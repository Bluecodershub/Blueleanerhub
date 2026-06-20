import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, BarChart3, Trophy, GraduationCap, CalendarDays, FileText, ShieldCheck, BookOpen } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'For Colleges & Universities',
  description:
    'Give your students a unified platform to learn, practise, and build career-ready skills — with department-level analytics and placement-readiness support.',
  robots: { index: true, follow: true },
}

const capabilities = [
  { icon: Users, title: 'Manage students', body: 'Invite students, organise them by department or batch, and monitor participation from one dashboard.' },
  { icon: BarChart3, title: 'Department-level analytics', body: 'Track course progress, coding activity, and engagement across departments and cohorts.' },
  { icon: Trophy, title: 'Host internal hackathons', body: 'Run college-branded hackathons and coding competitions with built-in submission and judging.' },
  { icon: CalendarDays, title: 'Request events', body: 'Request workshops, bootcamps, and tech talks — published after admin approval.' },
  { icon: GraduationCap, title: 'Placement readiness', body: 'Use skill scores and project portfolios to support placement-readiness, not guaranteed placement.' },
  { icon: FileText, title: 'Download reports', body: 'Export progress and participation reports for academic and accreditation needs.' },
]

const steps = [
  { n: '1', title: 'Request a college account', body: 'Tell us about your institution. Our team verifies your details.' },
  { n: '2', title: 'Admin approval', body: 'Once approved, your college dashboard and student invites are unlocked.' },
  { n: '3', title: 'Onboard students', body: 'Invite students and organise them by department or batch.' },
  { n: '4', title: 'Track & grow', body: 'Monitor progress, host events, and support placement readiness.' },
]

export default function ForCollegesPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="For Colleges & Universities"
        title="A career-readiness platform for your entire campus"
        subtitle="Bring lessons, courses, coding practice, hackathons, and analytics together — and give every student a clear path to industry-relevant skills."
      >
        <Link href="/contact" className="btn btn-primary">Partner With Us</Link>
        <Link href="/pricing" className="btn btn-outline">View Pricing</Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="What your college can do" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="rounded-2xl border border-border/40 bg-card/40 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{c.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <SectionHeading title="How partnership works" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/40 bg-card/40 p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mb-1.5 font-semibold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <BookOpen className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-1.5 font-semibold text-white">Publish college content</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Share approved learning material with your students directly on the platform.</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-1.5 font-semibold text-white">Data handled responsibly</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Student data is processed under our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and DPDP-aligned consent framework.</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <Trophy className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-1.5 font-semibold text-white">Leaderboards & recognition</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Celebrate top performers with cohort leaderboards and skill-based certificates.</p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Bring Bluelearnerhub to your campus"
        subtitle="Request a college account and our team will help you onboard your departments."
        primary={{ label: 'Partner With Us', href: '/contact' }}
        secondary={{ label: 'For Corporates', href: '/for-corporates' }}
      />
    </main>
  )
}
