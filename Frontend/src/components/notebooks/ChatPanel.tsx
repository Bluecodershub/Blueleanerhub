'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Bot, User, BookOpen, Trash2 } from 'lucide-react'

interface Source {
  id: number
  title: string
  status: string
}

interface CitedSource {
  source_id: number
  title: string
  snippet?: string
  chunk_index?: number
  similarity?: number
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: CitedSource[]
}

interface Props {
  notebookId: number
  messages: ChatMessage[]
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  sources: Source[]
  onOpenCitation: (sourceId: number, snippet?: string, chunkIndex?: number) => void
}

export default function ChatPanel({
  notebookId,
  messages,
  onMessagesChange,
  sources,
  onOpenCitation,
}: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bottom = bottomRef.current
    if (bottom) {
      bottom.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const readySources = sources.filter((s) => s.status === 'ready')

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || sending) return

    const userMessage: ChatMessage = { role: 'user', content: msg }
    onMessagesChange((prev) => [...prev, userMessage])
    setInput('')
    setSending(true)

    try {
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'chat_message_sent',
          eventPayload: { messageLength: msg.length },
        })
        .catch(() => {})

      const { data } = await api.post(`/notebooks/${notebookId}/chat`, { message: msg })
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      }
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'chat_answer_received',
          eventPayload: {
            answerLength: String(data.answer || '').length,
            sourceCount: Array.isArray(data.sources) ? data.sources.length : 0,
          },
        })
        .catch(() => {})
      onMessagesChange((prev) => [...prev, assistantMessage])
    } catch {
      api
        .post(`/notebooks/${notebookId}/behavior-events`, {
          eventType: 'chat_error',
          eventPayload: { stage: 'chat_request' },
        })
        .catch(() => {})
      onMessagesChange((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('Clear the chat history?')) return
    setClearing(true)
    try {
      await api.delete(`/notebooks/${notebookId}/chat`)
      onMessagesChange([])
    } catch {
      console.error('Failed to clear chat')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-white/35 dark:bg-transparent">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-sky-500/10 to-transparent" />
      {/* Chat header */}
      <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-white/65 px-4 py-2 backdrop-blur dark:bg-background-secondary/55">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary/80" />
          <span className="text-xs text-gray-500 dark:text-muted-foreground">
            {readySources.length === 0
              ? 'Add sources to start chatting'
              : `Grounded in ${readySources.length} source${readySources.length === 1 ? '' : 's'}`}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1 rounded text-xs text-gray-400 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-full bg-sky-50 p-3 dark:bg-sky-900/20">
              <Bot className="h-8 w-8 text-primary/80" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-muted-foreground">
              Ask anything about your sources
            </h3>
            <p className="max-w-xs text-xs text-gray-400 dark:text-muted-foreground">
              {readySources.length === 0
                ? 'Add some sources in the Sources panel, then come back to chat.'
                : "I'll answer based only on what's in your notebook, with citations."}
            </p>
            {readySources.length > 0 && (
              <div className="mt-4 flex max-w-sm flex-wrap justify-center gap-2">
                {[
                  'Summarise the key points',
                  'What are the main concepts?',
                  'Explain in simple terms',
                  'What are the most important formulas?',
                ].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5
                               text-xs text-primary transition-colors hover:bg-sky-100
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 dark:border-sky-800
                               dark:bg-sky-900/20 dark:text-sky-400 dark:hover:bg-sky-900/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
                  <Bot className="h-4 w-4 text-primary dark:text-sky-400" />
                </div>
              )}

              <div
                className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}
              >
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-primary text-black'
                      : 'rounded-tl-sm border border-sky-100/70 bg-white/90 text-gray-900 shadow-sm backdrop-blur dark:border-border dark:bg-card/90 dark:text-foreground'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Source citations */}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="flex w-full flex-col gap-1.5">
                    {msg.sources.map((src, si) => (
                      <button
                        key={si}
                        type="button"
                        onClick={() => onOpenCitation(src.source_id, src.snippet, src.chunk_index)}
                        className="rounded-lg border border-sky-200 bg-sky-50 px-2
                                   py-1.5 text-left text-xs text-sky-700
                                   transition-colors hover:border-sky-400 focus-visible:outline-none focus-visible:ring-2
                                   focus-visible:ring-sky-500/60 dark:border-sky-800
                                   dark:bg-sky-900/20 dark:text-sky-300 dark:hover:border-sky-600"
                      >
                        <div className="font-medium">📎 {src.title}</div>
                        {src.snippet ? (
                          <div className="mt-0.5 opacity-80">"{src.snippet}..."</div>
                        ) : null}
                        {typeof src.similarity === 'number' ? (
                          <div className="mt-0.5 opacity-60">
                            relevance: {(src.similarity * 100).toFixed(1)}%
                          </div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-popover">
                  <User className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <div className="flex justify-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
              <Bot className="h-4 w-4 text-primary dark:text-sky-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-card">
              <div className="flex items-center gap-1">
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex shrink-0 gap-2 border-t border-white/10 bg-white/70 px-4 py-3 backdrop-blur dark:bg-background-secondary/60"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            readySources.length === 0 ? 'Add sources first…' : 'Ask a question about your sources…'
          }
          disabled={readySources.length === 0 || sending}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as any)
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || sending || readySources.length === 0}
          className="bg-primary px-4 text-black hover:bg-primary/90"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
