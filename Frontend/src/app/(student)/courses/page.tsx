'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, BookOpen, Clock, GraduationCap, RefreshCw, Search, Sparkles, Users } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'

type Course = {
  _id: string
  title: string
  slug: string
  description?: string
  difficulty?: string
  estimatedHours?: number
  tags?: string[]
  enrollmentCount?: number
}

// Codecademy-style vivid gradient per subject (inferred from tags/title)
function courseAccent(course: Course): string {
  const hay = [course.title, ...(course.tags ?? [])].join(' ').toLowerCase()
  if (/(computer|software|web|python|data|cs|program)/.test(hay)) return 'bg-cat-blue'
  if (/(mechanical|cad|design|simulation)/.test(hay)) return 'bg-cat-coral'
  if (/(electrical|circuit|embedded|power)/.test(hay)) return 'bg-cat-amber'
  if (/(civil|structure|geotech)/.test(hay)) return 'bg-cat-teal'
  if (/(management|business|analytics|finance|marketing)/.test(hay)) return 'bg-cat-purple'
  return 'bg-cat-indigo'
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    api.get('/learning/courses', { params: { limit: 50 } })
      .then((res) => {
        if (!active) return
        const payload = res.data?.data?.data ?? res.data?.data ?? []
        const rows = Array.isArray(payload) ? payload : []
        setCourses(rows)
      })
      .catch(() => {
        if (!active) return
        setCourses([])
        setError('The course catalog could not be loaded from the API.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [requestKey])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return courses
    return courses.filter((course) => {
      const haystack = [course.title, course.description, course.difficulty, ...(course.tags ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [courses, query])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 gap-2 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Assessment guided enrollment
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Courses</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              Explore domain-based courses across computer science, mechanical, electrical, civil, and management tracks.
              Complete your assessment first, then enroll in the path that matches your skill report.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>
        </section>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-lg border bg-card/40" />
            ))}
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-[8px] border border-destructive/30 bg-destructive/[0.06] p-8 text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] border border-destructive/25 bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Course catalog unavailable</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-5 gap-2" onClick={() => setRequestKey((key) => key + 1)}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-[8px] border border-dashed border-border p-8 text-center">
            <BookOpen className="mb-4 h-8 w-8 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">No published courses yet</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Published course records will appear here as soon as they are available.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[8px] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No courses match “{query}”.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="flex h-full flex-col overflow-hidden border-border/70 bg-card/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[8px] text-white shadow-md ${courseAccent(course)}`}>
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">{course.difficulty ?? 'BEGINNER'}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-5">
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {course.description ?? 'Structured lessons, assessments, projects, and mentorship for this domain.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(course.tags?.length ? course.tags : ['Assessment', 'Project']).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{course.estimatedHours ?? 0} hrs</span>
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{course.enrollmentCount ?? 0}</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Course</span>
                    </div>
                    <Button asChild className="w-full gap-2">
                      <Link href={`/courses/${course._id}`}>
                        View Course
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
