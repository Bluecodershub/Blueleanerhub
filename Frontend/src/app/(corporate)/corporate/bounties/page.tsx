'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Plus,
  Search,
  DollarSign,
  Users,
  Clock,
  Code,
  Calendar,
  Tag,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Bounty {
  id: number | string
  title: string
  description: string
  reward: number
  currency?: string
  deadline: string
  status: 'open' | 'urgent' | 'closed' | 'completed'
  applicant_count?: number
  max_applicants?: number
  difficulty?: string
  skills?: string[]
  submission_count?: number
  created_at: string
}

interface BountyForm {
  title: string
  description: string
  reward: string
  currency: string
  deadline: string
  maxApplicants: string
  difficulty: string
  skills: string
}

const initialBountyForm: BountyForm = {
  title: '',
  description: '',
  reward: '',
  currency: 'usd',
  deadline: '',
  maxApplicants: '',
  difficulty: 'Medium',
  skills: '',
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: 'bg-green-500/10 text-green-500 border-green-500/20',
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    closed: 'bg-muted text-muted-foreground border-muted',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }
  return (
    <Badge variant="outline" className={styles[status] || styles.open}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy: 'bg-green-500/10 text-green-500',
    Medium: 'bg-amber-500/10 text-amber-500',
    Hard: 'bg-orange-500/10 text-orange-500',
    Critical: 'bg-red-500/10 text-red-500',
  }
  return (
    <Badge className={styles[difficulty] || styles.Medium}>
      {difficulty}
    </Badge>
  )
}

export default function CorporateBountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState<BountyForm>(initialBountyForm)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('all')

  useEffect(() => {
    fetchBounties()
  }, [])

  const fetchBounties = async () => {
    try {
      const response = await api.get('/corporate/bounties')
      setBounties(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch bounties:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateForm = (field: keyof BountyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleCreateBounty = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const reward = Number(form.reward)
    const maxApplicants = form.maxApplicants ? Number(form.maxApplicants) : undefined
    const skills = form.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (!form.title.trim() || !form.description.trim() || !form.deadline) {
      toast.error('Title, description, and deadline are required.')
      return
    }

    if (!Number.isFinite(reward) || reward < 0) {
      toast.error('Reward must be a valid non-negative amount.')
      return
    }

    if (maxApplicants !== undefined && (!Number.isFinite(maxApplicants) || maxApplicants < 1)) {
      toast.error('Max applicants must be at least 1.')
      return
    }

    try {
      setCreating(true)
      const response = await api.post('/corporate/bounties', {
        title: form.title.trim(),
        description: form.description.trim(),
        reward,
        currency: form.currency,
        deadline: form.deadline,
        maxApplicants,
        difficulty: form.difficulty,
        skills,
      })

      setBounties((current) => [response.data.data, ...current])
      setForm(initialBountyForm)
      setCreateOpen(false)
      toast.success('Bounty created')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bounty')
    } finally {
      setCreating(false)
    }
  }

  const filteredBounties = bounties.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = filterDifficulty === 'all' || b.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const openBounties = bounties.filter((b) => b.status === 'open').length
  const totalReward = bounties.reduce((acc, b) => acc + b.reward, 0)
  const totalSubmissions = bounties.reduce((acc, b) => acc + (b.submission_count || 0), 0)

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bounties</h1>
          <p className="text-muted-foreground">Issue-based challenges with rewards</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Bounty
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bounties.length}</p>
                <p className="text-sm text-muted-foreground">Total Bounties</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openBounties}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalReward}</p>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Code className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSubmissions}</p>
                <p className="text-sm text-muted-foreground">Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'Easy', 'Medium', 'Hard', 'Critical'].map((diff) => (
            <Button
              key={diff}
              variant={filterDifficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterDifficulty(diff)}
            >
              {diff === 'all' ? 'All Levels' : diff}
            </Button>
          ))}
        </div>
      </div>

      {filteredBounties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bounties yet</h3>
            <p className="text-muted-foreground mb-4">Create your first bounty to attract talented developers</p>
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Bounty
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredBounties.map((bounty, i) => (
            <motion.div
              key={bounty.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{bounty.title}</h3>
                        <StatusBadge status={bounty.status} />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{bounty.description}</p>
                    </div>
                  </div>

                  {bounty.skills && bounty.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {bounty.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm mb-4">
                    {bounty.difficulty && <DifficultyBadge difficulty={bounty.difficulty} />}
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-foreground">${bounty.reward}</span>
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {daysUntil(bounty.deadline) > 0 ? `${daysUntil(bounty.deadline)} days left` : 'Expired'}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {bounty.applicant_count || 0}/{bounty.max_applicants || '∞'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Applicants</span>
                      <span>{bounty.max_applicants ? Math.round(((bounty.applicant_count || 0) / bounty.max_applicants) * 100) : 0}%</span>
                    </div>
                    <Progress value={bounty.max_applicants ? ((bounty.applicant_count || 0) / bounty.max_applicants) * 100 : 0} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Deadline: {new Date(bounty.deadline).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" disabled={(bounty.applicant_count || 0) >= (bounty.max_applicants || Infinity)}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Bounty</DialogTitle>
            <DialogDescription>
              Publish a reward-backed challenge for candidates and participants.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateBounty}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="bounty-title">Title</label>
                <Input
                  id="bounty-title"
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="Build a fraud detection model"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" htmlFor="bounty-description">Description</label>
                <Textarea
                  id="bounty-description"
                  value={form.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  placeholder="Describe the expected solution, submission format, and review criteria."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-reward">Reward</label>
                <Input
                  id="bounty-reward"
                  type="number"
                  min="0"
                  step="1"
                  value={form.reward}
                  onChange={(event) => updateForm('reward', event.target.value)}
                  placeholder="500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-currency">Currency</label>
                <select
                  id="bounty-currency"
                  value={form.currency}
                  onChange={(event) => updateForm('currency', event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="usd">USD</option>
                  <option value="inr">INR</option>
                  <option value="eur">EUR</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-deadline">Deadline</label>
                <Input
                  id="bounty-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(event) => updateForm('deadline', event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-max-applicants">Max Applicants</label>
                <Input
                  id="bounty-max-applicants"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxApplicants}
                  onChange={(event) => updateForm('maxApplicants', event.target.value)}
                  placeholder="Unlimited"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-difficulty">Difficulty</label>
                <select
                  id="bounty-difficulty"
                  value={form.difficulty}
                  onChange={(event) => updateForm('difficulty', event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="bounty-skills">Skills</label>
                <Input
                  id="bounty-skills"
                  value={form.skills}
                  onChange={(event) => updateForm('skills', event.target.value)}
                  placeholder="React, Python, ML"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Bounty
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
