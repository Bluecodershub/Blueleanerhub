'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getHomeByRole } from '@/lib/authRoutes'

export default function DashboardRedirectPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated || !user) {
      router.replace('/login?from=/dashboard')
      return
    }
    router.replace(getHomeByRole(user.role))
  }, [loading, isAuthenticated, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}
