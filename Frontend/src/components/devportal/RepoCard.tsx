'use client'

/**
 * RepoCard — Repository summary card for the developer portal
 * Design: GitHub-inspired, Linear-clean
 */

import React from 'react'
import Link from 'next/link'
import { Star, GitFork, Lock, Globe, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const LANG_COLORS: Record<string, string> = {
  python: '#3572A5',
  javascript: '#f1e05a',
  typescript: '#3178c6',
  java: '#b07219',
  cpp: '#f34b7d',
  rust: '#dea584',
  go: '#00ADD8',
  html: '#e34c26',
  css: '#563d7c',
  sql: '#e38c00',
}

interface RepoCardProps {
  id: number
  ownerSlug: string
  slug: string
  name: string
  description?: string
  language?: string
  visibility: 'public' | 'private'
  starCount: number
  forkCount: number
  topics?: string[]
  updatedAt: string
}

export default function RepoCard({
  id: _id,
  ownerSlug,
  slug,
  name,
  description,
  language,
  visibility,
  starCount,
  forkCount,
  topics = [],
  updatedAt,
}: RepoCardProps) {
  const langColor = language ? LANG_COLORS[language.toLowerCase()] : undefined

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-sky-200 hover:shadow-sm dark:border-border dark:bg-background-secondary dark:hover:border-sky-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {visibility === 'private' ? (
              <Lock className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            ) : (
              <Globe className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            )}
            <Link
              href={`/dev/${ownerSlug}/${slug}`}
              className="truncate text-base font-semibold text-primary hover:underline dark:text-sky-400"
            >
              {name}
            </Link>
          </div>

          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topics.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        {language && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: langColor ?? '#888' }}
            />
            <span>{language}</span>
          </div>
        )}

        {starCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            <span>{starCount}</span>
          </div>
        )}

        {forkCount > 0 && (
          <div className="flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            <span>{forkCount}</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}
