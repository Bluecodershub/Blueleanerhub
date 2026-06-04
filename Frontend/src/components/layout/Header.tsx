'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X, LogOut, User as UserIcon, ShieldAlert, Award, Compass, LayoutDashboard, Bell, LockKeyhole } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'

type HeaderNavItem = {
  label: string
  href: string
  icon?: React.ElementType
  disabled?: boolean
}

// ─── Role-Based Navigation Maps ─────────────────────────────────────────────
const publicNav: HeaderNavItem[] = [
  { label: 'Lessons',     href: '/library' },
  { label: 'Courses',     href: '/courses', disabled: true },
  { label: 'Hackathons',  href: '/hackathons' },
  { label: 'Mentors',     href: '/mentors', disabled: true },
]

const studentNav: HeaderNavItem[] = [
  { label: 'Dashboard',   href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Lessons',     href: '/library',           icon: Compass },
  { label: 'Courses',     href: '/courses',           icon: Award, disabled: true },
  { label: 'Hackathons',  href: '/student/hackathons',icon: ShieldAlert },
  { label: 'Practice',    href: '/exercises',          icon: Compass },
  { label: 'Profile',     href: '/student/profile',   icon: UserIcon },
]

const mentorNav: HeaderNavItem[] = [
  { label: 'Dashboard',   href: '/mentor/dashboard' },
  { label: 'Students',    href: '/mentor/students' },
  { label: 'Submissions', href: '/mentor/submissions' },
  { label: 'Hackathons',  href: '/mentor/hackathons' },
  { label: 'Quizzes',     href: '/mentor/quizzes' },
  { label: 'Results',     href: '/mentor/results' },
  { label: 'Profile',     href: '/mentor/profile' },
]

const corporateNav: HeaderNavItem[] = [
  { label: 'Dashboard',   href: '/corporate/dashboard' },
  { label: 'Hackathons',  href: '/corporate/hackathons' },
  { label: 'Participants',href: '/corporate/participants' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Reports',     href: '/corporate/reports' },
  { label: 'Shortlist',   href: '/corporate/shortlist' },
  { label: 'Profile',     href: '/corporate/profile' },
]

const adminNav: HeaderNavItem[] = [
  { label: 'Dashboard',   href: '/admin/dashboard' },
  { label: 'Users',       href: '/admin/users' },
  { label: 'Courses',     href: '/admin/courses', disabled: true },
  { label: 'Lessons',     href: '/admin/lessons' },
  { label: 'Assessments', href: '/admin/assessments' },
  { label: 'Hackathons',  href: '/admin/hackathons' },
  { label: 'Payments',    href: '/admin/payments' },
  { label: 'Certificates',href: '/admin/certificates' },
  { label: 'Analytics',   href: '/admin/analytics' },
  { label: 'Settings',    href: '/admin/settings' },
]

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    api.get('/notifications?unread=true&limit=1').then(r => {
      setUnreadCount(r.data?.data?.unreadCount ?? 0)
    }).catch(() => {})
  }, [isAuthenticated, pathname])

  // Resolve dynamic nav items based on authenticated role
  const getNavItems = () => {
    if (!isAuthenticated || !user) return publicNav
    const role = (user.role || 'STUDENT').toUpperCase()
    if (role === 'ADMIN') return adminNav
    if (role === 'MENTOR') return mentorNav
    if (role === 'CORPORATE') return corporateNav
    return studentNav
  }

  const navItems = getNavItems()

  return (
    <>
      {/* ── Sticky Navbar – floats on scroll ── */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-border bg-card/95 shadow-sm'
            : 'border-b border-border/70 bg-card/90'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <svg
                className="h-7 w-7 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="text-primary">Blue</span>learnerhub
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) =>
                item.disabled ? (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3.5 py-1.5 text-sm font-semibold text-muted-foreground"
                    title="Coming soon in beta"
                  >
                    {item.label}
                    <LockKeyhole className="h-3 w-3" />
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'border border-primary/20 bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Link href="/notifications" className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary transition-colors">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              {isAuthenticated && user ? (
                /* Authenticated State Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-secondary"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline text-foreground max-w-[120px] truncate">{user.fullName || 'User'}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg glass animate-scale-in">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <div className="text-xs font-bold text-foreground truncate">{user.fullName || 'User'}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                        <span className="mt-1.5 inline-block rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                          {user.role || 'STUDENT'}
                        </span>
                      </div>
                      <Link
                        href={
                          user.role?.toLowerCase() === 'admin'
                            ? '/admin/dashboard'
                            : user.role?.toLowerCase() === 'mentor'
                            ? '/mentor/dashboard'
                            : user.role?.toLowerCase() === 'corporate'
                            ? '/corporate/dashboard'
                            : '/student/dashboard'
                        }
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4.5 w-4.5" />
                        My Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          logout()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Unauthenticated Guest Actions */
                <div className="hidden lg:flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
                    Login
                  </Link>
                  <Link href="/get-started" className="btn btn-primary text-xs flex items-center gap-1.5 shadow-sm">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                id="header-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-card border-l border-border shadow-xl flex flex-col glass">
            {/* Mobile Header */}
            <div className="flex h-14 items-center justify-between px-5 border-b border-border">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span className="text-base font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  <span className="text-primary">Blue</span>learnerhub
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-5 space-y-1">
              {navItems.map((item) =>
                item.disabled ? (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm font-semibold text-muted-foreground"
                  >
                    {item.label}
                    <span className="inline-flex items-center gap-1 text-xs text-primary">
                      Soon <LockKeyhole className="h-3 w-3" />
                    </span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? 'text-primary bg-primary/10 border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Mobile Guest Buttons */}
            {!isAuthenticated && (
              <div className="p-5 border-t border-border flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn btn-outline text-center py-2.5 text-xs"
                >
                  Login
                </Link>
                <Link
                  href="/get-started"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn btn-primary text-center py-2.5 text-xs"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
