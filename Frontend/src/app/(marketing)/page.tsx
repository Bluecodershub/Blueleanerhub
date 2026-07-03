'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, type ReactNode } from 'react'
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  ArrowRight,
  Bot,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Code2,
  GraduationCap,
  LineChart,
  Trophy,
  UserCheck,
} from 'lucide-react'

import Footer from '@/components/layout/Footer'

const features = [
  {
    icon: BookOpen,
    title: 'Interactive lessons',
    body: 'Learn by doing with bite-sized lessons and a live code editor from your first line.',
    color: 'text-primary',
  },
  {
    icon: GraduationCap,
    title: 'Structured courses',
    body: 'Guided, project-based courses with quizzes, assignments, and certificates.',
    color: 'text-success',
  },
  {
    icon: Code2,
    title: 'Coding practice',
    body: 'Sharpen skills in an online IDE with problems across 10+ languages.',
    color: 'text-warning',
  },
  {
    icon: Trophy,
    title: 'Hackathons',
    body: 'Build and ship real projects, compete on leaderboards, and earn recognition.',
    color: 'text-primary',
  },
  {
    icon: CalendarDays,
    title: 'Events',
    body: 'Workshops, webinars, bootcamps, and hiring challenges from partners.',
    color: 'text-success',
  },
  {
    icon: Bot,
    title: 'AI review',
    body: 'Fast, learning-focused feedback on your code, projects, and submissions.',
    color: 'text-warning',
  },
  {
    icon: UserCheck,
    title: 'Mentor review',
    body: 'Rubric-based mentor feedback that improves the quality of your work.',
    color: 'text-primary',
  },
  {
    icon: LineChart,
    title: 'Career pathway',
    body: 'Track skill scores and build a portfolio that shows real, proven ability.',
    color: 'text-success',
  },
]

const journey = [
  'Take a skill assessment',
  'Get course recommendations',
  'Learn with lessons',
  'Practise coding',
  'Build projects',
  'Join hackathons',
  'Get AI and mentor review',
  'Earn certificates',
  'Improve career readiness',
]

const highlights = [
  { value: '11', label: 'practice languages' },
  { value: 'Free', label: 'to start, no card' },
  { value: 'Browser', label: 'online IDE, no install' },
  { value: 'Moodle', label: 'powered courses' },
]

const proofPoints = [
  'Transform and opacity based motion',
  'Reduced-motion aware experience',
  'Scroll-triggered learning story',
]

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

const cardReveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

function LandingScrollProgress() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()

  if (shouldReduceMotion) return null

  return (
    <motion.div
      aria-hidden
      className="fixed left-0 right-0 top-16 z-[60] h-1 origin-left bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.35)]"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [18, -34])
  const badgeY = useTransform(scrollYProgress, [0, 1], [-6, 28])

  return (
    <motion.div
      ref={ref}
      style={{ position: 'relative' }}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
      className="relative"
    >
      <motion.div
        style={shouldReduceMotion ? undefined : { y: imageY }}
        className="glow-card relative aspect-[4/3] overflow-hidden rounded-2xl border border-border will-change-transform"
      >
        <Image
          src="/img/hero-coding.jpg"
          alt="A learner writing code in the Bluelearnerhub browser IDE"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/70 via-background/10 to-transparent" />
        <div className="absolute inset-x-6 bottom-6 hidden rounded-xl border border-white/30 bg-white/85 p-4 shadow-lg backdrop-blur-md sm:block">
          <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-primary">
            <span>Learning loop</span>
            <span>Live</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-foreground">
            {['Learn', 'Code', 'Review', 'Ship'].map((step, index) => (
              <motion.div
                key={step}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + index * 0.08, duration: 0.35 }}
                className="rounded-lg bg-primary/10 px-2 py-2"
              >
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      <motion.div
        style={shouldReduceMotion ? undefined : { y: badgeY }}
        className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-lg will-change-transform sm:flex"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/15">
          <Trophy className="h-4 w-4 text-success" />
        </span>
        <div>
          <p className="text-xs font-bold text-foreground">Certificate earned</p>
          <p className="text-[11px] text-muted-foreground">Python Fundamentals</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-hidden">
        <LandingScrollProgress />

        <section className="relative pb-12 pt-28 sm:pt-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_42%)]" />

          <div className="container relative mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="text-center lg:text-left">
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="pill text-primary"
                >
                  A unified Ed-Tech ecosystem
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="mx-auto mt-6 max-w-xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:mx-0 lg:text-6xl"
                >
                  Learn, practise, build, compete, and get{' '}
                  <span className="text-gradient">career-ready</span>.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0"
                >
                  Interactive lessons, structured courses, hands-on practice, capstones, and hackathons in one place.
                  Write real code in your browser from your very first lesson.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
                >
                  <Link href="/get-started" className="btn btn-primary gap-2">
                    Start learning free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/courses" className="btn btn-outline">
                    Explore courses
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.22 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start"
                >
                  {['100% free to start', 'Verifiable certificates', 'No credit card'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {item}
                    </span>
                  ))}
                </motion.div>
              </div>

              <HeroVisual />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="mt-16 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card/60 p-6 shadow-sm sm:grid-cols-4"
            >
              {highlights.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-serif text-3xl font-medium text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <Reveal className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Everything you need, in one ecosystem
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Stop juggling ten different tools. Learn, practise, build, and get reviewed in one place.
            </p>
          </div>
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={cardReveal}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  className="rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/30"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </Reveal>

        <Reveal className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src="/img/learn-lessons.jpg"
                alt="Interactive coding lessons"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Learn by doing</p>
              <h2 className="mb-4 font-serif text-3xl font-medium text-foreground">
                Write real code from lesson one
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Every lesson pairs clear explanations with a live editor and instant output. Practise concepts the
                moment you learn them, then prove your skills with quizzes and exercises.
              </p>
              <ul className="space-y-3">
                {[
                  'In-browser IDE, nothing to install',
                  'Instant output and test feedback',
                  'Quizzes and exercises after every lesson',
                  'Progress tracking and bookmarks',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/lessons"
                className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Browse lessons <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="mx-auto max-w-5xl px-6 py-20">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-medium text-foreground sm:text-4xl">
              Your path to career readiness
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              A clear, guided journey from your first lesson to a portfolio that proves your skills.
            </p>
          </div>
          <motion.div
            className="mb-8 h-1 overflow-hidden rounded-full bg-border"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="h-full origin-left bg-primary"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          </motion.div>
          <motion.ol
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.16 }}
          >
            {journey.map((step, index) => (
              <motion.li
                key={step}
                variants={cardReveal}
                whileHover={{ y: -3, scale: 1.01 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">{step}</span>
              </motion.li>
            ))}
          </motion.ol>
        </Reveal>

        <Reveal className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div whileHover={{ y: -5 }} className="overflow-hidden rounded-2xl border border-border bg-card/60">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/img/colleges.jpg"
                  alt="College students learning"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  <GraduationCap className="h-3.5 w-3.5" /> For colleges
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Bring career-readiness to your campus
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  Manage students, track department-level progress, host internal hackathons, and support placement
                  readiness from one dashboard.
                </p>
                <Link
                  href="/for-colleges"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Explore for colleges <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="overflow-hidden rounded-2xl border border-border bg-card/60">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/img/corporates.jpg"
                  alt="Corporate team collaborating"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Building2 className="h-3.5 w-3.5" /> For corporates
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Find talent through real project work
                </h3>
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  Host hackathons and hiring challenges, post problem statements, and evaluate candidates on
                  demonstrated skill. Hiring challenges may create opportunities.
                </p>
                <Link
                  href="/for-corporates"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Explore for corporates <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </Reveal>

        <Reveal className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid items-center gap-10 rounded-3xl border border-border bg-card/60 p-8 lg:grid-cols-2 lg:p-10">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                Simple, transparent pricing
              </p>
              <h2 className="mb-4 font-serif text-3xl font-medium text-foreground">
                Start free. Upgrade when you are ready.
              </h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Free for individual learners. Pro for premium courses and advanced AI review. Custom plans for
                colleges and corporates with dashboards, analytics, and private hackathons.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pricing" className="btn btn-primary">
                  View pricing
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  Contact sales
                </Link>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src="/img/analytics.jpg"
                alt="Analytics dashboard"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </div>
        </Reveal>

        <Reveal className="mx-auto my-16 max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 px-8 py-16 text-center">
            <div className="relative">
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {proofPoints.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-primary/15 bg-background/70 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <h2 className="mb-3 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                Start building your future today
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
                Join Bluelearnerhub and turn learning into real, demonstrable skills for free.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/get-started" className="btn btn-primary gap-2">
                  Get started free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/about" className="btn btn-outline">
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <Footer />
      </div>
    </MotionConfig>
  )
}
