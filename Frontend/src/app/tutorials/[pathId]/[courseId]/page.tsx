'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Search, ArrowLeft, Play, Star, Zap } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { tutorialsAPI } from '@/lib/api-civilization'

interface TutorialItem {
  id: string
  title: string
  lessons: number
  level: string
  progress: number
  icon: LucideIcon
}

const LEVEL_ICONS: Record<string, LucideIcon> = {
  beginner: BookOpen,
  intermediate: Star,
  advanced: Zap,
  expert: Zap,
}

export default function CategoryLibraryPage() {
  const params = useParams()
  const router = useRouter()
  const pathId = Array.isArray(params.pathId) ? params.pathId[0] : params.pathId
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId

  const [searchQuery, setSearchQuery] = useState('')
  const [tutorials, setTutorials] = useState<TutorialItem[]>([])
  const [loading, setLoading] = useState(true)

  const domainName = pathId
    ? (pathId as string).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Domain'
  const categoryName = courseId
    ? (courseId as string).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Category'

  useEffect(() => {
    if (!pathId || !courseId) return

    tutorialsAPI
      .list({ domain: pathId, subDomain: courseId })
      .then((d: any) => {
        const data = d.data || d
        if (Array.isArray(data)) {
          const mapped = data.map((t: any) => ({
            id: `${t.slug || t.id}`,
            title: t.title,
            lessons: t.sectionCount ?? 10,
            level: t.difficulty
              ? t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)
              : 'Intermediate',
            progress: t.userProgress?.progressPercent ?? 0,
            icon: LEVEL_ICONS[t.difficulty] ?? BookOpen,
          }))
          setTutorials(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pathId, courseId])

  const filteredTutorials = tutorials.filter(
    (t) => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="bg-noise" />

      <div className="relative mx-auto max-w-7xl space-y-24 px-6 pb-32 pt-16">
        {/* Subtle Background Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[10%] left-[30%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute right-[10%] top-[40%] h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
        </div>

        {/* Header Section */}
        <header className="space-y-12">
          <button
            onClick={() => router.push(`/tutorials/${pathId}`)}
            className="group flex items-center gap-2 text-sm font-bold text-muted-foreground transition-all hover:text-white"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to {domainName}
          </button>

          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Badge
                  variant="outline"
                  className="rounded-full border-primary/30 bg-primary/10 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                >
                  {domainName}
                </Badge>
                <h1 className="font-serif text-5xl font-medium tracking-tight text-white md:text-6xl">
                  {categoryName}
                </h1>
              </div>
              <p className="max-w-xl font-serif text-xl leading-relaxed text-muted-foreground">
                Deep-dive into <span className="text-foreground">{categoryName}</span> with our
                expert-led tutorials and interactive project-based curriculum.
              </p>
            </div>

            <div className="group relative w-full max-w-md">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/50 to-violet-600/50 opacity-10 blur transition duration-1000 group-focus-within:opacity-20" />
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary" />
                <Input
                  placeholder={`Search in ${categoryName}...`}
                  className="h-14 rounded-full border-border bg-card/60 pl-14 text-white backdrop-blur-xl transition-all focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Tutorials Grid */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-[2.5rem] bg-card/40" />
              ))}
            </div>
          ) : filteredTutorials.length > 0 ? (
            <AnimatePresence>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredTutorials.map((tutorial, i) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/tutorials/view/${tutorial.id}/lesson-1`}>
                      <motion.div
                        whileHover={{ y: -10 }}
                        className="group relative h-full overflow-hidden rounded-[2.5rem] border border-border bg-card/40 p-10 transition-all hover:bg-card hover:shadow-2xl hover:shadow-primary/10"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                        <div className="mb-10 flex items-start justify-between">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                            <tutorial.icon size={32} />
                          </div>
                          <Badge
                            variant="outline"
                            className="rounded-lg border-border/50 bg-secondary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                          >
                            {tutorial.level}
                          </Badge>
                        </div>

                        <h3 className="mb-6 font-serif text-2xl font-medium leading-[1.3] text-white transition-colors group-hover:text-primary">
                          {tutorial.title}
                        </h3>

                        <div className="space-y-6">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>{tutorial.lessons} Lessons</span>
                            <span className="text-primary">{tutorial.progress}% Complete</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${tutorial.progress}%` }}
                              className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                            />
                          </div>
                        </div>

                        <div className="mt-10 flex translate-y-4 items-center justify-center gap-2 rounded-full border border-border bg-background py-3 text-[11px] font-black uppercase tracking-widest text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:bg-primary group-hover:opacity-100">
                          <Play size={14} className="fill-current" /> Continue Learning
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-8 rounded-full bg-secondary p-8 text-muted-foreground/20">
                <BookOpen size={64} />
              </div>
              <h3 className="mb-2 font-serif text-2xl font-medium text-white">No modules found</h3>
              <p className="text-muted-foreground">
                Try broadening your search within this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
