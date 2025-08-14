'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BellRing, CircleCheck, CircleX } from 'lucide-react'
import React from 'react'
import http from '~/utils/http'
import { LINKS } from '~/constants/links'
import { OrderResponse } from '#/order'

import { toast } from 'sonner'
import { CODE_SUCCESS } from '~/constants'
import Link from 'next/link'
import { OrderStatusEnum } from '#/tabs-order'
import ModalOrder from '../../orders/[id]/_components/modal-order'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { env } from '~/configs/env'

const TIME = 5

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [orderId, setOrderId] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(TIME)
  const [subscriptionId, setSubscriptionId] = useState<number>()
  const [checkPayOS, setCheckPayOS] = useState(true)
  const [checkOrderExist, setCheckOrderExist] = useState(true)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [pending, setPending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const onOpenChange = (open: boolean) => setOpen(open)
  const ReminderSchema = z.object({
    reminder: z.string().min(1, 'No empty').max(100, 'Max 100 character'),
  })
  type ReminderData = z.infer<typeof ReminderSchema>

  const form = useForm<ReminderData>({
    resolver: zodResolver(ReminderSchema),
    defaultValues: {
      reminder: '',
    },
  })
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
          const resLicense = await http.patch<OrderResponse>(`${LINKS.order}/${orderId}`, {
            params: { newStatus: OrderStatusEnum.PROCESSING },
            baseUrl: '/api',
          })

          if (!CODE_SUCCESS.includes(resLicense.code)) {
            toast.error('Cannot update processs status with order.')
            setCheckPayOS(false)
            return
          }
        }
        // if (!res?.data?.accountName) {
        //   setCheckPayOS(false)
        //   toast.warning('Error payment from PayOS')
        //   return
        // }
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
    if (!subscriptionId || !checkPayOS) return

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
  }, [subscriptionId, router, orderId, checkPayOS])

  const reminderHandler = form.handleSubmit(async values => {
    setPending(true)
    startTransition(async () => {
      try {
        const res = await http.post(LINKS.order_email_report, {
          params: {
            email: env.ADMIN_MAIL,
            packageId: subscriptionId,
            orderId,
            content: values.reminder,
          },
          baseUrl: '/api',
        })

        if (!CODE_SUCCESS.includes(res.code)) {
          toast.error(res.message)
          return
        }

        setOpen(false)
        router.push(`/orders/${subscriptionId}?orderId=${orderId}`)
        toast.success(res.message)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Send failed.')
      } finally {
        setPending(false)
      }
    })
  })
  return (
    <>
      <div className='bg-primary-foreground fixed inset-0 z-[20] flex flex-col items-center justify-center px-4 text-center'>
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
        ) : checkPayOS ? (
          // Success
          <>
            <CircleCheck className='mb-4 h-10 w-10 text-green-600' />
            <p className='text-2xl font-semibold text-green-700'>
              Direct your order {orderId} : {countdown} s
            </p>
            <Link
              href='/'
              className='mt-6 rounded bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700'
            >
              Back to Homepage
            </Link>
          </>
        ) : (
          // PayOS error
          <>
            <BellRing className='mb-4 h-10 w-10 text-yellow-600' />
            <p className='text-2xl font-semibold text-yellow-700'>Something error from PayOS payment</p>
            <div className='mt-6 flex items-center justify-center gap-8'>
              <Link
                href={`/orders/${subscriptionId}?orderId=${orderId}`}
                className='rounded bg-yellow-600 px-6 py-2 font-medium text-white transition hover:bg-yellow-700'
              >
                Return Order
              </Link>
              <button
                disabled={isPending}
                onClick={() => onOpenChange(true)}
                className='hover:bg-primary-foreground-hover w-40 cursor-pointer rounded-lg border border-blue-600 py-3 text-center font-semibold text-blue-600 shadow-sm'
              >
                Reminder
              </button>
            </div>
          </>
        )}
      </div>
      <ModalOrder
        open={open}
        onOpenChange={setOpen}
        onSubmitOrder={reminderHandler}
        pending={pending}
        isReminder
        title='Reminder payment'
        content='Please enter content reminder'
        form={form}
      />
    </>
  )
}
