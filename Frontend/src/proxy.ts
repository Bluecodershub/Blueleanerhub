import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES: Array<{ prefix: string; loginPath: string }> = [
  { prefix: '/student',   loginPath: '/login/student' },
  { prefix: '/mentor',    loginPath: '/login/mentor' },
  { prefix: '/corporate', loginPath: '/login/corporate' },
  { prefix: '/candidate', loginPath: '/login' },
  { prefix: '/admin',     loginPath: '/login' },
  { prefix: '/assessment', loginPath: '/login/student' },
  { prefix: '/ide', loginPath: '/login/student' },
  { prefix: '/learn', loginPath: '/login/student' },
  { prefix: '/ai-companion', loginPath: '/login/student' },
  { prefix: '/premium', loginPath: '/login/student' },
  { prefix: '/payment', loginPath: '/login/student' },
  { prefix: '/notifications', loginPath: '/login/student' },
  { prefix: '/daily-quiz', loginPath: '/login/student' },
  { prefix: '/quiz', loginPath: '/login/student' },
]

const PUBLIC_EXCEPTIONS = new Set([
  '/student/onboarding',
])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/oauth/callback')) return NextResponse.next()

  const specialStudentRoute =
    pathname === '/dev/new' || /^\/hackathons\/[^/]+\/(submit|team)$/.test(pathname)
  const group = specialStudentRoute
    ? { prefix: pathname, loginPath: '/login/student' }
    : PROTECTED_PREFIXES.find((g) => pathname.startsWith(g.prefix))
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
    '/assessment/:path*',
    '/ide/:path*',
    '/learn/:path*',
    '/ai-companion/:path*',
    '/premium/:path*',
    '/payment/:path*',
    '/notifications/:path*',
    '/daily-quiz/:path*',
    '/quiz/:path*',
    '/dev/new',
    '/hackathons/:path*',
  ],
}
