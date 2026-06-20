'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PageLoading } from '@/components/ui/PageLoading'

/**
 * /profile/edit — routes to the role-appropriate profile page where editing
 * happens inline.
 */
export default function ProfileEditEntry() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const role = (user?.role || 'STUDENT').toUpperCase()
    if (!user) {
      router.replace('/login/student?from=/profile/edit')
    } else if (role === 'CORPORATE') {
      router.replace('/corporate/profile')
    } else {
      router.replace('/student/profile')
    }
  }, [user, loading, router])

  return <PageLoading />
}
