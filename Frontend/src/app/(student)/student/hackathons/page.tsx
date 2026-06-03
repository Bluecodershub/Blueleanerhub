'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Trophy,
  Calendar,
  Users,
  Search,
  Globe,
  Gift,
  Star,
  Award,
  TrendingUp,
  ArrowRight,
  Play,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type HackathonStatus = 'upcoming' | 'active' | 'ended'

interface Hackathon {
  id: string
  title: string
  description: string
  status: HackathonStatus
  startDate: string
  endDate: string
  participants: number
  maxParticipants: number
  prize: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  organization: string
  mode: 'online' | 'hybrid' | 'offline'
}

const STATUS_MAP: Record<string, HackathonStatus> = {
  PUBLISHED: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'ended',
  DRAFT: 'upcoming',
}

const DIFF_MAP: Record<string, Hackathon['difficulty']> = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Pro: 'advanced',
}

const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: '1',
    title: 'AI Innovation Challenge 2026',
    description: 'Build innovative AI-powered applications using machine learning, natural language processing, or computer vision.',
    status: 'active',
    startDate: '2026-04-01',
    endDate: '2026-04-03',
    participants: 847,
    maxParticipants: 1000,
    prize: '$5,000 + Mentorship',
    difficulty: 'advanced',
    tags: ['AI/ML', 'Python', 'TensorFlow', 'API'],
    organization: 'TechGiant Corp',
    mode: 'online',
  },
  {
    id: '2',
    title: 'Frontend Masters Hack',
    description: 'Create stunning user interfaces using modern frontend technologies. Focus on user experience and accessibility.',
    status: 'upcoming',
    startDate: '2026-04-10',
    endDate: '2026-04-12',
    participants: 234,
    maxParticipants: 500,
    prize: 'MacBook Air + Certificates',
    difficulty: 'intermediate',
    tags: ['React', 'Next.js', 'CSS', 'UI/UX'],
    organization: 'DesignStudio',
    mode: 'online',
  },
  {
    id: '3',
    title: 'Green Tech Sustainability',
    description: 'Develop solutions that address environmental challenges through technology. Climate tech, renewable energy, waste management.',
    status: 'upcoming',
    startDate: '2026-04-15',
    endDate: '2026-04-17',
    participants: 156,
    maxParticipants: 300,
    prize: '$3,000 + Grants',
    difficulty: 'intermediate',
    tags: ['Sustainability', 'IoT', 'Data Analytics', 'Cloud'],
    organization: 'EcoTech Foundation',
    mode: 'hybrid',
  },
  {
    id: '4',
    title: 'Blockchain Builder Challenge',
    description: 'Create decentralized applications, smart contracts, or blockchain-based solutions for real-world problems.',
    status: 'active',
    startDate: '2026-03-28',
    endDate: '2026-03-30',
    participants: 623,
    maxParticipants: 800,
    prize: '$4,000 + Web3 Course',
    difficulty: 'advanced',
    tags: ['Web3', 'Solidity', 'Blockchain', 'DeFi'],
    organization: 'CryptoLabs',
    mode: 'online',
  },
  {
    id: '5',
    title: 'Campus Coders Cup',
    description: 'College students compete in algorithmic challenges and build innovative projects within 48 hours.',
    status: 'ended',
    startDate: '2026-03-15',
    endDate: '2026-03-17',
    participants: 1200,
    maxParticipants: 1500,
    prize: 'Internship Offers',
    difficulty: 'beginner',
    tags: ['DSA', 'Python', 'Java', 'Algorithms'],
    organization: 'BlueLearnerHub',
    mode: 'offline',
  },
]

const statusConfig: Record<HackathonStatus, { label: string; color: string; bgColor: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-blue-600', bgColor: 'bg-blue-500/10 border-blue-500/20' },
  active: { label: 'Active', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  ended: { label: 'Ended', color: 'text-muted-foreground', bgColor: 'bg-secondary border-border' },
}


export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>(MOCK_HACKATHONS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | 'all'>('all')
  const [difficultyFilter] = useState<string>('all')

  useEffect(() => {
    api.get('/hackathons?limit=30').then((res) => {
      const rows: any[] = res.data?.data?.data ?? res.data?.data ?? []
      if (rows.length) {
        const mapped: Hackathon[] = rows
          .filter((h: any) => h.status !== 'DRAFT')
          .map((h: any) => ({
            id: String(h._id),
            title: h.name,
            description: h.description || '',
            status: STATUS_MAP[h.status] ?? 'upcoming',
            startDate: h.startDate ? new Date(h.startDate).toISOString().slice(0, 10) : '',
            endDate: h.endDate ? new Date(h.endDate).toISOString().slice(0, 10) : '',
            participants: 0,
            maxParticipants: h.maxParticipants || 0,
            prize: h.prizePool || (h.prizes?.[0]?.reward ?? 'Prizes'),
            difficulty: DIFF_MAP[h.difficulty] ?? 'intermediate',
            tags: h.tags || [],
            organization: h.organizerName || h.organizerType || 'BlueLearnerHub',
            mode: 'online' as const,
          }))
        setHackathons(mapped)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filteredHackathons = hackathons.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false
    if (difficultyFilter !== 'all' && h.difficulty !== difficultyFilter) return false
    if (search && !h.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    totalHackathons: hackathons.length,
    active: hackathons.filter(h => h.status === 'active').length,
    upcoming: hackathons.filter(h => h.status === 'upcoming').length,
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hackathons</h1>
            <p className="text-muted-foreground">Compete, create, and win prizes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Globe className="mr-2 h-4 w-4" />
              Host Hackathon
            </Button>
          </div>
        </header>

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-500/10 p-2">
                <Trophy className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalHackathons}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Award className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Featured Hackathon ────────────────────────────────────────── */}
        {hackathons.length > 0 && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6"
        >
          <Badge className="absolute right-6 top-6 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Star className="mr-1 h-3 w-3 fill-emerald-500" />
            Featured
          </Badge>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge className={statusConfig.active.bgColor}>
                  <span className={statusConfig.active.color}>{statusConfig.active.label}</span>
                </Badge>
                <Badge variant="outline">{hackathons[0].difficulty}</Badge>
              </div>
              <h2 className="mb-2 text-2xl font-bold">{hackathons[0].title}</h2>
              <p className="mb-4 max-w-xl text-muted-foreground">{hackathons[0].description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {hackathons[0].startDate} - {hackathons[0].endDate}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {hackathons[0].participants}/{hackathons[0].maxParticipants}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" /> {hackathons[0].mode}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <div className="rounded-xl bg-card border border-border p-4">
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="text-2xl font-bold text-amber-500">{hackathons[0].prize}</p>
              </div>
              <Button size="lg">
                <Play className="mr-2 h-4 w-4" />
                Register Now
              </Button>
            </div>
          </div>
        </motion.div>}

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-card p-1">
              {(['all', 'active', 'upcoming', 'ended'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {status === 'all' ? 'All' : statusConfig[status].label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hackathons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* ── Hackathon List ─────────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredHackathons.map((hackathon, i) => (
            <motion.div
              key={hackathon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/student/hackathons/${hackathon.id}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge className={statusConfig[hackathon.status].bgColor}>
                        <span className={statusConfig[hackathon.status].color}>
                          {statusConfig[hackathon.status].label}
                        </span>
                      </Badge>
                      <Badge variant="outline">{hackathon.mode}</Badge>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                      {hackathon.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{hackathon.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {hackathon.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {hackathon.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {hackathon.participants}/{hackathon.maxParticipants}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <Gift className="h-4 w-4" /> {hackathon.prize}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    by {hackathon.organization}
                  </span>
                  <Button size="sm" variant="ghost" className="gap-1">
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredHackathons.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 font-semibold">No hackathons found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
