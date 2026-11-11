// Middleware bảo vệ toàn diện các tuyến đường nội bộ của Frontend Web.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_EXACT_ROUTES = new Set([
  '/',
  '/login',
  '/verify-email',
  '/about',
  '/privacy',
  '/blog',
])

function isTokenValid(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const base64Url = parts[1]
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const decoded = typeof atob === 'function'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('binary')
    const jsonPayload = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    if (payload && typeof payload.exp === 'number') {
      return Date.now() < (payload.exp * 1000 - 5000)
    }
    return true
  } catch {
    return false
  }
}

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true
  if (pathname.startsWith('/blog/')) return true
  return false
}

function sanitizeReturnUrl(url: string | null): string {
  if (!url) return '/home'
  const decoded = decodeURIComponent(url).trim()
  if (
    decoded.startsWith('/') &&
    !decoded.startsWith('//') &&
    !decoded.includes('\\') &&
    !decoded.startsWith('/login')
  ) {
    return decoded
  }
  return '/home'
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const accessToken =
    request.cookies.get('lingosphere_user_access_token')?.value ||
    request.cookies.get('access_token')?.value

  const refreshToken =
    request.cookies.get('lingosphere_user_refresh_token')?.value ||
    request.cookies.get('refresh_token')?.value

  const hasValidAuth = isTokenValid(accessToken) || isTokenValid(refreshToken)

  if (isPublicRoute(pathname)) {
    if (pathname === '/login' && hasValidAuth) {
      const rawReturnUrl =
        request.nextUrl.searchParams.get('returnUrl') ||
        request.nextUrl.searchParams.get('redirect')
      const targetUrl = sanitizeReturnUrl(rawReturnUrl)
      return NextResponse.redirect(new URL(targetUrl, request.url))
    }
    return NextResponse.next()
  }

  if (!hasValidAuth) {
    const destinationPath = pathname + search
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', destinationPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp4|webm|woff2?|css|js)).*)',
  ],
}

