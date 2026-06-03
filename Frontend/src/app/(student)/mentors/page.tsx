'use client'

import * as React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { apiFetch } from '@/lib/apiFetch'
import {
  Send,
  Sparkles,
  Code2,
  Wrench,
  Cpu,
  Layers,
  Activity,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'react-hot-toast'

interface MentorPersona {
  id: string;
  name: string;
  role: string;
  domain: string;
  avatarIcon: any;
  avatarColor: string;
  intro: string;
  focus: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MENTORS: MentorPersona[] = [
  {
    id: 'software',
    name: 'Sarah Jenkins',
    role: 'AI Software Architect Lead',
    domain: 'Software Engineering',
    avatarIcon: Code2,
    avatarColor: 'bg-blue-500/10 border-blue-500/30 text-blue-450',
    intro: "Hello, builder! I'm Sarah. I specialize in designing scalable systems, time-complexity optimizations, and modern design patterns. Let's build something robust today!",
    focus: ['OOP Design', 'System Scale', 'Algorithm Complexity']
  },
  {
    id: 'robotics',
    name: 'Dr. Hiroshi Tanaka',
    role: 'Robotics Kinematics Master',
    domain: 'Robotics Engineering',
    avatarIcon: Cpu,
    avatarColor: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    intro: "Greetings! Dr. Hiroshi here. My focus is low-latency RTOS scheduling, kinematics transforms, and tuning responsive PID feedback. How can I assist your robotic assembly?",
    focus: ['Inverse Kinematics', 'RTOS Scheduling', 'PID Regulation']
  },
  {
    id: 'electronics',
    name: 'Elena Rostova',
    role: 'Circuits & Embedded Maestro',
    domain: 'Electronics Engineering',
    avatarIcon: Activity,
    avatarColor: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-450',
    intro: "Hi there! I'm Elena. I help engineers with PCB layouts, high-frequency SPI/I2C signals routing, and FPGA logic arrays. Tell me about your circuit boards!",
    focus: ['PCB Signal Integrity', 'SPI/I2C Protocols', 'FPGA Design']
  },
  {
    id: 'mechanical',
    name: 'Dr. Marcus Vance',
    role: 'Stress Analysis & CAD Guru',
    domain: 'Mechanical Engineering',
    avatarIcon: Wrench,
    avatarColor: 'bg-amber-500/10 border-amber-500/30 text-amber-450',
    intro: "Hello! I'm Dr. Vance. I specialize in FEA stress distributions, heat dynamics modeling, and structural optimization. Let's analyze your structural frames.",
    focus: ['FEA Stress Models', 'Thermal Dynamics', 'Structural Optimization']
  },
  {
    id: 'civil',
    name: 'Eng. David Koomson',
    role: 'BIM & Structural Pioneer',
    domain: 'Civil Engineering',
    avatarIcon: Layers,
    avatarColor: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    intro: "Greetings. I'm Eng. David. I help shape safe structures using BIM Revit workflows, concrete mixes calculus, and dynamic load stress tolerances. Let's draft your blueprints.",
    focus: ['BIM Workflows', 'Load Tolerances', 'Calculated Concrete Mixes']
  }
]

export default function AIMentorsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [selectedMentor, setSelectedMentor] = useState<MentorPersona>(MENTORS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize selected mentor and welcome message
  useEffect(() => {
    const getDefaultMentor = (): MentorPersona => {
      const topicParam = searchParams.get('topic')
      if (topicParam) {
        const match = MENTORS.find(m => m.domain === user?.domain)
        if (match) return match
      }
      const domainMatch = MENTORS.find(m => m.domain === user?.domain)
      return domainMatch || MENTORS[0]
    }

    const defaultMentor = getDefaultMentor()
    setSelectedMentor(defaultMentor)
    
    const topicParam = searchParams.get('topic')
    const welcomeText = topicParam 
      ? `Hi! I noticed you are exploring "${topicParam}" on your roadmap. Let's discuss this concept! What specific questions do you have?`
      : defaultMentor.intro

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date()
      }
    ])
  }, [user, searchParams])

  // Scroll to chat bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleMentorSelect = (mentor: MentorPersona) => {
    setSelectedMentor(mentor)
    setMessages([
      {
        id: `welcome-${mentor.id}`,
        role: 'assistant',
        content: mentor.intro,
        timestamp: new Date()
      }
    ])
    setInput('')
  }

  // Real-time SSE text streaming from backend
  const handleSendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Add placeholder assistant message for streaming response
    const assistantMessageId = `assistant-${Date.now()}`
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }
    ])

    try {
      const response = await apiFetch('/adaptive-learning/mentor/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: trimmedInput,
          mentorDomain: selectedMentor.domain
        })
      })

      if (!response.ok) {
        throw new Error('Streaming failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let completeResponse = ''

      if (!reader) {
        throw new Error('Readable stream not supported')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // Express standard response chunk processing (split by line-based SSE blocks)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const cleaned = line.replace('data: ', '').trim()
              if (cleaned === '[DONE]') {
                break
              }
              const parsed = JSON.parse(cleaned)
              if (parsed.text) {
                completeResponse += parsed.text
                
                // Update active streaming message content in state
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return { ...msg, content: completeResponse }
                  }
                  return msg
                }))
              }
            } catch {
              // Plain text fallback if JSON parsing fails
              const cleaned = line.replace('data: ', '')
              if (cleaned) {
                completeResponse += cleaned
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return { ...msg, content: completeResponse }
                  }
                  return msg
                }))
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('SSE stream failing, attempting standard Axios fallback query', err)
      
      // Axios fallback query if SSE stream route fails / is blocked by CORS/proxy
      try {
        const res = await api.post('/adaptive-learning/mentor/chat', {
          message: trimmedInput,
          mentorDomain: selectedMentor.domain
        })

        // Standard JSON reply
        const standardReply = res.data.data?.text || res.data.data?.response || 'I am ready to help you coordinate your active design nodes!'
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === assistantMessageId) {
            return { ...msg, content: standardReply }
          }
          return msg
        }))
      } catch {
        toast.error('Unable to establish secure dialog gateway.')
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const userInitial = (user?.fullName || 'U').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-12 relative overflow-hidden select-none flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 z-10 relative">
        
        {/* Left Column: Mentors Sidebar selector */}
        <div className="space-y-6 lg:col-span-1 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Expert AI Mentors</h2>
              <p className="text-xs text-slate-400">Choose a specialized domain persona to assist you.</p>
            </div>
            
            <div className="space-y-2">
              {MENTORS.map(m => {
                const IconComponent = m.avatarIcon
                const isSelected = selectedMentor.id === m.id
                const isUserDomain = user?.domain === m.domain

                return (
                  <button
                    key={m.id}
                    onClick={() => handleMentorSelect(m)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition duration-200 flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${m.avatarColor}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 leading-tight flex items-center gap-1.5">
                        {m.name}
                        {isUserDomain && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded uppercase font-bold shrink-0">
                            Primary
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Coordinated Level</span>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Personalized to Level {user?.level || 1}</span>
            </div>
            <p className="text-[10px] text-slate-450 leading-relaxed">
              Mentor dialogue dynamically adapts based on your active quiz assessment scores and skill tree node selections.
            </p>
          </div>
        </div>

        {/* Right Column: Chat Dialog Area */}
        <div className="lg:col-span-3 bg-slate-900/60 border border-slate-850 rounded-3xl backdrop-blur-md flex flex-col justify-between overflow-hidden shadow-2xl relative min-h-[500px]">
          {/* Header */}
          <header className="px-6 py-4 border-b border-slate-850 flex justify-between items-center bg-slate-950/30 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${selectedMentor.avatarColor}`}>
                {React.createElement(selectedMentor.avatarIcon, { className: 'h-5 w-5' })}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  {selectedMentor.name}
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                </h3>
                <span className="text-[10px] text-slate-400">{selectedMentor.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                {isLoading ? 'Streaming...' : 'Synchronized'}
              </span>
            </div>
          </header>

          {/* Conversations Thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[380px]">
            {messages.map(msg => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={`flex gap-3.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  <Avatar className={`h-9 w-9 border shrink-0 rounded-xl ${
                    isUser ? 'bg-slate-800 border-slate-700' : selectedMentor.avatarColor
                  }`}>
                    {isUser ? (
                      <AvatarFallback className="text-xs font-bold">{userInitial}</AvatarFallback>
                    ) : (
                      React.createElement(selectedMentor.avatarIcon, { className: 'm-auto h-4 w-4 text-indigo-455' })
                    )}
                  </Avatar>
                  <div className="space-y-1">
                    <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      isUser 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-950/80 border border-slate-850 text-slate-300 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content || (isLoading && !msg.content ? '...' : '')}</p>
                    </div>
                    <span className="text-[9px] text-slate-500 block text-right px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3.5 max-w-[85%]">
                <Avatar className={`h-9 w-9 border shrink-0 rounded-xl ${selectedMentor.avatarColor}`}>
                  {React.createElement(selectedMentor.avatarIcon, { className: 'm-auto h-4 w-4' })}
                </Avatar>
                <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl rounded-tl-none">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <footer className="p-4 border-t border-slate-850 bg-slate-950/20">
            {/* Quick Helper Topics selection */}
            <div className="flex gap-2 overflow-x-auto pb-2 text-[10px]">
              {selectedMentor.focus.map(t => (
                <button
                  key={t}
                  onClick={() => setInput(t)}
                  className="bg-slate-950/85 hover:bg-slate-900 border border-slate-850 text-slate-400 px-3 py-1.5 rounded-lg font-medium shrink-0 transition"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={`Ask ${selectedMentor.name} anything about ${selectedMentor.domain}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                disabled={isLoading}
                className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500/50 hover:border-slate-800 text-xs h-10 px-4 rounded-xl"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-bold h-10 rounded-xl"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </footer>
        </div>

      </div>
    </div>
  )
}
