'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Layers,
  CircuitBoard,
  Building,
  ChevronRight,
  Clock,
  BookOpen,
  Brain,
  Database,
  Globe,
  Cpu,
  Wrench,
  BarChart3,
  ShieldCheck,
  Zap,
  Binary,
  Terminal,
  Network,
  GitBranch,
  FlaskConical,
  Calculator,
  Factory,
  Settings,
  TrendingUp,
} from 'lucide-react'
import Header from '@/components/layout/Header'

// ─── Domain categories (tabs) ────────────────────────────────────────────────
const categories = [
  { id: 'all',              label: 'All Lessons' },
  { id: 'computer-science', label: 'Computer Science' },
  { id: 'mechanical',       label: 'Mechanical' },
  { id: 'electrical',       label: 'Electrical' },
  { id: 'civil',            label: 'Civil' },
  { id: 'management',       label: 'Management' },
]

// ─── Lesson card data ─────────────────────────────────────────────────────────
const lessons = [
  // — Computer Science —
  {
    id: 'python',
    category: 'computer-science',
    title: 'Python Programming',
    description: 'From variables and loops to classes and generators — a complete Python tour for beginners and intermediates.',
    icon: Terminal,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '20–35 min',
    tag: 'Popular',
    href: '/library/computer-science',
  },
  {
    id: 'dsa',
    category: 'computer-science',
    title: 'Data Structures & Algorithms',
    description: 'Arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming with real code examples.',
    icon: Binary,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '30–45 min',
    tag: 'New',
    href: '/library/computer-science',
  },
  {
    id: 'web-dev',
    category: 'computer-science',
    title: 'Web Development',
    description: 'Build full-stack apps with HTML, CSS, JavaScript, React, Node.js, and REST APIs from the ground up.',
    icon: Globe,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '25–40 min',
    tag: null,
    href: '/library/computer-science',
  },
  {
    id: 'ml',
    category: 'computer-science',
    title: 'Machine Learning & AI',
    description: 'Linear regression, neural networks, scikit-learn pipelines, and real-world ML model deployment.',
    icon: Brain,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '30–50 min',
    tag: 'New',
    href: '/library/computer-science',
  },
  {
    id: 'databases',
    category: 'computer-science',
    title: 'SQL & Databases',
    description: 'Write complex queries, understand indexing, transactions, and optimize database performance.',
    icon: Database,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '20–30 min',
    tag: null,
    href: '/library/computer-science',
  },
  {
    id: 'system-design',
    category: 'computer-science',
    title: 'System Design',
    description: 'Design scalable distributed systems — load balancing, caching, microservices, and message queues.',
    icon: Network,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '35–55 min',
    tag: null,
    href: '/library/computer-science',
  },
  {
    id: 'devops',
    category: 'computer-science',
    title: 'DevOps & CI/CD',
    description: 'Docker, Kubernetes, GitHub Actions, and cloud deployment pipelines explained step by step.',
    icon: GitBranch,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '25–40 min',
    tag: null,
    href: '/library/computer-science',
  },
  {
    id: 'cybersecurity',
    category: 'computer-science',
    title: 'Cybersecurity Fundamentals',
    description: 'Understand SQL injection, XSS, CSRF, and how to write secure, defensive code.',
    icon: ShieldCheck,
    iconBg: '#EFE6D8',
    iconColor: '#596F7C',
    duration: '20–35 min',
    tag: 'New',
    href: '/library/computer-science',
  },

  // — Mechanical —
  {
    id: 'thermo',
    category: 'mechanical',
    title: 'Thermodynamics',
    description: 'Laws of thermodynamics, heat engines, cycles, and entropy — with solved numerical examples.',
    icon: FlaskConical,
    iconBg: '#F3E8D7',
    iconColor: '#B45A3C',
    duration: '20–40 min',
    tag: 'Popular',
    href: '/library/mechanical',
  },
  {
    id: 'cad',
    category: 'mechanical',
    title: 'CAD/CAM Design',
    description: 'Computer-aided design and manufacturing concepts, toolpaths, and CNC programming fundamentals.',
    icon: Settings,
    iconBg: '#F3E8D7',
    iconColor: '#B45A3C',
    duration: '25–40 min',
    tag: null,
    href: '/library/mechanical',
  },
  {
    id: 'manufacturing',
    category: 'mechanical',
    title: 'Manufacturing Processes',
    description: 'Casting, forging, welding, machining, and quality control explained for aspiring engineers.',
    icon: Factory,
    iconBg: '#F3E8D7',
    iconColor: '#B45A3C',
    duration: '20–35 min',
    tag: null,
    href: '/library/mechanical',
  },
  {
    id: 'fluid',
    category: 'mechanical',
    title: 'Fluid Mechanics',
    description: 'Bernoulli equation, viscosity, flow regimes, pipe networks and turbomachinery basics.',
    icon: Wrench,
    iconBg: '#F3E8D7',
    iconColor: '#B45A3C',
    duration: '25–40 min',
    tag: null,
    href: '/library/mechanical',
  },

  // — Electrical —
  {
    id: 'circuits',
    category: 'electrical',
    title: 'Circuit Analysis',
    description: "Kirchhoff's laws, mesh analysis, Thevenin's theorem, and AC circuit behavior.",
    icon: CircuitBoard,
    iconBg: '#F5EBCB',
    iconColor: '#B7791F',
    duration: '20–35 min',
    tag: 'Popular',
    href: '/library/electrical',
  },
  {
    id: 'embedded',
    category: 'electrical',
    title: 'Embedded Systems',
    description: 'Microcontrollers, GPIO, UART, SPI, I2C protocols, and real-time OS concepts.',
    icon: Cpu,
    iconBg: '#F5EBCB',
    iconColor: '#B7791F',
    duration: '25–45 min',
    tag: 'New',
    href: '/library/electrical',
  },
  {
    id: 'power',
    category: 'electrical',
    title: 'Power Systems',
    description: 'Generation, transmission, distribution, transformers, and protection systems.',
    icon: Zap,
    iconBg: '#F5EBCB',
    iconColor: '#B7791F',
    duration: '20–35 min',
    tag: null,
    href: '/library/electrical',
  },


  // — Civil —
  {
    id: 'structural',
    category: 'civil',
    title: 'Structural Analysis',
    description: 'Structural loads, bending moment & shear force diagrams, and IS 456/875 beam design fundamentals.',
    icon: Building,
    iconBg: '#E5EFE6',
    iconColor: '#3F7D5C',
    duration: '20–35 min',
    tag: 'Popular',
    href: '/library/civil',
  },
  {
    id: 'geotech',
    category: 'civil',
    title: 'Geotechnical Engineering',
    description: 'Soil classification, Mohr-Coulomb failure, bearing capacity, and foundation design principles.',
    icon: Layers,
    iconBg: '#E5EFE6',
    iconColor: '#3F7D5C',
    duration: '20–35 min',
    tag: 'New',
    href: '/library/civil',
  },

  // — Management —
  {
    id: 'finance',
    category: 'management',
    title: 'Financial Management',
    description: 'Time value of money, capital budgeting, ratio analysis, and corporate finance fundamentals.',
    icon: Calculator,
    iconBg: '#EEE6ED',
    iconColor: '#75607B',
    duration: '20–35 min',
    tag: 'Popular',
    href: '/library/management',
  },
  {
    id: 'marketing',
    category: 'management',
    title: 'Marketing & Strategy',
    description: 'Market segmentation, 4Ps framework, digital marketing, brand management, and growth strategy.',
    icon: TrendingUp,
    iconBg: '#EEE6ED',
    iconColor: '#75607B',
    duration: '20–30 min',
    tag: null,
    href: '/library/management',
  },
  {
    id: 'operations',
    category: 'management',
    title: 'Operations Management',
    description: 'Supply chain, inventory models, queuing theory, lean manufacturing, and Six Sigma.',
    icon: BarChart3,
    iconBg: '#EEE6ED',
    iconColor: '#75607B',
    duration: '20–35 min',
    tag: null,
    href: '/library/management',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.055, ease: 'easeOut' },
  }),
}

// ─── Codecademy-style vivid category accents ──────────────────────────────────
const catStyle: Record<string, { grad: string; glow: string }> = {
  'computer-science': { grad: 'bg-cat-blue',   glow: 'hsl(199 89% 48%)' },
  'mechanical':       { grad: 'bg-cat-coral',  glow: 'hsl(25 95% 53%)' },
  'electrical':       { grad: 'bg-cat-amber',  glow: 'hsl(25 95% 53%)' },
  'civil':            { grad: 'bg-cat-teal',   glow: 'hsl(142 71% 45%)' },
  'management':       { grad: 'bg-cat-purple', glow: 'hsl(199 89% 58%)' },
}

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery]       = useState('')

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      const matchCat    = activeCategory === 'all' || l.category === activeCategory
      const matchSearch = searchQuery.trim() === '' ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page hero ── */}
      <section className="pt-28 pb-10">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-3"
          >
            Explore Lessons
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mx-auto mb-8 max-w-xl text-muted-foreground"
          >
            Free interactive lessons covering CS, Mechanical, Electrical,
            Civil, and Management — written by engineers, not content mills.
          </motion.p>

          {/* ── Search bar (exactly Hacksplaining style) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="relative mx-auto max-w-xl"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
            />
            <input
              id="library-search"
              type="text"
              placeholder="Search lesson catalog"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Category filter tabs ── */}
      <section className="pb-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 pb-2 sm:justify-start"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`filter-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Lessons grid (3 cols like Hacksplaining) ── */}
      <section className="py-6 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No lessons match &quot;{searchQuery}&quot;. Try a different search.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((lesson, i) => {
                const Icon = lesson.icon
                const style = catStyle[lesson.category] ?? catStyle['computer-science']
                return (
                  <motion.div
                    key={lesson.id}
                    custom={i}
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                  >
                    <Link
                      href={lesson.href}
                      id={`lesson-${lesson.id}`}
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                    >
                      {/* ── Illustration area — vivid category gradient glow ── */}
                      <div
                        className="relative flex items-center justify-center overflow-hidden border-b border-border"
                        style={{
                          background: `radial-gradient(120% 100% at 50% 0%, ${style.glow.replace(')', ' / 0.22)')}, hsl(var(--card)) 70%)`,
                          minHeight: 168,
                        }}
                      >
                        <div aria-hidden className="hero-grid absolute inset-0 opacity-40" />
                        {/* Tag pill */}
                        {lesson.tag && (
                          <span className="absolute right-4 top-4 z-10 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
                            {lesson.tag}
                          </span>
                        )}
                        {/* Big icon tile */}
                        <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105 ${style.grad}`}>
                          <Icon className="h-10 w-10" strokeWidth={1.75} />
                        </div>
                      </div>

                      {/* ── Card body ── */}
                      <div className="flex flex-col flex-1 p-5 text-center">
                        <h3 className="mb-2 text-xl leading-tight text-foreground">
                          {lesson.title}
                        </h3>
                        <p
                          className="mb-4 flex-1 text-sm leading-6 text-muted-foreground"
                        >
                          {lesson.description}
                        </p>

                        {/* Duration */}
                        <div className="mb-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {lesson.duration}
                        </div>

                        {/* Explore link — like Hacksplaining's "Explore Lesson →" */}
                        <div
                          className="flex items-center justify-center gap-1 border-t border-border pt-4 text-sm font-bold transition-colors group-hover:text-primary"
                          style={{ color: 'hsl(var(--primary))' }}
                        >
                          Explore Lesson
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
