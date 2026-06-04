'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Globe,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react'

const lessons = [
  {
    icon: Brain,
    title: 'AI-Powered Quizzes',
    description: 'Personalized questions with immediate feedback and clear explanations.',
    time: '10-25 min',
    href: '/library/ai-quizzes',
  },
  {
    icon: Code2,
    title: 'Data Structures & Algorithms',
    description: 'Arrays, trees, graphs, sorting, and dynamic programming through practice.',
    time: '20-45 min',
    href: '/library/computer-science',
  },
  {
    icon: Database,
    title: 'SQL & Databases',
    description: 'Write better queries, understand indexes, and reason about performance.',
    time: '15-30 min',
    href: '/library/databases',
  },
  {
    icon: Globe,
    title: 'Web Development',
    description: 'Build full-stack applications with modern frontend and backend foundations.',
    time: '20-40 min',
    href: '/library/web-dev',
  },
  {
    icon: Cpu,
    title: 'Embedded Systems',
    description: 'Microcontrollers, GPIO, UART, and real-time systems in practical lessons.',
    time: '25-50 min',
    href: '/library/electrical',
  },
  {
    icon: Wrench,
    title: 'Mechanical Engineering',
    description: 'Thermodynamics, manufacturing, CAD/CAM, and engineering design basics.',
    time: '20-40 min',
    href: '/library/mechanical',
  },
  {
    icon: BarChart3,
    title: 'Data Science & ML',
    description: 'Pandas, NumPy, model training, evaluation, and deployment workflows.',
    time: '30-60 min',
    href: '/library/data-science',
  },
  {
    icon: ShieldCheck,
    title: 'System Design',
    description: 'Scalable systems, caching, queues, load balancing, and tradeoff analysis.',
    time: '25-50 min',
    href: '/library/system-design',
  },
]

const whyItems = [
  {
    num: '01',
    headline: 'Learning paths with room to think.',
    body: 'Lessons are paced like concise digital chapters, with enough context to understand the concept before practice begins.',
  },
  {
    num: '02',
    headline: 'Practice connected to real outcomes.',
    body: 'Coding exercises, quizzes, and projects build toward portfolios, interviews, hackathons, and stronger fundamentals.',
  },
  {
    num: '03',
    headline: 'A platform for engineering breadth.',
    body: 'Computer science, mechanical, electrical, civil, and management tracks live together in one consistent academy.',
  },
]

const tracks = [
  {
    name: 'Computer Science',
    icon: Code2,
    color: 'hsl(var(--cs-blue))',
    topics: ['Python', 'JavaScript', 'DSA', 'Algorithms'],
    href: '/library/computer-science',
  },
  {
    name: 'Mechanical',
    icon: Wrench,
    color: 'hsl(var(--mech-orange))',
    topics: ['Thermodynamics', 'CAD/CAM', 'Manufacturing'],
    href: '/library/mechanical',
  },
  {
    name: 'Electrical',
    icon: Zap,
    color: 'hsl(var(--elec-yellow))',
    topics: ['Circuits', 'Power Systems', 'Electronics'],
    href: '/library/electrical',
  },
  {
    name: 'Civil',
    icon: Globe,
    color: 'hsl(var(--civil-teal))',
    topics: ['Structures', 'Geotechnical', 'Hydraulics'],
    href: '/library/civil',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: 'easeOut' },
  }),
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="px-4 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5 text-sm font-semibold uppercase text-primary"
              >
                Engineering learning academy
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="max-w-4xl text-balance"
              >
                Learn engineering with calm lessons, thoughtful practice, and AI-guided feedback.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
              >
                Bluelearnerhub brings lessons, coding exercises, quizzes, and hackathons into one clean workspace for engineering students. Courses and mentors are opening after beta.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link href="/library" id="hero-start-btn" className="btn btn-primary">
                  Browse lessons
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/get-started" id="hero-account-btn" className="btn btn-outline">
                  Create free account
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Today in your academy</p>
                  <p className="text-sm text-muted-foreground">A focused plan for the next study block.</p>
                </div>
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-5">
                {[
                  ['Read', 'System design: caching and consistency'],
                  ['Practice', 'Solve two graph traversal problems'],
                  ['Review', 'AI quiz feedback from yesterday'],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[88px_1fr] gap-4">
                    <span className="text-sm font-semibold uppercase text-primary">{label}</span>
                    <span className="text-sm leading-6 text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="lessons" className="section bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <span className="section-tag">Free lessons</span>
            <h2 className="mb-4">Start with the fundamentals</h2>
            <p className="text-muted-foreground">
              Each chapter is designed to be readable, practical, and compact enough for consistent study.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {lessons.map((lesson, i) => {
              const Icon = lesson.icon
              return (
                <motion.div key={lesson.title} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
                  <Link href={lesson.href} id={`lesson-card-${i}`} className="lesson-card group">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-xl transition-colors group-hover:text-primary">{lesson.title}</h3>
                      <p className="mb-3 text-sm leading-6 text-muted-foreground">{lesson.description}</p>
                      <span className="text-xs font-semibold text-muted-foreground">{lesson.time}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="why" className="section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-2xl">
            <span className="section-tag">Why Bluelearnerhub</span>
            <h2>Engineering lessons that actually stick</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {whyItems.map((item, i) => (
              <motion.div key={item.num} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} className="card h-full p-7">
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50 text-sm font-semibold text-muted-foreground">
                  {item.num}
                </div>
                <h3 className="mb-3">{item.headline}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="tracks" className="section bg-background-secondary">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="section-tag">Learning tracks</span>
            <h2 className="mb-3">Pick your engineering domain</h2>
            <p className="text-muted-foreground">Move from reading to practice with clear tracks across core engineering areas.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tracks.map((track, i) => {
              const Icon = track.icon
              return (
                <motion.div key={track.name} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
                  <Link href={track.href} id={`domain-card-${i}`} className="card block h-full p-5 transition-colors hover:border-primary/40">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${track.color}18` }}>
                      <Icon className="h-5 w-5" style={{ color: track.color }} />
                    </div>
                    <h3 className="mb-3 text-xl">{track.name}</h3>
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {track.topics.map((topic) => (
                        <span key={topic} className="rounded-full bg-secondary/70 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                      View track <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="cta" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-xl border border-border bg-card px-6 py-14 text-center shadow-sm sm:px-10">
          <h2 className="mx-auto mb-4 max-w-3xl">Start learning in a space designed for focus.</h2>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Join Bluelearnerhub to study, practice, and build proof of skill without a loud dashboard getting in the way.
          </p>
          <Link href="/get-started" id="cta-join-btn" className="btn btn-primary">
            Start learning free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
