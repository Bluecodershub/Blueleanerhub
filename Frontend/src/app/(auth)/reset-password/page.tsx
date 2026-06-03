'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('No reset token found. Please request a new password reset link.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid or expired token. Please request a new reset link.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-[120px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-card/40 p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-lg shadow-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <div className="space-y-2">
              <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-white">
                Access_Restored
              </h2>
              <p className="text-[11px] font-bold uppercase leading-relaxed tracking-wider text-muted-foreground">
                Password updated successfully. Redirecting to login...
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-white">
                New_Access_Code
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Enter your new password below
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 font-mono text-[10px] leading-tight text-red-500"
              >
                <span className="font-bold uppercase tracking-widest">[ERROR]:</span> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="ml-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  New_Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-white/20 bg-black pr-10 font-mono text-xs transition-none placeholder:text-white/10 focus:border-white"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                  Confirm_Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-11 border-white/20 bg-black font-mono text-xs transition-none placeholder:text-white/10 focus:border-white"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="h-12 w-full border-2 border-white bg-white font-mono text-[12px] font-black uppercase tracking-widest text-black transition-none hover:bg-black hover:text-white"
                >
                  {loading ? 'Updating...' : 'Set_New_Password'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" /> Back_To_Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
