'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function OAuthCallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const success = params.get('success')
    const error = params.get('error')

    if (error) {
      setErrorMsg(decodeURIComponent(error))
      setStatus('error')
      setTimeout(() => router.replace('/login'), 3500)
      return
    }

    if (success === 'true') {
      // Backend already set HttpOnly cookies — refresh the auth context
      refreshUser()
        .then(() => {
          setStatus('success')
          setTimeout(() => router.replace('/student/dashboard'), 1200)
        })
        .catch(() => {
          setErrorMsg('Session could not be established. Please try again.')
          setStatus('error')
          setTimeout(() => router.replace('/login'), 3500)
        })
    } else {
      router.replace('/login')
    }
  }, [params, refreshUser, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card/40 p-10 text-center backdrop-blur"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Completing sign-in…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-sm font-semibold text-white">Signed in! Redirecting…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-semibold text-white">Authentication failed</p>
            <p className="max-w-xs text-xs text-muted-foreground">{errorMsg}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login…</p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  )
}
