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
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm leading-tight text-destructive"
        >
          <span className="font-bold">Sign in error:</span> {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="ml-1 text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="ml-1 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <a
              href="#"
              className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Forgot?
            </a>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Need access?{' '}
          <a
            href="/get-started"
            className="ml-1 text-primary transition-colors hover:text-primary/80"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  )
}
