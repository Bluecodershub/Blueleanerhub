'use client'

import * as React from 'react'
import { useState, lazy, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn, getStorageItem, setStorageItem } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Bot,
  Flag,
  FlaskConical,
  Crown,
  ClipboardCheck,
  Menu,
  X,
  Settings,
  ShieldCheck,
  Loader2,
  Globe,
  Users,
  Compass,
  Trophy,
  BarChart3,
  LockKeyhole,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'

const AIAssistant = lazy(() => import('@/components/ai/AIAssistant').then(mod => ({ default: mod.AIAssistant })))

function AIAssistantFallback() {
  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-center justify-center">
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shadow-lg" disabled>
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    </div>
  )
}

const navItems = [
  { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'AI Roadmap', href: '/student/roadmap', icon: Compass },
  { title: 'Skill Report', href: '/student/skill-report', icon: BarChart3 },
  { title: 'Tutorials', href: '/tutorials', icon: BookOpen },
  { title: 'Daily Quiz', href: '/daily-quiz', icon: ClipboardCheck },
  { title: 'Exercises', href: '/exercises', icon: Code2 },
  { title: 'Labs', href: '/labs', icon: FlaskConical },
  { title: 'IDE Sandbox', href: '/ide', icon: Code2 },
  { title: 'AI Tutor', href: '/ai-companion', icon: Bot },
  { title: 'Hackathons', href: '/hackathons', icon: Flag },
  { title: 'Leaderboard', href: '/student/leaderboard', icon: Trophy },
  { title: 'Mentors', href: '/mentors', icon: Users, disabled: true },
  { title: 'Spaces', href: '/spaces', icon: Globe },
  { title: 'Premium', href: '/premium', icon: Crown },
]

const mobileTabItems = [
  { title: 'Home', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Quiz', href: '/daily-quiz', icon: ClipboardCheck },
  { title: 'IDE', href: '/ide', icon: Code2 },
  { title: 'More', href: '#more', icon: Menu },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()
  const protectedRoute =
    pathname.startsWith('/student') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/ide') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/ai-companion') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/daily-quiz') ||
    pathname.startsWith('/quiz') ||
    pathname === '/dev/new' ||
    /^\/hackathons\/[^/]+\/(submit|team)$/.test(pathname)

  const content = (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="bg-noise pointer-events-none opacity-50" />

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card transition-all duration-300 lg:w-72 md:flex">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/student/dashboard" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-foreground">
              BlueLearnerHub
            </span>
          </Link>

        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <nav className="space-y-1">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Main Menu
            </p>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/student/dashboard' && pathname.startsWith(item.href))
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
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-primary-foreground' : 'text-primary/70'
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute left-0 h-5 w-1 rounded-full bg-primary-foreground"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <nav className="space-y-1">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Settings
            </p>
            <Link
              href="/tools"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/70 hover:text-foreground"
            >
              <Settings className="h-5 w-5 text-primary/70" />
              <span>Utilities</span>
            </Link>
          </nav>
        </div>

        {/* ─── Profile Section ──────────────────────────────────────────────────── */}
        <div className="border-t border-border/50 p-4">
          <Link
            href="/student/profile"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 transition-colors hover:bg-secondary/70"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              {user?.fullName?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? 'Student'}</p>
              <p className="text-xs text-muted-foreground">View Profile</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-lg md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-border bg-card p-6 md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <ShieldCheck className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="font-semibold text-lg text-foreground">
                    BlueLearnerHub
                  </span>
                </div>
                <div className="flex items-center gap-2">

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-border p-2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
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
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary/50'
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

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="relative flex-1 overflow-y-auto pb-24">
          <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
            {children}
          </div>
          
          <Suspense fallback={<AIAssistantFallback />}>
            <AIAssistant />
          </Suspense>
        </main>

        {/* ─── MOBILE BOTTOM NAVBAR ────────────────────────────────────────── */}
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
          <div className="flex h-16 items-center justify-around px-2">
            {mobileTabItems.map((item) => {
              const isActive =
                item.href !== '#more' &&
                (pathname === item.href ||
                  (item.href !== '/student/dashboard' && pathname.startsWith(item.href)))
              const Icon = item.icon
              return item.href === '#more' ? (
                <button
                  key="more"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 p-2 text-muted-foreground"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {item.title}
                  </span>
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-0.5 p-2 transition-all',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {item.title}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-pill"
                      className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )

  if (!protectedRoute) return <>{children}</>

  return <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>{content}</RoleGuard>
}
