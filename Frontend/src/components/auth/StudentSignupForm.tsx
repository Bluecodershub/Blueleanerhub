'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { User, KeyRound, MailIcon } from 'lucide-react'
import { Github } from '@/components/ui/BrandIcons'

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
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[11px] font-bold leading-relaxed text-red-500"
        >
          <span className="uppercase tracking-widest">[AUTH_ERROR]:</span> {error}
        </motion.div>
      )}

      {/* Social Register */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/github`
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border-border bg-background/50 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
        >
          <Github size={14} /> GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/google`
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-2xl border-border bg-background/50 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-white hover:text-black"
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
        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.4em]">
          <span className="bg-[#121214] px-4 text-[9px] text-muted-foreground/40">
            or continue with email
          </span>
        </div>
      </div>

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1.5">
          <div className="group relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="Biological Name / Alias"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-2xl border-border bg-background/40 pl-12 text-sm font-medium transition-all placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="group relative">
            <MailIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              type="email"
              placeholder="Communication Uplink (Email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-2xl border-border bg-background/40 pl-12 text-sm font-medium transition-all placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="group relative">
            <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
            <Input
              type="password"
              placeholder="Master Encryption Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-2xl border-border bg-background/40 pl-12 text-sm font-medium transition-all placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        <div className="px-2">
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground/40">
            By initializing identity, you agree to the{' '}
            <span className="cursor-pointer text-white underline underline-offset-2 transition-colors hover:text-primary">
              Platform Protocol
            </span>{' '}
            &{' '}
            <span className="cursor-pointer text-white underline underline-offset-2 transition-colors hover:text-primary">
              Data Governance
            </span>
            .
          </p>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-2xl bg-primary font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Synchronizing Node...' : 'Initialize Identity'}
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">
          Already a recognized entity?{' '}
          <Link href="/login" className="ml-2 text-white transition-colors hover:text-primary">
            Access Portal
          </Link>
        </p>
      </div>
    </div>
  )
}
