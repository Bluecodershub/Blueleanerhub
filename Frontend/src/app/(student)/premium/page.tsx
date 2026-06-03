'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Shield,
  CheckCircle2,
  Crown,
  Cpu,
  Globe,
  Rocket,
  Trophy,
  CreditCard,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const tiers = [
  {
    name: 'EXPLORER',
    price: '$9',
    period: '/mo',
    description: 'Perfect for individual student innovators.',
    features: [
      '500 AI Generation Credits',
      'Standard Lab Access',
      'Course Completion Certificates',
      'Basic Performance Analytics',
    ],
    icon: Rocket,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    buttonColor: 'bg-primary hover:bg-primary/90',
  },
  {
    name: 'INNOVATOR',
    price: '$29',
    period: '/mo',
    description: 'For power users and elite engineers.',
    features: [
      'Unlimited AI Credits',
      'Priority Hackathon Entry',
      'Premium Lab Templates',
      'Deep Talent Analytics',
      'Verified Proof-Score Badge',
    ],
    icon: Sparkles,
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 shadow-[0_0_20px_rgba(147,51,234,0.3)]',
    popular: true,
  },
  {
    name: 'ENTERPRISE',
    price: '$199',
    period: '/mo',
    description: 'Complete OS for institutions and organizations.',
    features: [
      'Unlimited Organization Seats',
      'Custom Hackathon Hosting',
      'Full Talent Pipeline Access',
      'API Access for Custom Labs',
      'Dedicated Support Engineer',
    ],
    icon: Crown,
    color: 'text-foreground/70',
    border: 'border-border',
    buttonColor: 'bg-primary/90 hover:bg-primary/80',
  },
]

export default function PremiumHubPage() {
  useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: string) => {
    setLoading(tier)
    try {
      const { data } = await api.post('/payments/checkout', { tier })
      if (data?.url) {
        toast.success(`Redirecting to ${tier} checkout...`)
        window.location.href = data.url // Stripe hosted checkout — external URL requires full redirect
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="animate-in fade-in mx-auto max-w-7xl space-y-16 pb-32 duration-1000">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Badge className="border-purple-500/20 bg-purple-500/10 px-6 py-1.5 text-[10px] font-black uppercase italic tracking-widest text-purple-400">
          Bluelearner_Premium_Club_v2
        </Badge>
        <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter text-white md:text-7xl">
          UNLEASH_YOUR <span className="ai-glow text-primary">FULL_POTENTIAL</span>
        </h1>
        <p className="mx-auto max-w-2xl text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">
          Upgrade to the elite tier of engineering and management education. Get priority access to
          industry hackathons and unlimited AI mentorship.
        </p>
      </div>

      {/* Current Stats (If logged in) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="group flex items-center justify-between border-border bg-slate-900/40 p-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
              AI_Credits_Remaining
            </p>
            <p className="text-3xl font-black text-white">100 / 100</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 transition-transform group-hover:scale-110">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
        </Card>
        <Card className="group flex items-center justify-between border-border bg-slate-900/40 p-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
              Current_Tier
            </p>
            <p className="text-3xl font-black uppercase italic text-foreground/70">Free_User</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-3 transition-transform group-hover:scale-110">
            <Shield className="h-6 w-6 text-foreground/80" />
          </div>
        </Card>
        <Card className="group flex items-center justify-between border-border bg-slate-900/40 p-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
              Proof_Score_Boost
            </p>
            <p className="text-3xl font-black text-blue-400">1.0x</p>
          </div>
          <div className="rounded-2xl bg-blue-500/10 p-3 transition-transform group-hover:scale-110">
            <Zap className="h-6 w-6 text-blue-400" />
          </div>
        </Card>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <motion.div key={tier.name} whileHover={{ y: -10 }} className="flex h-full flex-col">
            <Card
              className={`flex-1 border-2 bg-card/60 ${tier.border} group relative flex flex-col overflow-hidden`}
            >
              {tier.popular && (
                <div className="absolute right-0 top-0 p-4">
                  <Badge className="bg-purple-600 text-[8px] font-black uppercase italic tracking-widest text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                    Most_Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="space-y-4 p-8">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background p-4 ${tier.color} transition-transform duration-500 group-hover:scale-110`}
                >
                  <tier.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-white">
                    {tier.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-widest text-white">
                      {tier.price}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{tier.period}</span>
                  </div>
                </div>
                <CardDescription className="text-xs font-medium uppercase leading-relaxed text-muted-foreground">
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 p-8 pt-0">
                <p className="mb-6 text-[10px] font-black uppercase italic tracking-[0.2em] text-muted-foreground">
                  Tier_Assets
                </p>
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 ${tier.color} shrink-0`} />
                    <span className="text-xs font-bold uppercase tracking-tight text-foreground/80">
                      {feature}
                    </span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="p-8">
                <Button
                  onClick={() => handleSubscribe(tier.name)}
                  disabled={loading === tier.name}
                  className={`h-14 w-full text-[10px] font-black uppercase italic tracking-[0.2em] ${tier.buttonColor} transition-all duration-300`}
                >
                  {loading === tier.name ? 'INITIALIZING_SESSION...' : `SELECT_${tier.name}_OPS`}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security & FAQ Info */}
      <div className="group relative overflow-hidden rounded-3xl border border-border bg-card p-12">
        <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tighter text-white">
              <Info className="h-5 w-5 text-primary" /> MISSION_CRITICAL_INFO
            </h3>
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase leading-relaxed tracking-wide text-muted-foreground">
                All subscriptions are encrypted via Stripe Military-Grade Layer. You can pause or
                terminate your sequence at any temporal point via the Portal.
              </p>
              <p className="text-xs font-medium uppercase leading-relaxed tracking-wide text-muted-foreground">
                AI Credits reset every 30-day temporal cycle. Bonus credits earned via hackathons
                remain active indefinitely.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 md:items-end">
            <div className="flex gap-4">
              <div className="rounded-xl border border-border bg-background p-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <Globe className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">
              Global_Payment_Protocols_Active
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
