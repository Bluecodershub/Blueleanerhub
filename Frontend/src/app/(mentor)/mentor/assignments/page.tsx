'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardList, Plus, Loader2, RefreshCw, BookOpen,
  CheckCircle, Clock, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ClassBatch {
  _id: string
  name: string
}

interface MentorAssignment {
  _id: string
  title: string
  description?: string
  dueDate?: string
  maxScore: number
  status: string
  batchId?: { name?: string } | string
}

interface AssignmentForm {
  title: string
  description: string
  classId: string
  dueDate: string
  maxScore: string
}

export default function MentorAssignmentsPage() {
  const [classes, setClasses] = useState<ClassBatch[]>([])
  const [assignments, setAssignments] = useState<MentorAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<AssignmentForm>({ title: '', description: '', classId: '', dueDate: '', maxScore: '100' })

  useEffect(() => {
    Promise.all([
      api.get('/mentor/classes'),
      api.get('/mentor/assignments'),
    ]).then(([classesRes, assignmentsRes]) => {
      setClasses(classesRes.data?.data ?? [])
      setAssignments(assignmentsRes.data?.data ?? [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.classId) return toast.error('Title and class are required')
    setCreating(true)
    try {
      const res = await api.post(`/mentor/classes/${form.classId}/assignments`, {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || undefined,
        maxScore: parseInt(form.maxScore) || 100,
      })
      setAssignments(prev => [res.data?.data, ...prev].filter(Boolean))
      setForm({ title: '', description: '', classId: '', dueDate: '', maxScore: '100' })
      setShowCreate(false)
      toast.success('Assignment created')
    } catch {
      toast.error('Failed to create assignment')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Assignments</span>
          </div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Create and manage class assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => api.get('/mentor/assignments').then(r => setAssignments(r.data?.data ?? []))} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" /> New Assignment
          </Button>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/20 bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground">Create Assignment</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Assignment title" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Assignment instructions..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Class *</label>
              <Select value={form.classId} onValueChange={v => setForm(f => ({ ...f, classId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Due Date</label>
              <Input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Max Score</label>
              <Input type="number" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} placeholder="100" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create
            </Button>
            <Button onClick={() => setShowCreate(false)} variant="outline">Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-emerald-500/10 p-5 mb-4">
            <BookOpen className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No classes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a class first before adding assignments.</p>
          <Button variant="outline" onClick={() => window.location.href = '/mentor/classes'}>Go to Classes</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-foreground">Assignments</h2>
            </div>
            {assignments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No assignments created yet.</div>
            ) : (
              <div className="space-y-3">
                {assignments.map(assignment => (
                  <div key={assignment._id} className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      {assignment.description && <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {typeof assignment.batchId === 'object' ? assignment.batchId?.name : 'Class'} · Max {assignment.maxScore}
                        {assignment.dueDate ? ` · Due ${new Date(assignment.dueDate).toLocaleString()}` : ''}
                      </p>
                    </div>
                    <Badge className={cn(
                      assignment.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-muted text-muted-foreground'
                    )}>
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-foreground">Create by Class</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(cls => (
                <div key={cls._id} className="rounded-xl border border-border bg-secondary/20 p-4">
                  <p className="font-medium text-foreground">{cls.name}</p>
                  <Button size="sm" variant="ghost" className="mt-2 text-xs text-emerald-400 hover:text-emerald-500 px-0"
                    onClick={() => { setForm(f => ({ ...f, classId: cls._id })); setShowCreate(true) }}>
                    + Add Assignment
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
