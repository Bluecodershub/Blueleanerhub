'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PageLoading } from '@/components/ui/PageLoading'

/**
 * Canonical /profile entry. Routes the user to the profile surface that
 * matches their role so the global "Profile" nav item works for everyone.
 */
export default function ProfileEntry() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const role = (user?.role || 'STUDENT').toUpperCase()
    if (!user) {
      router.replace('/login/student?from=/profile')
    } else if (role === 'CORPORATE') {
      router.replace('/corporate/profile')
    } else {
      router.replace('/student/profile')
    }
  }, [user, loading, router])

  return <PageLoading />
}
