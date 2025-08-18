import Link from 'next/link'
import React, { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CODE_SUCCESS } from '~/constants'
import ModalOrder from './modal-order'
import clsx from 'clsx'
import { LINKS } from '~/constants/links'
import http from '~/utils/http'
import { PackageResponse } from '#/package'
import { ResponseGlobal } from '#/payment'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'

interface Props {
  orderId: string | null
  data: PackageResponse
  paymentInfo?: ResponseGlobal
}

export default function Reminder({ orderId, data, paymentInfo }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pending, setPending] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)
  const [open, setOpen] = useState(false)
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
  const onOpenChange = (open: boolean) => setOpen(open)
  useEffect(() => {
    if (!orderId) return

    const key = `reminder_lock_${orderId}`
    const stored = localStorage.getItem(key)
    const { expiredAt }: { expiredAt: number } = stored ? JSON.parse(stored) : {}

    if (expiredAt && Date.now() < expiredAt) {
      const remaining = Math.ceil((expiredAt - Date.now()) / 1000)
      setIsLocked(true)
      setCountdown(remaining)

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsLocked(false)
            localStorage.removeItem(key)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setIsLocked(false)
      setCountdown(0)
      localStorage.removeItem(key)
    }
  }, [orderId])

  const reminderHandler = form.handleSubmit(async values => {
    setPending(true)
    startTransition(async () => {
      try {
        const res = await http.post(LINKS.order_email_report, {
          params: {
            packageId: data.id,
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
        toast.success(res.message)

        // Lock 60s
        const expiredAt = Date.now() + 60 * 1000
        localStorage.setItem(`reminder_lock_${orderId}`, JSON.stringify({ expiredAt }))
        setIsLocked(true)
        setCountdown(60)

        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              setIsLocked(false)
              localStorage.removeItem(`reminder_lock_${orderId}`)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Send failed.')
      } finally {
        setPending(false)
      }
    })
  })
  useEffect(() => {
    setOpen(false)
  }, [paymentInfo])

  return (
    <div className='mt-6 flex justify-center gap-4'>
      {paymentInfo?.canReport && ['PENDING', 'PROCESSING'].includes(paymentInfo?.paymentStatus ?? '') && (
        <button
          disabled={isPending || isLocked}
          onClick={() => onOpenChange(true)}
          className='hover:bg-primary-foreground-hover w-40 cursor-pointer rounded-lg border border-blue-600 py-3 text-center font-semibold text-blue-600 shadow-sm'
        >
          {isLocked ? `Reminder (${countdown}s)` : 'Reminder'}
        </button>
      )}

      <Link
        href={`/my-order${paymentInfo?.paymentStatus ? `?status=${paymentInfo.paymentStatus}` : ''}`}
        className={clsx(
          'text-destructive hover:bg-primary-foreground-hover border-destructive w-40 rounded-lg border py-3 text-center font-semibold shadow-sm',
          isPending && 'pointer-events-none opacity-50'
        )}
      >
        Back
      </Link>
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
    </div>
  )
}
