'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Clock,
  Users,
  Star,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lock,
  Play,
  Code2,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { tracksAPI } from '@/lib/api-civilization'
import type { LearningTrack, LearningTrackPhase } from '@/types'

const MOCK_TRACK = {
  id: 1,
  title: 'Full-Stack Software Engineer',
  slug: 'full-stack-engineer',
  description:
    'Master the complete web development stack — from pixel-perfect UIs to scalable backend APIs and cloud deployment. This track is designed to take you from foundational concepts to building production-grade applications.',
  careerOutcome: 'Full-Stack Software Engineer',
  estimatedWeeks: 24,
  difficulty: 'intermediate',
  enrollmentCount: 8420,
  rating: 4.9,
  reviewCount: 1240,
  hasCertificate: true,
  gradient: 'from-blue-600 to-purple-600',
  phases: [
    {
      phase: 1,
      title: 'Frontend Foundations',
      weeks: 4,
      courses: [
        { id: 1, title: 'Modern JavaScript & TypeScript', lessons: 28, hours: 12, locked: false },
        { id: 2, title: 'React 18: From Zero to Hero', lessons: 35, hours: 15, locked: false },
      ],
    },
    {
      phase: 2,
      title: 'Backend Engineering',
      weeks: 6,
      courses: [
        { id: 3, title: 'Node.js & Express Mastery', lessons: 30, hours: 14, locked: false },
        { id: 4, title: 'PostgreSQL & Database Design', lessons: 22, hours: 10, locked: false },
        { id: 5, title: 'REST APIs & GraphQL', lessons: 18, hours: 8, locked: true },
      ],
    },
    {
      phase: 3,
      title: 'Full-Stack Projects',
      weeks: 8,
      courses: [
        { id: 6, title: 'Build a SaaS Product End-to-End', lessons: 42, hours: 22, locked: true },
        { id: 7, title: 'Authentication & Security', lessons: 20, hours: 9, locked: true },
      ],
    },
    {
      phase: 4,
      title: 'Production & DevOps',
      weeks: 6,
      courses: [
        { id: 8, title: 'Docker & Kubernetes Fundamentals', lessons: 25, hours: 12, locked: true },
      ],
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
  instructors: [
    { name: 'Dr. Vijay Kumar', role: 'Principal Engineer @ Google', avatar: 'V' },
    { name: 'Kavitha Reddy', role: 'Senior Engineer @ Stripe', avatar: 'K' },
  ],
}

// Normalize the API response into the shape the page expects
function normalizeTrack(data: unknown): LearningTrack | null {
  if (!data) return null
  const raw = data as Record<string, unknown>
  const track = (raw.track ?? raw) as Record<string, unknown>
  const courses = (raw.courses ?? track.courses ?? []) as unknown[]
  const enrollment = (raw.enrollment ?? track.enrollment ?? null) as Record<string, unknown> | null

  const phases = (track.phases ?? []) as LearningTrackPhase[]
  if (!phases.length && courses.length) {
    phases.push({ phase: 1, title: 'Course Content', weeks: (track.estimatedWeeks ?? track.estimated_weeks ?? 12) as number, courses: courses as LearningTrackPhase['courses'] })
  }

  return {
    id: (track.id ?? 1) as number,
    title: (track.title ?? MOCK_TRACK.title) as string,
    slug: (track.slug ?? MOCK_TRACK.slug) as string,
    description: (track.description ?? MOCK_TRACK.description) as string,
    difficulty: (track.difficulty ?? 'intermediate') as string,
    estimatedWeeks: (track.estimatedWeeks ?? track.estimated_weeks ?? MOCK_TRACK.estimatedWeeks) as number,
    enrollmentCount: (track.enrollmentCount ?? track.enrollment_count ?? MOCK_TRACK.enrollmentCount) as number,
    rating: (track.rating ?? MOCK_TRACK.rating) as number,
    reviewCount: (track.reviewCount ?? track.review_count ?? MOCK_TRACK.reviewCount) as number,
    hasCertificate: (track.hasCertificate ?? track.has_certificate ?? true) as boolean,
    gradient: (track.gradient ?? MOCK_TRACK.gradient) as string,
    phases: phases.length ? phases : MOCK_TRACK.phases,
    skills: (track.skills ?? track.skillsGained ?? MOCK_TRACK.skills) as string[],
    instructors: (track.instructors ?? MOCK_TRACK.instructors) as LearningTrack['instructors'],
    isEnrolled: !!enrollment,
    progressPercent: (enrollment?.progressPercentage ?? 0) as number,
  }
}

function TrackSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-2/3 rounded bg-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-5/6 rounded bg-secondary" />
      </div>
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 w-24 rounded bg-secondary" />
        ))}
      </div>
    </div>
  )
}

export default function TrackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [track, setTrack] = useState<LearningTrack | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [progressPercent, setProgressPercent] = useState(0)
  const [expandedPhase, setExpanded] = useState<number>(1)

  useEffect(() => {
    tracksAPI
      .get(slug)
      .then((response) => {
        if (response.error) {
          toast.error(response.error)
          setTrack(normalizeTrack(MOCK_TRACK)!)
          return
        }
        const normalized = normalizeTrack(response.data)
        if (normalized) {
          setTrack(normalized)
          setIsEnrolled(!!normalized.isEnrolled)
          setProgressPercent(normalized.progressPercent ?? 0)
        } else {
          setTrack(normalizeTrack(MOCK_TRACK)!)
        }
      })
      .catch(() => {
        toast.error('Failed to load track. Using fallback data.')
        setTrack(normalizeTrack(MOCK_TRACK)!)
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleEnroll = async () => {
    if (!track) return
    setEnrolling(true)
    try {
      await tracksAPI.enroll(track.id)
      setIsEnrolled(true)
      toast.success('Enrolled successfully! Your learning journey begins now.')
    } catch {
      toast.error('Enrollment failed. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const t = track ?? normalizeTrack(MOCK_TRACK)!
  const totalCourses =
    t?.phases?.reduce((s: number, p: any) => s + (p.courses?.length ?? 0), 0) ?? 0
  const totalHours =
    t?.phases?.reduce(
      (s: number, p: any) =>
        s + (p.courses?.reduce((cs: number, c: any) => cs + (c.hours ?? 0), 0) ?? 0),
      0
    ) ?? 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-br from-card via-card to-background px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/learning-tracks" className="transition-colors hover:text-white">
              Learning Tracks
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="max-w-xs truncate text-gray-300">{loading ? '...' : t.title}</span>
          </div>

          {loading ? (
            <TrackSkeleton />
          ) : (
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="flex-1">
                <div
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${t.gradient} mb-4 px-4 py-1.5`}
                >
                  <Code2 className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Career Track</span>
                </div>
                <h1 className="mb-3 text-3xl font-bold text-white">{t.title}</h1>
                <p className="mb-5 leading-relaxed text-gray-400">{t.description}</p>

                <div className="mb-5 flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-foreground/70 text-foreground/70" />
                    <strong className="text-white">{t.rating}</strong> (
                    {t.reviewCount?.toLocaleString()} reviews)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {t.enrollmentCount?.toLocaleString()} enrolled
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {t.estimatedWeeks} weeks · {totalHours}h content
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    {totalCourses} courses
                  </span>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  <Badge className="bg-blue-900/50 text-xs text-blue-400">{t.difficulty}</Badge>
                  {t.hasCertificate && (
                    <Badge className="gap-1 bg-muted text-xs text-foreground/70">
                      <Award className="h-3 w-3" /> Certificate included
                    </Badge>
                  )}
                </div>

                {/* Instructors */}
                <div className="flex flex-wrap gap-4">
                  {(t.instructors ?? []).map((inst: any) => (
                    <div key={inst.name} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold">
                        {inst.avatar ?? inst.name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{inst.name}</p>
                        <p className="text-[10px] text-gray-500">{inst.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enroll card */}
              <div className="w-full shrink-0 md:w-72">
                <Card className="sticky top-6 border-border bg-card">
                  <div className={`h-2 rounded-t-xl bg-gradient-to-r ${t.gradient}`} />
                  <CardContent className="p-5">
                    {isEnrolled && (
                      <div className="mb-4">
                        <p className="mb-1 text-xs text-gray-500">Your progress</p>
                        <Progress value={progressPercent} className="mb-1 h-2" />
                        <p className="text-xs text-gray-400">{progressPercent}% complete</p>
                      </div>
                    )}
                    <div className="mb-5 space-y-2 text-sm">
                      {[
                        `${totalCourses} courses across ${t.phases?.length ?? 0} phases`,
                        `${totalHours}+ hours of content`,
                        `${t.estimatedWeeks}-week structured curriculum`,
                        'Industry-verified certificate',
                        'Lifetime access',
                      ].map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-gray-300">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-foreground/80" />
                          <span className="text-xs">{feat}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={isEnrolled ? undefined : handleEnroll}
                      disabled={enrolling}
                      className={`w-full gap-2 font-semibold ${isEnrolled ? 'bg-primary/80 hover:bg-primary/90' : `bg-gradient-to-r ${t.gradient} hover:opacity-90`}`}
                    >
                      {enrolling && <Loader2 className="h-4 w-4 animate-spin" />}
                      {enrolling
                        ? 'Enrolling...'
                        : isEnrolled
                          ? '✓ Continue Learning'
                          : 'Enroll Free'}
                    </Button>
                    <p className="mt-2 text-center text-xs text-gray-600">
                      30-day money-back guarantee
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum */}
      {!loading && t && (
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h2 className="mb-2 text-xl font-bold text-white">Track Curriculum</h2>
          <p className="mb-6 text-sm text-gray-400">
            {totalCourses} courses · {t.phases?.length ?? 0} phases · {t.estimatedWeeks} weeks
          </p>

          <div className="space-y-3">
            {(t.phases ?? []).map((phase: any) => (
              <Card key={phase.phase} className="overflow-hidden border-border bg-card">
                <button
                  onClick={() => setExpanded(expandedPhase === phase.phase ? 0 : phase.phase)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-xs font-bold text-white`}
                    >
                      {phase.phase}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{phase.title}</p>
                      <p className="text-xs text-gray-500">
                        {phase.courses?.length ?? 0} courses · {phase.weeks} weeks
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${expandedPhase === phase.phase ? 'rotate-180' : ''}`}
                  />
                </button>

                {expandedPhase === phase.phase && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }}>
                    {(phase.courses ?? []).map((course: any) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 border-t border-border px-5 py-3"
                      >
                        {course.locked ? (
                          <Lock className="h-4 w-4 shrink-0 text-gray-600" />
                        ) : (
                          <Play className="h-4 w-4 shrink-0 text-blue-400" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium ${course.locked ? 'text-gray-500' : 'text-white'}`}
                          >
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {course.lessons} lessons · {course.hours}h
                          </p>
                        </div>
                        {!course.locked && (
                          <Badge className="bg-muted text-[10px] text-foreground/70">Free</Badge>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </Card>
            ))}
          </div>

          {/* Skills */}
          {(t.skills ?? []).length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-white">Skills You'll Gain</h2>
              <div className="flex flex-wrap gap-2">
                {t.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded-xl bg-secondary px-4 py-2 text-sm font-medium text-foreground/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
