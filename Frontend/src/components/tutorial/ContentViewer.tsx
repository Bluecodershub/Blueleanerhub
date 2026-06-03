'use client'

/**
 * ContentViewer — Renders tutorial markdown with code highlighting
 * and a "Mark Complete" action.
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { CheckCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TutorialSection } from './TutorialLayout'

interface ContentViewerProps {
  section: TutorialSection
  onComplete: () => Promise<void>
}

export default function ContentViewer({ section, onComplete }: ContentViewerProps) {
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (completing || section.completed) return
    setCompleting(true)
    try {
      await onComplete()
    } finally {
      setCompleting(false)
    }
  }

  return (
    <article className="mx-auto max-w-2xl px-8 py-10">
      {/* Section title */}
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {section.title}
      </h2>

      {/* Markdown content */}
      <div className="prose prose-gray dark:prose-invert prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-sm dark:prose-code:bg-gray-800 max-w-none">
        <ReactMarkdown
          components={{
            code({ node: _node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '')
              const lang = match ? match[1] : ''

              return !inline && lang ? (
                <SyntaxHighlighter
                  style={oneDark as any}
                  language={lang}
                  PreTag="div"
                  className="!rounded-lg !text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
          }}
        >
          {section.content}
        </ReactMarkdown>
      </div>

      {/* Complete button */}
      <div className="mt-12 flex items-center gap-4">
        {section.completed ? (
          <div className="flex items-center gap-2 text-foreground/90 dark:text-foreground/70">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Section completed</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
              completing
                ? 'cursor-wait bg-blue-400 text-white'
                : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
            )}
          >
            <Sparkles className="h-4 w-4" />
            {completing ? 'Saving...' : 'Mark as complete'}
            {!completing && (
              <span className="ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs">
                +{section.exerciseXpReward} XP
              </span>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
