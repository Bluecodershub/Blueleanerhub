'use client'

import Link from 'next/link'

const footerLinks = {
  Learn: [
    { label: 'All Lessons',   href: '/library' },
    { label: 'AI & Python',   href: '/library/computer-science' },
    { label: 'Hackathons',    href: '/hackathons' },
    { label: 'Mentors',       href: '/mentors' },
    { label: 'Leaderboard',   href: '/leaderboard' },
  ],
  Platform: [
    { label: 'For Students',  href: '/get-started' },
    { label: 'For Corporates', href: '/corporate' },
    { label: 'Spaces',        href: '/spaces' },
    { label: 'Code Editor',   href: '/ide' },
  ],
  Resources: [
    { label: 'Library',       href: '/library' },
    { label: 'Tutorials',     href: '/tutorials' },
    { label: 'Community',     href: '/community' },
  ],
  Legal: [
    { label: 'Privacy',       href: '/privacy' },
    { label: 'Terms',         href: '/terms' },
    { label: 'Contact',       href: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer
      className="w-full border-t mt-20"
      style={{ background: 'hsl(222 47% 9%)', color: '#c9d1d9', borderColor: '#21262d' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* ── Top grid ── */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
            {/* Brand */}
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <svg
                  className="h-7 w-7"
                  style={{ color: '#6080ff' }}
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
                <span
                  className="text-base font-bold"
                  style={{ fontFamily: 'var(--font-heading)', color: '#e6edf3' }}
                >
                  <span style={{ color: '#6080ff' }}>Blue</span>learnerhub
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-mono)', color: '#8b949e' }}>
                Master any engineering domain.
                <br />
                Practice. Compete. Succeed.
              </p>

              {/* Badge */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono"
                style={{ borderColor: '#30363d', color: '#8b949e' }}>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Free for personal use
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3
                  className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ fontFamily: 'var(--font-mono)', color: '#8b949e' }}
                >
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ fontFamily: 'var(--font-mono)', color: '#8b949e' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="mt-10 border-t" style={{ borderColor: '#21262d' }} />

          {/* ── Bottom bar ── */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#57606a' }}>
              © {new Date().getFullYear()} Bluelearnerhub. A Product of Bluecoderhub.
            </p>
            <p className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#57606a' }}>
              Need help?{' '}
              <a
                href="mailto:connect@bluecoderhub.com"
                className="transition-colors hover:text-white"
                style={{ color: '#8b949e' }}
              >
                connect@bluecoderhub.com
              </a>
            </p>
          </div>
        </div>
    </footer>
  )
}
