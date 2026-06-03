'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SAMPLE_CONVERSATION: Message[] = [
  { id: '1', role: 'user', content: 'What is the Second Law of Thermodynamics?' },
  { id: '2', role: 'assistant', content: 'The Second Law states that the total entropy of an isolated system can never decrease over time. In simple terms, systems naturally move toward disorder (entropy) unless energy is applied.' },
  { id: '3', role: 'user', content: 'How do I center a div?' },
  { id: '4', role: 'assistant', content: 'Use Flexbox! Set display: flex; justify-content: center; and align-items: center; on the parent container. 🚀' },
]

export function AIBubblePreview() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentConvIndex, setCurrentConvIndex] = useState(0)

  const playNext = async () => {
    if (currentConvIndex >= SAMPLE_CONVERSATION.length) return

    const nextMessage = SAMPLE_CONVERSATION[currentConvIndex]
    
    if (nextMessage.role === 'user') {
      // Small pause before user speaks
      await new Promise(r => setTimeout(r, 600))
      setMessages(prev => [...prev, nextMessage])
      setCurrentConvIndex(prev => prev + 1)
      playNext() // Immediately trigger assistant response
    } else {
      // Assistant typing delay
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 1500))
      setMessages(prev => [...prev, nextMessage])
      setIsTyping(false)
      setCurrentConvIndex(prev => prev + 1)
      // Wait before next user message
      await new Promise(r => setTimeout(r, 2000))
      playNext()
    }
  }

  // Auto-play conversation when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      playNext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 flex h-[420px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10 backdrop-blur-xl transition-all"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Blue AI Assistant</h4>
                  <p className="text-[10px] opacity-70">Always online</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full p-0 text-white hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-card/50 p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10, y: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "rounded-2xl px-3 py-2 text-sm",
                    msg.role === 'user' 
                      ? "rounded-tr-none bg-primary text-white" 
                      : "rounded-tl-none bg-muted text-muted-foreground border border-border/50"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto flex items-end gap-2">
                  <div className="rounded-2xl rounded-tl-none bg-muted p-3">
                    <div className="flex gap-1">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 delay-100" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400 delay-200" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Footer (Static for Demo) */}
            <div className="border-t border-border bg-card p-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  disabled
                  className="w-full rounded-full border border-border bg-muted/50 py-2 pl-4 pr-10 text-xs text-muted-foreground outline-none"
                />
                <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 text-primary opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                 AI-powered by BlueLearnerHub Gemini Pro integration.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          isOpen ? "bg-card border border-border text-primary" : "bg-primary text-white"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
        )}
      </motion.button>
    </div>
  )
}
