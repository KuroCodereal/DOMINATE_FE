import type { Rule } from 'antd/es/form'

const validationRulesMap: { [key: string]: Rule[] | ((getFieldValue: (name: string) => unknown) => Rule[]) } = {
  userName: [{ required: true, message: 'Please input username!' }],
  firstName: [{ required: true, message: 'Please input first name!' }],
  lastName: [{ required: true, message: 'Please input last name!' }],
  phoneNumber: [
    { required: true, message: 'Please input phone number!' },
    {
      pattern: /^\d{10,12}$/,
      message: 'Phone number must be 10 to 12 digits!',
    },
  ],
  ///////////////////////////////////////////////////////////////////////////////DOCUMENT/////////////////////////////////////////////////////////////////////////
  name: [{ required: true, message: 'Please input name!' }],
  title: [{ required: true, message: 'Please input title!' }],
  slug: [{ required: true, message: 'Please input slug!' }],
  versionId: [{ required: true, message: 'Please choose a version!' }],
  categoryId: [{ required: true, message: 'Please choose a category!' }],
  version: [{ required: true, message: 'Please input version!' }],
  ////////////////////////////////////////////////////////////////////////////////SUBSCRIPTION PLAN//////////////////////////////////////////////////////////////////
  billingCycle: [{ required: true, message: 'Please input billing cycle!' }],

  typePackage: [{ required: true, message: 'Please input type package!' }],
  optionsId: [{ required: true, message: 'Please input at least an option!' }],
  price: [
    { required: true, message: 'Please input price!' },
    {
      validator(_, value) {
        const num = Number(value)
        if (num >= 2000) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Price must be at least 2.000đ'))
      },
    },
  ],
  discount: [
    { required: true, message: 'Please select discount!' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        const price = Number(getFieldValue('price') || 0)
        const discount = Number(value || 0)
        const finalPrice = (price * (100 - discount)) / 100

        if (!price) {
          return Promise.resolve()
        }

        if (finalPrice < 2000) {
          return Promise.reject(new Error('Final price after discount must be at least 2000đ'))
        }

        return Promise.resolve()
      },
    }),
  ],
  order: [
    { required: true, message: 'Please input sort order!' },
    {
      validator(_, value) {
        const num = Number(value)
        if (Number.isInteger(num) && num >= 0) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Sort order must be a positive integer'))
      },
    },
  ],
  simulatedCount: [
    { required: true, message: 'Please input simulated count!' },
    {
      validator(_, value) {
        const num = Number(value)
        if (Number.isInteger(num) && num >= 0) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('Simulated count must be a positive integer'))
      },
    },
  ],
  email: [
    { required: true, message: 'Please input email!' },
    { type: 'email', message: 'Please enter a valid email!' },
  ],
  password: [
    { required: true, message: 'Please input password!' },
    { min: 6, message: 'Password must be at least 6 characters!' },
  ],
  newPassword: [
    { required: true, message: 'Please input new password!' },
    { min: 6, message: 'Password must be at least 6 characters!' },
  ],
  password_confirmation: [
    {
      required: true,
      message: 'Please confirm your password!',
    },
    { min: 6, message: 'Password must be at least 6 characters!' },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (!value || getFieldValue('password') === value || getFieldValue('new_password') === value) {
          return Promise.resolve()
        }
        return Promise.reject(new Error('The two passwords do not match!'))
      },
    }),
  ],
}

export const getValidationRules = (field: string, getFieldValue?: (name: string) => unknown): Rule[] => {
  const rules = validationRulesMap[field]

  if (typeof rules === 'function') {
    return rules(getFieldValue!)
  }

  return rules || [{ required: true, message: 'This field is required!' }]
}
