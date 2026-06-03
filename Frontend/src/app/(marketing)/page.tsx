'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Code2,
  Trophy,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Zap,
  Database,
  Globe,
  ShieldCheck,
  Cpu,
  Wrench,
  BarChart3,
  ChevronRight,
} from 'lucide-react'

// ─── Lesson Cards (like Hacksplaining lesson grid) ─────────────────────────────
const lessons = [
  {
    icon: Brain,
    title: 'AI-Powered Quizzes',
    description: 'BlueLearner inbuilt AI generates personalized questions and gives real-time feedback on your answers.',
    time: '10–25 min',
    href: '/library/ai-quizzes',
  },
  {
    icon: Code2,
    title: 'Data Structures & Algorithms',
    description: 'Master arrays, trees, graphs, sorting, and dynamic programming with interactive problems.',
    time: '20–45 min',
    href: '/library/computer-science',
  },
  {
    icon: Database,
    title: 'SQL & Databases',
    description: 'Write complex queries, understand indexing, and optimize database performance.',
    time: '15–30 min',
    href: '/library/databases',
  },
  {
    icon: Globe,
    title: 'Web Development',
    description: 'Build full-stack apps with HTML, CSS, JavaScript, React, Node.js, and more.',
    time: '20–40 min',
    href: '/library/web-dev',
  },
  {
    icon: Cpu,
    title: 'Embedded Systems',
    description: 'Learn microcontrollers, GPIO, UART, and real-time OS concepts hands-on.',
    time: '25–50 min',
    href: '/library/electrical',
  },
  {
    icon: Wrench,
    title: 'Mechanical Engineering',
    description: 'Thermodynamics, CAD/CAM, manufacturing processes and engineering design.',
    time: '20–40 min',
    href: '/library/mechanical',
  },
  {
    icon: BarChart3,
    title: 'Data Science & ML',
    description: 'Pandas, NumPy, scikit-learn, model training, and deployment workflows.',
    time: '30–60 min',
    href: '/library/data-science',
  },
  {
    icon: ShieldCheck,
    title: 'System Design',
    description: 'Design scalable distributed systems — load balancing, caching, and microservices.',
    time: '25–50 min',
    href: '/library/system-design',
  },
]

// ─── Why Section (numbered like Hacksplaining) ─────────────────────────────────
const whyItems = [
  {
    num: '01',
    headline: 'Free learning that actually works.',
    body: 'Curated by Bluecoderhub Engineers for all core branches — CS, Mechanical, Electrical, Civil, and Management. No paywalls. No fluff.',
  },
  {
    num: '02',
    headline: 'Practice in a real code editor.',
    body: 'Our browser-based IDE supports 15+ languages. Write, run, and debug code instantly — no setup required.',
  },
  {
    num: '03',
    headline: 'Compete and earn recognition.',
    body: 'Join AI-generated weekly hackathons, climb leaderboards, earn XP, and build a portfolio that gets you hired.',
  },
]

// ─── Terminal lines ─────────────────────────────────────────────────────────────
const terminalLines = [
  { text: '$ bluelearnerhub start --track ai-python', color: '#e6edf3' },
  { text: '✓ Loading Python environment...', color: '#3fb950' },
  { text: '✓ AI Quiz Engine ready', color: '#3fb950' },
  { text: '✓ 2,450 XP loaded for user @rajan', color: '#3fb950' },
  { text: '', color: '' },
  { text: '» Question 1 of 5 — Algorithms', color: '#58a6ff' },
  { text: 'What is the time complexity of quicksort?', color: '#e6edf3' },
  { text: '', color: '' },
  { text: '  A) O(n)     B) O(n log n)', color: '#8b949e' },
  { text: '  C) O(n²)    D) O(log n)', color: '#8b949e' },
  { text: '', color: '' },
  { text: '  Your answer: B', color: '#e6edf3' },
  { text: '✓ Correct! Average case is O(n log n)', color: '#3fb950' },
  { text: '', color: '' },
  { text: '» +50 XP earned  🏆 Streak: 7 days', color: '#f78166' },
]

// ─── Stats ─────────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Status', value: 'Beta Launch' },
  { label: 'Lessons Available', value: '50+' },
  { label: 'Languages Supported', value: '15+' },
  { label: 'Per Session', value: 'Earn XP & Level Up' },
]

// ─── Fade-up variant ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' },
  }),
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">

      {/* ════════════════════════════════════════════════
          HERO — left content + terminal on right
      ════════════════════════════════════════════════ */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left content */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5 flex items-center gap-2"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-mono font-medium text-primary tracking-wide">
                  Limited Beta Access · Join our Founding Cohort
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="mb-4 text-foreground"
              >
                Learn the skills.
                <br />
                <span className="text-primary">Land your dream job.</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Free interactive lessons for engineering students — covering
                CS, Mechanical, Electrical, Civil and Management domains.
                AI-powered quizzes, live code editor, hackathons. Each lesson
                takes 15–45 minutes.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="flex flex-col sm:flex-row items-start gap-3"
              >
                <Link
                  href="/get-started"
                  id="hero-start-btn"
                  className="btn btn-primary flex items-center gap-2"
                >
                  Browse All Lessons
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/get-started"
                  id="hero-account-btn"
                  className="btn btn-outline flex items-center gap-2"
                >
                  Create Free Account
                </Link>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {stats.map((s) => (
                  <div key={s.label} className="text-center sm:text-left">
                    <div
                      className="text-xl font-bold text-primary"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                      {s.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Terminal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto w-full max-w-xl lg:max-w-none"
            >
              {/* Glow behind terminal */}
              <div
                className="absolute -inset-4 rounded-2xl opacity-20 blur-2xl pointer-events-none"
                style={{ background: 'hsl(var(--primary))' }}
              />
              <div className="terminal relative">
                {/* Title bar */}
                <div className="terminal-header">
                  <span className="terminal-dot" style={{ background: '#ff5f57' }} />
                  <span className="terminal-dot" style={{ background: '#ffbd2e' }} />
                  <span className="terminal-dot" style={{ background: '#28c840' }} />
                  <span className="ml-3 text-xs text-gray-400 font-mono">
                    Bluelearnerhub — AI Learning Session
                  </span>
                </div>
                {/* Lines */}
                <div className="terminal-body" style={{ minHeight: 320 }}>
                  {terminalLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.2 }}
                      className="leading-7"
                      style={{ color: line.color || 'transparent', minHeight: '1.75rem' }}
                    >
                      {line.text}
                      {/* Cursor on last active line */}
                      {i === terminalLines.length - 1 && (
                        <span
                          className="inline-block w-2 h-4 bg-green-400 ml-1 animate-blink"
                          style={{ verticalAlign: 'middle' }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          LESSONS GRID — 2 columns like Hacksplaining
      ════════════════════════════════════════════════ */}
      <section
        id="lessons"
        className="section"
        style={{
          background: 'hsl(var(--background-secondary))',
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.09) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-12">
            <span className="section-tag">FREE LESSONS</span>
            <h2 className="mb-4 max-w-xl">
              Start with the fundamentals
            </h2>
            <p
              className="text-muted-foreground max-w-lg leading-relaxed"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}
            >
              Master core engineering topics — from CS and Web Dev to Mechanical
              and Electrical. Each lesson takes 15–45 minutes.
            </p>
          </div>

          {/* Lesson cards — 2 column grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {lessons.map((lesson, i) => {
              const Icon = lesson.icon
              return (
                <motion.div
                  key={lesson.title}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                >
                  <Link
                    href={lesson.href}
                    id={`lesson-card-${i}`}
                    className="lesson-card group"
                  >
                    {/* Icon */}
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'hsl(var(--primary) / 0.10)' }}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {lesson.title}
                      </h3>
                      <p
                        className="text-sm text-muted-foreground leading-snug mb-2"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {lesson.description}
                      </p>
                      <span className="text-xs text-muted-foreground font-mono">
                        {lesson.time}
                      </span>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* View all CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/library"
              id="view-all-lessons-btn"
              className="btn btn-outline inline-flex items-center gap-2"
            >
              View all 200+ lessons
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    
      <section id="why" className="section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <span className="section-tag">WHY BLUELEARNERHUB</span>
            <h2 className="max-w-2xl">
              Engineering lessons that actually stick
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {whyItems.map((item, i) => (
              <motion.div
                key={item.num}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
              >
                {/* Step card */}
                <div className="card p-7 h-full flex flex-col gap-4">
                  <div
                    className="inline-flex items-center justify-center rounded-lg border border-border w-10 h-10 text-sm font-mono font-bold text-muted-foreground"
                  >
                    {item.num}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {item.headline}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {item.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FEATURES — icon grid
      ════════════════════════════════════════════════ */}
      <section
        id="features"
        className="section"
        style={{
          background: 'hsl(var(--background-secondary))',
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-tag">PLATFORM</span>
            <h2 className="mb-4">Everything you need to<br />master your engineering domain</h2>
            <p
              className="mx-auto max-w-xl text-muted-foreground leading-relaxed"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.92rem' }}
            >
              We built the platform we wished existed when we were studying engineering.
              No fluff, no paywalls — just practical skills.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Learning',
                desc: 'BlueLearner inbuilt AI generates personalized quizzes and provides real-time feedback on your code submissions.',
              },
              {
                icon: Code2,
                title: 'Built-in Code Editor',
                desc: 'Practice in our browser-based IDE supporting 15+ languages with instant execution and output.',
              },
              {
                icon: Trophy,
                title: 'Weekly Hackathons',
                desc: 'Compete in AI-generated challenges, win prizes, and build a portfolio that stands out to recruiters.',
              },
              {
                icon: GraduationCap,
                title: 'Expert Mentorship',
                desc: 'Connect with industry mentors for personalized guidance, code reviews, and career advice.',
              },
              {
                icon: BookOpen,
                title: 'Free Library',
                desc: 'Comprehensive engineering tutorials for CS, Mechanical, Electrical, Civil, and Management domains.',
              },
              {
                icon: TrendingUp,
                title: 'Career Growth',
                desc: 'Track your progress, earn XP, climb leaderboards, and showcase achievements to recruiters.',
              },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={f.title}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                  className="card p-6 flex flex-col gap-4 group hover:border-primary/40 transition-colors"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{ background: 'hsl(var(--primary) / 0.10)' }}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold mb-2">{f.title}</h3>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          DOMAINS BAND
      ════════════════════════════════════════════════ */}
      <section id="domains" className="section">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="section-tag">LEARNING TRACKS</span>
            <h2 className="mb-3">Pick your engineering domain</h2>
            <p className="text-muted-foreground text-sm font-mono max-w-lg">
              Comprehensive tutorials for every branch — no login needed to get started.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
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
                topics: ['Circuit Analysis', 'Power Systems', 'Electronics'],
                href: '/library/electrical',
              },
              {
                name: 'Civil',
                icon: Globe,
                color: 'hsl(var(--civil-teal))',
                topics: ['Structural Analysis', 'Geotechnical', 'Hydraulics'],
                href: '/library/civil',
              },
            ].map((d, i) => {
              const Icon = d.icon
              return (
                <motion.div
                  key={d.name}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={fadeUp}
                >
                  <Link
                    href={d.href}
                    id={`domain-card-${i}`}
                    className="card p-5 flex flex-col gap-3 group hover:border-primary/40 transition-all hover:shadow-md block"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: `${d.color}18` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: d.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {d.name}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {d.topics.map((t) => (
                          <span
                            key={t}
                            className="rounded-full px-2 py-0.5 text-xs font-mono font-medium"
                            style={{ background: `${d.color}14`, color: d.color }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                      View track <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════════ */}
      <section
        id="cta"
        className="pb-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-2xl border border-primary/20 text-center px-8 py-16"
            style={{ background: 'hsl(var(--primary))' }}
          >
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              <h2 className="mb-4 text-white">
                Ready to start your journey?
              </h2>
              <p
                className="mx-auto mb-8 max-w-lg text-white/80 leading-relaxed"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}
              >
                Be part of our Founding Cohort — master engineering skills across CS, Mechanical,
                Electrical, Civil and more. AI-powered, free, no credit card needed.
                <br />
                Limited Beta Access — join now and shape the platform.
              </p>
              <Link
                href="/get-started"
                id="cta-join-btn"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-primary shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}
              >
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          FOOTER — Powered by Bluecoderhub
      ════════════════════════════════════════════════ */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-mono">
              <span className="font-bold text-foreground">Bluelearnerhub</span> powered by <span className="font-bold text-foreground">Bluecoderhub</span>
            </p>
          </div>
        </div>
      </footer>

    </main>
  )
}
