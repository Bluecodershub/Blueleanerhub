'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, Code2, Lock, Globe, Loader2, Folder, UserX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { reposAPI } from '@/lib/api-civilization'

const LANG_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572A5',
  rust: '#dea584',
  go: '#00ADD8',
  shell: '#89e051',
  css: '#563d7c',
  java: '#b07219',
  cpp: '#f34b7d',
  c: '#555555',
}

interface Repo {
  id: string
  name: string
  slug: string
  description?: string
  language?: string
  visibility: 'public' | 'private'
  starCount: number
  forkCount: number
  topics: string[]
}

function normalizeRepo(raw: any): Repo {
  return {
    id: raw._id ?? raw.id,
    name: raw.name,
    slug: raw.slug ?? raw.name,
    description: raw.description,
    language: raw.language,
    visibility: (raw.visibility ?? 'public') as 'public' | 'private',
    starCount: raw.starCount ?? 0,
    forkCount: raw.forkCount ?? 0,
    topics: raw.topics ?? [],
  }
}

export default function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = React.use(params)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    reposAPI
      .getUserRepos(encodeURIComponent(username))
      .then((d: any) => {
        if (!active) return
        const list = d?.data?.data ?? d?.data
        if (Array.isArray(list)) {
          setRepos(list.map(normalizeRepo))
        } else {
          setNotFound(true)
        }
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [username])

  const displayName = decodeURIComponent(username)
  const totalStars = repos.reduce((s, r) => s + r.starCount, 0)
  const publicCount = repos.filter((r) => r.visibility === 'public').length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading developer profile…</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-center text-white">
        <div>
          <UserX className="mx-auto mb-4 h-14 w-14 opacity-20" />
          <h1 className="mb-1 text-xl font-bold">Developer not found</h1>
          <p className="mb-6 text-sm text-gray-500">
            No developer matches “{displayName}”.
          </p>
          <Link href="/dev" className="text-sm font-semibold text-sky-400 hover:underline">
            Back to Developer Portal
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar — only real, sourced fields */}
          <aside className="shrink-0 lg:w-64">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex flex-col items-center lg:items-start">
                <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-600 text-3xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold">{displayName}</h1>
                <p className="text-sm text-gray-400">Developer</p>
              </div>
            </motion.div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1">
            {/* Real derived stats */}
            <div className="mb-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Repositories', value: repos.length, icon: Code2, color: 'text-sky-400' },
                { label: 'Public', value: publicCount, icon: Globe, color: 'text-foreground/70' },
                { label: 'Total Stars', value: totalStars, icon: Star, color: 'text-foreground/70' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-gray-800 bg-gray-900">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className={`h-5 w-5 ${color} shrink-0`} />
                    <div>
                      <p className="text-lg font-bold text-white">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h2 className="mb-3 text-sm font-semibold text-white">Repositories</h2>

            {repos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
                <Folder className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-semibold text-gray-400">No public repositories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {repos.map((repo, i) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/dev/${encodeURIComponent(username)}/${repo.slug}`}>
                      <Card className="group h-full border-gray-800 bg-gray-900 transition-all hover:border-gray-700">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex min-w-0 items-center gap-2">
                              {repo.visibility === 'private' ? (
                                <Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                              ) : (
                                <Globe className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                              )}
                              <span className="truncate text-sm font-semibold text-sky-400 group-hover:text-sky-300">
                                {repo.name}
                              </span>
                            </div>
                            <Badge className="shrink-0 border border-gray-700 bg-gray-800 text-[10px] text-gray-400">
                              {repo.visibility}
                            </Badge>
                          </div>
                          {repo.description && (
                            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            {repo.language && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: LANG_COLORS[repo.language.toLowerCase()] ?? '#888' }}
                                />
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              {repo.starCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="h-3 w-3" />
                              {repo.forkCount}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
