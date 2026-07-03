'use client'

import { useState, useMemo, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Code2, Trophy, Target, Zap, Flame, Award, ArrowRight, CheckCircle2, Circle, Play, Users, Sparkles, ChevronRight, Brain, Bot, CheckCircle, Bookmark, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OnboardingTour, useOnboarding } from '@/components/onboarding/OnboardingTour'
import { trackingAPI } from '@/lib/api-civilization'
import { toast } from 'sonner'
import { LanguageBadge } from '@/components/ui/LanguageLogo'
import { RUNTIME_LANGUAGES } from '@/lib/languages'
import { AppPage, PageHeader } from '@/components/layout/AppPage'

// Lazy load heavy components
const XPProgressBar = lazy(() => import('@/components/gamification/XPProgressBar').then(m => ({ default: m.XPProgressBar })))
const Confetti = lazy(() => import('@/components/animations/Confetti'))

// ─── Loading States ─────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-40 rounded-3xl bg-card" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-3xl bg-card" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 rounded-3xl bg-card" />
        <div className="h-64 rounded-3xl bg-card" />
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
}: {
  icon: typeof BookOpen
  title: string
  description: string
  action: () => void
  actionLabel: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button onClick={action} className="gap-2">
        {actionLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

// ─── Progress Ring ────────────────────────────────────────────────────────────────
function ProgressRing({ progress, size = 80, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-border" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-1000"
      />
    </svg>
  )
}

// ─── Onboarding Checklist ─────────────────────────────────────────────────────────
const onboardingSteps = [
  { id: 'profile', label: 'Complete your profile', icon: Users },
  { id: 'quiz', label: 'Take your first daily quiz', icon: Target },
  { id: 'track', label: 'Enroll in a learning track', icon: BookOpen },
  { id: 'challenge', label: 'Solve a coding challenge', icon: Code2 },
]

function OnboardingChecklist({ completedSteps, onStepClick }: { completedSteps: string[]; onStepClick: (stepId: string) => void }) {
  return (
    <div className="rounded-[8px] border border-primary/20 bg-primary/[0.04] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Get Started</h3>
        <Badge variant="outline" className="text-xs">
          {completedSteps.length}/{onboardingSteps.length} complete
        </Badge>
      </div>
      <div className="space-y-3">
        {onboardingSteps.map((step) => {
          const isComplete = completedSteps.includes(step.id)
          const Icon = step.icon
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className="flex w-full items-center gap-3 rounded-[7px] p-3 transition-colors hover:bg-card"
            >
              {isComplete ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className={cn('flex-1 text-left text-sm', isComplete ? 'text-muted-foreground line-through' : 'text-foreground')}>
                {step.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Quick Stats ─────────────────────────────────────────────────────────────────
function QuickStatCard({ label, value, icon: Icon, color, trend }: { label: string; value: string | number; icon: typeof Flame; color: string; trend?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[8px] border border-border/80 bg-card/90 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn('rounded-[7px] p-2.5', color)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <Badge variant="outline" className="text-xs">
            {trend}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ─── Learning Activity ───────────────────────────────────────────────────────────
function LearningActivity({ type, title, time, xp }: { type: string; title: string; time: string; xp: number }) {
  const icons: Record<string, typeof BookOpen> = {
    quiz: Target,
    track: BookOpen,
    challenge: Code2,
    hackathon: Trophy,
  }
  const Icon = icons[type] || BookOpen

  return (
    <div className="flex items-center gap-4 rounded-[7px] p-3 transition-colors hover:bg-card">
      <div className="rounded-[7px] bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
      <Badge variant="outline" className="text-xs">
        +{xp} XP
      </Badge>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showConfetti] = useState(false)
  const { isFirstTime, showTour, completeTour } = useOnboarding()

  const [continueLearningList, setContinueLearningList] = useState<any[]>([])
  const [savedLessons, setSavedLessons] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loadingTracking, setLoadingTracking] = useState(true)

  const xp = stats?.totalXp ?? user?.totalPoints ?? 0
  const level = user?.level ?? 1
  const streak = stats?.streak ?? user?.currentStreak ?? 0
  const longestStreak = user?.longestStreak ?? 0
  const quizzesTaken = user?.stats?.quizzes_taken ?? 0
  const hackathonCount = user?.stats?.hackathons_participated ?? 0
  const enrolledPaths = user?.stats?.enrolled_paths ?? 0
  const firstName = user?.fullName?.split(' ')[0] ?? 'Learner'

  const isNewUser = xp === 0 && quizzesTaken === 0 && enrolledPaths === 0

  const levelXP = xp % 1000
  const nextXP = (level + 1) * 100

  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; title: string; time: string; xp: number }>>([])
  const [upcomingHackathons, setUpcomingHackathons] = useState<Array<{ _id: string; name?: string; title?: string; startDate?: string; endDate?: string; theme?: string }>>([])

  useEffect(() => {
    if (!user) return
    import('@/lib/api').then(({ default: api }) => {
      api.get('/hackathons?status=PUBLISHED&limit=3').then(r => {
        const raw = r.data?.data ?? r.data?.hackathons ?? []
        setUpcomingHackathons(Array.isArray(raw) ? raw.slice(0, 3) : [])
      }).catch(() => setUpcomingHackathons([]))
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    import('@/lib/api').then(({ default: api }) => {
      api.get('/quiz/attempts/me?limit=5').then(r => {
        const attempts = r.data?.data?.data ?? r.data?.data ?? []
        const mapped = (Array.isArray(attempts) ? attempts : []).slice(0, 5).map((a: any) => ({
          type: 'quiz',
          title: a.quizId?.title ? `Completed: ${a.quizId.title}` : 'Completed a quiz',
          time: a.completedAt ? new Date(a.completedAt).toLocaleDateString() : 'Recently',
          xp: a.pointsEarned ?? 0,
        }))
        setRecentActivity(mapped)
      }).catch(() => setRecentActivity([]))
    })
  }, [user])

  const completedSteps = useMemo(() => {
    const steps: string[] = []
    if (user?.fullName) steps.push('profile')
    if (quizzesTaken > 0) steps.push('quiz')
    if (enrolledPaths > 0) steps.push('track')
    return steps
  }, [user?.fullName, quizzesTaken, enrolledPaths])

  const handleOnboardingStep = (stepId: string) => {
    switch (stepId) {
      case 'profile':
        router.push('/profile')
        break
      case 'quiz':
        router.push('/daily-quiz')
        break
      case 'track':
        router.push('/learning-tracks')
        break
      case 'challenge':
        router.push('/exercises')
        break
    }
  }

  const loadTrackingData = async () => {
    try {
      setLoadingTracking(true)
      const [contRes, savedRes, recRes, statsRes] = await Promise.all([
        trackingAPI.getContinueLearning(),
        trackingAPI.getSavedLessons(),
        trackingAPI.getRecommendations(),
        trackingAPI.getStats()
      ]).catch((err) => {
        console.error('Promise.all error caught, resolving defaults:', err)
        return [ { data: [] }, { data: [] }, { data: [] }, { data: null } ]
      })
      
      setContinueLearningList(contRes?.data || [])
      setSavedLessons(savedRes?.data || [])
      setRecommendations(recRes?.data || [])
      setStats(statsRes?.data || null)
    } catch (err) {
      console.error('Failed to load tracking data:', err)
    } finally {
      setLoadingTracking(false)
    }
  }

  useEffect(() => {
    if (user) {
      if (!user.domain) {
        router.push('/student/onboarding')
      } else {
        setLoading(false)
        void loadTrackingData()
      }
    }
  }, [user, router])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <AppPage>
      <Suspense fallback={<DashboardSkeleton />}>
        <Confetti active={showConfetti} />
      </Suspense>

      <div className="space-y-7">
        {/* ── Header (premium hero band) ─────────────────────────────────── */}
        <PageHeader
          eyebrow="Learner dashboard"
          icon={BookOpen}
          title={`Welcome back, ${firstName}`}
          description={
            isNewUser
              ? 'Start with a short assessment, then build momentum with daily practice.'
              : `You have earned ${xp.toLocaleString()} XP. Continue from your most recent learning activity.`
          }
          actions={
            <>
              <div className="flex items-center gap-2.5 rounded-[8px] border border-border bg-card/70 px-4 py-2.5">
                <Award className="h-5 w-5 text-sky-400" />
                <div>
                  <p className="text-lg font-bold leading-none text-foreground">Lvl {level}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{levelXP}/{nextXP} XP</p>
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-2.5 rounded-[8px] border border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-lg font-bold leading-none text-amber-500">{streak}</p>
                    <p className="mt-1 text-[11px] text-amber-600/80">day streak</p>
                  </div>
                </div>
              )}
            </>
          }
        />

        {/* ── Onboarding for New Users ─────────────────────────────────── */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8"
          >
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="flex-1">
                  <h2 className="mb-2 text-2xl font-bold text-foreground">Start Your Journey</h2>
                <p className="text-muted-foreground">
                  Complete these quick steps to get the most out of BlueLearnerHub. Each step helps you build essential skills!
                </p>
              </div>
              <div className="lg:w-80">
                <OnboardingChecklist completedSteps={completedSteps} onStepClick={handleOnboardingStep} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            href="/daily-quiz"
            className="group flex flex-col items-center gap-3 rounded-[8px] border border-primary/20 bg-primary/[0.06] p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="rounded-[7px] bg-primary/15 p-4 transition-transform group-hover:scale-105">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Daily Quiz</span>
            <span className="text-xs text-muted-foreground">+10-30 XP</span>
          </Link>
          <Link
            href="/exercises"
            className="group flex flex-col items-center gap-3 rounded-[8px] border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center transition-all hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md"
          >
            <div className="rounded-[7px] bg-emerald-500/15 p-4 transition-transform group-hover:scale-105">
              <Code2 className="h-6 w-6 text-emerald-500" />
            </div>
            <span className="font-semibold text-foreground">Practice</span>
            <span className="text-xs text-muted-foreground">+20-50 XP</span>
          </Link>
          <Link
            href="/learning-tracks"
            className="group flex flex-col items-center gap-3 rounded-[8px] border border-sky-500/20 bg-sky-500/[0.06] p-6 text-center transition-all hover:-translate-y-0.5 hover:border-sky-500/40 hover:shadow-md"
          >
            <div className="rounded-[7px] bg-sky-500/15 p-4 transition-transform group-hover:scale-105">
              <BookOpen className="h-6 w-6 text-sky-500" />
            </div>
            <span className="font-semibold text-foreground">Learn Track</span>
            <span className="text-xs text-muted-foreground">+50-100 XP</span>
          </Link>
          <Link
            href="/hackathons"
            className="group flex flex-col items-center gap-3 rounded-[8px] border border-amber-500/20 bg-amber-500/[0.06] p-6 text-center transition-all hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-md"
          >
            <div className="rounded-[7px] bg-amber-500/15 p-4 transition-transform group-hover:scale-105">
              <Trophy className="h-6 w-6 text-amber-500" />
            </div>
            <span className="font-semibold text-foreground">Hackathon</span>
            <span className="text-xs text-muted-foreground">Win prizes!</span>
          </Link>
        </div>

        {/* ── Stats Overview ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickStatCard label="Total XP" value={xp.toLocaleString()} icon={Zap} color="bg-amber-500/20 text-amber-500" />
          <QuickStatCard label="Quizzes" value={quizzesTaken} icon={Target} color="bg-primary/20 text-primary" />
          <QuickStatCard label="Tracks" value={enrolledPaths} icon={BookOpen} color="bg-sky-500/20 text-sky-500" />
          <QuickStatCard label="Hackathons" value={hackathonCount} icon={Trophy} color="bg-amber-500/20 text-amber-500" />
        </div>

        <section className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Code2 className="h-3.5 w-3.5" />
                Live coding sandbox
              </div>
              <h2 className="text-2xl font-bold text-foreground">Run real code from your dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                The IDE connects to the authenticated backend execution route and reports the active runtime status before every run.
              </p>
            </div>
            <Button asChild className="gap-2 lg:justify-self-end">
              <Link href="/ide">
                Open IDE
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="border-t border-border/60 bg-secondary/30 p-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {RUNTIME_LANGUAGES.map((language) => (
                <LanguageBadge key={language.id} language={language.id} showVersion className="shrink-0" />
              ))}
            </div>
          </div>
        </section>

        {/* ── Main Content Grid ────────────────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Progress Card */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
                    <p className="text-sm text-muted-foreground">Level {level} • {levelXP}/{nextXP} XP to next level</p>
                  </div>
                  <div className="relative">
                    <ProgressRing progress={(levelXP / nextXP) * 100} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{level}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Suspense fallback={<div className="h-20 rounded-xl bg-secondary/50 animate-pulse" />}>
                  <XPProgressBar currentXP={levelXP} nextLevelXP={nextXP} level={level} />
                </Suspense>
              </div>
            </div>

            {/* Recent Activity or Empty State */}
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="border-b border-border/50 bg-secondary/30 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                  <Link href="/student/profile" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, i) => (
                    <LearningActivity key={i} {...activity} />
                  ))
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title="No activity yet"
                    description="Complete your first quiz, start a track, or solve a challenge to see your activity here."
                    action={() => router.push('/daily-quiz')}
                    actionLabel="Take Your First Quiz"
                  />
                )}
              </div>
            </div>

            {/* Learning Tracks Resume Preview */}
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="border-b border-border/50 bg-secondary/30 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Continue Learning</h2>
                  <Link href="/learning-tracks" className="text-sm text-primary hover:underline">
                    Browse all
                  </Link>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {loadingTracking ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : continueLearningList.length > 0 ? (
                  continueLearningList.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card/40 hover:bg-card/70 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/20 bg-primary/5">
                            {item.tutorialTitle || 'Lesson'}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            • Last accessed {item.lastAccessed ? new Date(item.lastAccessed).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground truncate">{item.lessonTitle || 'Untitled Lesson'}</h3>
                        
                        {/* Progress Bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${item.progress || 50}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground font-semibold">{item.progress || 50}% done</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => router.push(item.tutorialSlug ? `/tutorials/view/${item.tutorialSlug}/${item.lessonId}` : `/tutorials/cs/${item.tutorialId}/${item.lessonId}`)}
                        className="gap-2 bg-primary hover:bg-primary/90 font-bold text-primary-foreground shrink-0"
                      >
                        <Play className="h-4 w-4 fill-current" /> Resume
                      </Button>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={BookOpen}
                    title="Start a Learning Track"
                    description="Enroll in structured learning paths designed by industry experts to master new skills."
                    action={() => router.push('/learning-tracks')}
                    actionLabel="Explore Tracks"
                  />
                )}
              </div>
            </div>

            {/* Saved Lessons & Wishlist */}
            <div className="overflow-hidden rounded-3xl border border-border bg-card/10">
              <div className="border-b border-border/50 bg-secondary/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Saved for Later</h2>
                </div>
                <Badge variant="outline" className="text-xs font-bold bg-primary/5 text-primary border-primary/20">
                  {savedLessons.length} bookmarks
                </Badge>
              </div>
              <div className="p-6">
                {loadingTracking ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : savedLessons.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {savedLessons.map((item, idx) => (
                      <div key={idx} className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/50 bg-card hover:bg-card/80 transition-all hover:border-primary/20">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground border-border bg-secondary/10">
                              {item.tutorialSlug || 'CS Track'}
                            </Badge>
                            <button 
                              onClick={async () => {
                                const targetTut = item.tutorialSlug || String(item.tutorialId)
                                try {
                                  await trackingAPI.removeSavedLesson(targetTut, item.lessonId)
                                  setSavedLessons((prev) => prev.filter((l) => !(l.tutorialId === item.tutorialId && l.lessonId === item.lessonId)))
                                  toast.success('Removed from wishlist')
                                } catch {
                                  toast.error('Failed to remove bookmark')
                                }
                              }}
                              className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                              title="Remove Bookmark"
                            >
                              <Bookmark className="h-4 w-4 fill-current text-primary" />
                            </button>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground leading-snug mb-1">{item.lessonTitle || 'Untitled Lesson'}</h4>
                          <span className="text-[10px] text-muted-foreground/80 block mb-4">Saved {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : 'recently'}</span>
                        </div>
                        <Button 
                          onClick={() => router.push(item.tutorialSlug ? `/tutorials/view/${item.tutorialSlug}/${item.lessonId}` : `/tutorials/cs/${item.tutorialId}/${item.lessonId}`)}
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 font-bold hover:bg-primary hover:text-primary-foreground"
                        >
                          Read Now <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-card/20 rounded-2xl border border-dashed border-border p-6">
                    <Bookmark className="h-8 w-8 text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Your study wishlist is currently empty.</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Bookmark lessons inside curriculum modules to save them here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Skill Placement Card */}
            <div className="overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-card to-card p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-sky-400" />
                  <h2 className="text-lg font-semibold text-foreground">AI Skill Placement</h2>
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Adaptive
                </span>
              </div>

              <div className="mb-4 bg-background/40 border border-border p-4 rounded-2xl flex items-center justify-around">
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Overall Level</span>
                  <span className="text-3xl font-extrabold text-sky-300 block mt-1">Level {level}</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Active Domain</span>
                  <span className="text-xs font-bold text-foreground block mt-2.5 truncate max-w-[120px]">{user?.domain || 'Not Onboarded'}</span>
                </div>
              </div>

              {user?.skills && user.skills.length > 0 ? (
                <div className="mb-4 space-y-2">
                  <span className="text-xs font-bold text-foreground block">Sub-skill Breakdown</span>
                  <div className="space-y-1.5">
                    {user.skills.slice(0, 3).map((sk: any) => (
                      <div key={sk.name} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{sk.name}</span>
                        <span className="text-sky-300 font-semibold">Lvl {sk.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-4 space-y-2 text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Key syntax rules mastered
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Logic evaluation passed
                  </span>
                </div>
              )}

              <Button className="w-full gap-2 bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-500 hover:to-sky-500 text-white font-bold" onClick={() => router.push('/student/roadmap')}>
                <Award className="h-4 w-4" /> View Skill Tree Roadmap
              </Button>
            </div>

            {/* AI Study Insights Card */}
            <div className="overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-card to-card p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-400" />
                <h2 className="text-lg font-semibold text-foreground">AI Study Insights</h2>
              </div>

              <div className="mb-4 relative bg-background/40 border border-border p-4 rounded-2xl">
                {/* Talk bubble spike */}
                <div className="absolute -left-2 top-6 h-3 w-3 rotate-45 border-l border-b border-border bg-background/80" />
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {user?.domain === 'Software Engineering' ? 
                    `Welcome, developer! I've custom-designed a software architecture roadmap focusing on OOP & modular algorithms. Let's tackle your first node today!` :
                   user?.domain === 'Robotics Engineering' ?
                    `Greetings, roboticist! I've loaded specialized dynamic loops & PID controls into your pipeline. Complete the first task to unlock kinematics!` :
                    `Hello! Your customized curriculum is ready. Ask the AI tutor for domain-specific guidance whenever you need it.`
                  }
                </p>
              </div>

              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/ai-companion">
                  <Bot className="h-4 w-4 text-primary" /> Open AI Tutor
                </Link>
              </Button>
            </div>

            {/* Upcoming Hackathons */}
            {upcomingHackathons.length > 0 && (
              <div className="overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-foreground">Upcoming Hackathons</h2>
                  </div>
                  <Link href="/hackathons" className="text-xs text-amber-400 hover:underline">View all</Link>
                </div>
                <div className="p-4 space-y-3">
                  {upcomingHackathons.map((h) => (
                    <Link key={h._id} href={`/hackathons/${h._id}`} className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-colors block">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                        <Trophy className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{h.name ?? h.title ?? 'Hackathon'}</p>
                        {h.theme && <p className="text-xs text-muted-foreground truncate">{h.theme}</p>}
                        {h.startDate && (
                          <p className="text-xs text-amber-400 mt-1 font-mono">
                            {new Date(h.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {h.endDate && ` — ${new Date(h.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Challenge */}
            <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="bg-gradient-to-r from-primary/10 to-transparent p-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Daily Challenge</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 rounded-xl bg-card p-4">
                  <p className="mb-2 font-semibold text-foreground">Today&apos;s Daily Quiz</p>
                  <p className="mb-4 text-sm text-muted-foreground">Complete today&apos;s domain quiz to earn XP and keep your streak alive.</p>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">Daily</Badge>
                    <span className="text-amber-500">+10–30 XP</span>
                  </div>
                </div>
                <Button className="w-full gap-2" onClick={() => router.push('/daily-quiz')}>
                  <Play className="h-4 w-4" /> Start Challenge
                </Button>
              </div>
            </div>

            {/* Streak Info */}
            {streak > 0 && (
              <div className="overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-amber-500/20 p-3">
                      <Flame className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{streak} Day Streak</p>
                      <p className="text-sm text-muted-foreground">Longest: {longestStreak} days</p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {streak >= 7
                      ? "You're on fire! Keep your streak going!"
                      : "Don't break your streak! Complete a quiz today."}
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/daily-quiz')}>
                    <Target className="mr-2 h-4 w-4" /> Take Quiz to Maintain
                  </Button>
                </div>
              </div>
            )}

            {/* AI Custom Recommendations */}
            <div className="overflow-hidden rounded-3xl border border-sky-500/25 bg-gradient-to-br from-sky-500/5 to-transparent">
              <div className="bg-gradient-to-r from-sky-500/10 to-transparent p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-400" />
                  <h2 className="text-lg font-semibold text-foreground">AI Next-Steps</h2>
                </div>
                <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] uppercase font-bold tracking-widest">
                  Tailored
                </Badge>
              </div>
              <div className="p-6 space-y-4">
                {loadingTracking ? (
                  <div className="flex justify-center items-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
                  </div>
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="group relative rounded-2xl border border-border bg-card/65 p-4 transition-all hover:border-sky-500/30 hover:shadow-md">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-wider text-sky-400 border-sky-500/25 bg-sky-500/5">
                          {rec.type || 'lesson'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold">{rec.estimatedMinutes ? `${rec.estimatedMinutes}m` : '12m'} read</span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-snug mb-1 group-hover:text-sky-400 transition-colors">{rec.title || 'Recommended module'}</h4>
                      <p className="text-xs text-muted-foreground/80 mb-3">{rec.reason || 'Based on your interest in software development.'}</p>
                      <Button 
                        onClick={() => router.push('/learning-tracks')}
                        size="sm"
                        className="w-full gap-1 text-[11px] font-bold uppercase tracking-wider bg-sky-600/10 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/20"
                      >
                        Launch Module <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card/25 p-5 text-center">
                    <p className="text-xs text-muted-foreground">Complete your initial learning activity to generate recommendations!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="border-b border-border/50 bg-secondary/30 p-6">
                <h2 className="text-lg font-semibold text-foreground">Quick Links</h2>
              </div>
              <div className="divide-y divide-border/50">
                <Link href="/ide" className="flex items-center gap-4 p-4 transition-colors hover:bg-card">
                  <Code2 className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm">Open IDE</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/certificates" className="flex items-center gap-4 p-4 transition-colors hover:bg-card">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm">My Certificates</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                <Link href="/community" className="flex items-center gap-4 p-4 transition-colors hover:bg-card">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm">Community Q&A</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="overflow-hidden rounded-3xl border border-border">
              <div className="border-b border-border/50 bg-secondary/30 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
                  <Link href="/student/profile" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4 flex justify-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Complete challenges to unlock achievements!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Tour for first-time users */}
      <OnboardingTour isFirstTime={isFirstTime && showTour} onComplete={completeTour} />
    </AppPage>
  )
}
