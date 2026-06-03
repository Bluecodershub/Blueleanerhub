'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FileText,
  Globe,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Source {
  id: number
  title: string
  sourceType: 'text' | 'url' | 'pdf'
  chunkCount: number
  wordCount: number
  status: 'pending' | 'processing' | 'ready' | 'failed'
  createdAt: string
}

interface Props {
  notebookId: number
  sources: Source[]
  onSourcesChange: React.Dispatch<React.SetStateAction<Source[]>>
}

type AddMode = 'text' | 'url' | null

const STATUS_ICON = {
  ready: <CheckCircle2 className="h-3.5 w-3.5 text-primary/80" />,
  processing: <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />,
  pending: <Clock className="h-3.5 w-3.5 text-gray-400" />,
  failed: <AlertCircle className="h-3.5 w-3.5 text-red-400" />,
}

export default function SourcesPanel({ notebookId, sources, onSourcesChange }: Props) {
  const [addMode, setAddMode] = useState<AddMode>(null)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  const resetForm = () => {
    setTitle('')
    setContent('')
    setUrl('')
    setAddMode(null)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    try {
      const payload: Record<string, string> = {
        sourceType: addMode!,
        title: title.trim() || (addMode === 'url' ? url : 'Pasted Text'),
      }
      if (addMode === 'text') payload.content = content
      if (addMode === 'url') payload.url = url

      const { data } = await api.post(`/notebooks/${notebookId}/sources`, payload)
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'source_added',
          eventPayload: {
            sourceType: addMode,
            contentSize: addMode === 'text' ? content.length : url.length,
          },
        })
        .catch(() => {})
      onSourcesChange((prev) => [...prev, data.source])
      resetForm()
    } catch (err) {
      console.error('Failed to add source', err)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (sid: number) => {
    if (!confirm('Remove this source?')) return
    try {
      await api.delete(`/notebooks/${notebookId}/sources/${sid}`)
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'source_deleted',
          eventPayload: { sourceId: sid },
        })
        .catch(() => {})
      onSourcesChange((prev) => prev.filter((s) => s.id !== sid))
    } catch (err) {
      console.error('Failed to delete source', err)
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.')
      return
    }

    setUploadingPdf(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post(`/notebooks/${notebookId}/sources/pdf`, formData)
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'pdf_source_uploaded',
          eventPayload: { fileName: file.name, fileSize: file.size },
        })
        .catch(() => {})
      onSourcesChange((prev) => [...prev, data.source])
    } catch (err) {
      console.error('Failed to upload PDF', err)
    } finally {
      setUploadingPdf(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 bg-white/40 p-4 dark:bg-transparent">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
          Sources ({sources.length})
        </h2>
      </div>

      {/* Add buttons */}
      {addMode === null && (
        <div className="flex gap-2">
          <button
            onClick={() => setAddMode('text')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300
                       px-3 py-2 text-xs font-medium text-gray-500
                       transition-colors hover:border-blue-400 hover:text-primary/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-gray-600
                       dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <FileText className="h-3.5 w-3.5" /> Paste text
          </button>
          <button
            onClick={() => setAddMode('url')}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300
                       px-3 py-2 text-xs font-medium text-gray-500
                       transition-colors hover:border-blue-400 hover:text-primary/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:border-gray-600
                       dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            <Globe className="h-3.5 w-3.5" /> Add URL
          </button>
          <label
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed
                       border-gray-300 px-3 py-2 text-xs font-medium
                       text-gray-500 transition-colors hover:border-blue-400 hover:text-primary/80
                       dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400"
          >
            {uploadingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />
          </label>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {addMode !== null && (
          <motion.form
            key="add-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleAdd}
            className="flex flex-col gap-2 rounded-xl border border-blue-100/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/90"
          >
            <Input
              placeholder={addMode === 'url' ? 'Source title (optional)' : 'Source title'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
            />
            {addMode === 'text' ? (
              <textarea
                placeholder="Paste your notes, lecture transcripts, or any text content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={6}
                className="w-full resize-none rounded-lg border border-gray-200 bg-transparent px-3
                           py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:text-white"
              />
            ) : (
              <Input
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="h-8 text-sm"
              />
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  adding ||
                  (addMode === 'text' && !content.trim()) ||
                  (addMode === 'url' && !url.trim())
                }
                className="h-7 bg-primary px-3 text-xs text-white hover:bg-primary/90"
              >
                {adding ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="mr-1 h-3 w-3" />
                )}
                Add
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Source list */}
      <div className="flex flex-col gap-2 overflow-y-auto">
        <AnimatePresence>
          {sources.map((src) => (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="group overflow-hidden rounded-xl border border-blue-100/70 bg-white/90 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/90"
            >
              <div
                role="button"
                tabIndex={0}
                className="flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-blue-50/70 dark:hover:bg-gray-700/50"
                onClick={() => setExpanded(expanded === src.id ? null : src.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setExpanded(expanded === src.id ? null : src.id)
                  }
                }}
              >
                <div className="shrink-0">
                  {src.sourceType === 'url' ? (
                    <Globe className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </div>
                <span className="flex-1 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {src.title}
                </span>
                {STATUS_ICON[src.status]}
                <button
                  type="button"
                  aria-label={`Delete source ${src.title}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(src.id)
                  }}
                  className="p-0.5 text-gray-400 opacity-0 transition-all hover:text-red-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                {expanded === src.id ? (
                  <ChevronUp className="h-3 w-3 shrink-0 text-gray-400" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
                )}
              </div>

              <AnimatePresence>
                {expanded === src.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-4 border-t border-gray-100 px-3 pb-2.5 pt-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
                      <span>{src.wordCount.toLocaleString()} words</span>
                      <span>{src.chunkCount} chunks</span>
                      <span className="capitalize">{src.status}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {sources.length === 0 && addMode === null && (
          <p className="px-2 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
            Add sources above — paste notes, lecture content, or web URLs.
          </p>
        )}
      </div>
    </div>
  )
}
