'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { BrandMark } from '@/components/branding/Logo'

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
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center px-4 py-10 sm:px-6">
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-7">
          <div className="mb-5 flex items-center gap-3">
            <BrandMark size={42} className="rounded-[8px]" priority />
            <div>
              <p className="text-sm font-semibold text-foreground">Bluelearnerhub</p>
              <p className="text-xs text-muted-foreground">Secure account access</p>
            </div>
          </div>
          {icon && (
            <div className="mb-4 flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-primary/20 bg-primary/[0.08] text-primary">
                {icon}
              </div>
            </div>
          )}
          <h1 className="text-3xl font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-[8px] border border-border bg-card/90 p-6 shadow-md sm:p-8">
          {children}
        </div>
      </div>
    </main>
  )
}
