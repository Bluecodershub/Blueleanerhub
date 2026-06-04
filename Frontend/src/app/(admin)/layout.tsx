'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Trophy, Award, BarChart3,
  Shield, Menu, X, LogOut, Settings, BookOpen,
  GraduationCap, ClipboardCheck, FileCheck2, CreditCard, ListChecks, LockKeyhole,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'

const navItems = [
  { title: 'Dashboard',    href: '/admin/dashboard',    icon: LayoutDashboard },
  { title: 'Users',        href: '/admin/users',        icon: Users },
  { title: 'Courses',      href: '/admin/courses',      icon: GraduationCap, disabled: true },
  { title: 'Lessons',      href: '/admin/lessons',      icon: BookOpen },
  { title: 'Assessments',  href: '/admin/assessments',  icon: ClipboardCheck },
  { title: 'Quizzes',      href: '/admin/quizzes',      icon: ListChecks },
  { title: 'Hackathons',   href: '/admin/hackathons',   icon: Trophy },
  { title: 'Submissions',  href: '/admin/submissions',  icon: FileCheck2 },
  { title: 'Certificates', href: '/admin/certificates', icon: Award },
  { title: 'Payments',     href: '/admin/payments',     icon: CreditCard },
  { title: 'Results',      href: '/admin/results',      icon: BarChart3 },
  { title: 'Analytics',    href: '/admin/analytics',    icon: BarChart3 },
  { title: 'RBAC',         href: '/admin/rbac',         icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-none">Admin Panel</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase text-primary">Bluelearnerhub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Management
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            if (item.disabled) {
              return (
                <span
                  key={item.href}
                  aria-disabled="true"
                  className="group relative flex cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  <Icon className="h-5 w-5 text-primary/50" />
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
                    Soon <LockKeyhole className="h-3 w-3" />
                  </span>
                </span>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-primary-foreground' : 'text-primary/70')} />
                <span className="truncate">{item.title}</span>
                {isActive && (
                  <motion.div layoutId="admin-active-pill" className="absolute left-0 h-5 w-1 rounded-full bg-primary-foreground" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border/50 p-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
              {user?.fullName?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? 'Admin'}</p>
              <p className="text-[10px] font-semibold text-primary">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-lg lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-foreground">Admin Panel</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="rounded-lg border border-border p-2 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  if (item.disabled) {
                    return (
                      <span
                        key={item.href}
                        aria-disabled="true"
                        className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-muted-foreground"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
                          Soon <LockKeyhole className="h-3 w-3" />
                        </span>
                      </span>
                    )
                  }

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
          <button onClick={() => setMobileMenuOpen(true)} className="rounded-lg border border-border p-2 text-muted-foreground">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm text-foreground">Admin Panel</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </RoleGuard>
  )
}
