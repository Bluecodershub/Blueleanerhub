'use client'

import React from 'react'

interface LoginLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  role?: string
  accentColor?: string
  icon?: React.ReactNode
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, title, subtitle, icon }) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-[120px]" />
        <div
          className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-primary/5 blur-[120px]"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          {icon && (
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20">
                {icon}
              </div>
            </div>
          )}
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm font-medium uppercase tracking-tight tracking-widest text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-[2.5rem] border border-border/50 bg-card/30 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 md:p-12">
          {children}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-primary"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
