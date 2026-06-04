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
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          {icon && (
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                {icon}
              </div>
            </div>
          )}
          <h1>{title}</h1>
          {subtitle && (
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm transition-colors duration-300 md:p-12">
          {children}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
