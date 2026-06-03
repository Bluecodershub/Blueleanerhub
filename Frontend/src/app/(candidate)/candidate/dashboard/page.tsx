'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Video,
  CheckCircle2,
  TrendingUp,
  Star,
  ChevronRight,
  Upload,
  Eye,
  Calendar,
  MapPin,
  Building2,
  Zap,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

const stats = [
  {
    title: 'Active Applications',
    value: '8',
    icon: Briefcase,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    change: '+3 this week',
  },
  {
    title: 'Upcoming Interviews',
    value: '3',
    icon: Video,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    change: 'Next: Tomorrow',
  },
  {
    title: 'Profile Completion',
    value: '95%',
    icon: CheckCircle2,
    color: 'text-foreground/70',
    bg: 'bg-primary/10',
    change: 'Almost done',
  },
  {
    title: 'Profile Views',
    value: '142',
    icon: Eye,
    color: 'text-foreground/70',
    bg: 'bg-primary/10',
    change: '+28% this month',
  },
]

const applications = [
  {
    company: 'TechCorp Global',
    role: 'Senior Frontend Engineer',
    status: 'Interview',
    date: '2 days ago',
    location: 'Remote',
  },
  {
    company: 'InnovateLabs',
    role: 'Full Stack Developer',
    status: 'Applied',
    date: '5 days ago',
    location: 'San Francisco',
  },
  {
    company: 'QuantumAI',
    role: 'ML Engineer',
    status: 'Shortlisted',
    date: '1 week ago',
    location: 'Bangalore',
  },
]

const interviews = [
  {
    company: 'TechCorp Global',
    role: 'Senior Frontend Engineer',
    time: 'Tomorrow, 2:00 PM',
    type: 'Technical Round',
  },
  {
    company: 'DataStream Inc.',
    role: 'Software Architect',
    time: 'Dec 15, 10:00 AM',
    type: 'HR Round',
  },
]

export default function CandidateDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?from=/candidate/dashboard')
    }
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="animate-in fade-in space-y-8 pb-20 duration-700">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Candidate <span className="text-blue-400">Dashboard</span>
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Track your applications, prepare for interviews, and manage your professional profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border bg-card/50 text-white hover:bg-secondary"
          >
            <Upload className="mr-2 h-4 w-4" />
            Update Resume
          </Button>
          <Button className="bg-primary text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500">
            <Briefcase className="mr-2 h-4 w-4" />
            Browse Jobs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="group border-border bg-slate-900/40 transition-all hover:border-blue-500/30">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden border-border bg-slate-900/40">
            <CardHeader className="border-b border-slate-800/50 bg-background/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Recent Applications</CardTitle>
                  <CardDescription>Track the status of your job applications</CardDescription>
                </div>
                <Briefcase className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-800/50">
                {applications.map((app, i) => (
                  <div
                    key={i}
                    className="group flex cursor-pointer items-center justify-between p-5 transition-all hover:bg-card/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary font-bold text-blue-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{app.role}</h4>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{app.company}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" /> {app.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden text-right md:block">
                        <Badge
                          className={`border-none text-[10px] font-bold ${
                            app.status === 'Interview'
                              ? 'bg-purple-500/10 text-purple-400'
                              : app.status === 'Shortlisted'
                                ? 'bg-primary/10 text-foreground/70'
                                : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {app.status}
                        </Badge>
                        <div className="mt-1 text-[10px] text-muted-foreground">{app.date}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-blue-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800/50 p-4">
                <Button variant="link" className="w-full text-sm text-blue-400 hover:text-blue-300">
                  View All Applications
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-border bg-slate-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Star className="h-4 w-4 text-foreground/70" />
                  Skills Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { skill: 'React / Next.js', level: 92 },
                  { skill: 'System Design', level: 78 },
                  { skill: 'TypeScript', level: 88 },
                ].map((s) => (
                  <div key={s.skill} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground/80">{s.skill}</span>
                      <span className="font-bold text-blue-400">{s.level}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-slate-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <TrendingUp className="h-4 w-4 text-foreground/70" />
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Applications sent', value: '24', period: 'this month' },
                  { label: 'Interviews completed', value: '6', period: 'this month' },
                  { label: 'Offers received', value: '2', period: 'total' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">{item.value}</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">{item.period}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-t-2 border-border border-t-purple-500 bg-background/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Calendar className="h-4 w-4 text-purple-400" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {interviews.map((interview, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-border bg-card/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                      {interview.time}
                    </span>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary/70" />
                  </div>
                  <p className="text-sm font-bold text-white">{interview.role}</p>
                  <p className="text-xs text-muted-foreground">{interview.company}</p>
                  <Badge className="border-none bg-secondary text-[10px] text-foreground/80">
                    {interview.type}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full border-border text-xs hover:bg-secondary">
                View Full Schedule
              </Button>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-border bg-gradient-to-br from-blue-900/20 to-background/40">
            <div className="relative z-10 p-6">
              <Zap className="text-primary/80/50 mb-3 h-8 w-8 transition-transform group-hover:scale-110" />
              <h4 className="text-lg font-black text-white">AI Interview Prep</h4>
              <p className="mb-4 mt-2 text-xs leading-relaxed text-muted-foreground">
                Practice with AI-powered mock interviews tailored to your upcoming sessions.
              </p>
              <Button
                size="sm"
                className="h-auto bg-primary px-6 py-4 text-xs font-bold text-white shadow-lg shadow-blue-900/50 hover:bg-blue-500"
              >
                Start Practice
              </Button>
            </div>
            <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
          </Card>
        </div>
      </div>
    </div>
  )
}
