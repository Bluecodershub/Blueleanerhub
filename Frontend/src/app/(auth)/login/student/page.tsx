'use client'

import React from 'react'
import { StudentLoginLayout } from '@/components/auth/StudentLoginLayout'
import { StudentLoginForm } from '@/components/auth/StudentLoginForm'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function StudentLogin() {
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/student/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (data: any) => {
    setError(null)
    try {
      await login(data.email, data.password)
      router.push('/student/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize secure session.')
    }
  }

  return (
    <StudentLoginLayout>
      <StudentLoginForm onSubmit={handleSubmit} error={error} />
    </StudentLoginLayout>
  )
}
