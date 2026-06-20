'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ClipboardCheck, Loader2, ChevronDown, ExternalLink, GitBranch, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api'
import AIReviewPanel from '@/components/ai/AIReviewPanel'

interface Submission {
  _id: string
  courseId: string
  courseTitle?: string
  repoUrl?: string
  demoUrl?: string
  description: string
  grade?: number
  feedback?: string
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'GRADED' | 'REJECTED'
  submittedAt: string
  userId?: { _id: string; fullName?: string; email?: string } | null
}

const STATUS_TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'GRADED', label: 'Graded' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: '', label: 'All' },
]
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UNDER_REVIEW: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  GRADED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export default function MentorReviewsPage() {
  const [subs, setSubs] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ grade: string; feedback: string; status: string }>({ grade: '', feedback: '', status: 'GRADED' })
  const [saving, setSaving] = useState(false)

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      // "pending" = SUBMITTED + UNDER_REVIEW; fetch all and filter client-side for that bucket.
      const status = tab === 'pending' || tab === '' ? '' : tab
      const q = new URLSearchParams({ limit: '50' })
      if (status) q.set('status', status)
      const r = await api.get(`/mentor/capstones?${q.toString()}`)
      let rows: Submission[] = r.data?.data?.submissions ?? []
      if (tab === 'pending') rows = rows.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')
      setSubs(rows)
    } catch {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  const toggle = (s: Submission) => {
    if (expanded === s._id) { setExpanded(null); return }
    setExpanded(s._id)
    setDraft({ grade: s.grade != null ? String(s.grade) : '', feedback: s.feedback ?? '', status: s.status === 'SUBMITTED' ? 'GRADED' : s.status })
  }

  const submitGrade = async (id: string) => {
    const grade = Number(draft.grade)
    if (Number.isNaN(grade) || grade < 0 || grade > 100) { toast.error('Enter a grade between 0 and 100'); return }
    setSaving(true)
    try {
      await api.put(`/mentor/capstones/${id}/grade`, { grade, feedback: draft.feedback, status: draft.status })
      toast.success('Review saved')
      setExpanded(null)
      fetchSubs()
    } catch {
      toast.error('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mentor</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Submission Reviews</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Grade capstone submissions, leave rubric-based feedback, and approve or reject.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key || 'ALL'}
            onClick={() => setTab(t.key)}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : subs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardCheck className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">No {tab === 'pending' ? 'pending' : tab.toLowerCase()} submissions</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {subs.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <button onClick={() => toggle(s)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-secondary/20">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{s.courseTitle || s.courseId}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.userId?.fullName || 'Student'} · submitted {new Date(s.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {s.grade != null && <span className="text-sm font-bold text-emerald-400">{s.grade}/100</span>}
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', STATUS_COLORS[s.status])}>
                    {s.status.replace('_', ' ')}
                  </span>
                  <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded === s._id && 'rotate-180')} />
                </button>

                {expanded === s._id && (
                  <div className="space-y-4 border-t border-border bg-secondary/10 px-4 py-4">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Submission</p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{s.description}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs">
                        {s.repoUrl && <a href={s.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline"><GitBranch className="h-3.5 w-3.5" /> Repository</a>}
                        {s.demoUrl && <a href={s.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-400 hover:underline"><ExternalLink className="h-3.5 w-3.5" /> Live demo</a>}
                      </div>
                    </div>

                    {/* Optional AI assist on the written submission */}
                    <details className="rounded-xl border border-border bg-card/40 p-1">
                      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                        <Bot className="h-4 w-4 text-sky-400" /> AI assist (optional)
                      </summary>
                      <div className="p-2">
                        <AIReviewPanel content={s.description} submissionType="capstone" context={s.courseTitle} />
                      </div>
                    </details>

                    {/* Grade form */}
                    <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Grade /100</label>
                        <input
                          type="number" min={0} max={100}
                          value={draft.grade}
                          onChange={(e) => setDraft((d) => ({ ...d, grade: e.target.value }))}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Decision</label>
                        <select
                          value={draft.status}
                          onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="GRADED">Approve / Graded</option>
                          <option value="UNDER_REVIEW">Request resubmission (under review)</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">Feedback</label>
                      <textarea
                        value={draft.feedback}
                        onChange={(e) => setDraft((d) => ({ ...d, feedback: e.target.value }))}
                        rows={3}
                        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Rubric-based feedback for the student…"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setExpanded(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => submitGrade(s._id)} disabled={saving} className="gap-2">
                        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save review
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
