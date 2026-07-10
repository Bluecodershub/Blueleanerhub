'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Send, User } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { io, Socket } from 'socket.io-client'

interface Thread {
  id: number
  peer_id: number
  peer_name: string
  peer_avatar?: string
  last_message?: string
  last_at?: string
  unread_count?: number
}

interface Message {
  id: number
  thread_id: number
  from_id: number
  to_id: number
  body: string
  sent_at: string
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <MessagesPageInner />
    </Suspense>
  )
}

function MessagesPageInner() {
  const searchParams = useSearchParams()
  const initialTo = searchParams.get('to')
  const [threads, setThreads] = useState<Thread[]>([])
  const [active, setActive] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [draft, setDraft] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    api
      .get('/messages/threads')
      .then((r) => {
        const list: Thread[] = r.data?.data ?? r.data ?? []
        setThreads(list)
        if (initialTo) {
          const t = list.find((t) => String(t.peer_id) === initialTo)
          if (t) setActive(t)
        } else if (list.length > 0) {
          setActive(list[0])
        }
      })
      .catch(() => setThreads([]))
      .finally(() => setLoadingThreads(false))
  }, [initialTo])

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? window.location.origin
    const s = io(url, { transports: ['websocket'], withCredentials: true })
    socketRef.current = s
    s.on('message:new', (m: Message) => {
      if (active && m.thread_id === active.id) {
        setMessages((prev) => [...prev, m])
      }
    })
    return () => {
      s.disconnect()
    }
  }, [active])

  useEffect(() => {
    if (!active) return
    setLoadingMessages(true)
    api
      .get(`/messages/threads/${active.id}/messages`)
      .then((r) => setMessages(r.data?.data ?? r.data ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false))
  }, [active])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!active || !draft.trim()) return
    const body = draft.trim()
    setDraft('')
    try {
      const r = await api.post(`/messages/threads/${active.id}/messages`, { body })
      const m = r.data?.data ?? r.data
      if (m) setMessages((prev) => [...prev, m])
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="grid gap-4 md:grid-cols-[280px_1fr]" style={{ height: 'calc(100vh - 8rem)' }}>
          <Card className="overflow-hidden">
            <div className="border-b border-border bg-secondary/30 px-4 py-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Conversations</p>
            </div>
            {loadingThreads ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <ul className="max-h-full overflow-y-auto">
                {threads.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => setActive(t)}
                      className={`flex w-full items-center gap-3 border-b border-border p-3 text-left transition-colors hover:bg-secondary/40 ${
                        active?.id === t.id ? 'bg-secondary/60' : ''
                      }`}
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {t.peer_name}
                          </p>
                          {t.unread_count ? (
                            <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                              {t.unread_count}
                            </span>
                          ) : null}
                        </div>
                        {t.last_message && (
                          <p className="truncate text-xs text-muted-foreground">
                            {t.last_message}
                          </p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
                {threads.length === 0 && (
                  <li className="p-8 text-center text-sm text-muted-foreground">
                    No conversations yet.
                  </li>
                )}
              </ul>
            )}
          </Card>

          <Card className="flex flex-col overflow-hidden">
            {active ? (
              <>
                <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{active.peer_name}</p>
                  </div>
                </div>
                <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex justify-center py-16">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.from_id === active.peer_id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                            m.from_id === active.peer_id
                              ? 'bg-secondary text-foreground'
                              : 'bg-primary text-primary-foreground'
                          }`}
                        >
                          {m.body}
                          <div className="mt-1 text-[9px] opacity-70">
                            {new Date(m.sent_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    send()
                  }}
                  className="flex gap-2 border-t border-border p-3"
                >
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                  />
                  <Button type="submit" disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Select a conversation on the left.
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
