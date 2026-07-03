// src/components/hackathon/HackathonCard.tsx

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface HackathonCardProps {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'active' | 'completed'
  startDate: string
  endDate: string
  participants: number
  prizePool: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  image?: string
}

const statusColors = {
  upcoming: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  active: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-muted/30 text-muted-foreground border-border/50',
}

const difficultyColors = {
  beginner: 'text-sky-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-red-400',
}

export default function HackathonCard({
  id,
  title,
  description,
  status,
  startDate: _startDate,
  endDate: _endDate,
  participants,
  prizePool,
  difficulty,
  image: _image,
}: HackathonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[32px] border border-border/50 bg-card shadow-xl shadow-black/5 transition-all duration-500 hover:border-primary/50"
    >
      {/* Visual Header / Image Placeholder */}
      <div className="relative h-48 overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5 opacity-40 transition-opacity group-hover:opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="ai-glow relative flex aspect-video w-full items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 opacity-80 transition-all group-hover:opacity-100">
            <Sparkles className="h-10 w-10 text-primary opacity-50" />
          </div>
        </div>
        <div className="absolute right-6 top-6">
          <span
            className={`rounded-xl border px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-8">
        <div className="space-y-2">
          <h3 className="font-heading text-2xl font-black tracking-tight transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Dynamic Meta Info Grid */}
        <div className="grid grid-cols-2 gap-4 border-y border-border/30 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Prize Pool
              </p>
              <p className="text-sm font-black text-primary">{prizePool}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground transition-colors group-hover:text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Coders
              </p>
              <p className="text-sm font-black">{participants.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${difficultyColors[difficulty].replace('text-', 'bg-')}`}
            />
            <span
              className={`text-[12px] font-bold uppercase tracking-widest ${difficultyColors[difficulty]}`}
            >
              {difficulty}
            </span>
          </div>
          <span className="text-[12px] font-bold text-muted-foreground">48h Sprint</span>
        </div>

        {/* Enhanced CTA */}
        <Link href={`/hackathons/${id}`} className="block">
          <Button className="group/btn h-14 w-full gap-2 rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            {status === 'completed' ? 'View Final Leaderboard' : 'Enter Arena'}
            <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

import { Button } from '@/components/ui/button'
import { Sparkles, Trophy, Users, ChevronRight } from 'lucide-react'
