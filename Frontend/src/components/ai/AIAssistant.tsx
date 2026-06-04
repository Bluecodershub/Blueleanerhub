'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Bot,
  X,
  Minimize2,
  Sparkles,
  MessageSquare,
  Briefcase,
  Trophy,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/apiFetch'
export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [persona, setPersona] = useState<
    'tutor' | 'technical' | 'manager' | 'career' | 'competition'
  >('tutor')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your BLUELEARNERHUB AI Assistant. How can I help you today with your learning or career path?',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, assistantMessage])
    let currentContent = ''

    try {
      const response = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: input,
          context: { path: window.location.pathname },
          persona,
        }),
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          const line = event.split('\n').find((item) => item.startsWith('data: '))
          if (line) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') break

            try {
              const data = JSON.parse(dataStr)
              if (data.text) {
                currentContent += data.text
                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1].content = currentContent
                  return newMessages
                })
              }
            } catch {
              // Bit of a hack for partial JSON, but works for most stream chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].content =
          'Sorry, I encountered an error. Please try again.'
        return newMessages
      })
    } finally {
      setIsLoading(false)
    }
  }

  const personaIcons: Record<string, any> = {
    tutor: <Sparkles className="h-3.5 w-3.5" />,
    technical: <Bot className="h-3.5 w-3.5" />,
    manager: <Briefcase className="h-3.5 w-3.5" />,
    career: <Trophy className="h-3.5 w-3.5" />,
    competition: <Zap className="h-3.5 w-3.5" />,
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 h-[600px] w-[350px] md:w-[450px]"
          >
            <Card className="flex h-full flex-col overflow-hidden border-border bg-card shadow-lg">
              <CardHeader className="flex flex-col gap-3 border-b border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {personaIcons[persona]}
                    </div>
                    <div>
                      <CardTitle className="font-sans text-sm font-semibold text-foreground">
                        BlueAI {persona}
                      </CardTitle>
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                        Real-time Mentorship
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setIsMinimized(true)}
                    >
                      <Minimize2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Persona Selector */}
                <div className="scrollbar-hide flex gap-1 overflow-x-auto pb-1">
                  {['tutor', 'technical', 'manager', 'career', 'competition'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPersona(p as any)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase transition-colors ${
                        persona === p
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-muted-foreground hover:text-foreground/80'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden bg-card/50 p-0">
                <div className="h-full overflow-y-auto scroll-smooth p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-primary font-medium text-primary-foreground'
                              : 'border border-border bg-secondary/50 text-foreground'
                          }`}
                        >
                          {m.content}
                          {isLoading &&
                            i === messages.length - 1 &&
                            m.role === 'assistant' &&
                            m.content === '' && (
                              <div className="flex gap-1 py-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.2s]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0.4s]" />
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border bg-background/30 p-3">
                <form
                  className="flex w-full items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                >
                  <Input
                    placeholder={`Message the ${persona} assistant...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-10 flex-1 border-border bg-card placeholder:text-muted-foreground"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10"
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          isOpen ? 'bg-primary shadow-sm' : 'border border-border bg-card shadow-sm'
        }`}
      >
        {isOpen ? (
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Bot className="h-7 w-7 text-primary" />
        )}
      </motion.button>
    </div>
  )
}
