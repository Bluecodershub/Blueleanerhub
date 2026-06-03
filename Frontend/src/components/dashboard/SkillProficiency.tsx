'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Zap, Star } from 'lucide-react'

interface DomainSkill {
  name: string
  rank: number
  total: number
  percentile: number
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  color: string
}

const domainSkills: DomainSkill[] = [
  {
    name: 'Computer Science',
    rank: 42,
    total: 15400,
    percentile: 99.7,
    icon: Zap,
    color: 'text-foreground/80',
  },
  {
    name: 'Mechanical',
    rank: 890,
    total: 8200,
    percentile: 89.1,
    icon: Star,
    color: 'text-foreground/80',
  },
  {
    name: 'Data Science',
    rank: 120,
    total: 12000,
    percentile: 99.0,
    icon: TrendingUp,
    color: 'text-primary/80',
  },
]

export const SkillProficiency = () => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-background p-6 shadow-2xl">
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-[var(--xp-gold)]" />
        <h3 className="font-heading text-lg font-black italic tracking-tight text-white">
          GLOBAL_STANDING
        </h3>
      </div>

      <div className="space-y-6">
        {domainSkills.map((skill, i) => {
          const Icon = skill.icon
          return (
            <div key={skill.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-xl border border-white/10 bg-white/5 p-2 ${skill.color}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40">
                      {skill.name}
                    </p>
                    <p className="text-sm font-bold tracking-tight text-white">
                      Rank #{skill.rank} of {skill.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-foreground/70">{skill.percentile}%</p>
                  <p className="text-[10px] font-black uppercase tracking-tight text-white/20">
                    Percentile
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.percentile}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                  className="h-full bg-gradient-to-r from-primary to-primary/80 shadow-[0_0_10px_rgba(59,130,246,0.35)]"
                />
              </div>
            </div>
          )
        })}
      </div>

      <button className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary hover:text-white">
        VIEW_ALL_DOMAINS
      </button>
    </div>
  )
}
