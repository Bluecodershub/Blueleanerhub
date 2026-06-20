import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Code2, Trophy, Sparkles, Users2, ShieldCheck } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Bluelearnerhub is a unified Ed-Tech ecosystem that brings learning, practice, projects, and hackathons together to make students career-ready.',
  robots: { index: true, follow: true },
}

const values = [
  { icon: BookOpen, title: 'Learning that sticks', body: 'Interactive lessons and structured courses that turn concepts into real, applied skills.' },
  { icon: Code2, title: 'Practice by doing', body: 'A coding practice arena and online IDE so learners build by writing real code.' },
  { icon: Trophy, title: 'Compete and build', body: 'Hackathons, events, and capstone projects that mirror real industry challenges.' },
  { icon: Sparkles, title: 'Feedback that helps', body: 'AI review for fast, learning-focused feedback, with mentor review for depth.' },
  { icon: Users2, title: 'Open to everyone', body: 'Built for students, colleges, corporates, mentors, and hiring partners alike.' },
  { icon: ShieldCheck, title: 'Trust by design', body: 'Privacy, consent, and fair evaluation are built into the platform, not bolted on.' },
]

const journey = [
  'Take a skill assessment',
  'Get course recommendations',
  'Learn with lessons',
  'Practise coding',
  'Build projects',
  'Join hackathons',
  'Get AI & mentor review',
  'Earn certificates',
  'Improve career readiness',
]

export default function AboutPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="About Bluelearnerhub"
        title="Learn, practise, build, compete — and get career-ready"
        subtitle="Bluelearnerhub is a unified Ed-Tech ecosystem that connects lessons, courses, coding practice, hackathons, and projects into one clear path from learning to career readiness."
      >
        <Link href="/get-started" className="btn btn-primary">Get Started</Link>
        <Link href="/contact" className="btn btn-outline">Contact Us</Link>
      </PageHero>

      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-3xl border border-border/40 bg-card/40 p-8">
          <h2 className="mb-3 font-serif text-2xl font-medium text-white">Our mission</h2>
          <p className="leading-relaxed text-muted-foreground">
            Too many learners juggle separate tools for lessons, practice, projects, and competitions — and lose the
            thread between them. We bring it all together so every learner has one place to grow skills, prove them
            through real work, and connect with colleges and employers. We focus on career-readiness and honest
            outcomes: skill-based certificates and industry-relevant projects, not empty promises.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <SectionHeading title="What we believe" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.title} className="rounded-2xl border border-border/40 bg-card/40 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{v.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <SectionHeading title="The student journey" subtitle="A clear, guided path from your first lesson to career readiness." />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <li key={step} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand
        title="Join the ecosystem"
        subtitle="Whether you’re a student, college, or company — there’s a place for you here."
        primary={{ label: 'Get Started Free', href: '/get-started' }}
        secondary={{ label: 'For Colleges', href: '/for-colleges' }}
      />
    </main>
  )
}
