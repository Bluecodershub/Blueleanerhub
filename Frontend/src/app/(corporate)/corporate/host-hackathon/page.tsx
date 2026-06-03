'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  GraduationCap,
  Rocket,
  Trophy,
  Users,
  Zap,
  CheckCircle2,
  ArrowRight,
  Calendar,
  DollarSign,
  Globe,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const ORGANIZER_TYPES = [
  {
    id: 'UNIVERSITY',
    label: 'University / College',
    icon: GraduationCap,
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-500/10 border-purple-500/20',
    description: 'Run an inter-college or department hackathon for your students',
    benefits: [
      'Department-specific challenge templates',
      'Faculty judge panel tools',
      'Automated certificate generation',
      'Academic performance tracking',
    ],
    examples: ['Inter-dept Coding Competition', 'Civil Engineering Design Challenge', 'AI/ML Research Sprint'],
  },
  {
    id: 'CORPORATE',
    label: 'Corporate / Startup',
    icon: Building2,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-500/10 border-blue-500/20',
    description: 'Find top engineering talent and source real solutions to your problems',
    benefits: [
      'AI-powered candidate screening',
      'Custom branding & problem statements',
      'Integrated hiring pipeline',
      'Live code review & scoring',
    ],
    examples: ['Product Innovation Hackathon', 'Open Source Contribution Sprint', 'Industry Challenge'],
  },
  {
    id: 'PLATFORM',
    label: 'Community / Platform',
    icon: Rocket,
    color: 'from-primary to-orange-500',
    bg: 'bg-primary/10 border-primary/20',
    description: 'Partner with BlueLearner to run platform-wide hackathons',
    benefits: [
      'Access to 10,000+ registered students',
      'BlueLearner brand co-hosting',
      'Marketing & promotion support',
      'Prize pool management',
    ],
    examples: ['BlueLearner AI Cup', 'Open Innovation Challenge', 'National Engineering Sprint'],
  },
]

const STATS = [
  { label: 'Registered Students', value: '10,000+', icon: Users },
  { label: 'Hackathons Hosted', value: '50+', icon: Trophy },
  { label: 'Prizes Awarded', value: '$2M+', icon: DollarSign },
  { label: 'Countries', value: '15+', icon: Globe },
]

const STEPS = [
  { step: '01', title: 'Choose Your Type', description: 'Select University, Corporate, or Platform hackathon type' },
  { step: '02', title: 'Define Your Challenge', description: 'Set problem statements, rules, and prize structure' },
  { step: '03', title: 'We Handle Registration', description: 'Students register directly — you get instant analytics' },
  { step: '04', title: 'Run & Judge', description: 'Live leaderboard, AI evaluation, and submission management' },
  { step: '05', title: 'Hire / Graduate', description: 'Turn top performers into hires or academic achievers' },
]

export default function HostHackathonPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto max-w-3xl"
        >
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Star className="h-3 w-3 text-amber-500" />
            Trusted by 50+ Universities & Companies
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Host a Hackathon on<br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              BlueLearnerHub
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Reach 10,000+ engineering students across India. Run university competitions,
            corporate talent hunts, or community-driven innovation challenges — all on one platform.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="gap-2" onClick={() => {
              const el = document.getElementById('choose-type')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Start Hosting <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/corporate/hackathons">View Existing Hackathons</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card/50 px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Choose Type */}
      <section id="choose-type" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">What type of hackathon are you hosting?</h2>
          <p className="text-muted-foreground">Pick the option that best describes your organization</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ORGANIZER_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id
            return (
              <motion.div key={type.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className={cn(
                    'cursor-pointer border-2 transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border hover:border-primary/40'
                  )}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6">
                    <div className={cn('mb-4 inline-flex rounded-xl p-3 bg-gradient-to-br', type.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{type.label}</h3>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{type.description}</p>
                    <ul className="space-y-1.5">
                      {type.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {type.examples.map((ex) => (
                        <Badge key={ex} variant="secondary" className="text-xs">{ex}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="gap-2 px-10"
            disabled={!selectedType}
            onClick={() => router.push(`/corporate/hackathons/new?organizerType=${selectedType}`)}
          >
            Continue with Setup <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-t border-border bg-card/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-foreground">How it works</h2>
          <div className="relative">
            <div className="absolute left-[calc(2rem-1px)] top-4 h-[calc(100%-2rem)] w-0.5 bg-border md:left-1/2" />
            <div className="space-y-8">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'flex items-start gap-4 md:gap-8',
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  )}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xl font-bold text-primary shadow-lg shadow-primary/20">
                    {s.step}
                  </div>
                  <div className={cn('flex-1 rounded-xl border border-border bg-card p-5', i % 2 === 1 && 'md:text-right')}>
                    <h3 className="mb-1 font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl"
        >
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="mb-3 text-3xl font-bold text-foreground">Ready to inspire the next generation?</h2>
          <p className="mb-8 text-muted-foreground">
            Join universities and companies already running hackathons on BlueLearnerHub.
          </p>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push('/corporate/hackathons/new')}
          >
            <Zap className="h-4 w-4" />
            Create Your Hackathon Now
          </Button>
        </motion.div>
      </section>
    </div>
  )
}
