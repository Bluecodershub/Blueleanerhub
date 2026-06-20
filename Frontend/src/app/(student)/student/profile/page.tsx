'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  User,
  Shield,
  Bell,
  CreditCard,
  MapPin,
  Calendar,
  Edit2,
  Code2,
  Trophy,
  BookOpen,
  Award,
  Star,
  Flame,
  Zap,
  Target,
  TrendingUp,
  Clock,
  GitBranch,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
  Globe,
  Loader2,
} from 'lucide-react'
import { Github, Linkedin } from '@/components/ui/BrandIcons'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { generateAvatarURL } from '@/utils/generateAvatar'
import { gamificationAPI } from '@/lib/api-civilization'
import type { Achievement, LeaderboardEntry } from '@/types'
import { toast } from 'sonner'

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'skills', label: 'Skills', icon: TrendingUp },
  { id: 'achievements', label: 'Achievements', icon: Award },
  { id: 'settings', label: 'Settings', icon: Shield },
]

const trendIcon = (trend: string) => {
  if (trend === 'up') return <ArrowUp className="h-3 w-3 text-emerald-400" />
  if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-400" />
  return <Minus className="h-3 w-3 text-muted-foreground" />
}

const FALLBACK_ACHIEVEMENTS = [
  { title: 'First Steps', desc: 'Complete first lesson', icon: '🎯', unlocked: false },
  { title: 'Code Ninja', desc: 'Solve 50 challenges', icon: '🥷', unlocked: false },
  { title: 'Week Warrior', desc: '7-day streak', icon: '🔥', unlocked: false },
  { title: 'AI Explorer', desc: 'Use AI companion 10×', icon: '🤖', unlocked: false },
  { title: 'Hackathon Hero', desc: 'Win a hackathon', icon: '🏆', unlocked: false },
  { title: 'Certified Pro', desc: 'Earn a certificate', icon: '📜', unlocked: false },
  { title: 'Team Player', desc: 'Join 3 teams', icon: '🤝', unlocked: false },
  { title: 'Speed Demon', desc: 'Quiz in under 60s', icon: '⚡', unlocked: false },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [achievements, setAchievements] = useState<{ title: string; desc: string; icon: string; unlocked: boolean }[]>(FALLBACK_ACHIEVEMENTS)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return
    let mounted = true
    Promise.all([
      gamificationAPI.achievements(),
      gamificationAPI.leaderboard(10),
    ]).then(([achResponse, lbResponse]) => {
      if (!mounted) return
      if (achResponse.error) {
        toast.error('Failed to load achievements')
      } else {
        const raw = achResponse.data ?? []
        if (raw.length) {
          setAchievements(
            raw.map((a: Achievement) => ({
              title: a.title,
              desc: a.description,
              icon: a.badgeIcon || a.badge_icon || '🏅',
              unlocked: a.earned || a.unlocked || false,
            }))
          )
        }
      }
      if (!lbResponse.error) {
        setLeaderboard(lbResponse.data ?? [])
      }
    }).catch(() => {
      toast.error('Failed to load profile data')
    }).finally(() => { if (mounted) setLoadingData(false) })
    return () => { mounted = false }
  }, [user])

  if (!user)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  const avatarSrc = user.avatarConfig ? generateAvatarURL(user.avatarConfig) : user.profilePicture
  const initials = (user.fullName || user.email || 'U').charAt(0).toUpperCase()
  const totalXP = user.totalPoints ?? 0
  const level = user.level ?? 1
  const streak = user.currentStreak ?? 0
  const longestStreak = user.longestStreak ?? 0
  const quizzesTaken = user.stats?.quizzes_taken ?? 0
  const hackathonsJoined = user.stats?.hackathons_participated ?? 0
  const enrolledPaths = user.stats?.enrolled_paths ?? 0

  const currentLevelXP = totalXP % 1000
  const xpPercent = Math.min((currentLevelXP / (level * 1000)) * 100, 100)

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Recently'

  const skills = (user.skills ?? []).map((s) => ({
    name: s.skill_name,
    level: Math.min(s.proficiency_level ?? 50, 100),
    color: 'bg-primary',
  }))

  const topEntries = leaderboard.slice(0, 3).map((e, i) => ({
    rank: i + 1,
    name: e.name || `User ${i + 1}`,
    xp: e.xp || e.totalPoints || 0,
    isUser: false,
    trend: 'same',
  }))

  const userLbEntry = { rank: '?', name: 'You', xp: totalXP, isUser: true, trend: 'up' as const }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      {/* Profile Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-card p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-sky-500/5" />

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary text-3xl font-black text-primary-foreground sm:h-24 sm:w-24">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                {user.fullName || user.email?.split('@')[0]}
              </h1>
              <Badge className="border-primary/25 bg-primary/15 text-xs font-bold text-primary">
                Level {level}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {joinedDate}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {streak}-day streak
                </span>
              )}
            </div>
            {skills.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {skills.slice(0, 5).map((s) => (
                  <Badge key={s.name} variant="outline" className="border-border text-[10px] text-muted-foreground">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid shrink-0 grid-cols-3 gap-3">
            {[
              { label: 'XP', value: totalXP.toLocaleString(), icon: Zap, color: 'text-amber-400' },
              { label: 'Quizzes', value: quizzesTaken.toString(), icon: Code2, color: 'text-sky-400' },
              { label: 'Level', value: `#${level}`, icon: Trophy, color: 'text-orange-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-border bg-background/50 p-3 text-center">
                <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                <div className="text-lg font-black text-foreground">{value}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* XP bar */}
        <div className="relative z-10 mt-6 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Level {level} → Level {level + 1}</span>
            <span className="font-bold text-primary">{currentLevelXP.toLocaleString()} / {(level * 1000).toLocaleString()} XP</span>
          </div>
          <Progress value={xpPercent} className="h-2 bg-muted/50" />
        </div>

        {/* Links */}
        <div className="relative z-10 mt-5 flex items-center gap-2">
          {[{ icon: Github, label: 'GitHub' }, { icon: Linkedin, label: 'LinkedIn' }, { icon: Globe, label: 'Portfolio' }].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border/80 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              <ExternalLink className="h-3 w-3" />
            </button>
          ))}
          <div className="flex-1" />
          <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-xl border-border px-3 text-xs font-semibold">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-card/50 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              activeTab === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="hidden h-4 w-4 sm:block" />
            {label}
          </button>
        ))}
      </div>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {/* Bio */}
              {user.bio && (
                <div className="rounded-2xl border border-border bg-card/50 p-6">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    About
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{user.bio}</p>
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Total XP', value: totalXP.toLocaleString(), icon: Zap, color: 'text-amber-400' },
                  { label: 'Current Streak', value: `${streak}d`, icon: Flame, color: 'text-orange-400' },
                  { label: 'Longest Streak', value: `${longestStreak}d`, icon: Star, color: 'text-pink-400' },
                  { label: 'Learning Paths', value: enrolledPaths.toString(), icon: BookOpen, color: 'text-sky-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-border bg-card/50 p-4 text-center">
                    <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
                    <div className="text-xl font-black text-foreground">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>

              {/* Activity placeholder */}
              <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Recent Activity
                </h3>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 opacity-20" />
                    <p className="text-sm">Activity feed coming soon</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    Leaderboard
                  </h3>
                </div>
                <div className="space-y-2">
                  {topEntries.length > 0 ? (
                    [...topEntries, userLbEntry].map((entry, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                          entry.isUser ? 'border border-primary/20 bg-primary/10' : 'hover:bg-muted/30'
                        }`}
                      >
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                          entry.rank === 1 ? 'bg-amber-500 text-white' : entry.rank === 2 ? 'bg-slate-400 text-white' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          #{entry.rank}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-bold ${entry.isUser ? 'text-primary' : 'text-foreground/90'}`}>
                            {entry.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{(entry.xp || 0).toLocaleString()} XP</p>
                        </div>
                        {trendIcon(entry.trend)}
                      </div>
                    ))
                  ) : (
                    [userLbEntry].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-black text-muted-foreground">?</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-primary">You</p>
                          <p className="text-[10px] text-muted-foreground">{totalXP.toLocaleString()} XP</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
                <h3 className="text-sm font-bold text-foreground">Platform Stats</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Hackathons Joined', value: hackathonsJoined.toString(), icon: Trophy, color: 'text-amber-400' },
                    { label: 'Quizzes Taken', value: quizzesTaken.toString(), icon: Zap, color: 'text-sky-400' },
                    { label: 'Learning Paths', value: enrolledPaths.toString(), icon: BookOpen, color: 'text-sky-400' },
                    { label: 'Current Streak', value: `${streak} days`, icon: Flame, color: 'text-orange-400' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${color} shrink-0`} />
                      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-bold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6 rounded-2xl border border-border bg-card/50 p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Target className="h-4 w-4 text-primary" />
                Skill Proficiency
              </h3>
              {skills.length > 0 ? (
                <div className="space-y-5">
                  {skills.map((skill) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground/90">{skill.name}</span>
                        <span className="font-bold text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Target className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Complete quizzes and exercises to unlock skill data</p>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <GitBranch className="h-4 w-4 text-primary" />
                Coding Activity
              </h3>
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Code2 className="mx-auto mb-3 h-10 w-10 opacity-30" />
                Activity heatmap coming soon
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{achievements.filter((a) => a.unlocked).length}</strong>
                {' '}of {achievements.length} badges earned
              </p>
              <Progress
                value={(achievements.filter((a) => a.unlocked).length / achievements.length) * 100}
                className="h-1.5 w-32"
              />
            </div>
            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {achievements.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`space-y-2 rounded-2xl border p-5 text-center transition-all ${
                      a.unlocked ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' : 'border-border bg-card/30 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-3xl">{a.icon}</div>
                    <div className="text-xs font-bold text-foreground">{a.title}</div>
                    <div className="text-[10px] leading-tight text-muted-foreground">{a.desc}</div>
                    {a.unlocked && (
                      <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400">Unlocked</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { icon: User, title: 'Account Info', desc: 'Update your name, email, and profile picture' },
              { icon: Shield, title: 'Security', desc: 'Change password and enable two-factor authentication' },
              { icon: Bell, title: 'Notifications', desc: 'Manage email and push notification preferences' },
              { icon: CreditCard, title: 'Subscription', desc: 'View your plan, billing, and upgrade options' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group cursor-pointer space-y-3 rounded-2xl border border-border bg-card/50 p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
