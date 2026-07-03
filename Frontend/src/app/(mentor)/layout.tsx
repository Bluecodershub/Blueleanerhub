'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, ClipboardCheck, UserCircle, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { Logo } from '@/components/branding/Logo'

const navItems = [
  { title: 'Dashboard', href: '/mentor/dashboard', icon: LayoutDashboard },
  { title: 'Classes', href: '/mentor/classes', icon: Users },
  { title: 'Reviews', href: '/mentor/reviews', icon: ClipboardCheck },
  { title: 'Profile', href: '/mentor/profile', icon: UserCircle },
]

function SidebarLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <RoleGuard allowedRoles={['MENTOR', 'ADMIN']}>
      <div className="app-workspace min-h-screen text-foreground">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-sidebar p-4 lg:flex">
          <Link href="/mentor/dashboard" className="mb-6 flex items-center gap-2 px-2">
            <Logo markSize={28} />
          </Link>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mentor</p>
          <SidebarLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <button
            onClick={logout}
            className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4.5 w-4.5" /> Sign Out
          </button>
        </aside>

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <Link href="/mentor/dashboard" className="flex flex-col leading-tight">
            <span className="font-heading text-base font-bold">Bluelearnerhub</span>
            <span className="text-[10px] font-bold uppercase text-primary">Mentor</span>
          </Link>
          <button onClick={() => setOpen(true)} className="rounded-lg border border-border p-2"><Menu className="h-4 w-4" /></button>
        </div>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-64 border-r border-border bg-sidebar p-4">
              <div className="mb-6 flex items-center justify-between">
                <span className="font-heading font-bold">Mentor</span>
                <button onClick={() => setOpen(false)} className="rounded-lg border border-border p-1.5"><X className="h-4 w-4" /></button>
              </div>
              <SidebarLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              <button onClick={logout} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4.5 w-4.5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="lg:pl-60">
          <div className="app-page-frame max-w-7xl">{children}</div>
        </main>
      </div>
    </RoleGuard>
  )
}
