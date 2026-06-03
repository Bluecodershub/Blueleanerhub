'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Fixed visual dot-grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background radial-dot-grid" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[480px] text-center space-y-6"
      >
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-mono text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="h-3.5 w-3.5" />
          Error Code: 404
        </div>

        {/* Big 404 Header */}
        <h1 
          className="text-8xl font-black font-mono tracking-tighter text-foreground"
          style={{ textShadow: '4px 4px 0px hsl(var(--primary) / 0.15)' }}
        >
          404
        </h1>

        {/* Message */}
        <h2 className="text-xl font-bold font-mono text-foreground uppercase tracking-tight">
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-sm mx-auto">
          We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Back to Home Button */}
        <div className="pt-4">
          <Link href="/">
            <Button
              className="font-mono text-xs gap-2 px-6 h-11 shadow-sm"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
