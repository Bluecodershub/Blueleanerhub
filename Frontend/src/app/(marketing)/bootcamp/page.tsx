import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Rocket,
  Target,
  Users,
  BookOpen,
  Code2,
  Briefcase,
  Award,
  CheckCircle2,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'Bootcamps',
  description:
    'Intensive, cohort-based bootcamps that take you from fundamentals to job-ready. Live mentorship, real projects, career support — 8 to 16 weeks.',
  robots: { index: true, follow: true },
}

const pillars = [
  { icon: Target, title: 'Outcome-focused', body: 'Bootcamps are designed around a concrete outcome: land a role in that stack, ship a portfolio project, or crack a specific interview loop.' },
  { icon: Users, title: 'Cohort-based', body: 'You learn with a small cohort. Peer accountability keeps momentum high; live sessions keep questions unblocked.' },
  { icon: Code2, title: 'Real projects', body: 'Every module ends with a project that goes to your portfolio. Everything is code you own and can talk about in an interview.' },
  { icon: Briefcase, title: 'Career support', body: 'Mock interviews, resume reviews, GitHub polish, and dedicated placement support hours in the last three weeks.' },
]

const tracks = [
  {
    title: 'Full-Stack Web Development',
    duration: '12 weeks',
    seats: '30 seats / cohort',
    outcomes: ['Ship 3 full-stack projects', 'Master React, Node, Postgres', 'Land junior fullstack role'],
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Data Structures & Algorithms',
    duration: '8 weeks',
    seats: '40 seats / cohort',
    outcomes: ['Solve 200+ curated problems', 'Master patterns for FAANG loops', 'Mock interviews weekly'],
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    title: 'AI & Machine Learning',
    duration: '14 weeks',
    seats: '25 seats / cohort',
    outcomes: ['Build 4 ML projects end-to-end', 'Deploy models with FastAPI', 'Prep for ML engineer roles'],
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    title: 'System Design',
    duration: '10 weeks',
    seats: '30 seats / cohort',
    outcomes: ['Design 15+ real systems', 'Master scale and reliability trade-offs', 'Ace senior-level interview loops'],
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
]

const schedule = [
  { week: 'Weeks 1-3', title: 'Foundations', body: 'Bring everyone to the same baseline. Fill gaps quickly with hands-on labs and pair programming.' },
  { week: 'Weeks 4-8', title: 'Core building', body: 'Deep, project-heavy modules. You build features every week and get code review from mentors.' },
  { week: 'Weeks 9-11', title: 'Capstone', body: 'Design and ship a capstone project you can put on your resume and demo in interviews.' },
  { week: 'Weeks 12+', title: 'Career sprint', body: 'Interview prep, mock rounds, resume and LinkedIn polish, and dedicated placement support.' },
]

const includes = [
  'Live sessions with industry mentors',
  '1:1 code review weekly',
  'Portfolio of 3-4 real projects',
  'Access to Bluelearnerhub lesson library',
  'Verified completion certificate',
  'Placement support and referrals',
  'Alumni network access',
  'Lifetime course material access',
]

export default function BootcampPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="Bootcamps"
        title="From fundamentals to job-ready in 8-16 weeks"
        subtitle="Intensive cohort programs with live mentorship, real projects, and dedicated career support. Choose your track, join the cohort, and ship something you can put on your resume."
      >
        <Link href="/get-started" className="btn btn-primary gap-2">
          Apply for next cohort <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/contact" className="btn btn-outline">
          Talk to a mentor
        </Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="What makes a Bluelearnerhub bootcamp different" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="rounded-2xl border border-border/40 bg-card/40 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <SectionHeading title="Available tracks" />
        <div className="grid gap-6 sm:grid-cols-2">
          {tracks.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border/40 bg-card/40 p-7 transition-colors hover:border-primary/40">
              <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${t.bg} ${t.color}`}>
                <Rocket className="h-3.5 w-3.5" />
                Cohort program
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">{t.title}</h3>
              <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t.duration}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t.seats}
                </span>
              </div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outcomes</p>
              <ul className="space-y-2">
                {t.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {o}
                  </li>
                ))}
              </ul>
              <Link
                href="/get-started"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Apply for this track <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <SectionHeading title="How a bootcamp week is structured" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {schedule.map((s) => (
            <div key={s.week} className="rounded-2xl border border-border/40 bg-card/40 p-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">{s.week}</p>
              <h3 className="mb-1.5 font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-border/40 bg-card/40 p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Included in every bootcamp</p>
              <h2 className="font-serif text-2xl font-medium text-foreground">What you get</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {includes.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to change your career?"
        subtitle="Applications open for the next cohort. Small seats — early applicants get scholarship consideration."
        primary={{ label: 'Apply now', href: '/get-started' }}
        secondary={{ label: 'Talk to a mentor', href: '/contact' }}
      />
    </main>
  )
}
