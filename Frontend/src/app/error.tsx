'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[RouteError]', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            PAGE_ERROR
          </h1>
          <p className="text-sm font-medium leading-relaxed text-muted-foreground">
            This page encountered an unexpected error. Your data is safe.
          </p>
          {error.digest && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <Button
            onClick={reset}
            className="h-11 bg-primary px-6 text-[11px] font-black uppercase italic tracking-widest hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try_Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="h-11 border-border px-6 text-[11px] font-black uppercase italic tracking-widest"
          >
            <Home className="mr-2 h-4 w-4" />
            Go_Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
