'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  Clock,
  Users,
  Star,
  ChevronRight,
  Code2,
  Settings,
  Zap,
  TrendingUp,
  BookOpen,
  Search,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { tracksAPI } from '@/lib/api-civilization'
import { LearningTrack } from '@/types'

const TRACKS_FALLBACK = [
  {
    id: 1,
    slug: 'full-stack-engineer',
    title: 'Full-Stack Software Engineer',
    domain: 'Software',
    careerOutcome: 'Become a Full-Stack Engineer',
    estimatedWeeks: 24,
    difficulty: 'intermediate',
    enrollmentCount: 8420,
    rating: 4.9,
    courseCount: 8,
    icon: Code2,
    gradient: 'from-sky-600 to-purple-600',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TypeScript'],
    description:
      'Master the complete web development stack — from pixel-perfect UIs to scalable backend APIs.',
    hasCertificate: true,
  },
  {
    id: 2,
    slug: 'ml-engineer',
    title: 'Machine Learning Engineer',
    domain: 'AI/ML',
    careerOutcome: 'Become an ML Engineer',
    estimatedWeeks: 28,
    difficulty: 'advanced',
    enrollmentCount: 6200,
    rating: 4.8,
    courseCount: 10,
    icon: Zap,
    gradient: 'from-sky-600 to-pink-600',
    skills: ['Python', 'PyTorch', 'scikit-learn', 'MLflow', 'FastAPI'],
    description: 'From linear regression to transformers — build production-grade ML systems.',
    hasCertificate: true,
  },
  {
    id: 3,
    slug: 'mechanical-design-engineer',
    title: 'Mechanical Design Engineer',
    domain: 'Mechanical',
    careerOutcome: 'Become a Design Engineer',
    estimatedWeeks: 20,
    difficulty: 'intermediate',
    enrollmentCount: 3800,
    rating: 4.7,
    courseCount: 7,
    icon: Settings,
    gradient: 'from-primary/90 to-red-600',
    skills: ['CAD/CAM', 'FEM Analysis', 'Thermodynamics', 'Dynamics', 'GD&T'],
    description: 'Solid mechanical foundations + simulation tools + industry design standards.',
    hasCertificate: true,
  },
  {
    id: 4,
    slug: 'investment-banking-analyst',
    title: 'Investment Banking Analyst',
    domain: 'Finance',
    careerOutcome: 'Become an IB Analyst',
    estimatedWeeks: 16,
    difficulty: 'advanced',
    enrollmentCount: 4100,
    rating: 4.9,
    courseCount: 6,
    icon: TrendingUp,
    gradient: 'from-primary/90 to-cyan-600',
    skills: ['Financial Modeling', 'DCF', 'M&A Analysis', 'LBO', 'Excel'],
    description: 'Master the analytical toolkit of top-tier investment banks.',
    hasCertificate: true,
  },
  {
    id: 5,
    slug: 'data-analyst',
    title: 'Data Analyst',
    domain: 'Data',
    careerOutcome: 'Become a Data Analyst',
    estimatedWeeks: 14,
    difficulty: 'beginner',
    enrollmentCount: 9800,
    rating: 4.8,
    courseCount: 6,
    icon: BookOpen,
    gradient: 'from-cyan-600 to-sky-600',
    skills: ['SQL', 'Python', 'Tableau', 'Statistics', 'Excel'],
    description: 'Transform raw data into actionable business insights.',
    hasCertificate: true,
  },
  {
    id: 6,
    slug: 'electrical-systems-engineer',
    title: 'Electrical Systems Engineer',
    domain: 'Electrical',
    careerOutcome: 'Become a Systems Engineer',
    estimatedWeeks: 22,
    difficulty: 'intermediate',
    enrollmentCount: 2900,
    rating: 4.7,
    courseCount: 8,
    icon: Zap,
    gradient: 'from-yellow-500 to-primary',
    skills: ['Circuit Design', 'Control Systems', 'Power Electronics', 'MATLAB', 'FPGA'],
    description: 'From circuit theory to embedded systems and power electronics.',
    hasCertificate: true,
  },
]

const DOMAINS = ['All', 'Software', 'AI/ML', 'Mechanical', 'Electrical', 'Finance', 'Data']
const DIFFICULTY_COLORS = {
  beginner: 'bg-muted text-foreground/70',
  intermediate: 'bg-sky-900 text-sky-400',
  advanced: 'bg-purple-900 text-purple-400',
}

export default function LearningTracksPage() {
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('All')
  const [enrolled, setEnrolled] = useState<number[]>([])
  const [tracks, setTracks] = useState(TRACKS_FALLBACK)

  useEffect(() => {
    tracksAPI
      .list()
      .then((response: { data?: LearningTrack[]; error?: string }) => {
        if (response.error) {
          console.warn('Failed to load tracks:', response.error)
          return
        }
        const data = response?.data ?? []
        if (data?.length) setTracks(data as any)
      })
      .catch(() => {
        /* keep fallback data */
      })
  }, [])

  const filtered = tracks.filter((t) => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
    const matchDomain = domain === 'All' || t.domain === domain
    return matchSearch && matchDomain
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-20 top-28 h-[24rem] w-[24rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      {/* Hero */}
      <div className="relative border-b border-gray-800/80 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-3 flex items-center gap-2">
              <Map className="h-5 w-5 text-purple-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-purple-400">
                Career Tracks
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Learning Tracks</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
              Structured career paths with courses, projects, and industry-verified certificates.
            </p>
          </motion.div>

          <div className="mt-6 flex gap-6">
            {[
              { label: 'Tracks', value: tracks.length, icon: Map, color: 'text-purple-400' },
              { label: 'Enrolled', value: '32K+', icon: Users, color: 'text-sky-400' },
              { label: 'Completed', value: '8.4K', icon: Award, color: 'text-foreground/70' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="font-bold">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-8">
        {/* Filters */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-gray-800/90 bg-gray-900/50 p-3 backdrop-blur-sm sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tracks..."
              className="border-gray-700 bg-gray-900 pl-9 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  domain === d
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Track grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((track: any, i: number) => {
            const Icon = track.icon ?? BookOpen
            const isEnrolled = enrolled.includes(track.id)
            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="group h-full overflow-hidden border-gray-800 bg-gray-900 transition-all hover:border-gray-700">
                  {/* Header gradient */}
                  <div className={`h-2 bg-gradient-to-r ${track.gradient}`} />
                  <CardContent className="relative flex h-full flex-col p-5">
                    <div
                      className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${track.gradient} opacity-10 blur-2xl`}
                    />
                    <div className="mb-3 flex items-start justify-between">
                      <div className={`rounded-xl bg-gradient-to-br ${track.gradient} p-2.5`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs ${DIFFICULTY_COLORS[track.difficulty as keyof typeof DIFFICULTY_COLORS]}`}
                        >
                          {track.difficulty}
                        </Badge>
                        {track.hasCertificate && (
                          <Badge className="bg-muted text-[10px] text-foreground/70">
                            <Award className="mr-1 h-2.5 w-2.5" /> Cert
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="mb-1 text-base font-black tracking-tight text-white">
                      {track.title}
                    </h3>
                    <p className="mb-3 flex-1 text-xs text-gray-500">{track.description}</p>

                    {/* Skills */}
                    <div className="mb-4 flex flex-wrap gap-1">
                      {track.skills.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] text-gray-400"
                        >
                          {s}
                        </span>
                      ))}
                      {track.skills.length > 4 && (
                        <span className="text-[10px] text-gray-600">
                          +{track.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {track.estimatedWeeks}w
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {track.courseCount} courses
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(track.enrollmentCount / 1000).toFixed(1)}k enrolled
                      </span>
                      <span className="flex items-center gap-1 text-foreground/70">
                        <Star className="h-3.5 w-3.5 fill-foreground/70" />
                        {track.rating}
                      </span>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2">
                      <Link href={`/learning-tracks/${track.slug}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1 border-gray-700 text-xs text-gray-300 hover:text-white"
                        >
                          View Track <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() =>
                          setEnrolled(
                            isEnrolled
                              ? enrolled.filter((id) => id !== track.id)
                              : [...enrolled, track.id]
                          )
                        }
                        className={`px-4 text-xs ${isEnrolled ? 'bg-primary/80 hover:bg-primary/90' : `bg-gradient-to-r ${track.gradient} hover:opacity-90`}`}
                      >
                        {isEnrolled ? '✓ Enrolled' : 'Enroll'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
