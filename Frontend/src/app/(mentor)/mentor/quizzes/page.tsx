'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BrainCircuit, Plus, Search, Loader2, RefreshCw,
  Clock, BarChart3, CheckCircle2, Circle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Quiz {
  _id: string
  title: string
  topic: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  questionCount: number
  timeLimit: number
  isPublished: boolean
  createdAt: string
}

const difficultyColor: Record<string, string> = {
  EASY:   'text-emerald-400 bg-emerald-500/10',
  MEDIUM: 'text-amber-400  bg-amber-500/10',
  HARD:   'text-rose-400   bg-rose-500/10',
}

export default function MentorQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/quiz?limit=50')
      const raw = res.data?.data ?? res.data?.quizzes ?? []
      setQuizzes(Array.isArray(raw) ? raw : [])
    } catch {
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = quizzes.filter((q) =>
    !search ||
    q.title?.toLowerCase().includes(search.toLowerCase()) ||
    q.topic?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Mentor Portal</span>
          </div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Browse and assign quizzes to your students.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={load} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> Create Quiz
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Quizzes',    value: quizzes.length,                                   color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Published',        value: quizzes.filter(q => q.isPublished).length,         color: 'text-blue-500',    bg: 'bg-blue-500/10' },
          { label: 'Easy',             value: quizzes.filter(q => q.difficulty === 'EASY').length,   color: 'text-teal-500',    bg: 'bg-teal-500/10' },
          { label: 'Hard',             value: quizzes.filter(q => q.difficulty === 'HARD').length,   color: 'text-rose-500',    bg: 'bg-rose-500/10' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quiz Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BrainCircuit className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {search ? 'No quizzes match your search.' : 'No quizzes available yet.'}
            </p>
            {!search && (
              <Button size="sm" className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Create your first quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((quiz, i) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                      <BrainCircuit className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {quiz.isPublished
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <Circle className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-xs text-muted-foreground">
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold line-clamp-2 mb-1">{quiz.title}</h3>
                  {quiz.topic && (
                    <p className="text-xs text-muted-foreground mb-3">{quiz.topic}</p>
                  )}

                  <div className="mt-auto flex items-center gap-3 pt-3 border-t border-border/50">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyColor[quiz.difficulty] ?? 'text-muted-foreground bg-muted'}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BarChart3 className="h-3 w-3" /> {quiz.questionCount ?? 0} Qs
                    </span>
                    {quiz.timeLimit > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {quiz.timeLimit}m
                      </span>
                    )}
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
