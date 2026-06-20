'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Code2,
  Home,
  LayoutDashboard,
  Rocket,
  Terminal,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const quickLinks = [
  { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Hackathons', href: '/hackathons', icon: Trophy },
  { label: 'Practice', href: '/hackathons/practice', icon: Code2 },
  { label: 'Sandbox', href: '/ide', icon: Terminal },
  { label: 'Capstones', href: '/hackathons/capstones', icon: Rocket },
]

const segmentLabels: Record<string, string> = {
  hackathons: 'Hackathons',
  practice: 'Practice',
  capstone: 'Capstone',
  capstones: 'Capstones',
  submit: 'Submit',
  team: 'Team',
  live: 'Live',
}

function labelForSegment(segment: string, previous?: string): string {
  if (segmentLabels[segment]) return segmentLabels[segment]
  if (previous === 'hackathons') return 'Details'

  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  let href = ''

  return segments.map((segment, index) => {
    href += `/${segment}`
    return {
      href,
      label: labelForSegment(segment, segments[index - 1]),
    }
  })
}

export function PlatformNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const breadcrumbs = buildBreadcrumbs(pathname)

  return (
    <nav className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
              aria-label="Go to previous page"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => router.forward()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-card text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
              aria-label="Go to next page"
              title="Forward"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm text-muted-foreground">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => {
              const active = index === breadcrumbs.length - 1
              return (
                <span key={crumb.href} className="inline-flex shrink-0 items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  {active ? (
                    <span className="rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="rounded-md px-2 py-1 font-medium transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {quickLinks.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary/30 bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
