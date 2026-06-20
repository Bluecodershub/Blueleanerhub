'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Code2,
  Database,
  Globe,
  Loader2,
  Search,
  Server,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LanguageLogo } from '@/components/ui/LanguageLogo'
import { cn } from '@/lib/utils'
import { tutorialsAPI } from '@/lib/api-civilization'

interface TutorialRow {
  id: string
  slug: string
  title: string
  description: string
  domain: string
  difficulty: string
  tags: string[]
  authorName?: string | null
  createdAt?: string
}

interface CategoryRow {
  id: string
  name: string
  tutorials: number
  tags: string[]
}

const domainIconMap = [
  { match: 'python', language: 'python', icon: Code2 },
  { match: 'javascript', language: 'javascript', icon: Globe },
  { match: 'typescript', language: 'typescript', icon: Code2 },
  { match: 'java', language: 'java', icon: Code2 },
  { match: 'data', icon: Database },
  { match: 'database', icon: Database },
  { match: 'sql', icon: Database },
  { match: 'devops', icon: Server },
]

function asText(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function normalizeTutorial(raw: Record<string, unknown>): TutorialRow {
  return {
    id: asText(raw.id ?? raw._id),
    slug: asText(raw.slug ?? raw.path ?? raw.id ?? raw._id),
    title: asText(raw.title, 'Untitled tutorial'),
    description: asText(raw.description, 'No description has been published for this tutorial.'),
    domain: asText(raw.domain ?? raw.category, 'General'),
    difficulty: asText(raw.difficulty, 'BEGINNER'),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).filter(Boolean) : [],
    authorName: raw.authorName ? String(raw.authorName) : null,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  }
}

function normalizeTutorialList(payload: unknown): TutorialRow[] {
  const rows = Array.isArray((payload as { data?: unknown[] } | undefined)?.data)
    ? (payload as { data: unknown[] }).data
    : Array.isArray(payload)
      ? payload
      : []

  return rows
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map(normalizeTutorial)
    .filter((tutorial) => Boolean(tutorial.id && tutorial.slug))
}

function categoryId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildCategories(tutorials: TutorialRow[]): CategoryRow[] {
  const map = new Map<string, CategoryRow>()
  for (const tutorial of tutorials) {
    const id = categoryId(tutorial.domain)
    const current = map.get(id) ?? { id, name: tutorial.domain, tutorials: 0, tags: [] }
    current.tutorials += 1
    current.tags = Array.from(new Set([...current.tags, ...tutorial.tags])).slice(0, 6)
    map.set(id, current)
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function DomainIcon({ domain }: { domain: string }) {
  const normalized = domain.toLowerCase()
  const match = domainIconMap.find((item) => normalized.includes(item.match))
  if (match?.language) {
    return <LanguageLogo language={match.language} size={24} />
  }
  const Icon = match?.icon ?? BookOpen
  return <Icon className="h-5 w-5" />
}

function tutorialHref(tutorial: TutorialRow): string {
  return `/tutorials/view/${tutorial.slug}/lesson-1`
}

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [tutorials, setTutorials] = useState<TutorialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadTutorials() {
      setLoading(true)
      setError(null)
      const response = await tutorialsAPI.list({ limit: '100' })
      if (!active) return

      if (response.error) {
        setError(response.error)
        setTutorials([])
      } else {
        setTutorials(normalizeTutorialList(response.data))
      }
      setLoading(false)
    }

    loadTutorials().catch((err) => {
      if (!active) return
      setError(err instanceof Error ? err.message : 'Failed to load tutorials')
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => buildCategories(tutorials), [tutorials])

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase()
    return categories.filter((category) => {
      if (!query) return true
      return (
        category.name.toLowerCase().includes(query) ||
        category.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [categories, search])

  const filteredTutorials = useMemo(() => {
    const query = search.toLowerCase()
    return tutorials.filter((tutorial) => {
      if (selectedCategory && categoryId(tutorial.domain) !== selectedCategory) return false
      if (!query) return true
      return (
        tutorial.title.toLowerCase().includes(query) ||
        tutorial.description.toLowerCase().includes(query) ||
        tutorial.domain.toLowerCase().includes(query) ||
        tutorial.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [tutorials, selectedCategory, search])

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
              Published library
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Library</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Browse tutorials that are published in the backend learning system.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search published tutorials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>

        {loading ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading tutorials</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
            <h3 className="font-semibold">Library unavailable</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Categories</h2>
                <span className="text-sm text-muted-foreground">{tutorials.length} tutorials</span>
              </div>
              {filteredCategories.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map((category, i) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          'group block w-full rounded-lg border bg-card p-6 text-left transition-all hover:border-primary/30',
                          selectedCategory === category.id ? 'border-primary/50' : 'border-border'
                        )}
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                            <DomainIcon domain={category.name} />
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {category.tutorials} published {category.tutorials === 1 ? 'tutorial' : 'tutorials'}
                        </p>
                        {category.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {category.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-10 text-center">
                  <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold">No categories found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different search term.</p>
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold">Tutorials</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm transition-colors',
                      !selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm transition-colors',
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTutorials.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <div className="divide-y divide-border">
                    {filteredTutorials.map((tutorial) => (
                      <Link
                        key={tutorial.id}
                        href={tutorialHref(tutorial)}
                        className="flex items-center gap-4 bg-card p-4 transition-colors hover:bg-card/80"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                          <DomainIcon domain={tutorial.domain} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{tutorial.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {tutorial.difficulty}
                            </Badge>
                            {tutorial.authorName && (
                              <Badge variant="secondary" className="text-xs">
                                {tutorial.authorName}
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{tutorial.description}</p>
                        </div>
                        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          Published
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-12 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <h3 className="font-semibold">No published tutorials found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Publish tutorials from the backend/admin workflow to populate this library.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
