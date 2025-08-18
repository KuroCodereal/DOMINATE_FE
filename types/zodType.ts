import { z } from 'zod'

const baseSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Email is not valid' }),

  userName: z.string({ message: 'Username is required' }).min(1, { message: 'Username is required' }),

  firstName: z.string({ message: 'First name is required' }).min(1, { message: 'First name is required' }),

  lastName: z.string({ message: 'Last name is required' }).min(1, { message: 'Last name is required' }),

  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must have 10-12 digits' })
    .max(12, { message: 'Phone number must have 10-12 digits' })
    .regex(/^[0-9]+$/, { message: 'Phone number must be digits' }),

  oldPassword: z
    .string({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),

  password: z.string({ message: 'Password is required' }).min(6, { message: 'Password must be at least 6 characters' }),

  rePassword: z
    .string({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),

  newPassword: z
    .string({ message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
})

// use for change password
export const FormSchema = baseSchema
  .refine(data => data.newPassword === data.rePassword, {
    path: ['rePassword'],
    message: 'Password does not match',
  })
  .refine(data => data.password === data.rePassword, {
    path: ['rePassword'],
    message: 'Password does not match',
  })

// Login
export const LoginSchema = baseSchema.pick({
  userName: true,
  password: true,
})

// Register
export const RegisterSchema = baseSchema
  .pick({
    userName: true,
    firstName: true,
    lastName: true,
    password: true,
    rePassword: true,
    email: true,
    phoneNumber: true,
  })
  .refine(data => data.password === data.rePassword, {
    path: ['rePassword'],
    message: 'Password does not match',
  })

// Forget password
export const ForgetSchema = baseSchema.pick({
  email: true,
})

// Reset password
export const ResetSchema = baseSchema
  .pick({
    password: true,
    rePassword: true,
  })
  .refine(data => data.password === data.rePassword, {
    path: ['rePassword'],
    message: 'Password does not match',
  })

//  Đổi mật khẩu
export const ChangeSchema = baseSchema
  .pick({
    oldPassword: true,
    newPassword: true,
    rePassword: true,
  })
  .refine(data => data.newPassword === data.rePassword, {
    path: ['rePassword'],
    message: 'Password is not match',
  })

export const OrderSchema = z.object({
  description: z.string().min(1, 'Description is required').max(25, 'Description must be at most 25 characters'),
})

export const ProfileSchema = baseSchema.pick({
  userName: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
})

// Set type for schema
export type LoginFormValues = z.infer<typeof LoginSchema>
export type RegisterFormValues = z.infer<typeof RegisterSchema>
export type ForgetFormValues = z.infer<typeof ForgetSchema>
export type ResetFormValues = z.infer<typeof ResetSchema>
export type ChangeFormValues = z.infer<typeof ChangeSchema>
export type OrderFormValues = z.infer<typeof OrderSchema>
export type ProfileFormValues = z.infer<typeof ProfileSchema>
