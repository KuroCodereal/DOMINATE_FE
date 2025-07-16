'use client'
import { PackageResponse } from '#/package'
import { User } from '#/user'
import React, { useCallback, useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import BankTransferPayment from './bank-payment'
import PayosPayment from './payos-payment'
import { PaymentResponse, ResponseGlobal } from '#/payment'
import { useSearchParams } from 'next/navigation'
import http from '~/utils/http'
import { LINKS } from '~/constants/links'
import { OrderResponse } from '#/order'
import SockJS from 'sockjs-client'
import { CompatClient, Stomp } from '@stomp/stompjs'
import OrderInfo from './info-order'
import Reminder from './reminder'

interface Props {
  data: PackageResponse
  user: User
  id: string
}

export default function OrderPage({ data, user, id }: Props) {
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(undefined)
  const [paymentInfo, setPaymentInfo] = useState<ResponseGlobal>()
  const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const orderId = searchParams.get('orderId')

  const fetchOrder = useCallback(async () => {
    if (!orderId) return

    setIsLoading(true)
    try {
      const res = await http.get<OrderResponse>(`${LINKS.order}/${orderId}`, { baseUrl: '/api' })
      if (res && res.data) {
        setPaymentMethod(res.data.paymentMethod)
        setIsPaymentSubmitted(true)
        setPaymentInfo({
          description: `DOMINATE${orderId}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(res.data as any),
        })
      }
    } catch (err) {
      console.error('Không tìm thấy đơn hàng:', err)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrder()
      const timeoutId = setTimeout(
        () => {
          fetchOrder()
        },
        1 * 60 * 1000
      )

      return () => clearTimeout(timeoutId)
    } else {
      setIsLoading(false)
    }
  }, [orderId, fetchOrder])

  useEffect(() => {
    if (!orderId) return

    const socket = new SockJS(`${process.env.NEXT_PUBLIC_BASE_API_URL}/ws`)
    const stompClient: CompatClient = Stomp.over(socket)

    // stompClient.debug = console.log

    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/payment/${orderId}`, message => {
        const status = message.body
        console.log('📩 WebSocket nhận trạng thái:', status)
        fetchOrder() // update from socket
      })
    })

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect()
      }
    }
  }, [orderId, fetchOrder])
  console.log(paymentInfo)

  return (
    <div className='bg-primary-foreground mx-auto mt-12 w-full max-w-4xl rounded-xl border-2 px-4 py-8 shadow-md md:px-8'>
      <h1 className='text-primary mb-6 text-center text-2xl font-semibold md:text-3xl'>
        Order {orderId ? `${orderId}` : 'Information'}
      </h1>
      <OrderInfo data={data} user={user} />
      <div className='w-full'>
        <label className='mb-2 block font-semibold'>Choose payment method:</label>
        <Select
          onValueChange={value => setPaymentMethod(value)}
          value={paymentMethod}
          disabled={isLoading || isPaymentSubmitted}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Chọn phương thức' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='BANK'>Bank Transfer</SelectItem>
            <SelectItem value='PAYOS'>PAYOS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'PAYOS' && (
        <PayosPayment
          id={id}
          data={data}
          paymentInfo={paymentInfo as PaymentResponse}
          setPaymentInfo={setPaymentInfo}
          setIsPaymentSubmitted={setIsPaymentSubmitted}
          paymentMethod={paymentMethod}
          isPaymentSubmitted={isPaymentSubmitted}
        />
      )}

      {paymentMethod === 'BANK' && (
        <BankTransferPayment
          user={user}
          id={id}
          paymentInfo={paymentInfo as PaymentResponse}
          data={data}
          paymentMethod={paymentMethod}
          isPaymentSubmitted={isPaymentSubmitted}
          setIsPaymentSubmitted={setIsPaymentSubmitted}
        />
      )}
      <Reminder data={data} user={user} paymentInfo={paymentInfo} orderId={orderId} />
    </div>
  )
}
