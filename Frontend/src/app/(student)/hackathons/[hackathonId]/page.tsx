'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Trophy,
  Users,
  Clock,
  Award,
  Loader2,
  CheckCircle2,
  Code2,
  ChevronRight,
  Lightbulb,
  Send,
} from 'lucide-react'
import CountdownTimer from '@/components/hackathon/CountdownTimer'
import LeaderboardTable from '@/components/hackathon/LeaderboardTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { hackathonsAPI } from '@/lib/api-civilization'

const FALLBACK_HACKATHON = {
  id: 'sample',
  title: 'Sample Hackathon',
  description:
    'Join this exciting hackathon. Solve challenges, build projects, and compete for prizes.',
  status: 'OPEN',
  prizePool: '$5,000',
  entryFee: 0,
  currency: 'usd',
  participantCount: 100,
  maxParticipants: 500,
  durationHours: 48,
  domain: 'software',
  difficulty: 'intermediate',
  startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
  endDate: new Date(Date.now() + 86400000 * 4).toISOString(),
  prizes: [
    { rank: '1st Place', amount: '$2,500', label: '🥇' },
    { rank: '2nd Place', amount: '$1,500', label: '🥈' },
    { rank: '3rd Place', amount: '$1,000', label: '🥉' },
  ],
  rules: [
    'Individual or team participation (max 4 members)',
    'All code must be written during the hackathon window',
    'Use any programming language',
    'AI-assisted coding is allowed',
    'Submissions must include source code',
  ],
  problems: [
    { id: 1, title: 'Problem Solving', difficulty: 'Easy', points: 100, solved: false },
    { id: 2, title: 'Algorithm Challenge', difficulty: 'Medium', points: 200, solved: false },
  ],
  sponsors: ['TechCorp', 'InnovateLabs'],
}

const diffColors: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-400/10',
  Medium: 'text-amber-400 bg-amber-400/10',
  Hard: 'text-red-400 bg-red-400/10',
}

function HackathonSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-10 w-2/3 rounded bg-muted" />
      <div className="h-5 w-1/2 rounded bg-muted" />
      <div className="mt-4 flex gap-4">
        <div key="badge" className="h-8 w-32 rounded-full bg-muted" />
      </div>
      <div className="mt-6 h-10 w-40 rounded-lg bg-muted" />
    </div>
  )
}

export default function HackathonDetailsPage() {
  const params = useParams()
  const [hackathon, setHackathon] = useState<typeof FALLBACK_HACKATHON | null>(null)
  const [loading, setLoading] = useState(true)
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
      setHackathon(FALLBACK_HACKATHON)
      setLoading(false)
      return
    }

    hackathonsAPI
      .get(hackathonId)
      .then((result: any) => {
        const response = result?.data
        const h = response?.data || response
        
        if (h && (h.id || h._id)) {
          const startDate = h.start_time || h.startDate
          const endDate = h.end_time || h.endDate
          const durationHours = startDate && endDate
            ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 3600000)
            : 48
          
          setHackathon({
            ...FALLBACK_HACKATHON,
            id: h.id ?? h._id,
            title: h.title ?? h.name ?? FALLBACK_HACKATHON.title,
            description: h.description ?? FALLBACK_HACKATHON.description,
            status: (h.status || 'OPEN').toUpperCase(),
            prizePool: h.total_prize_pool ?? h.prizePool ?? FALLBACK_HACKATHON.prizePool,
            entryFee: Number(h.entryFee ?? h.entry_fee ?? 0) || 0,
            currency: h.currency || 'usd',
            participantCount: h.total_participants || 0,
            maxParticipants: h.max_participants || 500,
            durationHours: durationHours,
            domain: (h.domain || 'software').toLowerCase(),
            startDate: startDate || FALLBACK_HACKATHON.startDate,
            endDate: endDate || FALLBACK_HACKATHON.endDate,
          })
          setRegistered(h.isRegistered || h.is_registered || false)
        } else {
          setHackathon(FALLBACK_HACKATHON)
        }
      })
      .catch(() => setHackathon(FALLBACK_HACKATHON))
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
    if (!hackathonId) {
      setRegistered(true)
      toast.success('Registered successfully! Good luck!')
      return
    }
    setRegistering(true)
    try {
      if (isPaidHackathon) {
        const payment = await hackathonsAPI.processPayment(hackathonId)
        if (payment.error) {
          throw new Error(payment.error || 'Payment checkout failed')
        }

        const response = payment.data as any
        const url = response?.data?.url || response?.url
        if (!url) {
          throw new Error('Payment checkout URL was not returned')
        }

        toast.success('Redirecting to secure payment checkout...')
        window.location.href = url
        return
      }

      const result = await hackathonsAPI.register(hackathonId)
      if (result.error) {
        throw new Error(result.error || 'Registration failed')
      }
      
      toast.success('Registered successfully! Good luck!')
      
      void hackathonsAPI.trackBehavior(hackathonId, 'hackathon_registered').catch(() => undefined)
      setRegistered(true)
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.')
    } finally {
      setRegistering(false)
    }
  }

  const h = hackathon ?? FALLBACK_HACKATHON

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Hero Banner */}
        {loading ? (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
            <HackathonSkeleton />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white"
          >
            <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <Badge
                    className={`border-0 text-xs font-bold ${
                      h.status === 'OPEN'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : h.status === 'UPCOMING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-muted/20 text-muted-foreground'
                    }`}
                  >
                    {h.status}
                  </Badge>
                  <Badge className="border-0 bg-white/10 text-xs text-white/80">{h.domain}</Badge>
                </div>

                <h1 className="mb-2 text-3xl font-bold leading-tight md:text-4xl">{h.title}</h1>
                <p className="mb-5 max-w-xl text-base leading-relaxed text-blue-100">
                  {h.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                    <Trophy className="h-4 w-4" /> Prize Pool: {h.prizePool}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                    <Award className="h-4 w-4" /> Entry: {formattedEntryFee}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                    <Users className="h-4 w-4" /> {h.participantCount?.toLocaleString()}{' '}
                    Participants
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
                    <Clock className="h-4 w-4" /> {h.durationHours}h Duration
                  </span>
                </div>

                <div className="mt-6">
                  {registered ? (
                    <button className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/25">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                      Registered — Go to Dashboard
                    </button>
                  ) : (
                    <Button
                      onClick={handleRegister}
                      disabled={registering || h.status === 'CLOSED'}
                      className="h-auto gap-2 rounded-xl bg-white px-8 py-3 font-bold text-blue-700 transition-colors hover:bg-blue-50 disabled:opacity-60"
                    >
                      {registering && <Loader2 className="h-4 w-4 animate-spin" />}
                      {h.status === 'CLOSED'
                        ? 'Registration Closed'
                        : registering
                          ? 'Registering...'
                          : isPaidHackathon
                            ? `Pay ${formattedEntryFee} & Register`
                            : 'Register Now - Free'}
                    </Button>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-200">
                  Ends in
                </p>
                <CountdownTimer endTime={h.endDate} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Adaptive Guidance */}
        {adaptiveGuidance.length > 0 && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
                Adaptive Coaching
              </h3>
            </div>
            <ul className="space-y-1">
              {adaptiveGuidance.map((tip, index) => (
                <li
                  key={`${tip}-${index}`}
                  className="flex items-start gap-2 text-sm text-indigo-100"
                >
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tabs */}
        {!loading && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="border border-border bg-card">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* About + Rules */}
                <div className="space-y-6 lg:col-span-2">
                  <Card className="border-border bg-card">
                    <CardContent className="p-6">
                      <h2 className="mb-3 text-lg font-bold text-foreground">About</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground">{h.description}</p>

                      <h3 className="mb-3 mt-6 text-base font-bold text-foreground">Rules</h3>
                      <ul className="space-y-2">
                        {h.rules.map((rule, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {h.sponsors?.length > 0 && (
                    <Card className="border-border bg-card">
                      <CardContent className="p-6">
                        <h3 className="mb-3 text-base font-bold text-foreground">Sponsors</h3>
                        <div className="flex flex-wrap gap-3">
                          {h.sponsors.map((s: string) => (
                            <span
                              key={s}
                              className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Prizes */}
                <div>
                  <Card className="border-border bg-card">
                    <CardContent className="p-6">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                        <Award className="h-5 w-5 text-amber-400" /> Prizes
                      </h2>
                      <div className="space-y-3">
                        {h.prizes.map((prize) => (
                          <div
                            key={prize.rank}
                            className="flex items-center justify-between rounded-xl bg-secondary p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{prize.label}</span>
                              <span className="text-sm text-muted-foreground">{prize.rank}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{prize.amount}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-border pt-4 text-center">
                        <p className="text-xs text-muted-foreground">Total Prize Pool</p>
                        <p className="text-2xl font-black text-amber-400">{h.prizePool}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="problems">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">Problems</h2>
                    {!registered && (
                      <Badge className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-400">
                        Register to unlock all problems
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {h.problems.map((problem, i) => (
                      <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                          registered
                            ? 'cursor-pointer border-border bg-secondary/50 hover:bg-secondary'
                            : 'border-border bg-card/50 opacity-60'
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{problem.title}</p>
                          <p className="text-xs text-muted-foreground">{problem.points} points</p>
                        </div>
                        <Badge
                          className={`border-0 text-[10px] ${diffColors[problem.difficulty] ?? ''}`}
                        >
                          {problem.difficulty}
                        </Badge>
                        {problem.solved && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        )}
                        {registered && !problem.solved && (
                          <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  {!registered && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={handleRegister}
                        disabled={registering}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {registering && <Loader2 className="h-4 w-4 animate-spin" />}
                        Register to Start Solving
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <LeaderboardTable hackathonId={params.hackathonId as string} />
            </TabsContent>

            <TabsContent value="submissions">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  {registered ? (
                    <div className="space-y-4">
                      <h2 className="mb-4 text-lg font-bold text-foreground">My Submissions</h2>
                      <div className="flex flex-col items-center gap-3 py-12 text-center">
                        <Send className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No submissions yet.</p>
                        <p className="text-xs text-muted-foreground">
                          Go to Problems tab to start solving challenges.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-border"
                          onClick={() => setActiveTab('problems')}
                        >
                          View Problems
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <Trophy className="h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Register first to submit solutions.</p>
                      <Button
                        onClick={handleRegister}
                        disabled={registering}
                        className="mt-2 gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {registering && <Loader2 className="h-4 w-4 animate-spin" />}
                        Register Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
