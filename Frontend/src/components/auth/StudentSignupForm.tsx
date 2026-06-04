'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { User, KeyRound, MailIcon } from 'lucide-react'
import { Github } from '@/components/ui/BrandIcons'
import { authOAuthUrl } from '@/lib/api'

interface StudentSignupFormProps {
  onSubmit: (userData: any) => Promise<void>
  error?: string | null
}

export const StudentSignupForm: React.FC<StudentSignupFormProps> = ({ onSubmit, error }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ name, email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-bold leading-relaxed text-destructive"
        >
          <span>Signup error:</span> {error}
        </motion.div>
      )}

      {/* Social Register */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = authOAuthUrl('github')
          }}
          className="h-10 gap-2"
        >
          <Github size={14} /> GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = authOAuthUrl('google')
          }}
          className="h-10 gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-4 text-xs text-muted-foreground">
            or continue with email
          </span>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1.5">
          <div className="group relative">
            <label htmlFor="student-signup-name" className="sr-only">Full name</label>
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              id="student-signup-name"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 pl-12"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="group relative">
            <label htmlFor="student-signup-email" className="sr-only">Email address</label>
            <MailIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              id="student-signup-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 pl-12"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="group relative">
            <label htmlFor="student-signup-password" className="sr-only">Create a password</label>
            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              id="student-signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pl-12"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <div className="px-2">
          <p className="text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree to the{' '}
            <span className="cursor-pointer text-primary underline underline-offset-2 transition-colors hover:text-primary/80">
              Terms
            </span>{' '}
            &{' '}
            <span className="cursor-pointer text-primary underline underline-offset-2 transition-colors hover:text-primary/80">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login/student" className="ml-2 font-semibold text-primary transition-colors hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
