'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Search,
  Zap,
  Send,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Share2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

type JobType = 'full-time' | 'part-time' | 'contract' | 'internship'
type Experience = 'entry' | 'mid' | 'senior'

interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  salary: string
  type: JobType
  experience: Experience
  posted: string
  applicants: number
  description: string
  requirements: string[]
  skills: string[]
  remote: boolean
  urgent: boolean
  aiScreening: boolean
  applyUrl?: string
}

const TYPE_MAP: Record<string, JobType> = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
  CONTRACT: 'contract',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
}

const jobTypeConfig: Record<JobType, { label: string; color: string }> = {
  'full-time': { label: 'Full-time', color: 'text-emerald-600' },
  'part-time': { label: 'Part-time', color: 'text-sky-600' },
  'contract': { label: 'Contract', color: 'text-amber-600' },
  'internship': { label: 'Internship', color: 'text-sky-600' },
}

const experienceConfig: Record<Experience, { label: string; color: string }> = {
  entry: { label: 'Entry Level', color: 'text-emerald-600' },
  mid: { label: 'Mid Level', color: 'text-sky-600' },
  senior: { label: 'Senior', color: 'text-amber-600' },
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [appStats, setAppStats] = useState({ applied: 0, reviewing: 0, offers: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<JobType | 'all'>('all')
  const [experienceFilter] = useState<Experience | 'all'>('all')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [applicationStatus, setApplicationStatus] = useState<Record<string, 'applied' | 'reviewing' | 'rejected'>>({})
  const [resumeUrl, setResumeUrl] = useState('')
  const [applyingJobs, setApplyingJobs] = useState<Record<string, boolean>>({})
  const [applicationError, setApplicationError] = useState<string | null>(null)
  const [applicationMessage, setApplicationMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/jobs?limit=20').catch(() => null),
      api.get('/jobs/applications/me?limit=50').catch(() => null),
    ]).then(([jobsRes, appsRes]) => {
      const rows: any[] = jobsRes?.data?.data?.data ?? jobsRes?.data?.data ?? []
      const mapped: Job[] = (Array.isArray(rows) ? rows : []).map((j: any) => ({
        id: String(j._id),
        title: j.title,
        company: j.company || 'Company',
        location: j.location || 'Remote',
        salary: j.salary || 'Competitive',
        type: TYPE_MAP[j.type] ?? 'full-time',
        experience: 'mid' as Experience,
        posted: j.createdAt ? relativeTime(j.createdAt) : 'Recently',
        applicants: 0,
        description: j.description || '',
        requirements: j.requirements || [],
        skills: [],
        remote: !j.location || j.location.toLowerCase().includes('remote'),
        urgent: false,
        aiScreening: true,
        applyUrl: j.applyUrl,
      }))
      setJobs(mapped)
      if (appsRes?.data?.data?.data) {
        const apps: any[] = appsRes.data.data.data
        const appliedIds: Record<string, 'applied'> = {}
        apps.forEach((a: any) => {
          const jobId = typeof a.jobId === 'object' ? a.jobId?._id : a.jobId
          if (jobId) appliedIds[String(jobId)] = 'applied'
        })
        setApplicationStatus(appliedIds)
        setAppStats({ applied: apps.length, reviewing: 0, offers: 0 })
      }
    }).finally(() => setLoading(false))
  }, [])

  const filteredJobs = jobs.filter((job) => {
    if (typeFilter !== 'all' && job.type !== typeFilter) return false
    if (experienceFilter !== 'all' && job.experience !== experienceFilter) return false
    if (remoteOnly && !job.remote) return false
    if (search && !job.title.toLowerCase().includes(search.toLowerCase()) && !job.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    )
  }

  const handleApply = async (jobId: string) => {
    const trimmedResumeUrl = resumeUrl.trim()
    if (!/^https:\/\/\S+\.\S+/i.test(trimmedResumeUrl)) {
      setApplicationMessage(null)
      setApplicationError('Add a valid HTTPS resume link before applying.')
      return
    }

    setApplicationError(null)
    setApplicationMessage(null)
    setApplyingJobs(prev => ({ ...prev, [jobId]: true }))
    try {
      await api.post(`/jobs/${jobId}/apply`, { resumeUrl: trimmedResumeUrl })
      setApplicationStatus(prev => ({ ...prev, [jobId]: 'applied' }))
      setAppStats(prev => ({ ...prev, applied: prev.applied + 1 }))
      setApplicationMessage('Application submitted.')
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.response?.data?.errors?.[0]?.message || 'We could not submit your application. Please try again.'
      setApplicationError(message)
    } finally {
      setApplyingJobs(prev => ({ ...prev, [jobId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Apply Now</h1>
            <p className="text-muted-foreground">AI-powered job matching and resume screening</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/student/jobs/applications">My Applications</Link>
            </Button>
          </div>
        </header>

        {/* ── Application Stats ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{appStats.applied}</p>
            <p className="text-xs text-muted-foreground">Applied</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{appStats.reviewing}</p>
            <p className="text-xs text-muted-foreground">Under Review</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{appStats.offers}</p>
            <p className="text-xs text-muted-foreground">Offers</p>
          </div>
        </div>

        {/* ── AI Screening Banner ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <div className="rounded-full bg-primary/10 p-3">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">AI-Powered Screening Active</h3>
            <p className="text-sm text-muted-foreground">
              Your resume is being matched against job requirements using AI
            </p>
          </div>
          <Button variant="outline">View Match Score</Button>
        </motion.div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_2fr] md:items-center">
            <div>
              <h2 className="text-sm font-semibold">Resume link</h2>
              <p className="text-sm text-muted-foreground">Use an HTTPS link from your portfolio, drive, or resume host.</p>
            </div>
            <Input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://example.com/resume.pdf"
              aria-label="Resume URL"
            />
          </div>
          {applicationError && (
            <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {applicationError}
            </p>
          )}
          {applicationMessage && (
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              {applicationMessage}
            </p>
          )}
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-border bg-card p-1">
              {(['all', 'full-time', 'part-time', 'internship'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    typeFilter === type
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {type === 'all' ? 'All Types' : jobTypeConfig[type].label}
                </button>
              ))}
            </div>
            <Button
              variant={remoteOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRemoteOnly(!remoteOnly)}
            >
              <CheckCircle className={cn('mr-1.5 h-4 w-4', !remoteOnly && 'opacity-0')} />
              Remote
            </Button>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* ── Job List ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filteredJobs.map((job, i) => {
            const isSaved = savedJobs.includes(job.id)
            const applicationState = applicationStatus[job.id]
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  {/* Company Logo Placeholder */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {job.urgent && (
                        <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
                          Urgent Hiring
                        </Badge>
                      )}
                      {job.remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                      {job.aiScreening && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          <Zap className="mr-1 h-3 w-3" /> AI Match
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> {job.salary}
                      </span>
                      <span className={jobTypeConfig[job.type].color}>
                        {jobTypeConfig[job.type].label}
                      </span>
                      <span className={experienceConfig[job.experience].color}>
                        {experienceConfig[job.experience].label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                    {/* Skills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{job.skills.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {job.posted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {job.applicants} applicants
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2 md:items-end">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(job.id)}
                        className={cn(isSaved && 'text-primary')}
                      >
                        <Bookmark className={cn('h-5 w-5', isSaved && 'fill-current')} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {applicationState === 'applied' ? (
                      <Button disabled className="w-full gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">
                        <CheckCircle className="h-4 w-4" />
                        Applied
                      </Button>
                    ) : (
                      <Button onClick={() => handleApply(job.id)} disabled={Boolean(applyingJobs[job.id])} className="w-full gap-1.5">
                        {applyingJobs[job.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {applyingJobs[job.id] ? 'Applying' : 'Apply Now'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 font-semibold">No jobs found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
