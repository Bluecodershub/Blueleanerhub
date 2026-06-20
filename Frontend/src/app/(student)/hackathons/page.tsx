'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Calendar,
  ArrowRight,
  Search,
  Code2,
  Cpu,
  Settings,
  Zap,
  Building2,
  Briefcase,
  PlusCircle,
  ChevronRight,
  GraduationCap,
  Rocket,
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
  'computer science': { icon: Cpu, gradient: 'bg-cat-blue' },
  software: { icon: Cpu, gradient: 'bg-cat-blue' },
  robotics: { icon: Cpu, gradient: 'bg-cat-indigo' },
  automotive: { icon: Settings, gradient: 'bg-cat-coral' },
  mechanical: { icon: Settings, gradient: 'bg-cat-coral' },
  finance: { icon: Briefcase, gradient: 'bg-cat-purple' },
  management: { icon: Briefcase, gradient: 'bg-cat-purple' },
  civil: { icon: Building2, gradient: 'bg-cat-teal' },
  electrical: { icon: Zap, gradient: 'bg-cat-amber' },
}
const DEFAULT_META = { icon: Trophy, gradient: 'bg-cat-indigo' }

function getMeta(domain: string) {
  return DOMAIN_META[domain?.toLowerCase()] ?? DEFAULT_META
}

const ORGANIZER_CONFIG = {
  UNIVERSITY: {
    label: 'University',
    icon: GraduationCap,
    color: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
  CORPORATE: {
    label: 'Corporate',
    icon: Briefcase,
    color: 'bg-success-light text-success border-success/20',
    dot: 'bg-success',
  },
  PLATFORM: {
    label: 'BlueLearner',
    icon: Rocket,
    color: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
}


const STATUS_TABS = ['All', 'Active', 'Upcoming', 'Past']
const ORGANIZER_TABS = ['All', 'Platform', 'University', 'Corporate']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Pro']

const statusConfig = {
  OPEN: {
    label: 'Registration Open',
    color: 'bg-success-light text-success border-success/20',
    dot: 'bg-success',
  },
  UPCOMING: {
    label: 'Coming Soon',
    color: 'bg-primary/10 text-primary border-primary/20',
    dot: 'bg-primary',
  },
  CLOSED: {
    label: 'Completed',
    color: 'bg-muted/50 text-muted-foreground border-border',
    dot: 'bg-muted-foreground',
  },
}

function DeadlineBar({ daysLeft, status }: { daysLeft: number; status: string }) {
  if (status !== 'OPEN' || daysLeft <= 0) return null
  const maxDays = 30
  const pct = Math.min(100, ((maxDays - daysLeft) / maxDays) * 100)
  const urgentColor = daysLeft <= 3 ? 'bg-destructive' : daysLeft <= 7 ? 'bg-warning' : 'bg-success'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Registration closes</span>
        <span className={daysLeft <= 3 ? 'font-bold text-destructive' : ''}>{daysLeft}d left</span>
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
  const accent = getMeta(hack.domain).gradient
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
    >
      <div className={`relative h-1.5 ${accent}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105 ${accent}`}>
            <hack.icon className="h-5 w-5" />
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
          <h3 className="text-xl leading-tight text-foreground transition-colors group-hover:text-primary">
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
            <div className="text-sm font-bold text-foreground">{hack.prize}</div>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-2.5 text-center">
            <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              {hack.status === 'UPCOMING' ? 'Opens In' : 'Participants'}
            </div>
            <div className="text-sm font-bold text-foreground">
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
            <span className={hack.daysLeft <= 5 ? 'font-semibold text-destructive' : ''}>
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
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : hack.status === 'UPCOMING'
                  ? 'border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15'
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

  return (
    <div className="space-y-8 pb-20 pt-4 sm:pt-0">
      <section className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Trophy className="h-3.5 w-3.5" />
              Hackathon arena
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
              Build, submit, and compete with real project workflows
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              Browse university, corporate, and platform challenges. Registration, teams, submissions, and leaderboards are connected to the backend APIs.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/hackathons/practice">
                  Practice first
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/ide">
                  Open coding sandbox
                  <Code2 className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative min-h-[260px] border-t border-border lg:border-l lg:border-t-0">
            <Image
              src="/img/hackathon.jpg"
              alt="Students collaborating during a hackathon"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
          </div>
        </div>
      </section>

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
                aria-pressed={organizerTab === tab}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  organizerTab === tab
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
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
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusTab(tab)}
                aria-pressed={statusTab === tab}
                className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition-all ${
                  statusTab === tab
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
                {tab === 'Active' && openCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {openCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-border sm:border-l sm:pl-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                aria-pressed={activeDifficulty === diff}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold transition-all ${
                  activeDifficulty === diff
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground'
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
          Showing <span className="font-bold text-foreground">{filtered.length}</span> hackathon{filtered.length !== 1 ? 's' : ''}
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
          <Button variant="ghost" onClick={() => { setSearch(''); setStatusTab('All'); setOrganizerTab('All'); setActiveDifficulty('All') }}>
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
              <div className="group flex h-full min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-8 text-center transition-colors duration-300 hover:border-primary/30 hover:bg-primary/5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card transition-colors group-hover:border-primary/20 group-hover:bg-primary/10">
                  <PlusCircle className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground transition-colors group-hover:text-primary">
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
