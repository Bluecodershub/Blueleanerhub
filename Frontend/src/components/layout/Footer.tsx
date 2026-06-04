'use client'

import Link from 'next/link'

const footerLinks = {
  Learn: [
    { label: 'All Lessons', href: '/library' },
    { label: 'AI & Python', href: '/library/computer-science' },
    { label: 'Hackathons', href: '/hackathons' },
    { label: 'Mentors (Soon)', href: '/mentors' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ],
  Platform: [
    { label: 'For Students', href: '/get-started' },
    { label: 'For Corporates', href: '/corporate' },
    { label: 'Spaces', href: '/spaces' },
    { label: 'Code Editor', href: '/ide' },
  ],
  Resources: [
    { label: 'Library', href: '/library' },
    { label: 'Tutorials', href: '/tutorials' },
    { label: 'Community', href: '/community' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="mt-20 w-full border-t border-border bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2.5">
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
              <span className="font-heading text-lg font-semibold text-foreground">
                <span className="text-primary">Blue</span>learnerhub
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-7 text-muted-foreground">
              A calm engineering learning space for lessons, practice, hackathons, and mentorship.
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
          <p>Copyright {new Date().getFullYear()} Bluelearnerhub. A Product of Bluecoderhub.</p>
          <p>
            Need help?{' '}
            <a href="mailto:connect@bluecoderhub.com" className="text-primary hover:text-primary/80">
              connect@bluecoderhub.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
