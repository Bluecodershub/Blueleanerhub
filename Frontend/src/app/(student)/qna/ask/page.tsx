'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Search, Lightbulb, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { qnaAPI } from '@/lib/api-civilization'
import { toast } from 'sonner'

const DOMAIN_OPTIONS = [
  'computer-science',
  'machine-learning',
  'mechanical',
  'electrical',
  'civil',
  'finance',
  'management',
  'mathematics',
]

const SIMILAR_QUESTIONS = [
  'How does backpropagation work in neural networks?',
  'What is the vanishing gradient problem?',
  'How to choose a learning rate for gradient descent?',
]

export default function AskQuestionPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [domain, setDomain] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)

  const handleTitleBlur = () => {
    if (title.length > 20) setShowSimilar(true)
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await qnaAPI.askQuestion({ title, body, domain, tags })
      toast.success('Question posted!')
      router.push('/qna?posted=1')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to post question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isValid = title.length >= 15 && body.length >= 30 && domain

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/qna" className="hover:text-foreground">
              Q&A Hub
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Ask a Question</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ask a Good Question</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Be specific, share context, and include what you've already tried.
          </p>
        </div>

        {/* Tips card */}
        <Card className="mb-6 border-sky-800 bg-sky-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <div className="text-sm text-sky-300">
                <strong className="font-semibold">Writing a great question:</strong> Include
                relevant code, error messages, and what you've already attempted. Specific questions
                get faster, better answers.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Title */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Question Title <span className="text-red-400">*</span>
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Imagine you're asking a colleague. Be specific and concrete.
              </p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="e.g. How does gradient descent converge in non-convex landscapes?"
                className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                maxLength={200}
              />
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">{title.length}/200</span>
                {title.length > 0 && title.length < 15 && (
                  <span className="flex items-center gap-1 text-xs text-foreground/70">
                    <AlertCircle className="h-3.5 w-3.5" /> Add more detail ({15 - title.length}{' '}
                    chars min)
                  </span>
                )}
              </div>

              {/* Similar questions warning */}
              {showSimilar && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                    <Search className="h-3.5 w-3.5" /> Similar questions already exist — check these
                    first:
                  </p>
                  {SIMILAR_QUESTIONS.map((q) => (
                    <Link
                      key={q}
                      href="#"
                      className="block py-0.5 text-xs text-sky-400 hover:underline"
                    >
                      → {q}
                    </Link>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Body */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Question Details <span className="text-red-400">*</span>
              </label>
              <p className="mb-3 text-xs text-muted-foreground">
                Include all the information needed. Supports Markdown and code blocks.
              </p>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`Describe your problem in detail...\n\nWhat have you tried?\n\`\`\`python\n# Include relevant code here\n\`\`\``}
                className="min-h-[240px] border-border bg-secondary font-mono text-sm text-foreground placeholder:text-muted-foreground"
              />
              <p className="mt-1.5 text-xs text-muted-foreground/60">{body.length} characters</p>
            </CardContent>
          </Card>

          {/* Domain + Tags */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Domain <span className="text-red-400">*</span>
              </label>
              <div className="mb-4 flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDomain(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      domain === d
                        ? 'bg-primary text-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                    }`}
                  >
                    {d.replace('-', ' ')}
                  </button>
                ))}
              </div>

              <label className="mb-2 mt-4 block text-sm font-semibold text-foreground">
                Tags <span className="text-xs font-normal text-muted-foreground">(up to 5)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="e.g. python, neural-networks"
                  className="border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={addTag}
                  variant="outline"
                  className="shrink-0 border-border text-foreground/80"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="cursor-pointer bg-gray-800 text-gray-300 transition-colors hover:bg-red-900 hover:text-red-300"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link href="/qna">
              <Button variant="outline" className="border-gray-700 text-gray-400">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="bg-primary px-6 hover:bg-primary/90"
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
