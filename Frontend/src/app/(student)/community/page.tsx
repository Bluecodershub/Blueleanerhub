'use client'

import { Users, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CommunityPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground">
      <div className="max-w-3xl space-y-8">
        <div className="relative inline-block">
          <div className="absolute -inset-4 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-border bg-card shadow-2xl">
            <Users className="h-12 w-12 text-foreground/70" />
          </div>
        </div>

        <div className="space-y-4">
          <Badge
            variant="outline"
            className="border-border bg-primary/5 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/70"
          >
            Coming Soon
          </Badge>
          <h1 className="text-5xl font-black tracking-tighter text-white md:text-6xl">
            The Developer{' '}
            <span className="bg-gradient-to-r from-primary/80 to-cyan-400 bg-clip-text text-transparent">
              Ecosystem
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
            We're building a world-class space for developers to connect, share knowledge, and build
            the future together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-3">
          <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-6">
            <MessageSquare className="h-6 w-6 text-foreground/70" />
            <h3 className="font-bold text-white">Direct Access</h3>
            <p className="text-sm text-muted-foreground">
              Chat with experts and peers in real-time across specialized channels.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-6">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <h3 className="font-bold text-white">Verified Roles</h3>
            <p className="text-sm text-muted-foreground">
              Earn badges and reputation based on your contributions and skills.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-6">
            <Zap className="h-6 w-6 text-purple-400" />
            <h3 className="font-bold text-white">Live Events</h3>
            <p className="text-sm text-muted-foreground">
              Weekly tech talks, workshops, and exclusive community hackathons.
            </p>
          </div>
        </div>

        <div className="pt-8">
          <Button className="group h-14 rounded-2xl bg-primary px-10 text-lg font-black text-white shadow-xl shadow-primary/15 transition-all hover:bg-primary/90 active:scale-95">
            Notify Me When Ready
            <Sparkles className="ml-2 h-5 w-5 transition-transform group-hover:rotate-12" />
          </Button>
        </div>
      </div>
    </div>
  )
}
