'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, CheckCircle2, Clock, GraduationCap, Loader2, PlayCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

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

type Module = {
  _id: string
  title: string
  description?: string
  order?: number
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!params.id) return
    let active = true

    Promise.all([
      api.get(`/learning/courses/${params.id}`).catch(() => null),
      api.get(`/learning/courses/${params.id}/modules`).catch(() => null),
    ])
      .then(([courseRes, modulesRes]) => {
        if (!active) return
        setCourse(courseRes?.data?.data ?? null)
        setModules(modulesRes?.data?.data ?? [])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [params.id])

  const enroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(`/courses/${params.id}`)}`)
      return
    }

    setEnrolling(true)
    setMessage('')
    try {
      const res = await api.post(`/courses/${params.id}/enroll`)
      if (res.data?.alreadyEnrolled) {
        router.push('/student/dashboard')
        return
      }
      setMessage('Course added to your dashboard.')
      router.push('/student/dashboard')
    } catch (err: any) {
      const data = err.response?.data
      if (data?.requiresAssessment) {
        router.push(`/assessment/onboarding?domain=${encodeURIComponent(data.domain ?? course?.title ?? '')}`)
        return
      }
      setMessage(data?.message || err.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link href="/courses">
            <ArrowLeft className="h-4 w-4" />
            Back to courses
          </Link>
        </Button>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : !course ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <h1 className="text-xl font-semibold">Course not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">This course may be unpublished or unavailable.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
                  {course.difficulty ?? 'BEGINNER'}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {course.description ?? 'A structured Bluelearnerhub course with lessons, assessment-driven placement, progress tracking, and project work.'}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Course Modules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {modules.length === 0 ? (
                    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                      Modules are being prepared for this course.
                    </div>
                  ) : (
                    modules.map((module, index) => (
                      <div key={module._id} className="flex gap-3 rounded-md border p-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h2 className="font-medium">{module.title}</h2>
                          {module.description && <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Enrollment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border p-3">
                      <Clock className="mb-2 h-4 w-4 text-muted-foreground" />
                      <div className="font-semibold">{course.estimatedHours ?? 0} hrs</div>
                      <div className="text-xs text-muted-foreground">Estimated</div>
                    </div>
                    <div className="rounded-md border p-3">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-muted-foreground" />
                      <div className="font-semibold">Assessment</div>
                      <div className="text-xs text-muted-foreground">Required</div>
                    </div>
                  </div>
                  <Button onClick={enroll} disabled={enrolling} className="w-full gap-2">
                    {enrolling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                    Enroll
                  </Button>
                  {message && <p className="text-sm text-muted-foreground">{message}</p>}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
