'use client'
import { OrderResponse } from '#/order'
import { OrderStatusEnum } from '#/tabs-order'
import { CircleX } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CODE_SUCCESS } from '~/constants'
import { LINKS } from '~/constants/links'
import http from '~/utils/http'
const TIME = 5
export default function CancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderId, setOrderId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(TIME)
  const [isLoading, setIsLoading] = useState(true)
  const [checkOrderExist, setCheckOrderExist] = useState(true)
  const [subscriptionId, setSubscriptionId] = useState<number>()
  const hasFetched = useRef(false)

  useEffect(() => {
    const id = searchParams.get('orderCode')
    setOrderId(id)
  }, [searchParams])

  useEffect(() => {
    if (!orderId || hasFetched.current) return
    hasFetched.current = true

    const fetchOrder = async () => {
      try {
        const res = await http.get<OrderResponse>(`${LINKS.order}/${orderId}`, {
          baseUrl: '/api',
        })

        if (res?.data?.subscriptionId) {
          setSubscriptionId(res.data.subscriptionId)
        }

        if (!CODE_SUCCESS.includes(res.code)) {
          toast.error(`Not found order ${orderId}`)
          setCheckOrderExist(false)
          return
        }

        if (res?.data?.paymentStatus === OrderStatusEnum.PENDING) {
          // await http.patch<OrderResponse>(`${LINKS.order}/${orderId}`, {
          //   params: { newStatus: OrderStatusEnum.FAILED },
          //   baseUrl: '/api',
          // })

          await http.post(`${LINKS.payment_cancel_pro}/${orderId}`, {
            baseUrl: '/api',
          })
        }
      } catch (err) {
        console.error('Not found order:', err)
        setCheckOrderExist(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (!subscriptionId) return

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    const redirectTimer = setTimeout(() => {
      router.push(`/orders/${subscriptionId}?orderId=${orderId}`)
      router.refresh()
    }, TIME * 1000)

    return () => {
      clearInterval(timer)
      clearTimeout(redirectTimer)
    }
  }, [subscriptionId, router, orderId])
  return (
    <div className='bg-primary-foreground fixed inset-0 z-[999] flex flex-col items-center justify-center px-4 text-center'>
      {isLoading ? (
        <p className='text-2xl font-bold text-blue-700'>Checking order...</p>
      ) : !checkOrderExist ? (
        // Not found
        <>
          <CircleX className='mb-4 h-10 w-10 text-red-600' />
          <p className='text-2xl font-semibold text-red-700'>Order not found</p>
          <Link
            href='/'
            className='mt-6 rounded bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700'
          >
            Back to Homepage
          </Link>
        </>
      ) : (
        <>
          <CircleX className='mb-4 h-10 w-10 text-red-600' />
          <p className='text-2xl font-semibold text-red-600'>
            Direct your order {orderId} : {countdown} s
          </p>
          <Link
            href='/'
            className='mt-6 rounded bg-red-600 px-6 py-2 font-medium text-white transition hover:bg-red-700'
          >
            Back to Homepage
          </Link>
        </>
      )}
    </div>
  )
}