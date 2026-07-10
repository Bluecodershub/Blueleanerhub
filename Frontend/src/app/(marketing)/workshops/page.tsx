import type { Metadata } from 'next'
import Link from 'next/link'
import { Presentation, Users, Clock, Award, Zap, Calendar, ArrowRight, BookOpen } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'Workshops',
  description:
    'Hands-on, expert-led workshops on trending engineering topics — short, focused, and skill-driven. Learn by building alongside industry mentors.',
  robots: { index: true, follow: true },
}

const features = [
  { icon: Zap, title: 'Live, hands-on', body: 'Every workshop is live and project-based — no passive slides. You leave with working code and a repo.' },
  { icon: Users, title: 'Small cohorts', body: 'Cohorts stay small so mentors can review each participant\'s work and give real feedback.' },
  { icon: Clock, title: '2 to 6 hours', body: 'Focused single-day sessions on weekends, designed to fit around college or work.' },
  { icon: Award, title: 'Verified certificate', body: 'Complete the workshop project to earn a verifiable Bluelearnerhub certificate.' },
]

const upcoming = [
  {
    title: 'Building a REST API with Node.js and Express',
    track: 'Backend',
    duration: '4 hours',
    level: 'Beginner',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'Data Structures Deep Dive — Trees and Graphs',
    track: 'DSA',
    duration: '5 hours',
    level: 'Intermediate',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    title: 'Intro to Machine Learning with scikit-learn',
    track: 'AI/ML',
    duration: '6 hours',
    level: 'Beginner',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    title: 'System Design — From Zero to a Scalable App',
    track: 'System Design',
    duration: '5 hours',
    level: 'Advanced',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    title: 'React & Next.js Fundamentals',
    track: 'Frontend',
    duration: '4 hours',
    level: 'Beginner',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    title: 'Docker and Containers for Developers',
    track: 'DevOps',
    duration: '3 hours',
    level: 'Intermediate',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
]

const format = [
  { n: '1', title: 'Pick a workshop', body: 'Browse upcoming workshops by track, level, and date. Enroll in one click.' },
  { n: '2', title: 'Attend live', body: 'Join the live session with a mentor and a small cohort. Ask questions in real time.' },
  { n: '3', title: 'Build a project', body: 'Work on a guided project during the session. Get feedback and code review from the mentor.' },
  { n: '4', title: 'Earn a certificate', body: 'Submit your project to earn a verifiable certificate you can share on your resume or LinkedIn.' },
]

export default function WorkshopsPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="Workshops"
        title="Short, focused, mentor-led sessions that teach a skill by building it"
        subtitle="Every workshop is live, small-group, project-based, and ends with a verifiable certificate. Pick a topic, spend a weekend, and walk away with real, working code."
      >
        <Link href="/get-started" className="btn btn-primary gap-2">
          Get started free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/pricing" className="btn btn-outline">
          View pricing
        </Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="Why our workshops work" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-2xl border border-border/40 bg-card/40 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <SectionHeading title="Upcoming workshops" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((w) => (
            <div key={w.title} className="rounded-2xl border border-border/40 bg-card/40 p-6 transition-colors hover:border-primary/40">
              <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${w.bg} ${w.color}`}>
                <Presentation className="h-3.5 w-3.5" />
                {w.track}
              </div>
              <h3 className="mb-3 text-base font-semibold leading-snug text-foreground">{w.title}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {w.duration}
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {w.level}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Weekend
                </span>
              </div>
              <Link
                href="/get-started"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Enroll <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <SectionHeading title="How workshops work" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {format.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border/40 bg-card/40 p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mb-1.5 font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Ready to build something this weekend?"
        subtitle="Pick a workshop, join a cohort, and walk away with a project — and a certificate to prove it."
        primary={{ label: 'Get started free', href: '/get-started' }}
        secondary={{ label: 'See all courses', href: '/courses' }}
      />
    </main>
  )
}
