'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Play, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface TryItYourselfProps {
  title?: string
  code: string
  language?: string
  onTryIt?: () => void
}

export const TryItYourself: React.FC<TryItYourselfProps> = ({
  title = 'Interactive Example',
  code,
  language = 'python',
  onTryIt,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group my-12 overflow-hidden rounded-2xl border border-border/40 bg-card shadow-2xl shadow-primary/5"
    >
      <div className="flex items-center justify-between border-b border-border/40 bg-secondary/30 px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <h3 className="m-0 font-heading text-lg font-black tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100">
          <div className="h-3 w-3 rounded-full bg-red-500/50" />
          <div className="h-3 w-3 rounded-full bg-primary/50" />
          <div className="h-3 w-3 rounded-full bg-blue-500/50" />
        </div>
      </div>

      <div className="relative flex flex-col gap-6 whitespace-pre-wrap bg-black/20 p-8 font-mono text-lg leading-relaxed text-foreground/90">
        <div className="pointer-events-none absolute right-6 top-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">
            {language}
          </span>
        </div>
        <code className="block">{code}</code>
      </div>

      <div className="flex items-center justify-between border-t border-border/10 bg-secondary/20 px-8 py-6">
        <div className="hidden items-center gap-2 text-xs font-bold text-muted-foreground sm:flex">
          <Sparkles size={14} className="text-primary" />
          <span>Interactive Environment Ready</span>
        </div>
        <Button
          onClick={onTryIt}
          size="lg"
          className="flex items-center gap-3 rounded-xl bg-primary px-10 text-lg font-black text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] hover:bg-primary/90 active:scale-[0.97]"
        >
          Try it Yourself <Play size={18} fill="currentColor" />
        </Button>
      </div>
    </motion.div>
  )
}
