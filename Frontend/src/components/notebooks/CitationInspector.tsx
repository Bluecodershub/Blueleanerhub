'use client'

import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollText, ExternalLink, Layers3, Search, BookmarkPlus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface SourceChunk {
  chunkIndex: number
  content: string
}

interface SourceDetail {
  id: number
  title: string
  sourceType: 'text' | 'url' | 'pdf'
  url?: string | null
  status: string
  wordCount: number
  chunkCount: number
  previewText: string
  focusChunkIndex?: number | null
  activeSearch?: string | null
  chunks: SourceChunk[]
}

interface Props {
  notebookId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  source: SourceDetail | null
  loading: boolean
  focusSnippet?: string
  focusChunkIndex?: number
  onSearch?: (query: string) => void
  onAnnotationsChanged?: () => void
}

interface Annotation {
  id: number
  quote: string
  note: string | null
  chunkIndex: number | null
  createdAt: string
}

export default function CitationInspector({
  notebookId,
  open,
  onOpenChange,
  source,
  loading,
  focusSnippet,
  focusChunkIndex,
  onSearch,
  onAnnotationsChanged,
}: Props) {
  const chunkRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [query, setQuery] = useState('')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [annotationLoading, setAnnotationLoading] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState('')
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || loading || focusChunkIndex === undefined || focusChunkIndex === null) return
    const timer = window.setTimeout(() => {
      chunkRefs.current[focusChunkIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [open, loading, focusChunkIndex, source?.id])

  useEffect(() => {
    setQuery(source?.activeSearch || '')
  }, [source?.id, source?.activeSearch])

  useEffect(() => {
    if (!source || !open) return
    setSelectedQuote(focusSnippet || '')
    setSelectedChunkIndex(focusChunkIndex ?? null)
    setNoteDraft('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.id, open, focusSnippet, focusChunkIndex])

  useEffect(() => {
    if (!open || !source) return
    setAnnotationLoading(true)
    api
      .get(`/notebooks/${notebookId}/sources/${source.id}/annotations`)
      .then(({ data }) => setAnnotations(data.annotations || []))
      .catch(() => console.error('Failed to load annotations'))
      .finally(() => setAnnotationLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source?.id, notebookId])

  const saveAnnotation = async () => {
    if (!source || !selectedQuote.trim()) return
    setSaving(true)
    try {
      const { data } = await api.post(`/notebooks/${notebookId}/sources/${source.id}/annotations`, {
        quote: selectedQuote.trim(),
        note: noteDraft.trim(),
        chunkIndex: selectedChunkIndex,
      })
      setAnnotations((prev) => [data.annotation, ...prev])
      setNoteDraft('')
      onAnnotationsChanged?.()
    } catch {
      console.error('Failed to save annotation')
    } finally {
      setSaving(false)
    }
  }

  const deleteAnnotation = async (annotationId: number) => {
    if (!source) return
    try {
      await api.delete(`/notebooks/${notebookId}/sources/${source.id}/annotations/${annotationId}`)
      setAnnotations((prev) => prev.filter((item) => item.id !== annotationId))
      onAnnotationsChanged?.()
    } catch {
      console.error('Failed to delete annotation')
    }
  }

  const safeSourceUrl = (() => {
    if (!source?.url) return null
    try {
      const parsed = new URL(source.url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null
    } catch {
      return null
    }
  })()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[85vh] w-[95vw] max-w-4xl overflow-hidden border border-white/10 bg-background/70 p-0 backdrop-blur-2xl">
        <div className="flex h-full flex-col">
          <DialogHeader className="border-b border-white/10 bg-white/70 px-6 py-4 backdrop-blur dark:bg-background-secondary/60">
            <DialogTitle className="flex items-center gap-2 text-left">
              <ScrollText className="h-5 w-5 text-primary/80" />
              {source?.title || 'Citation Inspector'}
            </DialogTitle>
            <DialogDescription className="text-left">
              Inspect the exact source material used to ground this answer.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 space-y-5 overflow-y-auto bg-white/45 px-6 py-4 dark:bg-transparent">
            {loading ? (
              <div className="text-sm text-gray-500">Loading source…</div>
            ) : !source ? (
              <div className="text-sm text-gray-500">No source selected.</div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 capitalize text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300">
                    {source.sourceType}
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-gray-600 dark:border-border dark:bg-card dark:text-muted-foreground">
                    {source.wordCount.toLocaleString()} words
                  </span>
                  <span className="rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-gray-600 dark:border-border dark:bg-card dark:text-muted-foreground">
                    {source.chunkCount} chunks
                  </span>
                  {safeSourceUrl ? (
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300"
                    >
                      Open original
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : source.url ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-gray-500 dark:border-border dark:bg-card dark:text-muted-foreground">
                      Invalid source URL
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search within this source..."
                    className="h-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        onSearch?.(query.trim())
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => onSearch?.(query.trim())}>
                    <Search className="mr-1 h-4 w-4" />
                    Search
                  </Button>
                </div>

                {focusSnippet ? (
                  <div className="rounded-xl border border-border bg-secondary p-3 dark:border-border dark:bg-muted/20">
                    <div className="mb-1 text-xs font-medium text-foreground dark:text-foreground/60">
                      Referenced snippet
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-foreground dark:text-foreground/90">
                      {focusSnippet}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3 rounded-xl border border-sky-200/80 bg-sky-50/85 p-4 shadow-sm dark:border-sky-800 dark:bg-sky-900/20">
                  <div className="flex items-center gap-2 text-sm font-medium text-sky-900 dark:text-sky-100">
                    <BookmarkPlus className="h-4 w-4" />
                    Save highlight
                  </div>
                  <Textarea
                    value={selectedQuote}
                    onChange={(e) => setSelectedQuote(e.target.value)}
                    placeholder="Select a cited snippet or choose a chunk below to save it here..."
                    rows={4}
                  />
                  <Textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add your own note about why this matters..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={saveAnnotation}
                      disabled={saving || !selectedQuote.trim()}
                    >
                      <BookmarkPlus className="mr-1 h-4 w-4" />
                      Save highlight
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-800 dark:text-foreground">
                    Saved highlights
                  </div>
                  {annotationLoading ? (
                    <div className="text-sm text-gray-500">Loading highlights…</div>
                  ) : annotations.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 p-3 text-sm text-gray-500 dark:border-border">
                      No saved highlights yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {annotations.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-sky-100/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-border dark:bg-background-secondary/80"
                        >
                          <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-foreground">
                            {item.quote}
                          </div>
                          {item.note ? (
                            <div className="mt-2 text-sm text-gray-600 dark:text-muted-foreground">
                              {item.note}
                            </div>
                          ) : null}
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                            <span>
                              {item.chunkIndex !== null
                                ? `Chunk ${item.chunkIndex}`
                                : 'Custom excerpt'}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteAnnotation(item.id)}
                              className="inline-flex items-center gap-1 transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-foreground">
                    <Layers3 className="h-4 w-4 text-primary/80" />
                    Extracted chunks
                  </div>
                  {source.chunks.length > 0 ? (
                    <div className="space-y-2">
                      {source.chunks.map((chunk) => {
                        const matchesFocus =
                          (focusChunkIndex !== undefined && chunk.chunkIndex === focusChunkIndex) ||
                          (focusSnippet && chunk.content.includes(focusSnippet.slice(0, 40)))
                        return (
                          <div
                            key={chunk.chunkIndex}
                            ref={(element) => {
                              chunkRefs.current[chunk.chunkIndex] = element
                            }}
                            className={`rounded-xl border p-3 ${
                              matchesFocus
                                ? 'border-border bg-secondary dark:border-border dark:bg-muted/20'
                                : 'border-sky-100/70 bg-white/90 backdrop-blur dark:border-border dark:bg-background-secondary/80'
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="text-[11px] uppercase tracking-wide text-gray-400">
                                Chunk {chunk.chunkIndex}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedQuote(chunk.content)
                                  setSelectedChunkIndex(chunk.chunkIndex)
                                }}
                                className="rounded text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 dark:text-sky-400"
                              >
                                Use as highlight
                              </button>
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-foreground">
                              {chunk.content}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 p-3 text-sm text-gray-500 dark:border-border">
                      {source.previewText}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
