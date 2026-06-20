import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Presentation, Video, Briefcase, Code2, Rocket, Mic2, CalendarClock } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Hackathons, workshops, webinars, hiring challenges, coding competitions, bootcamps, and tech talks hosted by Bluelearnerhub and our college and corporate partners.',
  robots: { index: true, follow: true },
}

const eventTypes = [
  { icon: Trophy, title: 'Hackathons', body: 'Build and ship real projects against the clock, solo or in teams.', href: '/hackathons' },
  { icon: Code2, title: 'Coding competitions', body: 'Sharpen your problem-solving in timed competitive challenges.', href: '/hackathons/practice' },
  { icon: Briefcase, title: 'Hiring challenges', body: 'Skill-based challenges hosted by companies. May create opportunities.', href: '/for-corporates' },
  { icon: Presentation, title: 'Workshops', body: 'Hands-on, instructor-led sessions on focused topics.', href: '/contact' },
  { icon: Video, title: 'Webinars', body: 'Live online sessions with industry practitioners and educators.', href: '/contact' },
  { icon: Rocket, title: 'Bootcamps', body: 'Intensive, multi-day programs to fast-track a skill.', href: '/contact' },
  { icon: Mic2, title: 'Tech talks', body: 'Talks and AMAs from engineers, founders, and researchers.', href: '/contact' },
  { icon: CalendarClock, title: 'Placement-readiness programs', body: 'Structured programs that build interview and project readiness.', href: '/for-colleges' },
]

export default function EventsPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="Events"
        title="Learn live. Compete. Connect."
        subtitle="From hackathons and coding competitions to workshops and tech talks — discover events run by Bluelearnerhub and our college and corporate partners."
      >
        <Link href="/hackathons" className="btn btn-primary">Browse Hackathons</Link>
        <Link href="/contact" className="btn btn-outline">Host an Event</Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="Types of events" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {eventTypes.map((e) => {
            const Icon = e.icon
            return (
              <Link
                key={e.title}
                href={e.href}
                className="group rounded-2xl border border-border/40 bg-card/40 p-6 transition-colors hover:border-primary/30 hover:bg-card/70"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-white group-hover:text-primary">{e.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-3xl border border-border/40 bg-card/40 p-8 text-center">
          <h2 className="mb-3 font-serif text-2xl font-medium text-white">Organizing for a college or company?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Colleges and corporates can request events and hackathons. Submissions are reviewed and published after
            admin approval to keep the community safe and high-quality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/for-colleges" className="btn btn-outline">For Colleges</Link>
            <Link href="/for-corporates" className="btn btn-outline">For Corporates</Link>
          </div>
        </div>
      </section>

      <CtaBand
        title="Don’t miss the next one"
        subtitle="Create a free account to register for events and get notified about new hackathons."
        primary={{ label: 'Get Started Free', href: '/get-started' }}
        secondary={{ label: 'Browse Hackathons', href: '/hackathons' }}
      />
    </main>
  )
}
