'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Calendar,
  ArrowRight,
  Search,
  Cpu,
  Settings,
  Zap,
  Building2,
  Briefcase,
  Globe,
  Star,
  PlusCircle,
  ChevronRight,
  Flame,
  GraduationCap,
  Rocket,
  Clock,
  Filter,
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { hackathonsAPI } from '@/lib/api-civilization'

interface HackathonItem {
  id: string | number
  title: string
  domain: string
  type: string
  organizerType: 'UNIVERSITY' | 'CORPORATE' | 'PLATFORM'
  organizerName?: string
  status: 'OPEN' | 'UPCOMING' | 'CLOSED'
  prize: string
  participants: number
  daysLeft: number
  registrationDeadline?: string
  icon: LucideIcon
  gradient: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Pro'
  tags?: string[]
}

const DOMAIN_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  'computer science': { icon: Cpu, gradient: 'from-blue-600 to-indigo-600' },
  software: { icon: Cpu, gradient: 'from-blue-600 to-violet-600' },
  automotive: { icon: Settings, gradient: 'from-red-600 to-orange-600' },
  mechanical: { icon: Settings, gradient: 'from-orange-600 to-amber-600' },
  finance: { icon: Briefcase, gradient: 'from-emerald-600 to-teal-600' },
  management: { icon: Briefcase, gradient: 'from-cyan-600 to-blue-600' },
  civil: { icon: Building2, gradient: 'from-yellow-600 to-orange-600' },
  electrical: { icon: Zap, gradient: 'from-yellow-500 to-amber-500' },
}
const DEFAULT_META = { icon: Trophy, gradient: 'from-primary to-violet-600' }

function getMeta(domain: string) {
  return DOMAIN_META[domain?.toLowerCase()] ?? DEFAULT_META
}

const ORGANIZER_CONFIG = {
  UNIVERSITY: {
    label: 'University',
    icon: GraduationCap,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    dot: 'bg-purple-400',
  },
  CORPORATE: {
    label: 'Corporate',
    icon: Briefcase,
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  PLATFORM: {
    label: 'BlueLearner',
    icon: Rocket,
    color: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
}

const MOCK_HACKATHONS: HackathonItem[] = [
  {
    id: 1,
    title: 'AI Revolution 2026',
    domain: 'Computer Science',
    type: 'Software',
    organizerType: 'PLATFORM',
    organizerName: 'BlueLearner',
    status: 'OPEN',
    prize: '$10,000',
    participants: 1240,
    daysLeft: 5,
    icon: Cpu,
    gradient: 'from-blue-600 to-indigo-600',
    description: 'Build the next generation of AI-powered tools that reshape how humans interact with technology.',
    difficulty: 'Intermediate',
    tags: ['AI', 'Machine Learning', 'Python']
  },
  {
    id: 2,
    title: 'IIT Bombay TechFest Hackathon',
    domain: 'Mechanical',
    type: 'Engineering',
    organizerType: 'UNIVERSITY',
    organizerName: 'IIT Bombay',
    status: 'OPEN',
    prize: '₹5,00,000',
    participants: 890,
    daysLeft: 12,
    icon: Settings,
    gradient: 'from-purple-600 to-indigo-600',
    description: 'Design sustainable engineering solutions for real-world mechanical challenges. Open to all engineering students.',
    difficulty: 'Pro',
    tags: ['Mechanical', 'CAD', 'AutoCAD']
  },
  {
    id: 3,
    title: 'Microsoft Build Challenge',
    domain: 'Computer Science',
    type: 'Cloud & AI',
    organizerType: 'CORPORATE',
    organizerName: 'Microsoft India',
    status: 'OPEN',
    prize: '$7,500 + Job PPO',
    participants: 2100,
    daysLeft: 3,
    icon: Cpu,
    gradient: 'from-emerald-600 to-teal-600',
    description: 'Build innovative cloud solutions using Azure services. Top performers get direct interview calls.',
    difficulty: 'Intermediate',
    tags: ['Azure', 'Cloud', 'TypeScript']
  },
  {
    id: 4,
    title: 'GreenBuild Challenge',
    domain: 'Civil',
    type: 'Sustainability',
    organizerType: 'PLATFORM',
    organizerName: 'BlueLearner',
    status: 'UPCOMING',
    prize: '$4,000',
    participants: 0,
    daysLeft: 30,
    icon: Building2,
    gradient: 'from-lime-600 to-green-600',
    description: 'Design sustainable structural solutions for the cities of the future.',
    difficulty: 'Intermediate',
    tags: ['Civil', 'Sustainability', 'BIM']
  },
  {
    id: 5,
    title: 'NIT Circuit Design Sprint',
    domain: 'Electrical',
    type: 'Electronics',
    organizerType: 'UNIVERSITY',
    organizerName: 'NIT Trichy',
    status: 'UPCOMING',
    prize: '₹2,00,000',
    participants: 0,
    daysLeft: 21,
    icon: Zap,
    gradient: 'from-yellow-500 to-amber-500',
    description: 'Engineer next-gen power electronics and smart grid solutions for the future of India.',
    difficulty: 'Pro',
    tags: ['PCB', 'VLSI', 'Embedded']
  },
  {
    id: 6,
    title: 'Amazon AWS Builders Cup',
    domain: 'Computer Science',
    type: 'Cloud',
    organizerType: 'CORPORATE',
    organizerName: 'Amazon Web Services',
    status: 'CLOSED',
    prize: '$15,000 + AWS Credits',
    participants: 3400,
    daysLeft: 0,
    icon: Cpu,
    gradient: 'from-orange-500 to-amber-600',
    description: 'Past hackathon on serverless architectures and cloud-native development.',
    difficulty: 'Pro',
    tags: ['AWS', 'Serverless', 'Lambda']
  },
  {
    id: 7,
    title: 'BlueLearner Robotics Cup 2026',
    domain: 'Robotics',
    type: 'Autonomous Systems',
    organizerType: 'PLATFORM',
    organizerName: 'BlueLearner',
    status: 'OPEN',
    prize: '$6,000',
    participants: 670,
    daysLeft: 8,
    icon: Cpu,
    gradient: 'from-violet-600 to-purple-600',
    description: 'Build autonomous robots that can navigate real-world obstacle courses. All experience levels welcome.',
    difficulty: 'Beginner',
    tags: ['Robotics', 'ROS', 'Python']
  },
]

const STATUS_TABS = ['All', 'Active', 'Upcoming', 'Past']
const ORGANIZER_TABS = ['All', 'Platform', 'University', 'Corporate']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Pro']

const statusConfig = {
  OPEN: {
    label: 'Registration Open',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  UPCOMING: {
    label: 'Coming Soon',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dot: 'bg-blue-400',
  },
  CLOSED: {
    label: 'Completed',
    color: 'bg-muted/50 text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
}

const HACKATHON_MODES = [
  {
    title: 'Capstone',
    href: '/hackathons/capstone',
    description: 'Submit course projects, receive mentor review, and publish final outcomes.',
    icon: GraduationCap,
  },
  {
    title: 'Practice',
    href: '/hackathons/practice',
    description: 'Solve coding problems, run code in the IDE, and build submission history.',
    icon: Cpu,
  },
  {
    title: 'Live Hackathons',
    href: '/hackathons/live',
    description: 'Register for active events, view timelines, problem statements, and leaderboards.',
    icon: Trophy,
  },
]

function DeadlineBar({ daysLeft, status }: { daysLeft: number; status: string }) {
  if (status !== 'OPEN' || daysLeft <= 0) return null
  const maxDays = 30
  const pct = Math.min(100, ((maxDays - daysLeft) / maxDays) * 100)
  const urgentColor = daysLeft <= 3 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-orange-500' : 'bg-emerald-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Registration closes</span>
        <span className={daysLeft <= 3 ? 'font-bold text-red-400' : ''}>{daysLeft}d left</span>
      </div>
      <div className="h-1 w-full rounded-full bg-muted/50">
        <div className={`h-1 rounded-full ${urgentColor} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function HackathonCard({ hack, index }: { hack: HackathonItem; index: number }) {
  const config = statusConfig[hack.status]
  const orgConf = ORGANIZER_CONFIG[hack.organizerType]
  const OrgIcon = orgConf.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className={`relative h-1.5 bg-gradient-to-r ${hack.gradient}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${hack.gradient} flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
            <hack.icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge className={`flex items-center gap-1.5 border text-[10px] font-semibold ${config.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${hack.status === 'OPEN' ? 'animate-pulse' : ''}`} />
              {config.label}
            </Badge>
            <Badge className={`flex items-center gap-1 border text-[10px] font-semibold ${orgConf.color}`}>
              <OrgIcon className="h-3 w-3" />
              {hack.organizerName || orgConf.label}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold leading-snug text-white transition-colors group-hover:text-primary">
            {hack.title}
          </h3>
          <p className="text-[11px] text-muted-foreground">{hack.domain} · {hack.difficulty}</p>
        </div>

        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {hack.description}
        </p>

        {/* Tags */}
        {hack.tags && hack.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hack.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-background/50 p-2.5 text-center">
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Prize Pool</div>
            <div className="text-sm font-black text-white">{hack.prize}</div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-2.5 text-center">
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              {hack.status === 'UPCOMING' ? 'Opens In' : 'Participants'}
            </div>
            <div className="text-sm font-black text-white">
              {hack.status === 'UPCOMING' ? `${hack.daysLeft}d` : hack.participants.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Deadline bar */}
        <DeadlineBar daysLeft={hack.daysLeft} status={hack.status} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {hack.status === 'OPEN' && (
            <span className={hack.daysLeft <= 5 ? 'font-semibold text-red-400' : ''}>
              {hack.daysLeft} days left
            </span>
          )}
          {hack.status === 'UPCOMING' && <span>Starts in {hack.daysLeft} days</span>}
          {hack.status === 'CLOSED' && <span>Ended</span>}
        </div>
        <Link href={`/hackathons/${hack.id}`}>
          <Button
            size="sm"
            className={`h-8 gap-1.5 rounded-xl px-4 text-xs font-bold transition-all ${
              hack.status === 'OPEN'
                ? 'bg-primary text-white hover:bg-primary/90'
                : hack.status === 'UPCOMING'
                  ? 'border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                  : 'border border-border bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {hack.status === 'OPEN' ? 'Join Now' : hack.status === 'UPCOMING' ? 'Notify Me' : 'View Results'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
      <div className="h-1.5 bg-muted" />
      <div className="space-y-4 p-5">
        <div className="flex justify-between">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="space-y-1.5">
            <div className="h-5 w-28 rounded-full bg-muted" />
            <div className="h-4 w-20 rounded-full bg-muted" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-7 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-xl bg-muted" />
          <div className="h-14 rounded-xl bg-muted" />
        </div>
      </div>
      <div className="flex justify-between px-5 pb-5">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-8 w-24 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<HackathonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('All')
  const [organizerTab, setOrganizerTab] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('All')

  useEffect(() => {
    hackathonsAPI
      .list()
      .then((result: any) => {
        const response = result?.data
        const list = Array.isArray(response) ? response : (response?.data || [])
        if (list.length > 0) {
          setHackathons(
            list.map((h: any) => {
              const meta = getMeta(h.domain)
              const deadline = h.registrationDeadline || h.registration_deadline
              const daysLeft = deadline
                ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
                : 0
              const statusRaw = (h.status || '').toUpperCase()
              const status =
                statusRaw === 'OPEN' || statusRaw === 'PUBLISHED' || statusRaw === 'ACTIVE'
                  ? 'OPEN'
                  : statusRaw === 'UPCOMING' || statusRaw === 'DRAFT'
                    ? 'UPCOMING'
                    : 'CLOSED'
              return {
                id: h._id || h.id,
                title: h.name || h.title || 'Untitled Hackathon',
                domain: h.domain || 'Technology',
                type: h.theme || h.type || 'General',
                organizerType: (h.organizerType as any) || 'PLATFORM',
                organizerName: h.organizerName,
                status,
                prize: h.prizePool || h.prize || 'N/A',
                participants: h.maxParticipants || h.participants || 0,
                daysLeft,
                icon: meta.icon,
                gradient: meta.gradient,
                description: h.description || 'Participate and innovate.',
                difficulty: (h.difficulty || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Pro',
                tags: h.tags || []
              } satisfies HackathonItem
            })
          )
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to load hackathons from API', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = hackathons.filter((h) => {
    const matchSearch =
      !search ||
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.domain.toLowerCase().includes(search.toLowerCase()) ||
      h.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))

    const matchStatus =
      statusTab === 'All' ||
      (statusTab === 'Active' && h.status === 'OPEN') ||
      (statusTab === 'Upcoming' && h.status === 'UPCOMING') ||
      (statusTab === 'Past' && h.status === 'CLOSED')

    const matchOrganizer =
      organizerTab === 'All' ||
      (organizerTab === 'Platform' && h.organizerType === 'PLATFORM') ||
      (organizerTab === 'University' && h.organizerType === 'UNIVERSITY') ||
      (organizerTab === 'Corporate' && h.organizerType === 'CORPORATE')

    const matchDifficulty =
      activeDifficulty === 'All' || h.difficulty === activeDifficulty

    return matchSearch && matchStatus && matchOrganizer && matchDifficulty
  })

  const openCount = hackathons.filter((h) => h.status === 'OPEN').length
  const uniCount = hackathons.filter((h) => h.organizerType === 'UNIVERSITY').length
  const corpCount = hackathons.filter((h) => h.organizerType === 'CORPORATE').length
  const totalPrize = hackathons
    .filter((h) => h.status === 'OPEN')
    .reduce((acc, h) => {
      const num = parseInt(h.prize.replace(/[^0-9]/g, ''))
      return acc + (isNaN(num) ? 0 : num)
    }, 0)

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-black tracking-tight text-white">Hackathons</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Compete in university, corporate, and platform hackathons. Build real solutions, win prizes, and get noticed by top companies.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="h-10 gap-2 rounded-xl border-border px-5 text-sm font-bold">
            <Star className="h-4 w-4" />
            My Registrations
          </Button>
          <Link href="/corporate/host-hackathon">
            <Button className="h-10 gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary/90">
              <PlusCircle className="h-4 w-4" />
              Host a Hackathon
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Hackathons', value: openCount, icon: Flame, color: 'text-orange-400' },
          { label: 'Total Prize Pool', value: totalPrize > 0 ? `$${Math.round(totalPrize / 1000)}K+` : 'View All', icon: Trophy, color: 'text-amber-400' },
          { label: 'University Events', value: uniCount, icon: GraduationCap, color: 'text-purple-400' },
          { label: 'Corporate Events', value: corpCount, icon: Briefcase, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-border bg-card/50 p-4 text-center">
            <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} />
            <div className="text-xl font-black text-white">{value}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {HACKATHON_MODES.map(({ title, href, description, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-2xl border border-border bg-card/50 p-5 transition hover:border-primary/40 hover:bg-primary/5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              Open
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* Organizer type tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ORGANIZER_TABS.map((tab) => {
            const conf = tab === 'Platform' ? ORGANIZER_CONFIG.PLATFORM
              : tab === 'University' ? ORGANIZER_CONFIG.UNIVERSITY
              : tab === 'Corporate' ? ORGANIZER_CONFIG.CORPORATE
              : null
            const count = tab === 'All' ? hackathons.length
              : tab === 'Platform' ? hackathons.filter(h => h.organizerType === 'PLATFORM').length
              : tab === 'University' ? uniCount
              : corpCount
            return (
              <button
                key={tab}
                onClick={() => setOrganizerTab(tab)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  organizerTab === tab
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card/50 text-muted-foreground hover:border-border/80 hover:text-white'
                }`}
              >
                {conf && <conf.icon className="h-3.5 w-3.5" />}
                {tab}
                <span className="rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px]">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search + status tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, domain, or technology tag..."
            className="h-11 rounded-xl border-border bg-card pl-11 text-sm focus-visible:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition-all ${
                  statusTab === tab
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card/50 text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
                {tab === 'Active' && openCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    {openCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 border-l border-border pl-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-all ${
                  activeDifficulty === diff
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-card/30 text-muted-foreground hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-bold text-white">{filtered.length}</span> hackathon{filtered.length !== 1 ? 's' : ''}
          {organizerTab !== 'All' && ` · ${organizerTab}`}
          {statusTab !== 'All' && ` · ${statusTab}`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="space-y-3 py-24 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">No hackathons found.</p>
          <Button variant="ghost" onClick={() => { setSearch(''); setStatusTab('All'); setOrganizerTab('All') }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((hack, i) => (
              <HackathonCard key={hack.id} hack={hack} index={i} />
            ))}
          </AnimatePresence>

          {/* Host CTA card */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Link href="/corporate/host-hackathon">
              <div className="group flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-8 text-center transition-all duration-300 hover:border-primary/30 hover:bg-primary/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card transition-all group-hover:border-primary/20 group-hover:bg-primary/10">
                  <PlusCircle className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground/80 transition-colors group-hover:text-white">
                    Host Your Own Hackathon
                  </h4>
                  <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-muted-foreground">
                    Organize a competition for your university, company, or community.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Get Started <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  )
}
