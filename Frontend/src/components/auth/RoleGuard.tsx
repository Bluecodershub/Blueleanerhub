'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PageLoading } from '@/components/ui/PageLoading'
import { AppRole, getHomeByRole, isAllowedRole, normalizeRole } from '@/lib/authRoutes'

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: AppRole[]
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const role = normalizeRole(user?.role)
  const allowed = isAllowedRole(user?.role, allowedRoles)
  const loginPath =
    allowedRoles.includes('STUDENT') && allowedRoles.length <= 2
      ? '/login/student'
      : '/login'

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace(`${loginPath}?from=${encodeURIComponent(pathname)}`)
      return
    }
    if (!allowed) {
      router.replace(role ? getHomeByRole(role) : `/login?from=${encodeURIComponent(pathname)}`)
    }
  }, [allowed, loading, loginPath, pathname, role, router, user])

  if (loading || !user || !allowed) return <PageLoading />
  return <>{children}</>
}
