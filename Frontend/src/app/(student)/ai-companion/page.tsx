'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Send,
  Bot,
  Sparkles,
  Zap,
  MessageSquare,
  PlusCircle,
  Hash,
  Loader2,
  AlertCircle,
  Map,
  Code2,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/apiFetch'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
}

const QUICK_PROMPTS = [
  { icon: Map, label: 'Build my roadmap', prompt: 'Create a personalized learning roadmap for me based on modern software engineering.' },
  { icon: Code2, label: 'Review my code', prompt: 'What are best practices for writing clean, maintainable code?' },
  { icon: Sparkles, label: 'Career advice', prompt: 'What skills should I focus on to advance my software engineering career?' },
  { icon: Zap, label: 'Practice problem', prompt: 'Give me a coding challenge to practice today.' },
]

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hello! I'm your AI Career Coach powered by the BlueLearner inbuilt AI engine. I can help you with personalized learning roadmaps, code review, career advice, and explaining complex concepts. What would you like to explore today?",
  timestamp: new Date(),
}

export default function AICompanionPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([])
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      // Save session title from first user message
      if (messages.length === 1) {
        setSessions((prev) => [
          { id: Date.now().toString(), title: trimmed.slice(0, 40) },
          ...prev.slice(0, 9),
        ])
      }

      try {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])

        const response = await apiFetch('/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: trimmed,
            context: { path: window.location.pathname },
            persona: 'career',
          }),
        })

        if (!response.ok) {
          const error: any = new Error('AI request failed')
          error.response = { status: response.status }
          throw error
        }
        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let reply = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const event of events) {
            const line = event.split('\n').find((item) => item.startsWith('data: '))
            if (!line) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') continue
            const parsed = JSON.parse(payload)
            if (parsed.text) {
              reply += parsed.text
              setMessages((prev) =>
                prev.map((msg) => (msg.id === aiMsg.id ? { ...msg, content: reply } : msg))
              )
            }
          }
        }

        if (!reply) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsg.id
                ? { ...msg, content: 'I received your message but did not get a model response.' }
                : msg
            )
          )
        }
      } catch (err: any) {
        const isCredits = err?.response?.status === 402
        const errorText = isCredits
          ? 'You have used all your AI credits for today. Upgrade to Pro for unlimited access.'
          : 'I encountered an issue connecting to the AI service. Please try again in a moment.'

        if (isCredits) toast.error('AI credits exhausted — upgrade to Pro')

        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: errorText,
          timestamp: new Date(),
          error: true,
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
        inputRef.current?.focus()
      }
    },
    [isLoading, messages.length]
  )

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE])
    setInput('')
    inputRef.current?.focus()
  }

  const userInitial = (user?.fullName || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex h-[calc(100vh-8rem)] gap-6 duration-700">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col gap-4 lg:flex">
        <Button
          onClick={handleNewChat}
          className="h-12 gap-2 rounded-2xl bg-primary font-bold text-white shadow-lg shadow-primary/20"
        >
          <PlusCircle className="h-5 w-5" /> New Conversation
        </Button>

        <div className="glass-morphism flex flex-1 flex-col space-y-4 overflow-hidden rounded-[32px] border-border/50 p-5">
          <h4 className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Recent Chats
          </h4>
          <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
            <AnimatePresence>
              {sessions.length === 0 ? (
                <p className="px-2 text-xs text-muted-foreground/60">No recent conversations</p>
              ) : (
                sessions.map((s, i) => (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={handleNewChat}
                    className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:bg-primary/10"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span className="truncate text-sm font-semibold group-hover:text-foreground">
                      {s.title}
                    </span>
                  </motion.button>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="rounded-[28px] border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-heading text-sm font-bold">Quick Actions</h4>
          </div>
          <div className="space-y-2">
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground disabled:opacity-50"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="glass-morphism relative flex flex-1 flex-col overflow-hidden rounded-[40px] border-border/50 shadow-2xl">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        {/* Header */}
        <header className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-8 py-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold">
                AI Companion <Sparkles className="h-4 w-4 text-primary" />
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${isLoading ? 'animate-pulse bg-amber-400' : 'bg-emerald-400'}`}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {isLoading ? 'Thinking...' : 'Online - Inbuilt AI Engine'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleNewChat}>
              <Hash className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar
                className={`h-10 w-10 shrink-0 rounded-xl border border-border/50 ${
                  msg.role === 'assistant' ? 'bg-primary' : 'bg-muted'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Bot className="m-auto h-6 w-6 text-white" />
                ) : (
                  <AvatarFallback className="font-bold text-sm">{userInitial}</AvatarFallback>
                )}
              </Avatar>
              <div
                className={`flex max-w-[78%] flex-col ${msg.role === 'user' ? 'items-end' : ''}`}
              >
                <div
                  className={`rounded-3xl p-5 text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-none bg-primary text-white'
                      : msg.error
                        ? 'rounded-tl-none border border-amber-500/30 bg-amber-500/10 text-foreground'
                        : 'rounded-tl-none border border-border/50 bg-muted/50 text-foreground'
                  }`}
                >
                  {msg.error && (
                    <AlertCircle className="mb-2 h-4 w-4 text-amber-400" />
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="mt-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-none border border-border/50 bg-muted/50 p-5">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-6 pt-4">
          {/* Mobile quick prompts */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {QUICK_PROMPTS.map(({ label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                disabled={isLoading}
                className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="group relative">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-focus-within:opacity-100" />
            <div className="relative flex items-center gap-3 rounded-[24px] border border-border/50 bg-muted/30 p-2 pl-4 pr-3 shadow-inner transition-all focus-within:border-primary/50 focus-within:bg-muted/50">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about your career or curriculum..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                disabled={isLoading}
                className="h-12 flex-1 border-none bg-transparent text-[15px] font-medium placeholder:text-muted-foreground/50 focus-visible:ring-0"
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 shrink-0 rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
            Powered by BlueLearner inbuilt AI engine - responses may not always be accurate
          </p>
        </footer>
      </div>
    </div>
  )
}
