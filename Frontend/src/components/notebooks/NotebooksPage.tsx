'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  ArrowRight,
  FileText,
  Loader2,
  Sparkles,
  BookMarked,
} from 'lucide-react'

interface Notebook {
  id: number
  title: string
  description: string | null
  emoji: string
  sourceCount: number
  createdAt: string
  updatedAt: string
}

const EMOJIS = ['📓', '📚', '🧠', '💡', '🔬', '📐', '🌍', '⚡', '🎯', '🏆']

export default function NotebooksPage() {
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', emoji: '📓' })

  useEffect(() => {
    fetchNotebooks()
  }, [])

  const fetchNotebooks = async () => {
    try {
      const { data } = await api.get('/notebooks')
      setNotebooks(data.notebooks)
    } catch (err) {
      console.error('Failed to load notebooks', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post('/notebooks', form)
      setNotebooks((prev) => [data.notebook, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', emoji: '📓' })
      router.push(`/notebooks/${data.notebook.id}`)
    } catch (err) {
      console.error('Failed to create notebook', err)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this notebook and all its content?')) return
    try {
      await api.delete(`/notebooks/${id}`)
      setNotebooks((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error('Failed to delete', err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    )
  }

  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
              <Sparkles className="h-6 w-6 text-primary dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Notebooks</h1>
          </div>
          <p className="ml-14 text-sm text-gray-500 dark:text-gray-400">
            Upload your materials and chat with an AI tutor grounded in your content
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Notebook
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 rounded-2xl border border-blue-100/70 bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur dark:border-gray-700 dark:bg-gray-800/90"
          >
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              New Notebook
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Emoji picker */}
              <div>
                <label className="mb-2 block text-sm text-gray-600 dark:text-gray-400">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                      className={`rounded-lg border-2 p-2 text-xl transition-colors ${
                        form.emoji === e
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                placeholder="Notebook title (e.g. Thermodynamics Exam Prep)"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                autoFocus
              />
              <Input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !form.title.trim()}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Notebook
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notebook grid */}
      {notebooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
            <BookMarked className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            No notebooks yet
          </h3>
          <p className="mb-6 max-w-xs text-sm text-gray-400 dark:text-gray-500">
            Create a notebook, add your study materials, and start asking questions with AI support.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first notebook
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {notebooks.map((nb, i) => (
              <motion.div
                key={nb.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/notebooks/${nb.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    router.push(`/notebooks/${nb.id}`)
                  }
                }}
                className="group relative cursor-pointer rounded-2xl border border-blue-100/80 bg-white/95 p-5
                           shadow-[0_10px_35px_rgba(15,23,42,0.08)] transition-all hover:border-blue-300
                           hover:shadow-[0_20px_55px_rgba(14,116,144,0.16)] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-blue-600"
              >
                {/* Delete button */}
                <button
                  type="button"
                  aria-label={`Delete notebook ${nb.title}`}
                  onClick={(e) => handleDelete(nb.id, e)}
                  className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-red-50
                             hover:text-red-500 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2
                             focus-visible:ring-red-500/70 group-focus-within:opacity-100 group-hover:opacity-100 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Emoji + title */}
                <div className="mb-3 flex items-start gap-3">
                  <span className="text-3xl">{nb.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate pr-6 font-semibold text-gray-900 dark:text-white">
                      {nb.title}
                    </h3>
                    {nb.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                        {nb.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    <span>
                      {nb.sourceCount} {nb.sourceCount === 1 ? 'source' : 'sources'}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-1 text-xs font-medium text-primary/80
                                  transition-all group-hover:gap-2"
                  >
                    Open
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
