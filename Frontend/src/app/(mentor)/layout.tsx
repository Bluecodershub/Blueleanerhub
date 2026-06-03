'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, BookOpen, Users, ClipboardList,
  Video, BarChart3, Menu, X, GraduationCap, FileText, LogOut,
  BrainCircuit, Trophy,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'

const navItems = [
  { title: 'Dashboard',   href: '/mentor/dashboard',   icon: LayoutDashboard },
  { title: 'Classes',     href: '/mentor/classes',     icon: BookOpen },
  { title: 'Students',    href: '/mentor/students',    icon: Users },
  { title: 'Assignments', href: '/mentor/assignments', icon: ClipboardList },
  { title: 'Sessions',    href: '/mentor/sessions',    icon: Video },
  { title: 'Quizzes',     href: '/mentor/quizzes',     icon: BrainCircuit },
  { title: 'Hackathons',  href: '/mentor/hackathons',  icon: Trophy },
  { title: 'Grades',      href: '/mentor/grades',      icon: FileText },
  { title: 'Analytics',   href: '/mentor/analytics',   icon: BarChart3 },
]

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <RoleGuard allowedRoles={['MENTOR', 'ADMIN']}>
    <div className="flex min-h-screen bg-background text-foreground selection:bg-emerald-500/20">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-50" />

      {/* ─── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card transition-all duration-300 lg:flex">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/mentor/dashboard" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-lg shadow-emerald-600/25">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-foreground">
                BlueLearnerHub
              </span>
              <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Faculty
              </span>
            </div>
          </Link>

        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Teaching
          </p>
          {navItems.slice(0, 7).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/mentor/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-white' : 'text-emerald-600/70'
                  )}
                />
                <span className="truncate">{item.title}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 h-5 w-1 rounded-full bg-white"
                  />
                )}
              </Link>
            )
          })}

          <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Settings
          </p>
          {navItems.slice(7).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-white' : 'text-emerald-600/70'
                  )}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </div>

        {/* Profile + Logout */}
        <div className="border-t border-border/50 p-4 space-y-2">
          <div className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 bg-gradient-to-br from-emerald-600 to-teal-500 font-bold text-white shadow-inner">
              {user?.fullName?.[0]?.toUpperCase() ?? 'M'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? 'Mentor'}</p>
              <p className="text-xs text-emerald-400">Mentor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE DRAWER ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-lg lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-border bg-card p-6 lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                    <GraduationCap className="h-6 w-6 text-white" />
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
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
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

      {/* ─── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="relative flex-1 overflow-y-auto pb-24">
          <div className="pointer-events-none absolute left-0 top-0 h-[300px] w-full bg-gradient-to-b from-emerald-500/5 to-transparent" />

          <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* ─── MOBILE BOTTOM NAVBAR ─────────────────────────────────── */}
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-around px-2">
            {[
              { title: 'Home', href: '/mentor/dashboard', icon: LayoutDashboard },
              { title: 'Classes', href: '/mentor/classes', icon: BookOpen },
              { title: 'Students', href: '/mentor/students', icon: Users },
              { title: 'More', href: '#more', icon: Menu },
            ].map((item) => {
              const isActive =
                item.href !== '#more' &&
                (pathname === item.href ||
                  (item.href !== '/mentor/dashboard' && pathname.startsWith(item.href)))
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
                    isActive ? 'text-emerald-600' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {item.title}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobile-pill"
                      className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-600"
                    />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
    </RoleGuard>
  )
}
