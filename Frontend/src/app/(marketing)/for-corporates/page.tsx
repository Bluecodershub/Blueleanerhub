import type { Metadata } from 'next'
import Link from 'next/link'
import { Trophy, Target, Users, ClipboardCheck, BarChart3, Building2, Award, ShieldCheck } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'For Corporates',
  description:
    'Host hackathons and hiring challenges, post problem statements, and discover skilled talent through real project work. Hiring challenges may create opportunities.',
  robots: { index: true, follow: true },
}

const capabilities = [
  { icon: Trophy, title: 'Host hackathons', body: 'Run branded corporate hackathons with built-in registration, submission, and judging.' },
  { icon: Target, title: 'Post problem statements', body: 'Share real-world challenges and see how candidates approach them with working solutions.' },
  { icon: Users, title: 'Discover talent', body: 'Review participants and submissions, and shortlist candidates based on demonstrated skill.' },
  { icon: ClipboardCheck, title: 'Evaluate submissions', body: 'Combine AI-assisted preliminary scoring with your own evaluation for fair shortlisting.' },
  { icon: BarChart3, title: 'Event analytics', body: 'Track registrations, submissions, and engagement across your hosted events.' },
  { icon: Building2, title: 'Employer branding', body: 'Showcase your brand to a community of motivated, career-focused learners.' },
]

const steps = [
  { n: '1', title: 'Request a corporate account', body: 'Share your company details for verification.' },
  { n: '2', title: 'Admin approval', body: 'Once verified, your corporate dashboard is activated.' },
  { n: '3', title: 'Create a challenge', body: 'Submit a hackathon or hiring-challenge request with your problem statement.' },
  { n: '4', title: 'Review & shortlist', body: 'Evaluate submissions and shortlist candidates after the event.' },
]

export default function ForCorporatesPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="For Corporates"
        title="Find talent through real project work"
        subtitle="Host hackathons and hiring challenges, post problem statements, and evaluate candidates on demonstrated skill — not just résumés."
      >
        <Link href="/login/corporate" className="btn btn-primary">Request Corporate Access</Link>
        <Link href="/contact" className="btn btn-outline">Talk to Sales</Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="What your team can do" />
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
        <SectionHeading title="How it works" />
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

      {/* Honest expectations */}
      <section className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-start gap-3 rounded-2xl border border-border/40 bg-card/40 p-6">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            We help you connect with skilled learners through fair, skill-based challenges. Hiring challenges may
            create opportunities — we do not guarantee hiring outcomes, and all candidate data is handled under our{' '}
            <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> with participant consent.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <Award className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-1.5 font-semibold text-white">Hiring challenge packages</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Run focused hiring challenges with custom problem statements and shortlisting tools.</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-6">
            <Building2 className="mb-3 h-5 w-5 text-primary" />
            <h3 className="mb-1.5 font-semibold text-white">Enterprise LMS access</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">Upskill your own teams with enterprise access to courses and learning tracks.</p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Host your next hackathon with us"
        subtitle="Request a corporate account and our team will help you launch your first challenge."
        primary={{ label: 'Request Corporate Access', href: '/login/corporate' }}
        secondary={{ label: 'View Pricing', href: '/pricing' }}
      />
    </main>
  )
}
