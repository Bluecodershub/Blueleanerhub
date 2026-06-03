'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Search,
  Users,
  Brain,
  FileText,
  Clock,
  CheckCircle2,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import api from '@/lib/api'

interface ScreeningResult {
  id: number
  candidate_name: string
  email: string
  position: string
  status: 'completed' | 'in_progress' | 'failed'
  score: number
  match_percentage: number
  skills: string[]
  experience: string
  applied_at: string
  completed_at?: string
  verdict?: string
}

export default function CorporateAIScreeningPage() {
  const [screenings, setScreenings] = useState<ScreeningResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchScreenings()
  }, [])

  const fetchScreenings = async () => {
    try {
      const response = await api.get('/corporate/candidates')
      const candidates = response.data.data || []
      const mapped = candidates.map((c: any) => ({
        id: c.id,
        candidate_name: c.full_name,
        email: c.email,
        position: 'Position TBD',
        status: c.status || 'completed',
        score: c.total_points || 0,
        match_percentage: Math.min((c.total_points || 0), 100),
        skills: [],
        experience: 'N/A',
        applied_at: c.applied_at || c.created_at,
      }))
      setScreenings(mapped)
    } catch (error) {
      console.error('Failed to fetch screenings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredScreenings = screenings.filter((s) => {
    const matchesSearch = s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const completedCount = screenings.filter((s) => s.status === 'completed').length
  const avgScore = completedCount > 0
    ? Math.round(screenings.filter((s) => s.status === 'completed').reduce((acc, s) => acc + s.score, 0) / completedCount)
    : 0
  const recommendedCount = screenings.filter((s) => s.score >= 80).length

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
          <h1 className="text-2xl font-bold">AI Screening</h1>
          <p className="text-muted-foreground">AI-powered candidate evaluation and ranking</p>
        </div>
        <Button className="gap-2">
          <Brain className="h-4 w-4" />
          Start New Screening
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{screenings.length}</p>
                <p className="text-sm text-muted-foreground">Total Screenings</p>
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
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Bot className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recommendedCount}</p>
                <p className="text-sm text-muted-foreground">Recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'completed', 'in_progress', 'failed'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredScreenings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No screenings yet</h3>
            <p className="text-muted-foreground mb-4">Start screening candidates to see AI-powered evaluations</p>
            <Button className="gap-2">
              <Brain className="h-4 w-4" />
              Start New Screening
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredScreenings.map((screening, i) => (
            <motion.div
              key={screening.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{screening.candidate_name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            screening.status === 'completed'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : screening.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }
                        >
                          {screening.status === 'in_progress' ? 'In Progress' : screening.status}
                        </Badge>
                        {screening.score >= 80 && (
                          <Badge className="bg-green-500/10 text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{screening.position}</p>
                      {screening.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {screening.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Applied {new Date(screening.applied_at).toLocaleDateString()}
                        </span>
                        {screening.experience && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {screening.experience}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {screening.status === 'completed' ? (
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{screening.score}%</p>
                          <p className="text-xs text-muted-foreground">AI Score</p>
                          <Progress value={screening.score} className="w-20 h-1.5 mt-2" />
                        </div>
                      ) : screening.status === 'in_progress' ? (
                        <div className="text-center">
                          <div className="flex items-center gap-2 text-blue-500">
                            <Brain className="h-5 w-5 animate-pulse" />
                            <span className="text-sm font-medium">Analyzing...</span>
                          </div>
                        </div>
                      ) : null}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
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
