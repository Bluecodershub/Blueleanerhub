'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BrandMark } from '@/components/branding/Logo'
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Code2,
  Trophy,
  CalendarDays,
  Bot,
  UserCheck,
  LineChart,
  Building2,
} from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'Interactive Lessons', body: 'Learn by doing with bite-sized lessons and a live code editor from your first line.', color: 'text-primary' },
  { icon: GraduationCap, title: 'Structured Courses', body: 'Guided, project-based courses with quizzes, assignments, and certificates.', color: 'text-success' },
  { icon: Code2, title: 'Coding Practice', body: 'Sharpen skills in an online IDE with problems across 10+ languages.', color: 'text-warning' },
  { icon: Trophy, title: 'Hackathons', body: 'Build and ship real projects, compete on leaderboards, and earn recognition.', color: 'text-primary' },
  { icon: CalendarDays, title: 'Events', body: 'Workshops, webinars, bootcamps, and hiring challenges from partners.', color: 'text-success' },
  { icon: Bot, title: 'AI Review', body: 'Fast, learning-focused feedback on your code, projects, and submissions.', color: 'text-warning' },
  { icon: UserCheck, title: 'Mentor Review', body: 'Rubric-based mentor feedback that improves the quality of your work.', color: 'text-primary' },
  { icon: LineChart, title: 'Career Pathway', body: 'Track skill scores and build a portfolio that shows real, proven ability.', color: 'text-success' },
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

// Factual product highlights only — no fabricated engagement metrics.
const highlights = [
  { value: '11', label: 'Practice languages' },
  { value: 'Free', label: 'to start, no card' },
  { value: 'Browser', label: 'online IDE — no install' },
  { value: 'Moodle', label: 'powered courses' },
]

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-12 sm:pt-32">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="blob absolute left-1/2 top-4 h-72 w-[40rem] -translate-x-1/2" style={{ background: 'hsl(205 100% 60%)', opacity: 0.22 }} />
        </div>

        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pill text-primary"
              >
                <BrandMark size={20} className="rounded-md" alt="" />
                <span>A unified Ed-Tech ecosystem</span>
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mx-auto mt-6 max-w-xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl"
              >
                Learn, practise, build, compete — and get{' '}
                <span className="text-gradient">career-ready</span>.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0"
              >
                Interactive lessons, structured courses, hands-on practice, capstones, and hackathons —
                all in one place. Write real code in your browser from your very first lesson.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
              >
                <Link href="/get-started" className="btn btn-primary gap-2">
                  Start Learning Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/courses" className="btn btn-outline">Explore Courses</Link>
              </motion.div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                {['100% free to start', 'Verifiable certificates', 'No credit card'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="glow-card relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <Image
                  src="/img/hero-coding.jpg"
                  alt="A developer writing code on Bluelearnerhub"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
                  <Trophy className="h-4 w-4 text-success" />
                </span>
                <div>
                  <p className="text-xs font-bold text-foreground">Certificate earned</p>
                  <p className="text-[11px] text-muted-foreground">Python Fundamentals</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Factual highlights strip */}
          <div className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card/40 p-6 sm:grid-cols-4">
            {highlights.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-3xl font-medium text-white">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-medium text-white sm:text-4xl">Everything you need, in one ecosystem</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Stop juggling ten different tools. Learn, practise, build, and get reviewed — all in one place.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-card/40 p-6 transition-colors hover:border-primary/30">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                  <Icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Learn by doing (image split) ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border">
            <Image src="/img/learn-lessons.jpg" alt="Interactive coding lessons" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Learn by doing</p>
            <h2 className="mb-4 font-serif text-3xl font-medium text-white">Write real code from lesson one</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Every lesson pairs clear explanations with a live editor and instant output. Practise concepts the
              moment you learn them, then prove your skills with quizzes and exercises.
            </p>
            <ul className="space-y-3">
              {['In-browser IDE — nothing to install', 'Instant output and test feedback', 'Quizzes and exercises after every lesson', 'Progress tracking and bookmarks'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/lessons" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Browse lessons <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Student journey ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-medium text-white sm:text-4xl">Your path to career readiness</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">A clear, guided journey from your first lesson to a portfolio that proves your skills.</p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journey.map((step, i) => (
            <li key={step} className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
              <span className="text-sm text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── For Colleges & Corporates ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
            <div className="relative aspect-[16/9]">
              <Image src="/img/colleges.jpg" alt="College students learning" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                <GraduationCap className="h-3.5 w-3.5" /> For Colleges
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Bring career-readiness to your campus</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                Manage students, track department-level progress, host internal hackathons, and support placement
                readiness — all from one dashboard.
              </p>
              <Link href="/for-colleges" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Explore for colleges <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
            <div className="relative aspect-[16/9]">
              <Image src="/img/corporates.jpg" alt="Corporate team collaborating" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                <Building2 className="h-3.5 w-3.5" /> For Corporates
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Find talent through real project work</h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                Host hackathons and hiring challenges, post problem statements, and evaluate candidates on
                demonstrated skill. Hiring challenges may create opportunities.
              </p>
              <Link href="/for-corporates" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                Explore for corporates <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Business model / pricing teaser ────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid items-center gap-10 rounded-3xl border border-border bg-card/40 p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Simple, transparent pricing</p>
            <h2 className="mb-4 font-serif text-3xl font-medium text-white">Start free. Upgrade when you’re ready.</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Free for individual learners. Pro for premium courses and advanced AI review. Custom plans for colleges
              and corporates with dashboards, analytics, and private hackathons.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing" className="btn btn-primary">View Pricing</Link>
              <Link href="/contact" className="btn btn-outline">Contact Sales</Link>
            </div>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border">
            <Image src="/img/analytics.jpg" alt="Analytics dashboard" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto my-16 max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-8 py-16 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="blob absolute left-1/2 top-0 h-48 w-[30rem] -translate-x-1/2" style={{ background: 'hsl(50 100% 50%)', opacity: 0.16 }} />
          </div>
          <div className="relative">
            <h2 className="mb-3 font-serif text-3xl font-medium text-white sm:text-4xl">Start building your future today</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Join Bluelearnerhub and turn learning into real, demonstrable skills — for free.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/get-started" className="btn btn-primary gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="btn btn-outline">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
