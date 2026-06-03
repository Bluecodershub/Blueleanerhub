'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Plus, Loader2, RefreshCw, Users, Calendar,
  MoreHorizontal, Pencil, Trash2, ChevronRight, GraduationCap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ClassBatch {
  _id: string
  name: string
  description?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  studentCount: number
  sessionCount: number
}

export default function MentorClassesPage() {
  const [classes, setClasses] = useState<ClassBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mentor/classes')
      setClasses(res.data?.data ?? [])
    } catch {
      toast.error('Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Class name is required')
    setCreating(true)
    try {
      const res = await api.post('/mentor/classes', form)
      setClasses(prev => [res.data.data, ...prev])
      setForm({ name: '', description: '', startDate: '', endDate: '' })
      setShowCreate(false)
      toast.success('Class created')
    } catch {
      toast.error('Failed to create class')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/mentor/classes/${id}`)
      setClasses(prev => prev.filter(c => c._id !== id))
      toast.success('Class deleted')
    } catch {
      toast.error('Failed to delete class')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Classes</span>
          </div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your teaching batches and student groups.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" /> New Class
          </Button>
        </div>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-500/20 bg-card p-6 space-y-4"
        >
          <h3 className="font-semibold text-foreground">Create New Class</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Class Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Web Development Batch 1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Start Date</label>
              <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">End Date</label>
              <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Create Class
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
            <GraduationCap className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No classes yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first class to start teaching.</p>
          <Button onClick={() => setShowCreate(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="h-4 w-4" /> Create First Class
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls, i) => (
            <motion.div key={cls._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="group glass border-border hover:border-emerald-500/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{cls.name}</CardTitle>
                      {cls.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{cls.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={cn('text-[10px] ml-2 shrink-0', cls.isActive ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-border text-muted-foreground')}>
                      {cls.isActive ? 'Active' : 'Ended'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{cls.studentCount ?? 0} students</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{cls.sessionCount ?? 0} sessions</span>
                    </div>
                  </div>
                  {cls.startDate && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(cls.startDate).toLocaleDateString()} – {cls.endDate ? new Date(cls.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs hover:border-emerald-500/50 hover:text-emerald-400"
                      onClick={() => toast.info('Class detail view coming soon')}>
                      <ChevronRight className="h-3.5 w-3.5" /> View
                    </Button>
                    <Button size="sm" variant="ghost" className="text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 px-2"
                      onClick={() => handleDelete(cls._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
