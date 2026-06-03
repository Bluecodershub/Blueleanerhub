'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Trophy,
  Award,
  Globe,
  Loader2,
  TrendingUp,
  Flame,
  Star,
} from 'lucide-react'
import { Github, Linkedin } from '@/components/ui/BrandIcons'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { hackathonsAPI } from '@/lib/api-civilization'
import { gamificationAPI } from '@/lib/api-civilization'



interface Hackathon {
  id: number
  title: string
  description: string
  status: string
  domain: string
  total_prize_pool: string
  start_time: string
  end_time: string
}

interface Achievement {
  id: number
  title: string
  description: string
  xp_reward: number
  badge_url: string | null
  earned_at: string | null
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    streak: 0,
    hackathonsCompleted: 0,
    rank: 0,
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    Promise.all([
      hackathonsAPI.list(),
      gamificationAPI.achievements(),
      gamificationAPI.leaderboard(100),
    ])
      .then(([hackathonsResult, achievementsResult, leaderboardResult]: any[]) => {
        const hackathonsData = hackathonsResult?.data?.data || hackathonsResult?.data || []
        setHackathons(hackathonsData)

        const achievementsData = achievementsResult?.data?.data || achievementsResult?.data || []
        setAchievements(achievementsData.filter((a: any) => a.earned_at || a.unlocked))

        const leaderboardData = leaderboardResult?.data?.data || leaderboardResult?.data || []
        const userRank = leaderboardData.findIndex((entry: any) => entry.user_id === user.id || entry.userId === user.id)
        if (userRank >= 0) {
          setStats(prev => ({ ...prev, rank: userRank + 1 }))
        }

        const totalXP = achievementsData
          .filter((a: any) => a.earned_at)
          .reduce((sum: number, a: any) => sum + (a.xp_reward || 0), 0)
        
        setStats(prev => ({
          ...prev,
          totalXP: user.totalPoints || totalXP,
          level: user.level || 1,
          streak: user.currentStreak || 0,
        }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-3xl font-bold text-white">
          {user?.fullName?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user?.fullName || 'User'}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="mt-2 flex gap-4">
            {user?.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white">
                <Github className="h-5 w-5" />
              </a>
            )}
            {user?.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {user?.portfolioUrl && (
              <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white">
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <Star className="mx-auto mb-2 h-6 w-6 text-amber-400" />
              <p className="text-2xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-2xl font-bold text-white">Level {stats.level}</p>
              <p className="text-xs text-muted-foreground">Current Level</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <Flame className="mx-auto mb-2 h-6 w-6 text-orange-400" />
              <p className="text-2xl font-bold text-white">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-blue-400" />
              <p className="text-2xl font-bold text-white">#{stats.rank || '-'}</p>
              <p className="text-xs text-muted-foreground">Global Rank</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-400" />
          Achievements
        </h2>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {achievements.slice(0, 8).map((achievement, i) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-2xl">
                      🏅
                    </div>
                    <p className="font-bold text-white">{achievement.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>
                    <Badge className="mt-2 bg-amber-500/20 text-amber-400">
                      +{achievement.xp_reward} XP
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card p-8 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No achievements earned yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Complete hackathons to earn badges!</p>
          </Card>
        )}
      </div>

      {/* Hackathons */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-blue-400" />
          Hackathons
        </h2>
        {hackathons.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {hackathons.slice(0, 6).map((hackathon, i) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/hackathons/${hackathon.id}`}>
                  <Card className="border-border bg-card transition-all hover:border-primary/50 hover:bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{hackathon.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {hackathon.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge
                              className={`text-xs ${
                                hackathon.status === 'OPEN'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : hackathon.status === 'UPCOMING'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {hackathon.status}
                            </Badge>
                            <Badge className="bg-primary/20 text-xs text-primary">
                              {hackathon.domain}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-lg font-bold text-amber-400">
                            {hackathon.total_prize_pool || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">Prize Pool</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card p-8 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">No hackathons participated yet</p>
            <Link href="/hackathons">
              <Button className="mt-4">Browse Hackathons</Button>
            </Link>
          </Card>
        )}
      </div>

      {/* CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-violet-600/20 p-8 text-center">
        <h3 className="text-xl font-bold text-white">Ready to add more achievements?</h3>
        <p className="mt-2 text-muted-foreground">
          Join upcoming hackathons and showcase your skills
        </p>
        <Link href="/hackathons">
          <Button className="mt-4 bg-primary font-bold hover:bg-primary/90">
            Explore Hackathons
          </Button>
        </Link>
      </div>
    </div>
  )
}
