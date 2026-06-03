'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, BookOpen, Loader2, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

type SkillScore = {
  name: string
  score: number
  level: number
}

type SkillReport = {
  domain: string
  overallLevel: number
  estimatedLevel: string
  skills: SkillScore[]
  strengths: string[]
  weaknesses: string[]
  skillGaps: string[]
}

export default function SkillReportPage() {
  const { user } = useAuth()
  const [report, setReport] = useState<SkillReport | null>(null)
  const [loading, setLoading] = useState(true)
  const domain = user?.domain || 'Software Engineering'

  useEffect(() => {
    api.get('/adaptive-learning/roadmap', { params: { domain } })
      .then((res) => setReport(res.data?.data?.scores ?? null))
      .catch(() => setReport(null))
      .finally(() => setLoading(false))
  }, [domain])

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Report</h1>
          <p className="mt-2 text-sm text-muted-foreground">Complete an assessment to generate your domain-wise skill report.</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">No report available</h2>
              <p className="mt-1 text-sm text-muted-foreground">Your strengths, weaknesses, and recommendations will appear here.</p>
            </div>
            <Button asChild>
              <Link href={`/assessment/onboarding?domain=${encodeURIComponent(domain)}`}>Start Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">{report.domain}</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Skill Report</h1>
          <p className="mt-2 text-sm text-muted-foreground">Domain-wise scores, strengths, gaps, and recommended next actions.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/courses">View Recommended Courses</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" /> Overall Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{report.overallLevel}/10</div>
            <p className="mt-1 text-sm text-muted-foreground">{report.estimatedLevel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" /> Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(report.strengths ?? []).slice(0, 4).map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-primary" /> Learning Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(report.skillGaps ?? report.weaknesses ?? []).slice(0, 4).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Topic Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(report.skills ?? []).length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">Topic-level scores are not available yet.</div>
          ) : (
            report.skills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, skill.score))}%` }} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
