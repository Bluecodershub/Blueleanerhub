'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StudentLoginLayoutProps {
  children: React.ReactNode
}

export const StudentLoginLayout: React.FC<StudentLoginLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
      {/* Top Logo — compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-6 flex items-center"
      >
        <span className="font-heading text-lg font-semibold text-foreground">Bluelearnerhub</span>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm sm:max-w-md sm:p-8"
      >
        <div className="mb-5 text-center">
          <h1 className="font-sans text-xl font-bold tracking-normal text-foreground">Student sign in</h1>
          <p className="mt-1 text-xs text-muted-foreground">Access your dashboard, lessons, quizzes, and projects.</p>
        </div>
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
