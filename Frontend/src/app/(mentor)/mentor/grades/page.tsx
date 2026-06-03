'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Loader2, RefreshCw, ClipboardList,
  CheckCircle, XCircle, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Submission {
  _id: string
  studentId: { fullName: string; email: string } | string
  assignmentTitle: string
  submittedAt: string
  grade?: number
  maxScore: number
  feedback?: string
  status: 'PENDING' | 'GRADED'
}

export default function MentorGradesPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [gradeInput, setGradeInput] = useState('')
  const [feedbackInput, setFeedbackInput] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mentor/submissions')
      setSubmissions(res.data?.data ?? [])
    } catch {
      toast.error('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleGrade = async (id: string) => {
    const score = parseFloat(gradeInput)
    if (isNaN(score)) return toast.error('Enter a valid grade')
    try {
      await api.put(`/mentor/submissions/${id}/grade`, { grade: score, feedback: feedbackInput })
      setSubmissions(prev =>
        prev.map(s => s._id === id ? { ...s, grade: score, feedback: feedbackInput, status: 'GRADED' } : s)
      )
      setGradingId(null)
      setGradeInput('')
      setFeedbackInput('')
      toast.success('Grade saved')
    } catch {
      toast.error('Failed to save grade')
    }
  }

  const pendingCount = submissions.filter(s => s.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Grades</span>
          </div>
          <h1 className="text-2xl font-bold">Grades & Submissions</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and grade student submissions.
            {pendingCount > 0 && <span className="ml-2 text-amber-400 font-semibold">{pendingCount} pending</span>}
          </p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-emerald-500/10 p-5 mb-4">
            <ClipboardList className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No submissions yet</h3>
          <p className="text-sm text-muted-foreground">Student submissions will appear here when they submit assignments.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, i) => {
            const studentName = typeof sub.studentId === 'object' ? sub.studentId.fullName : 'Student'
            const studentEmail = typeof sub.studentId === 'object' ? sub.studentId.email : ''
            const isGrading = gradingId === sub._id
            return (
              <motion.div key={sub._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card p-5 glass"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn('text-[10px]', sub.status === 'GRADED' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400')}>
                        {sub.status === 'GRADED' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                        {sub.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-foreground">{studentName}</p>
                    <p className="text-xs text-muted-foreground">{studentEmail}</p>
                    <p className="text-sm text-muted-foreground mt-1">{sub.assignmentTitle}</p>
                    {sub.status === 'GRADED' && (
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-sm font-bold text-emerald-400">{sub.grade}/{sub.maxScore}</span>
                        {sub.feedback && <span className="text-xs text-muted-foreground italic">"{sub.feedback}"</span>}
                      </div>
                    )}
                  </div>
                  {sub.status === 'PENDING' && !isGrading && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                      onClick={() => { setGradingId(sub._id); setGradeInput(''); setFeedbackInput('') }}>
                      Grade
                    </Button>
                  )}
                </div>
                {isGrading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border space-y-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Score (max {sub.maxScore})</label>
                        <Input type="number" value={gradeInput} onChange={e => setGradeInput(e.target.value)} placeholder={`0–${sub.maxScore}`} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Feedback</label>
                        <Input value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} placeholder="Brief feedback..." />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleGrade(sub._id)}>Save Grade</Button>
                      <Button size="sm" variant="outline" onClick={() => setGradingId(null)}>Cancel</Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
