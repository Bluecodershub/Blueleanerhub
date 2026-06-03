'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

interface StudentLoginLayoutProps {
  children: React.ReactNode
}

export const StudentLoginLayout: React.FC<StudentLoginLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Top Logo — compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 flex items-center gap-2"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap size={20} />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">BlueLearnerHub</span>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border/50 bg-card/30 p-6 shadow-2xl backdrop-blur-xl sm:max-w-md sm:rounded-3xl sm:p-8"
      >
        {children}
      </motion.div>

      {/* Bottom link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 mt-6 text-center"
      >
        <a
          href="/help"
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Need help? Support Center
        </a>
      </motion.div>
    </div>
  )
}
