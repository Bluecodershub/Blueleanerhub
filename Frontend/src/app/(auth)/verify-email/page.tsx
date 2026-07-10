'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailPageInner />
    </Suspense>
  )
}

function VerifyEmailPageInner() {
  const params = useSearchParams()
  const token = params.get('token')
  const [state, setState] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle')
  const [resending, setResending] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!token) return
    setState('verifying')
    api
      .post('/auth/verify-email', { token })
      .then(() => setState('success'))
      .catch((e) => {
        setState('failed')
        setMsg(e?.response?.data?.message ?? 'Verification link is invalid or expired.')
      })
  }, [token])

  const resend = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-verification')
      setMsg('A new verification email has been sent — check your inbox.')
    } catch {
      setMsg('Could not resend right now. Try again in a minute.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-5 p-8 text-center">
        {state === 'verifying' ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h1 className="text-xl font-bold">Verifying your email…</h1>
          </>
        ) : state === 'success' ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Email verified!</h1>
            <p className="text-sm text-muted-foreground">
              You&apos;re all set. Continue to your dashboard.
            </p>
            <Link href="/select-role">
              <Button className="w-full">Continue</Button>
            </Link>
          </>
        ) : state === 'failed' ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{msg}</p>
            <Button onClick={resend} disabled={resending} className="w-full">
              {resending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Send a new verification email
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a verification link to your inbox. Click it to activate your
              account. The link expires in 24 hours.
            </p>
            <Button variant="outline" onClick={resend} disabled={resending} className="w-full">
              {resending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Resend verification email
            </Button>
            {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
