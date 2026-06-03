'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  Eye,
  Clock,
  Share2,
  Bookmark,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { formatDistanceToNow } from 'date-fns'
import { qnaAPI } from '@/lib/api-civilization'

// Fallback when API is unavailable
const FALLBACK_QUESTION = {
  id: 1,
  title: 'How does gradient descent converge in non-convex loss landscapes?',
  body: `I'm studying deep learning and I understand gradient descent in theory — you follow the negative gradient to minimize loss. But in practice, deep neural networks have highly non-convex loss surfaces with saddle points, local minima, and flat regions.

My questions:
1. How does SGD avoid getting trapped in bad local minima?
2. What is the role of learning rate in convergence?
3. Are there theoretical guarantees for convergence in non-convex settings?

Here's a simple gradient descent implementation I've been studying:

\`\`\`python
import numpy as np

def gradient_descent(f, grad_f, x0, lr=0.01, n_iter=1000):
    x = x0.copy()
    history = [x.copy()]
    for _ in range(n_iter):
        grad = grad_f(x)
        x -= lr * grad
        history.append(x.copy())
    return x, history
\`\`\`

I've noticed that with different learning rates I get very different outcomes.`,
  domain: 'machine-learning',
  voteScore: 47,
  answerCount: 3,
  viewCount: 1240,
  isAnswered: true,
  acceptedAnswerId: 1,
  tags: ['deep-learning', 'optimization', 'python', 'neural-networks'],
  authorName: 'Arjun S.',
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
}

const FALLBACK_ANSWERS = [
  {
    id: 1,
    body: `Great question! Let me address each part systematically.

## 1. Why SGD Doesn't Get Trapped

The key insight is that in high-dimensional spaces, **true local minima are extremely rare**. Most critical points are saddle points. Empirically, SGD noise actually helps escape saddle points because the stochastic gradient introduces random perturbations.

> "The geometry of loss surfaces in deep networks is actually more benign than it appears." — Goodfellow et al.

## 2. Learning Rate and Convergence

The learning rate controls the step size. Too high → diverges. Too low → very slow. The Goldilocks zone:

\`\`\`python
# Learning rate scheduling (cosine annealing)
def cosine_lr(t, T, lr_max, lr_min=0):
    return lr_min + 0.5 * (lr_max - lr_min) * (1 + np.cos(np.pi * t / T))

# Adaptive methods (Adam) adjust lr per-parameter
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, betas=(0.9, 0.999))
\`\`\`

## 3. Theoretical Guarantees

For non-convex functions, we typically prove convergence to **stationary points** (where gradient = 0), not global minima. Key results:

- **SGD**: Converges to stationary point at rate O(1/√T) under mild conditions
- **Adam**: Convergence proven under specific assumptions (Reddi et al., 2018)

The practical takeaway: use **learning rate warmup + cosine decay** and **gradient clipping** for stable training.`,
    voteScore: 32,
    isAccepted: true,
    aiGenerated: false,
    authorName: 'Dr. Rajesh Kumar',
    authorRep: 8420,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 2,
    body: `Adding to the excellent answer above — one thing that often gets overlooked is **batch size** as a regularizer.

Smaller batches → noisier gradients → better generalization. This is why full-batch gradient descent often overfits compared to mini-batch SGD.

The loss landscape intuition: imagine a landscape with many sharp valleys (bad minima) and some wide flat valleys (good minima). SGD with noise tends to find the **wider** minima because the noise prevents it from settling into narrow ones.

See: "Sharp Minima Can Generalize For Deep Nets" (Dinh et al., 2017)`,
    voteScore: 14,
    isAccepted: false,
    aiGenerated: false,
    authorName: 'Meera Iyer',
    authorRep: 3760,
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
]

function VoteWidget({
  score,
  onUpvote,
  onDownvote,
  isAccepted,
}: {
  score: number
  onUpvote: () => void
  onDownvote: () => void
  isAccepted?: boolean
}) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)

  return (
    <div className="flex w-10 flex-col items-center gap-1">
      <button
        onClick={() => {
          onUpvote()
          setVoted('up')
        }}
        className={`rounded-full p-1.5 transition-colors ${voted === 'up' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-blue-400'}`}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <span
        className={`text-base font-bold tabular-nums ${score > 0 ? 'text-blue-400' : score < 0 ? 'text-red-400' : 'text-gray-400'}`}
      >
        {score}
      </span>
      <button
        onClick={() => {
          onDownvote()
          setVoted('down')
        }}
        className={`rounded-full p-1.5 transition-colors ${voted === 'down' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-800 hover:text-red-400'}`}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
      {isAccepted && (
        <div className="mt-1 rounded-full bg-muted p-1.5">
          <CheckCircle2 className="h-4 w-4 text-foreground/70" />
        </div>
      )}
    </div>
  )
}

function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm prose-code:rounded prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 max-w-none">
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark as any}
                language={match[1]}
                PreTag="div"
                className="!rounded-xl !text-sm"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function QuestionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-3/4 rounded bg-gray-800" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-800" />
        <div className="h-4 w-5/6 rounded bg-gray-800" />
        <div className="h-4 w-4/6 rounded bg-gray-800" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 rounded-full bg-gray-800" />
        ))}
      </div>
    </div>
  )
}

export default function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [question, setQuestion] = useState<typeof FALLBACK_QUESTION | null>(null)
  const [answers, setAnswers] = useState<typeof FALLBACK_ANSWERS>([])
  const [loading, setLoading] = useState(true)
  const [answerBody, setAnswerBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const numId = Number(id)
    if (!numId) {
      setQuestion(FALLBACK_QUESTION)
      setAnswers(FALLBACK_ANSWERS)
      setLoading(false)
      return
    }

    qnaAPI
      .getQuestion(numId)
      .then((data: any) => {
        if (data?.question) {
          setQuestion(data.question)
          setAnswers(data.answers ?? [])
        } else if (data?.id) {
          setQuestion(data)
          setAnswers(data.answers ?? [])
        } else {
          setQuestion(FALLBACK_QUESTION)
          setAnswers(FALLBACK_ANSWERS)
        }
      })
      .catch(() => {
        setQuestion(FALLBACK_QUESTION)
        setAnswers(FALLBACK_ANSWERS)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmitAnswer = async () => {
    if (!answerBody.trim()) return
    const numId = Number(id)
    setSubmitting(true)
    try {
      if (numId) {
        await qnaAPI.postAnswer(numId, answerBody)
      }
      setAnswers((prev) => [
        ...prev,
        {
          id: Date.now(),
          body: answerBody,
          voteScore: 0,
          isAccepted: false,
          aiGenerated: false,
          authorName: 'You',
          authorRep: 1,
          createdAt: new Date().toISOString(),
        },
      ])
      setAnswerBody('')
      toast.success('Answer posted!')
    } catch {
      toast.error('Failed to post answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (
    targetId: number,
    targetType: 'question' | 'answer',
    type: 'up' | 'down'
  ) => {
    const numId = Number(id)
    toast.success(type === 'up' ? 'Upvoted!' : 'Downvoted!', { duration: 1500 })
    if (numId) {
      qnaAPI.vote(numId, targetId, targetType, type).catch(() => undefined)
    }
  }

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Could not copy link'))
  }

  const q = question ?? FALLBACK_QUESTION

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/qna" className="transition-colors hover:text-white">
            Q&A Hub
          </Link>
          <span>/</span>
          {loading ? (
            <div className="h-4 w-40 animate-pulse rounded bg-gray-800" />
          ) : (
            <span className="truncate text-gray-400">
              {q.title.slice(0, 55)}
              {q.title.length > 55 ? '...' : ''}
            </span>
          )}
        </div>

        {/* Question */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6 border-gray-800 bg-gray-900">
            <CardContent className="p-6">
              {loading ? (
                <QuestionSkeleton />
              ) : (
                <>
                  <h1 className="mb-4 text-xl font-bold leading-snug text-white">{q.title}</h1>

                  <div className="mb-5 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Asked{' '}
                      {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {q.viewCount?.toLocaleString() ?? 0} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> {q.answerCount ?? answers.length}{' '}
                      answers
                    </span>
                  </div>

                  <div className="flex gap-5">
                    <VoteWidget
                      score={q.voteScore ?? 0}
                      onUpvote={() => handleVote(q.id, 'question', 'up')}
                      onDownvote={() => handleVote(q.id, 'question', 'down')}
                    />
                    <div className="flex-1">
                      <MarkdownBody content={q.body} />
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(q.tags ?? []).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-gray-800 text-xs text-gray-300"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <button
                            onClick={handleShare}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                          >
                            <Share2 className="h-3.5 w-3.5" /> Share
                          </button>
                          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
                            <Bookmark className="h-3.5 w-3.5" /> Save
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                            {(q.authorName ?? 'U')[0]}
                          </div>
                          <span>{q.authorName ?? 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Answers */}
        {!loading && (
          <>
            <h2 className="mb-4 text-lg font-semibold text-white">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            <div className="mb-8 flex flex-col gap-4">
              {answers.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className={`border ${a.isAccepted ? 'border-border bg-background/30' : 'border-gray-800 bg-gray-900'}`}
                  >
                    <CardContent className="p-6">
                      {a.isAccepted && (
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground/70">
                          <CheckCircle2 className="h-4 w-4" /> Accepted Answer
                        </div>
                      )}
                      <div className="flex gap-5">
                        <VoteWidget
                          score={a.voteScore ?? 0}
                          onUpvote={() => handleVote(a.id, 'answer', 'up')}
                          onDownvote={() => handleVote(a.id, 'answer', 'down')}
                          isAccepted={a.isAccepted}
                        />
                        <div className="flex-1">
                          <MarkdownBody content={a.body} />
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex gap-2">
                              <button
                                onClick={handleShare}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                              >
                                <Share2 className="h-3.5 w-3.5" /> Share
                              </button>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-pink-500 text-xs font-bold">
                                {(a.authorName ?? 'U')[0]}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-white">{a.authorName}</p>
                                {a.authorRep != null && (
                                  <p className="text-[10px] font-bold text-foreground/70">
                                    {a.authorRep.toLocaleString()} rep
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {answers.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-500">
                  <MessageSquare className="h-10 w-10 opacity-30" />
                  <p className="text-sm">No answers yet. Be the first to answer!</p>
                </div>
              )}
            </div>

            {/* Post Answer */}
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-blue-400" /> Your Answer
                </h3>
                <Textarea
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  placeholder="Write your answer in Markdown. Include code examples where relevant..."
                  className="min-h-[200px] border-gray-700 bg-gray-800 font-mono text-sm text-white placeholder:text-gray-500"
                />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Supports Markdown and code blocks (``` python ```)
                  </p>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!answerBody.trim() || submitting}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {submitting ? 'Posting...' : 'Post Answer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
