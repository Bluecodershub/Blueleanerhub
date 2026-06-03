'use client'

/**
 * QuestionCard — Q&A question summary for browse/search views
 * Design: compact, data-dense, Stripe-inspired
 */

import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { generateAvatarURL } from '@/utils/generateAvatar'

interface QuestionCardProps {
  id: number
  title: string
  domain?: string
  voteScore: number
  answerCount: number
  viewCount: number
  isAnswered: boolean
  tags?: string[]
  authorName: string
  authorAvatarConfig?: any
  createdAt: string
}

export default function QuestionCard({
  id,
  title,
  domain,
  voteScore,
  answerCount,
  viewCount,
  isAnswered,
  tags = [],
  authorName,
  authorAvatarConfig,
  createdAt,
}: QuestionCardProps) {
  return (
    <div className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-900">
      {/* Stats column */}
      <div className="flex w-20 flex-shrink-0 flex-col items-end gap-2 text-right">
        <Stat value={voteScore} label="votes" highlight={voteScore > 10} />
        <Stat
          value={answerCount}
          label="answers"
          highlight={isAnswered}
          icon={isAnswered ? <CheckCircle2 className="h-3 w-3 text-foreground/80" /> : null}
          highlightColor="emerald"
        />
        <Stat value={viewCount} label="views" />
      </div>

      {/* Content column */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/qna/questions/${id}`}
          className="line-clamp-2 block text-base font-semibold text-gray-900 transition-colors group-hover:text-primary dark:text-white dark:group-hover:text-blue-400"
        >
          {title}
        </Link>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          {domain && (
            <>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium dark:bg-gray-800">
                {domain}
              </span>
              <span>·</span>
            </>
          )}
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 overflow-hidden rounded-full bg-muted">
              {authorAvatarConfig ? (
                <img
                  src={generateAvatarURL(authorAvatarConfig)}
                  alt={authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-[8px] font-bold text-primary">
                  {authorName.charAt(0)}
                </div>
              )}
            </div>
            <span>{authorName}</span>
          </div>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}

function Stat({
  value,
  label,
  highlight = false,
  highlightColor = 'blue',
  icon = null,
}: {
  value: number
  label: string
  highlight?: boolean
  highlightColor?: 'blue' | 'emerald'
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-end rounded-lg px-2 py-1 text-right',
        highlight && highlightColor === 'blue' && 'bg-blue-50 dark:bg-blue-950',
        highlight && highlightColor === 'emerald' && 'bg-secondary dark:bg-background'
      )}
    >
      <div className="flex items-center gap-1">
        {icon}
        <span
          className={cn(
            'text-base font-bold tabular-nums',
            highlight && highlightColor === 'blue' && 'text-blue-700 dark:text-blue-300',
            highlight && highlightColor === 'emerald' && 'text-foreground dark:text-foreground/60',
            !highlight && 'text-gray-700 dark:text-gray-300'
          )}
        >
          {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  )
}
