'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Trophy,
  Briefcase,
  Bot,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Search,
  BookmarkCheck,
  LogOut,
  Building2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { BrandMark } from '@/components/branding/Logo'

const navItems = [
  { title: 'Dashboard',    href: '/corporate/dashboard',   icon: LayoutDashboard },
  { title: 'Candidates',   href: '/corporate/candidates',  icon: Users },
  { title: 'Shortlist',    href: '/corporate/shortlist',   icon: BookmarkCheck },
  { title: 'Jobs',         href: '/corporate/jobs',        icon: Briefcase },
  { title: 'Hackathons',   href: '/corporate/hackathons',  icon: Trophy },
  { title: 'AI Screening', href: '/corporate/ai-screening', icon: Bot },
  { title: 'Bounties',     href: '/corporate/bounties',    icon: TrendingUp },
  { title: 'Reports',      href: '/corporate/reports',     icon: BarChart3 },
  { title: 'Profile',      href: '/corporate/profile',     icon: Building2 },
]

const mobileTabItems = [
  { title: 'Home',       href: '/corporate/dashboard',  icon: LayoutDashboard },
  { title: 'Candidates', href: '/corporate/candidates', icon: Users },
  { title: 'Jobs',       href: '/corporate/jobs',       icon: Briefcase },
  { title: 'More',       href: '#more',                 icon: Menu },
]

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <RoleGuard allowedRoles={['CORPORATE', 'ADMIN']}>
    <div className="app-workspace flex min-h-screen text-foreground selection:bg-primary/20">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-50" />

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className="sticky top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-card transition-all duration-300 lg:flex">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/corporate/dashboard" className="group flex items-center gap-3">
            <BrandMark size={40} className="rounded-xl" priority />
            <div className="min-w-0">
              <span className="block truncate font-semibold text-sm tracking-tight text-foreground">
                BlueLearnerHub
              </span>
              <span className="mt-1 inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                for Teams
              </span>
            </div>
          </Link>

        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full rounded-xl border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Hiring
          </p>
          {navItems.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/corporate/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
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

          <p className="mb-3 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Tools
          </p>
          {navItems.slice(5).map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
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
              </Link>
            )
          })}
        </div>

        {/* Profile + Logout */}
        <div className="border-t border-border/50 p-4 space-y-2">
          <div className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              {user?.fullName?.[0]?.toUpperCase() ?? 'C'}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{user?.fullName ?? 'Corporate'}</p>
              <p className="text-xs text-primary">Corporate</p>
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

      {/* ─── MOBILE DRAWER ────────────────────────────────────────────────── */}
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
                  <BrandMark size={38} className="rounded-xl" />
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
          <div className="app-page-frame">
            {children}
          </div>
        </main>

        {/* ─── MOBILE BOTTOM NAVBAR ────────────────────────────────────────── */}
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-around px-2">
            {mobileTabItems.map((item) => {
              const isActive =
                item.href !== '#more' &&
                (pathname === item.href ||
                  (item.href !== '/corporate/dashboard' && pathname.startsWith(item.href)))
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
    </RoleGuard>
  )
}
