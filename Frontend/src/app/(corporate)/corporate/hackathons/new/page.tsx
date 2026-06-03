'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Trophy,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Tag,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building2,
  GraduationCap,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

const ORGANIZER_LABELS: Record<string, { label: string; icon: any }> = {
  UNIVERSITY: { label: 'University', icon: GraduationCap },
  CORPORATE:  { label: 'Corporate',  icon: Building2 },
  PLATFORM:   { label: 'Community',  icon: Rocket },
}

const DOMAINS = [
  'Software Engineering', 'Mechanical Engineering', 'Electrical Engineering',
  'Civil Engineering', 'Robotics Engineering', 'AI/ML', 'Web Development',
  'Data Science', 'Cybersecurity', 'Electronics', 'Product Design', 'GENERAL',
]

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Pro'] as const

interface Prize { rank: string; reward: string }

function NewHackathonForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultOrganizerType = searchParams.get('organizerType') || 'CORPORATE'

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    organizerType: defaultOrganizerType,
    organizerName: '',
    domain: 'Software Engineering',
    difficulty: 'Intermediate' as typeof DIFFICULTIES[number],
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 200,
    prizePool: '',
    entryFee: 0,
    currency: 'usd',
    rules: '',
    judgingCriteria: ['Innovation & Creativity', 'Technical Execution', 'Presentation Quality'],
    tags: [] as string[],
    prizes: [
      { rank: '1st Place', reward: '' },
      { rank: '2nd Place', reward: '' },
      { rank: '3rd Place', reward: '' },
    ] as Prize[],
  })

  const [tagInput, setTagInput] = useState('')
  const [criteriaInput, setCriteriaInput] = useState('')

  const set = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => set('tags', form.tags.filter((t) => t !== tag))

  const addCriteria = () => {
    const c = criteriaInput.trim()
    if (c && !form.judgingCriteria.includes(c)) {
      set('judgingCriteria', [...form.judgingCriteria, c])
      setCriteriaInput('')
    }
  }

  const removeCriteria = (c: string) =>
    set('judgingCriteria', form.judgingCriteria.filter((x) => x !== c))

  const updatePrize = (index: number, field: keyof Prize, value: string) => {
    const updated = form.prizes.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    set('prizes', updated)
  }

  const addPrize = () => set('prizes', [...form.prizes, { rank: `${form.prizes.length + 1}th Place`, reward: '' }])

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Hackathon title is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.startDate || !form.endDate) return 'Start and end dates are required'
    const now = new Date()
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (start <= now) return 'Start date must be in the future'
    if (end <= start) return 'End date must be after start date'
    if (form.registrationDeadline) {
      const regDeadline = new Date(form.registrationDeadline)
      if (regDeadline <= now) return 'Registration deadline must be in the future'
      if (regDeadline >= start) return 'Registration deadline must be before the start date'
    }
    if (!form.organizerName.trim()) return 'Organizer name is required'
    const maxP = Number(form.maxParticipants)
    if (!Number.isInteger(maxP) || maxP < 1 || maxP > 100000) return 'Max participants must be between 1 and 100,000'
    return null
  }

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    const err = validate()
    if (err) { toast.error(err); return }

    setLoading(true)
    try {
      await api.post('/hackathons', {
        title: form.title,
        description: form.description,
        organizerType: form.organizerType,
        organizerName: form.organizerName,
        domain: form.domain,
        difficulty: form.difficulty,
        startDate: form.startDate,
        endDate: form.endDate,
        registrationDeadline: form.registrationDeadline || undefined,
        maxParticipants: Number(form.maxParticipants),
        prizePool: form.prizePool,
        entryFee: Number(form.entryFee) || 0,
        currency: form.currency,
        rules: form.rules,
        judgingCriteria: form.judgingCriteria,
        prizes: form.prizes.filter((p) => p.reward),
        tags: form.tags,
        status,
      })
      setSubmitted(true)
      toast.success(status === 'PUBLISHED' ? 'Hackathon published!' : 'Saved as draft')
      setTimeout(() => router.push('/corporate/hackathons'), 1500)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create hackathon')
    } finally {
      setLoading(false)
    }
  }

  const OrgIcon = ORGANIZER_LABELS[form.organizerType]?.icon || Building2

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-primary/10 p-6">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Hackathon Created!</h2>
        <p className="text-muted-foreground">Redirecting to your hackathons dashboard...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/corporate/hackathons"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create a Hackathon</h1>
          <p className="text-sm text-muted-foreground">Fill in the details below to set up your event</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organizer Type */}
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <OrgIcon className="h-4 w-4 text-primary" />
              Organizer Type
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(ORGANIZER_LABELS).map(([type, { label, icon: Icon }]) => (
                <button
                  key={type}
                  onClick={() => set('organizerType', type)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                    form.organizerType === type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              Basic Information
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Hackathon Title *</label>
              <Input
                placeholder="e.g. AI Innovators Challenge 2026"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Organizer Name *</label>
              <Input
                placeholder="Your university or company name"
                value={form.organizerName}
                onChange={(e) => set('organizerName', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Description *</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[120px] resize-y"
                placeholder="Describe what participants will build, why it matters, and what makes your hackathon unique..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Domain</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={form.domain}
                  onChange={(e) => set('domain', e.target.value)}
                >
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Difficulty</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={form.difficulty}
                  onChange={(e) => set('difficulty', e.target.value)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              Schedule
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Start Date *</label>
                <Input type="datetime-local" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">End Date *</label>
                <Input type="datetime-local" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Registration Deadline</label>
                <Input type="datetime-local" value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Max Participants</label>
                <Input
                  type="number"
                  min={10}
                  max={10000}
                  value={form.maxParticipants}
                  onChange={(e) => set('maxParticipants', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prizes */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              Prize Structure
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Total Prize Pool</label>
              <Input placeholder="e.g. $10,000 or ₹5,00,000" value={form.prizePool} onChange={(e) => set('prizePool', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Entry Fee</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0 for free"
                  value={form.entryFee}
                  onChange={(e) => set('entryFee', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Currency</label>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                >
                  <option value="usd">USD</option>
                  <option value="inr">INR</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Prize Breakdown</label>
              {form.prizes.map((prize, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    className="w-36 shrink-0"
                    placeholder="Rank"
                    value={prize.rank}
                    onChange={(e) => updatePrize(i, 'rank', e.target.value)}
                  />
                  <Input
                    placeholder="Reward (e.g. $5,000 + Internship PPO)"
                    value={prize.reward}
                    onChange={(e) => updatePrize(i, 'reward', e.target.value)}
                  />
                  {i >= 3 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => set('prizes', form.prizes.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button size="sm" variant="outline" className="gap-2" onClick={addPrize}>
                <Plus className="h-3.5 w-3.5" /> Add Prize
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rules & Judging */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Rules & Judging
            </h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Rules</label>
              <textarea
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 min-h-[100px] resize-y"
                placeholder="Teams of 1-4. All code must be original. Open-source libraries are permitted..."
                value={form.rules}
                onChange={(e) => set('rules', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Judging Criteria</label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.judgingCriteria.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1">
                    {c}
                    <button onClick={() => removeCriteria(c)} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Code Quality"
                  value={criteriaInput}
                  onChange={(e) => setCriteriaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCriteria()}
                />
                <Button size="sm" variant="outline" onClick={addCriteria}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-foreground">
              <Tag className="h-4 w-4 text-primary" />
              Tags
            </h2>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AI, Python, Machine Learning"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <Button size="sm" variant="outline" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => handleSubmit('DRAFT')}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save as Draft
          </Button>
          <Button
            disabled={loading}
            onClick={() => handleSubmit('PUBLISHED')}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Publish Hackathon
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewHackathonPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-xs font-mono">Loading form...</p>
      </div>
    }>
      <NewHackathonForm />
    </Suspense>
  )
}
