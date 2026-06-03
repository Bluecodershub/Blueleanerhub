'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronDown, Loader2, RefreshCw } from 'lucide-react'
import SourcesPanel from './SourcesPanel'
import HighlightsPanel from './HighlightsPanel'
import ChatPanel from './ChatPanel'
import GeneratePanel from './GeneratePanel'
import CitationInspector from './CitationInspector'

interface Source {
  id: number
  title: string
  sourceType: 'text' | 'url' | 'pdf'
  chunkCount: number
  wordCount: number
  status: 'pending' | 'processing' | 'ready' | 'failed'
  createdAt: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: {
    source_id: number
    title: string
    snippet?: string
    chunk_index?: number
    similarity?: number
  }[]
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
  chunks: { chunkIndex: number; content: string }[]
}

interface Generation {
  id: number
  type: string
  title: string
  content: string
  createdAt: string
}

interface Notebook {
  id: number
  title: string
  emoji: string
  description: string | null
}

interface Props {
  notebookId: number
}

interface EndpointHealthMetric {
  success: number
  failure: number
  total_latency_ms: number
  last_latency_ms: number
  last_status_code: number
  total_calls: number
  avg_latency_ms: number
}

interface NotebookHealth {
  status: string
  service: string
  failure_rate: number
  metrics: Record<string, EndpointHealthMetric>
}

interface HealthSnapshot {
  ts: number
  failureRate: number
  avgLatencyMs: number
}

interface AdaptiveGuidanceItem {
  title: string
  insight: string
  action: string
  priority: 'high' | 'medium' | 'low'
  confidence: number
}

export default function NotebookWorkspace({ notebookId }: Props) {
  const router = useRouter()
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'generate'>('chat')
  const [leftTab, setLeftTab] = useState<'sources' | 'highlights'>('sources')
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [inspectorLoading, setInspectorLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState<SourceDetail | null>(null)
  const [focusSnippet, setFocusSnippet] = useState<string | undefined>(undefined)
  const [focusChunkIndex, setFocusChunkIndex] = useState<number | undefined>(undefined)
  const [annotationsRefreshToken, setAnnotationsRefreshToken] = useState(0)
  const [health, setHealth] = useState<NotebookHealth | null>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [healthDetailsOpen, setHealthDetailsOpen] = useState(false)
  const [healthHistory, setHealthHistory] = useState<HealthSnapshot[]>([])
  const [lastHealthSuccessAt, setLastHealthSuccessAt] = useState<number | null>(null)
  const [consecutiveHealthFailures, setConsecutiveHealthFailures] = useState(0)
  const [healthAlertDismissed, setHealthAlertDismissed] = useState(false)
  const [clockTick, setClockTick] = useState(Date.now())
  const [healthAutoRefreshPaused, setHealthAutoRefreshPaused] = useState(false)
  const [adaptiveGuidance, setAdaptiveGuidance] = useState<AdaptiveGuidanceItem[]>([])

  const loadNotebook = useCallback(async () => {
    try {
      const { data } = await api.get(`/notebooks/${notebookId}`)
      setNotebook(data.notebook)
      setSources(data.sources)
      setMessages(data.messages)
      setGenerations(data.generations)
    } catch (err) {
      console.error('Failed to load notebook', err)
    } finally {
      setLoading(false)
    }
  }, [notebookId])

  useEffect(() => {
    loadNotebook()
  }, [loadNotebook])

  const loadAdaptiveGuidance = useCallback(async () => {
    try {
      const { data } = await api.get(`/notebooks/${notebookId}/adaptive-guidance`)
      setAdaptiveGuidance(Array.isArray(data.guidance) ? data.guidance : [])
    } catch (err) {
      console.error('Failed to load adaptive guidance', err)
    }
  }, [notebookId])

  const loadHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const { data } = await api.get('/notebooks/health')
      const nextHealth: NotebookHealth = data.health
      setHealth(nextHealth)
      setHealthError(null)
      setLastHealthSuccessAt(Date.now())
      setConsecutiveHealthFailures(0)
      setHealthAlertDismissed(false)

      const metrics = Object.values(nextHealth.metrics || {})
      const avgLatencyMs = metrics.length
        ? metrics.reduce((acc, metric) => acc + metric.avg_latency_ms, 0) / metrics.length
        : 0

      setHealthHistory((prev) => [
        ...prev.slice(-19),
        {
          ts: Date.now(),
          failureRate: nextHealth.failure_rate || 0,
          avgLatencyMs,
        },
      ])
    } catch (err) {
      console.error('Failed to load notebooks health', err)
      setHealthError('Health unavailable')
      setConsecutiveHealthFailures((value) => value + 1)
    } finally {
      setHealthLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHealth()
  }, [loadHealth])

  useEffect(() => {
    loadAdaptiveGuidance()
  }, [loadAdaptiveGuidance])

  useEffect(() => {
    if (healthAutoRefreshPaused) return
    const timer = setInterval(() => {
      loadHealth()
      loadAdaptiveGuidance()
    }, 15000)
    return () => clearInterval(timer)
  }, [loadHealth, loadAdaptiveGuidance, healthAutoRefreshPaused])

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'r' || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      const active = document.activeElement as HTMLElement | null
      const tag = active?.tagName?.toLowerCase()
      const isTypingContext =
        !!active &&
        (active.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select')
      if (isTypingContext) return

      event.preventDefault()
      loadHealth()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [loadHealth])

  // Poll source status until all ready (for processing state feedback)
  useEffect(() => {
    const pending = sources.filter((s) => s.status === 'processing' || s.status === 'pending')
    if (pending.length === 0) return
    const timer = setTimeout(() => loadNotebook(), 3000)
    return () => clearTimeout(timer)
  }, [sources, loadNotebook])

  const handleOpenCitation = async (sourceId: number, snippet?: string, chunkIndex?: number) => {
    setInspectorOpen(true)
    setInspectorLoading(true)
    setFocusSnippet(snippet)
    setFocusChunkIndex(chunkIndex)
    try {
      const { data } = await api.get(`/notebooks/${notebookId}/sources/${sourceId}`, {
        params: chunkIndex !== undefined ? { focusChunkIndex: chunkIndex } : undefined,
      })
      setSelectedSource(data.source)
    } catch (err) {
      console.error('Failed to load source detail', err)
      setSelectedSource(null)
    } finally {
      setInspectorLoading(false)
    }

    api
      .post(`/notebooks/${notebookId}/behavior-events`, {
        eventType: 'citation_opened',
        eventPayload: { sourceId, chunkIndex: chunkIndex ?? null, hasSnippet: !!snippet },
      })
      .catch(() => {})
  }

  const handleSearchCitationSource = async (query: string) => {
    if (!selectedSource) return
    setInspectorLoading(true)
    try {
      const { data } = await api.get(`/notebooks/${notebookId}/sources/${selectedSource.id}`, {
        params: query
          ? { search: query }
          : focusChunkIndex !== undefined
            ? { focusChunkIndex }
            : undefined,
      })
      setSelectedSource(data.source)
    } catch (err) {
      console.error('Failed to search source detail', err)
    } finally {
      setInspectorLoading(false)
    }
  }

  useEffect(() => {
    api
      .post(`/notebooks/${notebookId}/behavior-events`, {
        eventType: 'workspace_opened',
        eventPayload: { notebookId },
      })
      .catch(() => {})
  }, [notebookId])

  useEffect(() => {
    api
      .post(`/notebooks/${notebookId}/behavior-events`, {
        eventType: 'workspace_tab_changed',
        eventPayload: { activeTab, leftTab },
      })
      .catch(() => {})
  }, [activeTab, leftTab, notebookId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    )
  }

  if (!notebook) {
    return (
      <div className="py-24 text-center">
        <p className="text-gray-500">Notebook not found.</p>
        <Button variant="link" onClick={() => router.push('/notebooks')}>
          Back to notebooks
        </Button>
      </div>
    )
  }

  const metricEntries = Object.entries(health?.metrics || {})
  const totalCalls = metricEntries.reduce((acc, [, metric]) => acc + metric.total_calls, 0)
  const endpointLabel: Record<string, string> = {
    ingest: 'Ingest',
    delete_chunks: 'Delete Chunks',
    chat: 'Chat',
    generate: 'Generate',
  }

  const buildSparklinePath = (values: number[], width: number, height: number) => {
    if (values.length < 2) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = Math.max(max - min, 0.0001)
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * width
        const y = height - ((value - min) / span) * height
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  const sparklineValues = healthHistory.map((item) => item.failureRate)
  const sparklinePath = buildSparklinePath(sparklineValues, 180, 34)

  const lastRefreshText = (() => {
    if (!lastHealthSuccessAt) return 'No successful refresh yet'
    const diffSec = Math.max(0, Math.floor((clockTick - lastHealthSuccessAt) / 1000))
    if (diffSec < 60) return 'Updated just now'
    const minutes = Math.floor(diffSec / 60)
    if (minutes < 60) return `Updated ${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `Updated ${hours}h ago`
  })()

  const showHealthAlert = consecutiveHealthFailures >= 3 && !healthAlertDismissed

  const metricTone = (metric: EndpointHealthMetric) => {
    const failureRatio = metric.total_calls > 0 ? metric.failure / metric.total_calls : 0
    const unhealthyStatus = metric.last_status_code >= 500

    if (failureRatio >= 0.2 || unhealthyStatus) {
      return {
        dot: 'bg-red-500',
        border: 'border-red-200 dark:border-red-900/40',
        bg: 'bg-red-50 dark:bg-red-950/20',
      }
    }
    if (failureRatio > 0 || metric.avg_latency_ms > 1200) {
      return {
        dot: 'bg-primary',
        border: 'border-border dark:border-border/40',
        bg: 'bg-secondary dark:bg-background/20',
      }
    }
    return {
      dot: 'bg-blue-500',
      border: 'border-blue-200 dark:border-blue-900/40',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    }
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-4rem)] max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-background/35 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-blue-500/12 absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-primary/12 absolute -right-20 top-16 h-64 w-64 rounded-full blur-3xl" />
      </div>
      {/* Top bar */}
      <div className="relative shrink-0 border-b border-white/10 bg-white/85 px-4 py-3 backdrop-blur-xl dark:bg-gray-900/75">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/notebooks')}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xl">{notebook.emoji}</span>
          <h1 className="truncate font-semibold text-gray-900 dark:text-white">{notebook.title}</h1>
          {notebook.description && (
            <span className="hidden truncate text-sm text-gray-400 dark:text-gray-500 md:block">
              — {notebook.description}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-blue-100/80 bg-white/80 px-2.5 py-1.5 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${healthError ? 'bg-red-500' : (health?.failure_rate || 0) > 0.15 ? 'bg-primary' : 'bg-blue-500'}`}
            />
            <span className="text-gray-600 dark:text-gray-300">
              AI Health:{' '}
              {healthError
                ? 'Unavailable'
                : health
                  ? `${Math.round((1 - health.failure_rate) * 100)}%`
                  : 'Loading'}
            </span>
            {health && (
              <span className="hidden text-gray-500 dark:text-gray-400 md:inline">
                Avg{' '}
                {Object.values(health.metrics).length > 0
                  ? Math.round(
                      Object.values(health.metrics).reduce(
                        (acc, metric) => acc + metric.avg_latency_ms,
                        0
                      ) / Object.values(health.metrics).length
                    )
                  : 0}
                ms
              </span>
            )}
            <button
              type="button"
              onClick={loadHealth}
              className="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Refresh notebooks health"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setHealthDetailsOpen((value) => !value)}
              className="text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Toggle notebooks health details"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${healthDetailsOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>{lastRefreshText}</span>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline">
              Press{' '}
              <kbd className="rounded border border-gray-300 px-1 py-0.5 text-[10px] dark:border-gray-600">
                R
              </kbd>{' '}
              to refresh
            </span>
            {consecutiveHealthFailures > 0 && (
              <span>Retry failures: {consecutiveHealthFailures}</span>
            )}
            <button
              type="button"
              onClick={() => setHealthAutoRefreshPaused((value) => !value)}
              className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {healthAutoRefreshPaused ? 'Resume Auto-Refresh' : 'Pause Auto-Refresh'}
            </button>
          </div>
        </div>

        {showHealthAlert && (
          <div
            className="mt-2 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            role="alert"
            aria-live="polite"
          >
            <span>Notebook AI health checks failed repeatedly. Diagnostics may be stale.</span>
            <button
              type="button"
              onClick={() => setHealthAlertDismissed(true)}
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {adaptiveGuidance.length > 0 && (
          <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-2 dark:border-blue-900/50 dark:bg-blue-950/25">
            <p className="mb-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Adaptive Guidance
            </p>
            <div className="space-y-1.5">
              {adaptiveGuidance.slice(0, 2).map((item, idx) => (
                <div key={idx} className="text-[11px] text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">{item.title}:</span> {item.action}
                </div>
              ))}
            </div>
          </div>
        )}

        {healthDetailsOpen && (
          <div className="mt-3 rounded-lg border border-blue-100/70 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-800/75">
            {healthError || !health ? (
              <p className="text-xs text-red-500">Detailed health data is currently unavailable.</p>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Total API calls: {totalCalls}</span>
                  <span>Failure rate: {(health.failure_rate * 100).toFixed(2)}%</span>
                </div>
                <div className="mb-3 rounded-md border border-gray-200 bg-white px-2 py-2 dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Failure trend</span>
                    <span>{healthHistory.length} samples</span>
                  </div>
                  <svg viewBox="0 0 180 34" className="h-9 w-full">
                    <path
                      d="M0,33 L180,33"
                      stroke="currentColor"
                      className="text-gray-200 dark:text-gray-700"
                      strokeWidth="1"
                      fill="none"
                    />
                    {sparklinePath && (
                      <path
                        d={sparklinePath}
                        stroke="currentColor"
                        className="text-primary/80"
                        strokeWidth="2"
                        fill="none"
                      />
                    )}
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {metricEntries.map(([key, metric]) => (
                    <div
                      key={key}
                      className={`rounded-md border p-2.5 ${metricTone(metric).border} ${metricTone(metric).bg}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${metricTone(metric).dot}`} />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                          {endpointLabel[key] || key}
                        </p>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Calls: {metric.total_calls}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Success: {metric.success}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Failures: {metric.failure}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Avg latency: {metric.avg_latency_ms}ms
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Last status: {metric.last_status_code || '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Three-pane layout */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* LEFT: Sources panel */}
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-white/10 bg-white/60 backdrop-blur-xl dark:bg-gray-900/45">
          <div className="sticky top-0 z-10 flex border-b border-white/10 bg-white/70 px-3 pt-3 backdrop-blur dark:bg-gray-900/55">
            {(['sources', 'highlights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setLeftTab(tab)}
                className={`flex-1 border-b-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  leftTab === tab
                    ? 'border-blue-500 text-primary dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {leftTab === 'sources' ? (
              <motion.div
                key="sources-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <SourcesPanel
                  notebookId={notebookId}
                  sources={sources}
                  onSourcesChange={setSources}
                />
              </motion.div>
            ) : (
              <motion.div
                key="highlights-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <HighlightsPanel
                  notebookId={notebookId}
                  refreshToken={annotationsRefreshToken}
                  onOpenCitation={handleOpenCitation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* CENTER: Chat / Generate (tabbed) */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background/10">
          {/* Tab bar */}
          <div className="flex shrink-0 border-b border-white/10 bg-white/75 px-4 backdrop-blur dark:bg-gray-900/65">
            {(['chat', 'generate'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-primary dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'chat' ? '💬 Chat' : '✨ Generate'}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'chat' ? (
                <motion.div
                  key="chat-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <ChatPanel
                    notebookId={notebookId}
                    messages={messages}
                    onMessagesChange={setMessages}
                    sources={sources}
                    onOpenCitation={handleOpenCitation}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="generate-panel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full"
                >
                  <GeneratePanel
                    notebookId={notebookId}
                    generations={generations}
                    onGenerationsChange={setGenerations}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CitationInspector
        notebookId={notebookId}
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        source={selectedSource}
        loading={inspectorLoading}
        focusSnippet={focusSnippet}
        focusChunkIndex={focusChunkIndex}
        onSearch={handleSearchCitationSource}
        onAnnotationsChanged={() => setAnnotationsRefreshToken((value) => value + 1)}
      />
    </div>
  )
}
