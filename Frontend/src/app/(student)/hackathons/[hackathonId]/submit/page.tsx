'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { 
  Code2, 
  Upload, 
  Send, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { hackathonsAPI } from '@/lib/api-civilization'

interface SubmissionFormProps {
  hackathonId: string
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
]

export default function SubmissionForm({ hackathonId }: SubmissionFormProps) {
  const router = useRouter()
  const [language, setLanguage] = useState('javascript')
  const [sourceCode, setSourceCode] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [presentationUrl, setPresentationUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter your code')
      return
    }

    setSubmitting(true)
    try {
      const result = await (hackathonsAPI as any).submitCode?.(Number(hackathonId), {
        language,
        sourceCode,
        demoUrl: demoUrl || undefined,
        presentationUrl: presentationUrl || undefined,
      })

      if (result.error) {
        throw new Error(result.error.message || 'Submission failed')
      }

      setSubmitted(true)
      toast.success('Submission successful! Good luck!')
      
      setTimeout(() => {
        router.push(`/hackathons/${hackathonId}`)
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl"
      >
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
            <h2 className="text-2xl font-bold text-white">Submission Received!</h2>
            <p className="mt-2 text-muted-foreground">
              Your project has been submitted successfully.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Redirecting to hackathon page...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          ← Back
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Submit Your Project</h2>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Project Submission
          </CardTitle>
          <CardDescription>
            Submit your hackathon project with code and documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Programming Language
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    language === lang.id
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {/* Source Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Source Code
            </label>
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* File Upload (Mock) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Additional Files (Optional)
            </label>
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ZIP, PDF, or any project files
              </p>
            </div>
          </div>

          {/* Demo URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Live Demo URL (Optional)
            </label>
            <Input
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://your-demo.vercel.app"
            />
          </div>

          {/* Presentation URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Presentation/Video URL (Optional)
            </label>
            <Input
              value={presentationUrl}
              onChange={(e) => setPresentationUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Make sure your submission is final before submitting.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !sourceCode.trim()}
              className="bg-primary font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            Submission Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• All code must be your original work or properly attributed</li>
            <li>• Include a README.md file with setup instructions</li>
            <li>• Provide clear documentation of your solution</li>
            <li>• Submissions are final once submitted</li>
            <li>• You can update your submission until the deadline</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
