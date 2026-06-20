'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Lightbulb,
  Loader2,
  Send,
  Trophy,
  Users,
} from 'lucide-react'
import CountdownTimer from '@/components/hackathon/CountdownTimer'
import LeaderboardTable from '@/components/hackathon/LeaderboardTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hackathonsAPI } from '@/lib/api-civilization'

type HackathonStatus = 'OPEN' | 'UPCOMING' | 'CLOSED' | string

interface HackathonProblem {
  id: string | number
  title: string
  difficulty: string
  points: number
  solved?: boolean
}

interface HackathonPrize {
  rank: string
  amount: string
  label?: string
}

interface HackathonDetails {
  id: string
  title: string
  description: string
  status: HackathonStatus
  prizePool: string
  entryFee: number
  currency: string
  participantCount: number
  maxParticipants: number
  durationHours: number
  domain: string
  startDate: string
  endDate: string
  prizes: HackathonPrize[]
  rules: string[]
  problems: HackathonProblem[]
  sponsors: string[]
}

const diffColors: Record<string, string> = {
  Easy: 'text-success bg-success-light',
  Medium: 'text-warning bg-warning-light',
  Hard: 'text-red-400 bg-red-400/10',
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}

function normalizeStatus(status: unknown): HackathonStatus {
  const raw = String(status || 'OPEN').toUpperCase()
  if (raw === 'PUBLISHED' || raw === 'ACTIVE') return 'OPEN'
  if (raw === 'DRAFT') return 'UPCOMING'
  return raw
}

function normalizeHackathon(h: any): HackathonDetails | null {
  const id = h?._id ?? h?.id
  if (!id) return null

  const startDate = h.start_time || h.startDate || h.start_date || new Date().toISOString()
  const endDate = h.end_time || h.endDate || h.end_date || startDate
  const durationHours = Math.max(
    0,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 3600000)
  )

  return {
    id: String(id),
    title: h.title ?? h.name ?? 'Untitled hackathon',
    description: h.description ?? 'No description has been published for this hackathon yet.',
    status: normalizeStatus(h.status),
    prizePool: h.total_prize_pool ?? h.prizePool ?? h.prize ?? 'Not published',
    entryFee: Number(h.entryFee ?? h.entry_fee ?? 0) || 0,
    currency: h.currency || 'usd',
    participantCount: Number(h.total_participants ?? h.participantCount ?? h.participants ?? 0) || 0,
    maxParticipants: Number(h.max_participants ?? h.maxParticipants ?? 0) || 0,
    durationHours,
    domain: String(h.domain || 'technology').toLowerCase(),
    startDate,
    endDate,
    prizes: asArray<HackathonPrize>(h.prizes),
    rules: asArray<string>(h.rules),
    problems: asArray<HackathonProblem>(h.problems),
    sponsors: asArray<string>(h.sponsors),
  }
}

function HackathonSkeleton() {
  return (
    <div className="animate-pulse space-y-6 rounded-2xl border border-border bg-card p-8">
      <div className="h-10 w-2/3 rounded bg-muted" />
      <div className="h-5 w-1/2 rounded bg-muted" />
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-10 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

export default function HackathonDetailsPage() {
  const params = useParams()
  const [hackathon, setHackathon] = useState<HackathonDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [adaptiveGuidance, setAdaptiveGuidance] = useState<string[]>([])

  const hackathonId = useMemo(() => {
    const rawId = Array.isArray(params.hackathonId) ? params.hackathonId[0] : params.hackathonId
    return rawId ? String(rawId) : null
  }, [params.hackathonId])

  const isPaidHackathon = (Number(hackathon?.entryFee ?? 0) || 0) > 0
  const formattedEntryFee = useMemo(() => {
    const amount = Number(hackathon?.entryFee ?? 0) || 0
    if (amount <= 0) return 'Free'
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (hackathon?.currency || 'usd').toUpperCase(),
      }).format(amount)
    } catch {
      return `${hackathon?.currency || 'usd'} ${amount}`
    }
  }, [hackathon?.currency, hackathon?.entryFee])

  useEffect(() => {
    if (!hackathonId) {
      setHackathon(null)
      setLoadError('Hackathon ID is missing.')
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError('')

    hackathonsAPI
      .get(hackathonId)
      .then((result: any) => {
        const response = result?.data
        const normalized = normalizeHackathon(response?.data || response)
        if (!normalized) {
          setHackathon(null)
          setLoadError('Hackathon was not found.')
          return
        }

        setHackathon(normalized)
        setRegistered(Boolean(response?.isRegistered || response?.is_registered))
      })
      .catch(() => {
        setHackathon(null)
        setLoadError('Could not load this hackathon. Check that the backend is running and try again.')
      })
      .finally(() => setLoading(false))

    void hackathonsAPI.trackBehavior(hackathonId, 'hackathon_opened').catch(() => undefined)
    void hackathonsAPI
      .adaptiveGuidance(hackathonId)
      .then((result: any) => {
        const response = result?.data || result
        const guidance = Array.isArray(response?.guidance)
          ? response.guidance.filter((item: unknown) => typeof item === 'string')
          : []
        setAdaptiveGuidance(guidance.slice(0, 3))
      })
      .catch(() => setAdaptiveGuidance([]))
  }, [hackathonId])

  useEffect(() => {
    if (!hackathonId) return
    void hackathonsAPI
      .trackBehavior(hackathonId, 'tab_viewed', { tab: activeTab })
      .catch(() => undefined)
  }, [activeTab, hackathonId])

  const handleRegister = async () => {
    if (!hackathonId || !hackathon) return

    setRegistering(true)
    try {
      if (isPaidHackathon) {
        const payment = await hackathonsAPI.processPayment(hackathonId)
        if (payment.error) throw new Error(payment.error || 'Payment checkout failed')

        const response = payment.data as any
        const url = response?.data?.url || response?.url
        if (!url) throw new Error('Payment checkout URL was not returned')

        toast.success('Redirecting to secure payment checkout')
        window.location.href = url
        return
      }

      const result = await hackathonsAPI.register(hackathonId)
      if (result.error) throw new Error(result.error || 'Registration failed')

      toast.success('Registered successfully')
      void hackathonsAPI.trackBehavior(hackathonId, 'hackathon_registered').catch(() => undefined)
      setRegistered(true)
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        {loading && <HackathonSkeleton />}

        {!loading && loadError && (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <AlertCircle className="h-10 w-10 text-warning" />
              <div>
                <h1 className="text-2xl font-bold">Hackathon unavailable</h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">{loadError}</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/hackathons">Back to hackathons</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && hackathon && (
          <>
            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
            >
              <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      className={`border-0 text-xs font-bold ${
                        hackathon.status === 'OPEN'
                          ? 'bg-success-light text-success'
                          : hackathon.status === 'UPCOMING'
                            ? 'bg-warning-light text-warning'
                            : 'bg-muted/20 text-muted-foreground'
                      }`}
                    >
                      {hackathon.status}
                    </Badge>
                    <Badge className="border-border bg-secondary text-xs text-muted-foreground">
                      {hackathon.domain}
                    </Badge>
                  </div>

                  <h1 className="max-w-3xl text-balance text-3xl font-bold leading-tight md:text-5xl">
                    {hackathon.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    {hackathon.description}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <span className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                      <Trophy className="h-4 w-4 text-primary" /> {hackathon.prizePool}
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-primary" /> {formattedEntryFee}
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" /> {hackathon.participantCount.toLocaleString()} participants
                    </span>
                    <span className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" /> {hackathon.durationHours}h duration
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {registered ? (
                      <Button asChild variant="outline" className="gap-2">
                        <Link href={`/hackathons/${hackathon.id}/submit`}>
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Submit project
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleRegister}
                        disabled={registering || hackathon.status === 'CLOSED'}
                        className="gap-2"
                      >
                        {registering && <Loader2 className="h-4 w-4 animate-spin" />}
                        {hackathon.status === 'CLOSED'
                          ? 'Registration closed'
                          : isPaidHackathon
                            ? `Pay ${formattedEntryFee} and register`
                            : 'Register free'}
                      </Button>
                    )}
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/hackathons/${hackathon.id}/team`}>
                        Team
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-5 text-center">
                  <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Ends in</p>
                  <CountdownTimer endTime={hackathon.endDate} />
                </div>
              </div>
            </motion.header>

            {adaptiveGuidance.length > 0 && (
              <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h2 className="font-sans text-sm font-semibold uppercase text-primary">
                    Adaptive coaching
                  </h2>
                </div>
                <ul className="space-y-1">
                  {adaptiveGuidance.map((tip, index) => (
                    <li key={`${tip}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="border border-border bg-card">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="problems">Problems</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                <TabsTrigger value="submissions">My submissions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2">
                    <Card className="border-border bg-card">
                      <CardContent className="p-6">
                        <h2 className="mb-3 text-lg font-bold text-foreground">About</h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">{hackathon.description}</p>

                        <h3 className="mb-3 mt-6 text-base font-bold text-foreground">Rules</h3>
                        {hackathon.rules.length > 0 ? (
                          <ul className="space-y-2">
                            {hackathon.rules.map((rule) => (
                              <li key={rule} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                {rule}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Rules have not been published yet.</p>
                        )}
                      </CardContent>
                    </Card>

                    {hackathon.sponsors.length > 0 && (
                      <Card className="border-border bg-card">
                        <CardContent className="p-6">
                          <h3 className="mb-3 text-base font-bold text-foreground">Sponsors</h3>
                          <div className="flex flex-wrap gap-3">
                            {hackathon.sponsors.map((sponsor) => (
                              <span key={sponsor} className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground">
                                {sponsor}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Card className="border-border bg-card">
                    <CardContent className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                        <Award className="h-5 w-5 text-warning" /> Prizes
                      </h2>
                      {hackathon.prizes.length > 0 ? (
                        <div className="space-y-3">
                          {hackathon.prizes.map((prize) => (
                            <div key={`${prize.rank}-${prize.amount}`} className="flex items-center justify-between rounded-xl bg-secondary p-3">
                              <div className="flex items-center gap-2">
                                {prize.label && <span className="text-xl">{prize.label}</span>}
                                <span className="text-sm text-muted-foreground">{prize.rank}</span>
                              </div>
                              <span className="text-sm font-bold text-foreground">{prize.amount}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Prize details have not been published yet.</p>
                      )}
                      <div className="mt-4 border-t border-border pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Total prize pool</p>
                        <p className="text-2xl font-bold text-warning">{hackathon.prizePool}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="problems">
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-bold text-foreground">Problems</h2>
                      {!registered && (
                        <Badge className="border-warning/20 bg-warning-light text-xs text-warning">
                          Register to unlock problems
                        </Badge>
                      )}
                    </div>
                    {hackathon.problems.length > 0 ? (
                      <div className="space-y-3">
                        {hackathon.problems.map((problem, index) => (
                          <motion.div
                            key={problem.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                              registered
                                ? 'border-border bg-secondary/50 hover:bg-secondary'
                                : 'border-border bg-card/50 opacity-60'
                            }`}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground">{problem.title}</p>
                              <p className="text-xs text-muted-foreground">{problem.points} points</p>
                            </div>
                            <Badge className={`border-0 text-[10px] ${diffColors[problem.difficulty] ?? ''}`}>
                              {problem.difficulty}
                            </Badge>
                            {problem.solved ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-8 text-center">
                        <Code2 className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-3 text-sm text-muted-foreground">Problems have not been published yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard">
                <LeaderboardTable hackathonId={hackathon.id} />
              </TabsContent>

              <TabsContent value="submissions">
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    {registered ? (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <Send className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No submissions found for your account.</p>
                        <Button asChild variant="outline" size="sm" className="mt-2 border-border">
                          <Link href={`/hackathons/${hackathon.id}/submit`}>Submit project</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <Trophy className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Register first to submit solutions.</p>
                        <Button onClick={handleRegister} disabled={registering} className="mt-2 gap-2">
                          {registering && <Loader2 className="h-4 w-4 animate-spin" />}
                          Register now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
