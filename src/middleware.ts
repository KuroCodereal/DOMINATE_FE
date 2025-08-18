import { NextRequest, NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'
import { AUTH } from '~/constants'

interface JwtPayload {
  exp: number
  iat?: number
  [key: string]: unknown
}

interface User {
  role?: string
  [key: string]: unknown
}

// Public paths that do not require authentication
const PUBLIC_PATHS = [
  'login',
  'register',
  'about',
  'doc',
  'active',
  'forget',
  'new-password',
  '_next',
  'favicon.ico',
  'static',
]

// Public paths that should be restricted if the user is already logged in
const AUTH_ONLY_PUBLIC_PATHS = ['login', 'register', 'forget', 'active', 'new-password']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const token = request.cookies.get(AUTH.token)?.value
  const userRaw = request.cookies.get(AUTH.userInfo)?.value

  let user: User | undefined = undefined

  try {
    user = userRaw ? JSON.parse(userRaw) : undefined
  } catch (err) {
    console.warn('❌ Failed to parse userInfo:', err)
  }

  const isApi = pathname.startsWith('/api')
  const isStaticFile =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')

  const isPublic =
    pathname === '/' ||
    PUBLIC_PATHS.some(path => pathname.startsWith(`/${path}`)) ||
    pathname === '/product' ||
    /^\/product\/\d+$/.test(pathname)

  const isAuthOnlyPublicPage = AUTH_ONLY_PUBLIC_PATHS.some(path => pathname.startsWith(`/${path}`))

  // Allow all API routes
  if (isApi || isStaticFile) return NextResponse.next()

  // 🔒 Block access to login/register/... pages if already logged in
  if (isAuthOnlyPublicPage && token) {
    const redirectUrl = user?.role === 'ADMIN' ? '/admin' : '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // 👤 Redirect ADMIN user away from public pages
  if (isPublic && user?.role === 'ADMIN' && !pathname.startsWith('/doc')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  // 🆓 Allow access to public pages
  if (isPublic) {
    return NextResponse.next()
  }

  // 🔐 Redirect to login if no token is found
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ⏰ Check if token is expired
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp <= now) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch (err) {
    console.warn('❌ Token decode failed:', err)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🛡️ Restrict ADMIN users to /admin only
  if (user?.role === 'ADMIN' && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // 🚫 Block non-admin users from accessing /admin
  if (user?.role !== 'ADMIN' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // ✅ Allow access
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\.).*)'], // Match all routes except static files
}
