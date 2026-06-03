'use client'

import { Trophy, Zap, Target, Award, ChevronRight, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function GamificationSidebar() {
  const leaderboard = [
    { name: 'Alex Riverside', xp: '12,450', level: 42, role: 'STUDENT' },
    { name: 'Sarah Chen', xp: '11,200', level: 38, role: 'CANDIDATE' },
    { name: 'Marcus Vane', xp: '9,800', level: 35, role: 'STUDENT' },
  ]

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      <Card className="group relative overflow-hidden border-border bg-slate-900/40">
        <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
          <Star className="h-16 w-16 rotate-12 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Badge className="border-none bg-primary/20 text-[10px] font-black italic text-primary">
              LEVEL 12
            </Badge>
            <div className="flex items-center gap-1 text-foreground/70">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-black">5 DAY STREAK</span>
            </div>
          </div>
          <CardTitle className="pt-2 text-xl font-black italic tracking-tight">
            SPECIALIST_II
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground">
              <span>XP PROGRESS</span>
              <span>2,450 / 3,000</span>
            </div>
            <Progress value={82} className="h-1.5 bg-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-800/50 bg-background/50 p-2">
              <p className="text-[8px] font-black uppercase text-muted-foreground">Global Rank</p>
              <p className="text-sm font-bold text-white">#1,284</p>
            </div>
            <div className="rounded-lg border border-slate-800/50 bg-background/50 p-2">
              <p className="text-[8px] font-black uppercase text-muted-foreground">Badges</p>
              <p className="text-sm font-bold text-white">14</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Leaderboard */}
      <Card className="border-border bg-background/40">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Trophy className="h-4 w-4 text-yellow-500" /> GLOBAL_LEADERBOARD
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800/50">
            {leaderboard.map((user, i) => (
              <div
                key={i}
                className="group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-black ${i === 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}
                  >
                    {i + 1}
                  </span>
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-border bg-secondary" />
                  <div>
                    <p className="text-xs font-bold text-foreground group-hover:text-white">
                      {user.name}
                    </p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground">
                      {user.role} • LVL {user.level}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black italic text-primary">{user.xp}</p>
                  <p className="text-[8px] font-bold uppercase text-muted-foreground">XP</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-full py-4 text-[10px] font-black uppercase italic tracking-widest text-muted-foreground hover:text-primary"
          >
            View Full Rankings <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-background to-background p-4">
        <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <Award className="h-3 w-3 text-foreground/70" /> Recent Unlock
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10">
            <Target className="h-5 w-5 text-foreground/80" />
          </div>
          <div>
            <h5 className="text-xs font-bold uppercase italic text-white">CODE_WARRIOR</h5>
            <p className="text-[9px] text-muted-foreground">Completed 10 daily quizzes in a row.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
