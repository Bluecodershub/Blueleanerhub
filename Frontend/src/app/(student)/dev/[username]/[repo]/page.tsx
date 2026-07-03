'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  GitFork,
  GitBranch,
  Code2,
  Bug,
  GitMerge,
  ChevronRight,
  File,
  Folder,
  Clock,
  Loader2,
  FolderX,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { reposAPI } from '@/lib/api-civilization'

function relTime(value?: string) {
  if (!value) return ''
  const d = new Date(value)
  return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
}

interface FileNode {
  name: string
  type: 'dir' | 'file'
  path?: string
}

/** Flattens the top level of the buildTree() response into a sorted list. */
function topLevelEntries(tree: any): FileNode[] {
  if (!tree || typeof tree !== 'object') return []
  const entries: FileNode[] = Object.entries(tree).map(([name, val]: [string, any]) => {
    if (val && val.__type === 'file') return { name, type: 'file', path: val.path }
    return { name, type: 'dir' }
  })
  return entries.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1))
}

export default function RepositoryPage({
  params,
}: {
  params: Promise<{ username: string; repo: string }>
}) {
  const { username, repo: repoSlug } = React.use(params)
  const [activeTab, setActiveTab] = useState('code')
  const [loading, setLoading] = useState(true)
  const [repo, setRepo] = useState<any | null>(null)
  const [starred, setStarred] = useState(false)
  const [issues, setIssues] = useState<any[]>([])
  const [pulls, setPulls] = useState<any[]>([])

  useEffect(() => {
    let active = true
    reposAPI
      .getRepo(encodeURIComponent(username), encodeURIComponent(repoSlug))
      .then((d: any) => {
        if (!active) return
        const data = d?.data?.data
        if (data && (data._id || data.name)) {
          setRepo(data)
          setStarred(Boolean(data.isStarred))
          const repoId = data._id ?? data.id
          if (repoId) {
            reposAPI.listIssues(repoId).then((r: any) => active && setIssues(r?.data?.data ?? [])).catch(() => {})
            reposAPI.listPRs(repoId).then((r: any) => active && setPulls(r?.data?.data ?? [])).catch(() => {})
          }
        } else {
          setRepo(null)
        }
      })
      .catch(() => active && setRepo(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [username, repoSlug])

  const handleStar = async () => {
    if (!repo?._id) return
    setStarred((s) => !s)
    try {
      await reposAPI.toggleStar(repo._id)
    } catch {
      setStarred((s) => !s) // revert on failure
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading repository…</p>
        </div>
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-center text-white">
        <div>
          <FolderX className="mx-auto mb-4 h-14 w-14 opacity-20" />
          <h1 className="mb-1 text-xl font-bold">Repository not found</h1>
          <p className="mb-6 text-sm text-gray-500">
            “{decodeURIComponent(username)}/{decodeURIComponent(repoSlug)}” does not exist or is private.
          </p>
          <Link href="/dev" className="text-sm font-semibold text-sky-400 hover:underline">
            Back to Developer Portal
          </Link>
        </div>
      </div>
    )
  }

  const files = topLevelEntries(repo.files)
  const recentCommits: any[] = Array.isArray(repo.recentCommits) ? repo.recentCommits : []
  const topics: string[] = repo.topics ?? []
  const openIssues = issues.filter((i) => (i.status ?? i.state) === 'open' || (i.status ?? i.state) === 'OPEN')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          <Link href="/dev" className="text-sky-400 hover:underline">dev</Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          <Link href={`/dev/${encodeURIComponent(username)}`} className="text-sky-400 hover:underline">
            {decodeURIComponent(username)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
          <span className="font-semibold text-white">{repo.name}</span>
          <Badge className="ml-1 bg-gray-800 text-[10px] text-gray-400">{repo.visibility}</Badge>
        </div>

        {/* Repo header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              {repo.description && <p className="max-w-xl text-sm text-gray-400">{repo.description}</p>}
              {topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topics.map((t) => (
                    <span key={t} className="rounded-full bg-sky-950 px-2.5 py-0.5 text-xs text-sky-400">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleStar}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  starred
                    ? 'border-primary bg-background text-foreground/70'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-primary'
                }`}
              >
                <Star className={`h-4 w-4 ${starred ? 'fill-foreground/70 text-foreground/70' : ''}`} />
                {starred ? 'Starred' : 'Star'} · {(repo.starCount ?? 0) + (starred && !repo.isStarred ? 1 : 0)}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mb-5 flex flex-wrap items-center gap-5 text-sm text-gray-500">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-sky-500" />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {repo.starCount ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="h-4 w-4" />1 branch
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {repo.totalCommits ?? recentCommits.length} commits
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-0 h-auto w-full justify-start gap-0 rounded-none border-b border-gray-800 bg-gray-900 px-0">
            {[
              { value: 'code', icon: Code2, label: 'Code' },
              { value: 'issues', icon: Bug, label: `Issues (${openIssues.length})` },
              { value: 'pulls', icon: GitMerge, label: `Pull Requests (${pulls.length})` },
              { value: 'commits', icon: Clock, label: 'Commits' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary/70 data-[state=active]:text-white data-[state=inactive]:text-gray-500"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Code tab */}
          <TabsContent value="code" className="mt-0">
            <div className="flex flex-col gap-4 pt-4 lg:flex-row">
              <div className="min-w-0 flex-1">
                {recentCommits[0] && (
                  <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-gray-800 bg-gray-900 px-4 py-2.5">
                    <span className="truncate text-sm text-gray-400">{recentCommits[0].message}</span>
                    <span className="ml-3 shrink-0 text-xs text-gray-500">{relTime(recentCommits[0].createdAt)}</span>
                  </div>
                )}
                <Card className={`${recentCommits[0] ? 'rounded-t-none' : ''} border-gray-800 bg-gray-900`}>
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center text-gray-500">
                      <Folder className="mb-3 h-10 w-10 opacity-30" />
                      <p className="text-sm">This repository has no files yet.</p>
                    </div>
                  ) : (
                    <div className="font-mono text-sm">
                      {files.map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center gap-2 border-b border-gray-800 px-3 py-2 transition-colors last:border-0 hover:bg-gray-800/50"
                        >
                          {f.type === 'dir' ? (
                            <Folder className="h-4 w-4 shrink-0 text-sky-400" />
                          ) : (
                            <File className="h-4 w-4 shrink-0 text-gray-500" />
                          )}
                          <span className={f.type === 'dir' ? 'text-sky-400' : 'text-gray-300'}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* About sidebar — real fields only */}
              <aside className="w-full shrink-0 space-y-3 lg:w-64">
                <Card className="border-gray-800 bg-gray-900">
                  <CardContent className="p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">About</p>
                    {repo.description ? (
                      <p className="text-sm text-gray-300">{repo.description}</p>
                    ) : (
                      <p className="text-sm text-gray-600">No description provided.</p>
                    )}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Star className="h-3.5 w-3.5" />
                        <span>{repo.starCount ?? 0} stars</span>
                      </div>
                      {repo.license && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <GitFork className="h-3.5 w-3.5" />
                          <span>{repo.license}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </TabsContent>

          {/* Issues tab — real */}
          <TabsContent value="issues" className="pt-4">
            <Card className="border-gray-800 bg-gray-900">
              {issues.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center text-gray-500">
                  <Bug className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">No issues opened yet.</p>
                </div>
              ) : (
                issues.map((issue, i) => (
                  <div
                    key={issue._id ?? issue.id ?? i}
                    className={`flex items-start gap-3 px-4 py-3.5 ${i < issues.length - 1 ? 'border-b border-gray-800' : ''}`}
                  >
                    <Bug className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{issue.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {issue.number ? `#${issue.number} ` : ''}opened {relTime(issue.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </TabsContent>

          {/* Commits tab — real (recent) */}
          <TabsContent value="commits" className="pt-4">
            <Card className="border-gray-800 bg-gray-900">
              {recentCommits.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center text-gray-500">
                  <Clock className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">No commits yet.</p>
                </div>
              ) : (
                recentCommits.map((c, i) => (
                  <div
                    key={c._id ?? c.hash ?? i}
                    className={`flex items-center gap-4 px-4 py-3 ${i < recentCommits.length - 1 ? 'border-b border-gray-800' : ''}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{c.message}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{relTime(c.createdAt)}</p>
                    </div>
                    {(c.hash ?? c.sha) && (
                      <span className="shrink-0 rounded bg-gray-800 px-2 py-0.5 font-mono text-xs text-sky-400">
                        {String(c.hash ?? c.sha).slice(0, 7)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </Card>
          </TabsContent>

          {/* Pull Requests tab — real */}
          <TabsContent value="pulls" className="pt-4">
            <Card className="border-gray-800 bg-gray-900">
              {pulls.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center text-gray-500">
                  <GitMerge className="mb-3 h-10 w-10 opacity-30" />
                  <p className="text-sm">No pull requests yet.</p>
                </div>
              ) : (
                pulls.map((pr, i) => (
                  <div
                    key={pr._id ?? pr.id ?? i}
                    className={`flex items-start gap-3 px-4 py-3.5 ${i < pulls.length - 1 ? 'border-b border-gray-800' : ''}`}
                  >
                    <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{pr.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {pr.number ? `#${pr.number} ` : ''}opened {relTime(pr.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
