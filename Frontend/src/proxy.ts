import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES: Array<{ prefix: string; loginPath: string }> = [
  { prefix: '/student',   loginPath: '/login/student' },
  { prefix: '/mentor',    loginPath: '/login/mentor' },
  { prefix: '/corporate', loginPath: '/login/corporate' },
  { prefix: '/candidate', loginPath: '/login' },
  { prefix: '/admin',     loginPath: '/login' },
]

const PUBLIC_EXCEPTIONS = new Set([
  '/student/onboarding',
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/oauth/callback')) return NextResponse.next()

  const group = PROTECTED_PREFIXES.find((g) => pathname.startsWith(g.prefix))
  if (!group) return NextResponse.next()

  if (PUBLIC_EXCEPTIONS.has(pathname)) return NextResponse.next()

  const authHint = request.cookies.get('auth_hint')
  if (authHint?.value === '1') return NextResponse.next()

  const loginUrl = new URL(group.loginPath, request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    '/student/:path*',
    '/mentor/:path*',
    '/corporate/:path*',
    '/candidate/:path*',
    '/admin/:path*',
  ],
}
