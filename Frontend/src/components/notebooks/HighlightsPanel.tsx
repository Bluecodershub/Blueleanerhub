'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Bookmark, Quote, Loader2 } from 'lucide-react'

interface HighlightItem {
  id: number
  sourceId: number
  sourceTitle: string
  quote: string
  note: string | null
  chunkIndex: number | null
  createdAt: string
}

interface Props {
  notebookId: number
  refreshToken: number
  onOpenCitation: (sourceId: number, snippet?: string, chunkIndex?: number) => void
}

export default function HighlightsPanel({ notebookId, refreshToken, onOpenCitation }: Props) {
  const [items, setItems] = useState<HighlightItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    api
      .get(`/notebooks/${notebookId}/annotations`)
      .then(({ data }) => {
        if (active) setItems(data.annotations || [])
      })
      .catch((err) => console.error('Failed to load notebook annotations', err))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [notebookId, refreshToken])

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto bg-white/40 p-4 dark:bg-transparent">
      <div className="flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-primary/80" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          Highlights
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading highlights...
        </div>
      ) : items.length === 0 ? (
        <div className="px-2 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
          Saved highlights will appear here when you bookmark source evidence.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onOpenCitation(item.sourceId, item.quote, item.chunkIndex ?? undefined)
              }
              className="w-full rounded-xl border border-blue-100/80 bg-white/90 p-3 text-left shadow-sm backdrop-blur transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-blue-600"
            >
              <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                <Quote className="h-3.5 w-3.5" />
                {item.sourceTitle}
              </div>
              <div className="line-clamp-4 whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">
                {item.quote}
              </div>
              {item.note ? (
                <div className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-gray-500 dark:text-gray-400">
                  {item.note}
                </div>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
