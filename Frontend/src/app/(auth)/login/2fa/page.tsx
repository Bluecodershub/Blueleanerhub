'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Loader2, KeyRound } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

export default function TwoFactorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TwoFactorPageInner />
    </Suspense>
  )
}

function TwoFactorPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/dashboard'
  const [code, setCode] = useState('')
  const [useBackup, setUseBackup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!code) return
    setSubmitting(true)
    try {
      await api.post('/auth/2fa/verify', {
        [useBackup ? 'backup_code' : 'totp']: code,
      })
      router.replace(from)
    } catch (err) {
      const anyErr = err as { response?: { data?: { message?: string } } }
      setError(anyErr?.response?.data?.message ?? 'Invalid code — try again.')
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-5 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold">Two-Factor Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {useBackup
              ? 'Enter one of your 8-character backup codes.'
              : 'Open your authenticator app and enter the 6-digit code.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
            maxLength={useBackup ? 8 : 6}
            inputMode={useBackup ? 'text' : 'numeric'}
            pattern={useBackup ? '[A-Za-z0-9]{8}' : '[0-9]{6}'}
            placeholder={useBackup ? '••••••••' : '••••••'}
            autoComplete="one-time-code"
            className="text-center font-mono text-lg tracking-widest"
          />
          {error && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={submitting || !code} className="w-full">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </form>

        <button
          onClick={() => {
            setUseBackup((b) => !b)
            setCode('')
            setError('')
          }}
          className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <KeyRound className="h-3 w-3" />
          {useBackup ? 'Use authenticator code instead' : 'Use a backup code instead'}
        </button>
      </CardContent>
    </Card>
  )
}
