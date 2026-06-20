'use client'

import Link from 'next/link'

import { Logo } from '@/components/branding/Logo'
import { legalNav } from '@/data/legal'

const footerLinks = {
  Platform: [
    { label: 'Lessons', href: '/lessons' },
    { label: 'Courses', href: '/courses' },
    { label: 'Practice', href: '/hackathons/practice' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Events', href: '/events' },
  ],
  Learning: [
    { label: 'Library', href: '/library' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Certificates', href: '/certificates' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'For Colleges', href: '/for-colleges' },
    { label: 'For Corporates', href: '/for-corporates' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: legalNav,
}

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <Link href="/" className="mb-4 inline-flex items-center">
              <Logo markSize={34} className="gap-2.5" />
            </Link>
            <p className="max-w-xs text-sm leading-7 text-muted-foreground">
              A unified Ed-Tech ecosystem for lessons, structured courses, coding practice, capstones, hackathons, and career growth.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Free for personal use
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 font-sans text-xs font-bold uppercase text-muted-foreground">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border" />

        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>Copyright {new Date().getFullYear()} Bluelearnerhub.</p>
          <p>
            Need help?{' '}
            <a href="mailto:connect@bluelearnerhub.com" className="text-primary hover:text-primary/80">
              connect@bluelearnerhub.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
