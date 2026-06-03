'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>
  error?: string | null
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error }) => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 font-mono text-[10px] leading-tight text-red-500"
        >
          <span className="font-bold uppercase tracking-widest">[AUTH_ERROR]:</span> {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="ml-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Terminal_ID (Email)
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border-white/10 bg-black/40 font-mono text-xs transition-all duration-300 placeholder:text-white/10 focus:border-primary/40 focus:bg-black focus:ring-1 focus:ring-primary/40"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="ml-1 flex items-center justify-between">
            <label className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Access_Code (Pass)
            </label>
            <a
              href="#"
              className="font-mono text-[9px] font-bold uppercase text-primary/60 transition-colors hover:text-primary"
            >
              Forgot?
            </a>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border-white/10 bg-black/40 font-mono text-xs transition-all duration-300 placeholder:text-white/10 focus:border-primary/40 focus:bg-black focus:ring-1 focus:ring-primary/40"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="shimmer h-11 w-full rounded-xl bg-primary font-mono text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Exec_Login'}
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wide text-white/30">
          Need access?{' '}
          <a
            href="/get-started"
            className="ml-1 text-primary transition-colors hover:text-primary/80"
          >
            Initialize_Account
          </a>
        </p>
      </div>
    </div>
  )
}
