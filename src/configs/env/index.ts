import { A_SECOND } from '~/constants'

export const env = {
  ADMIN_MAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://dominate-fe.netlify.app/',
  BASE_API_URL: `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1` || '',
  SOCKET_URL: `${process.env.NEXT_PUBLIC_BASE_API_URL}` || '',
  DEBUG_LOG: +(process.env.NEXT_PUBLIC_DEBUG_LOG || '0'),
  TOKEN_EXPIRED: Number(process.env.NEXT_PUBLIC_TOKEN_EXPIRED)
    ? Number(process.env.NEXT_PUBLIC_TOKEN_EXPIRED)
    : A_SECOND * 24 * 60 * 60 * 2,
}
