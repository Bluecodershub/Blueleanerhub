'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Building2, 
  Shield, 
  AlertCircle, 
  Mail, 
  CheckCircle2, 
  X,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

// Blocked email domains for organization login
const BLOCKED_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'msn.com', 'aol.com', 'icloud.com', 'me.com', 'mac.com',
  'zoho.com', 'protonmail.com', 'mail.com', 'ymail.com',
  'yandex.com', 'gmx.com', 'inbox.com', 'fastmail.com',
  'qq.com', '163.com', '126.com', 'rediffmail.com',
  'indiatimes.com', 'sify.com', 'hotmail.co.uk', 'hotmail.fr',
]

const isOrganizationEmail = (email: string): { valid: boolean; reason?: string } => {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return { valid: false, reason: 'Please enter a valid email address' }
  }
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: `Personal email addresses are not allowed. Please use your organization email (e.g., @${domain.replace(/\.\w+$/, '.com')})` }
  }
  if (!domain.includes('.')) {
    return { valid: false, reason: 'Please enter a valid organization email' }
  }
  return { valid: true }
}

function CorporateLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<{ valid: boolean; reason?: string } | null>(null)

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        await api.get('/auth/me')
        const from = searchParams.get('from')
        router.replace(from && from.startsWith('/') ? from : '/corporate/dashboard')
      } catch {
        // Not authenticated, stay on login page
      }
    }
    checkAuth()
  }, [router, searchParams])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value.includes('@') && value.includes('.')) {
      setEmailStatus(isOrganizationEmail(value))
    } else if (value.length > 0) {
      setEmailStatus(null)
    } else {
      setEmailStatus(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const emailValidation = isOrganizationEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.reason || 'Invalid email')
      return
    }
    
    setLoading(true)
    try {
      const response = await api.post('/auth/corporate/login', { email, password })
      if (response.data?.success) {
        // Set auth hint cookie
        document.cookie = 'auth_hint=1; path=/; max-age=604800; SameSite=Lax'
        const from = searchParams.get('from')
        router.replace(from && from.startsWith('/') ? from : '/corporate/dashboard')
      } else {
        setError(response.data?.message || 'Login failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/select-role" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to role selection
          </Link>
          
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold">Organization Portal</h1>
          <p className="text-muted-foreground">Sign in to manage hackathons and hire talent</p>
        </div>

        {/* Verification Badge */}
        <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 p-3 border border-amber-500/20">
          <Shield className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-600">Verified Organization Access</span>
        </div>

        {/* Email Warning */}
        <div className="rounded-xl bg-amber-500/5 p-4 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Organization Email Required</p>
              <p className="text-xs text-amber-600/80 mt-1">
                Only organizational email addresses are accepted. Personal email services like Gmail, Yahoo, Outlook, Zoho, etc. are not permitted.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Organization Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`pl-10 ${emailStatus && !emailStatus.valid ? 'border-red-500 focus:border-red-500' : emailStatus?.valid ? 'border-green-500 focus:border-green-500' : ''}`}
                  required
                />
                {emailStatus && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailStatus.valid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {emailStatus && !emailStatus.valid && (
                <p className="text-xs text-red-500 mt-1">{emailStatus.reason}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" 
              disabled={loading || (emailStatus !== null && !emailStatus.valid)}
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Are you a candidate?{' '}
            <Link href="/select-role" className="font-semibold text-primary hover:underline">
              Select role
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function CorporateLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      </div>
    }>
      <CorporateLoginContent />
    </Suspense>
  )
}
