'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  GraduationCap, 
  BookOpen,
  Users,
  AlertCircle, 
  Mail, 
  Lock,
  ClipboardList,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

function MentorLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/me')
        const from = searchParams.get('from')
        router.replace(from && from.startsWith('/') ? from : '/mentor/dashboard')
      } catch {
        // Not authenticated, stay on login page
      }
    }
    checkAuth()
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    setLoading(true)
    try {
      const response = await api.post('/auth/mentor/login', { email, password })
      if (response.data?.success) {
        document.cookie = 'auth_hint=1; path=/; max-age=604800; SameSite=Lax'
        const from = searchParams.get('from')
        router.replace(from && from.startsWith('/') ? from : '/mentor/dashboard')
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
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[150px]" />
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
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="mb-2 text-2xl font-bold">Professor Portal</h1>
          <p className="text-muted-foreground">Sign in to manage classes and track student progress</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Manage Classes</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
            <Users className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Track Students</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
            <ClipboardList className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">Grade Work</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium">View Analytics</span>
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
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="professor@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
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
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Are you a student?{' '}
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

export default function MentorLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <MentorLoginContent />
    </Suspense>
  )
}
