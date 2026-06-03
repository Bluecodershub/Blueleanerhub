'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Tag,
  Flame,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import QuestionCard from '@/components/qna/QuestionCard'
import QuestionCardSkeleton from '@/components/skeletons/QuestionCardSkeleton'
import { qnaAPI } from '@/lib/api-civilization'

const MOCK_QUESTIONS = [
  {
    id: 1,
    title: 'How does gradient descent converge in non-convex loss landscapes?',
    domain: 'machine-learning',
    voteScore: 47,
    answerCount: 8,
    viewCount: 1240,
    isAnswered: true,
    tags: ['deep-learning', 'optimization', 'python'],
    authorName: 'Arjun S.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    title: 'What is the difference between stress and strain in structural analysis?',
    domain: 'civil',
    voteScore: 23,
    answerCount: 5,
    viewCount: 830,
    isAnswered: true,
    tags: ['structural-analysis', 'mechanics', 'civil'],
    authorName: 'Priya M.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 3,
    title: 'How to implement a binary search tree with AVL rebalancing in Python?',
    domain: 'computer-science',
    voteScore: 38,
    answerCount: 6,
    viewCount: 2100,
    isAnswered: true,
    tags: ['data-structures', 'python', 'algorithms'],
    authorName: 'Rahul K.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 4,
    title: 'Best practices for DCF valuation in volatile market conditions?',
    domain: 'finance',
    voteScore: 15,
    answerCount: 2,
    viewCount: 460,
    isAnswered: false,
    tags: ['valuation', 'financial-modeling', 'dcf'],
    authorName: 'Sneha P.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 5,
    title: "Why does Bernoulli's equation fail for real fluids at high velocities?",
    domain: 'mechanical',
    voteScore: 29,
    answerCount: 4,
    viewCount: 670,
    isAnswered: true,
    tags: ['fluid-mechanics', 'thermodynamics'],
    authorName: 'Vikram T.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 6,
    title: 'How to design a PID controller for a temperature regulation system?',
    domain: 'electrical',
    voteScore: 52,
    answerCount: 11,
    viewCount: 3400,
    isAnswered: true,
    tags: ['control-systems', 'pid', 'circuit-analysis'],
    authorName: 'Divya R.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
]

const POPULAR_TAGS = [
  'python',
  'javascript',
  'machine-learning',
  'algorithms',
  'data-structures',
  'react',
  'thermodynamics',
  'circuit-analysis',
  'financial-modeling',
  'sql',
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest', icon: Clock },
  { value: 'votes', label: 'Most Voted', icon: TrendingUp },
  { value: 'unanswered', label: 'Unanswered', icon: MessageSquare },
]

export default function QnAPage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params: Record<string, string> = { sort }
    if (activeTag) params.tag = activeTag
    qnaAPI
      .listQuestions(params)
      .then((d: any) => {
        const payload = d?.data?.data ?? d?.data ?? []
        setQuestions(Array.isArray(payload) ? payload : [])
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false))
  }, [sort, activeTag])

  const filtered = questions.filter((q) => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || q.tags.includes(activeTag)
    return matchSearch && matchTag
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium uppercase tracking-wider text-blue-400">
                  Knowledge Network
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Q&amp;A Hub</h1>
              <p className="mt-2 max-w-xl text-gray-400">
                Ask engineering questions. Get expert answers. Build community knowledge.
              </p>
            </div>
            <Link href="/qna/ask">
              <Button className="gap-2 bg-primary px-5 py-2.5 hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Ask Question
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 flex gap-6">
            {[
              { label: 'Questions', value: '12,847', icon: MessageSquare, color: 'text-blue-400' },
              {
                label: 'Answered',
                value: '10,204',
                icon: CheckCircle2,
                color: 'text-foreground/70',
              },
              { label: 'Experts', value: '3,420', icon: Award, color: 'text-foreground/70' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="font-bold text-white">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Search + Sort */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  className="border-gray-700 bg-gray-900 pl-9 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="flex gap-1">
                {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      sort === value
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions list */}
            <div className="flex flex-col gap-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <QuestionCardSkeleton key={i} />)
                : filtered.map((q, i) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <QuestionCard {...q} />
                    </motion.div>
                  ))}
              {!loading && filtered.length === 0 && (
                <div className="py-16 text-center text-gray-500">
                  <MessageSquare className="mx-auto mb-3 h-10 w-10 opacity-30" />
                  <p>No questions match your search.</p>
                  <Link href="/qna/ask">
                    <Button variant="outline" className="mt-4 border-gray-700 text-gray-300">
                      Ask the first question
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full shrink-0 space-y-4 md:w-64">
            {/* Popular tags */}
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Popular Tags</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        activeTag === tag
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top contributors */}
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-foreground/70" />
                  <span className="text-sm font-semibold text-white">Top Experts</span>
                </div>
                {[
                  { name: 'Dr. Rajesh Kumar', rep: 8420, domain: 'ML/AI' },
                  { name: 'Anjali Sharma', rep: 6150, domain: 'Civil Eng' },
                  { name: 'Karthik V.', rep: 4980, domain: 'Finance' },
                  { name: 'Meera Iyer', rep: 3760, domain: 'Electrical' },
                ].map((u) => (
                  <div key={u.name} className="flex items-center gap-2 py-1.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                      {u.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-500">{u.domain}</p>
                    </div>
                    <span className="text-xs font-bold text-foreground/70">
                      {u.rep.toLocaleString()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
