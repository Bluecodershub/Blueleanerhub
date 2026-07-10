'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Upload, Download, Trash2, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface ResumeMeta {
  id: number
  filename: string
  uploaded_at: string
  size_bytes: number
  parsed_summary?: string
  ats_score?: number
  primary?: boolean
}

export default function CandidateResumePage() {
  const [resumes, setResumes] = useState<ResumeMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    api
      .get('/candidate/resumes')
      .then((r) => setResumes(r.data?.data ?? r.data ?? []))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const upload = async (f: File) => {
    setUploading(true)
    const form = new FormData()
    form.append('resume', f)
    try {
      await api.post('/candidate/resumes', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      load()
    } finally {
      setUploading(false)
    }
  }

  const primary = resumes.find((r) => r.primary) ?? resumes[0]

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            My <span className="text-primary">Resume</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload PDF or DOCX. We&apos;ll extract skills, calculate an ATS score, and let recruiters
            search you.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload(f)
            }}
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Upload New Version
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent
            className="cursor-pointer p-12 text-center"
            onClick={() => fileRef.current?.click()}
          >
            <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-semibold">No resume uploaded yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click to upload your PDF or DOCX
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {primary && (
            <Card className="border-t-2 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Primary Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{primary.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded {new Date(primary.uploaded_at).toLocaleDateString()} •{' '}
                      {(primary.size_bytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {typeof primary.ats_score === 'number' && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {primary.ats_score}
                        <span className="text-sm text-muted-foreground">/100</span>
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">ATS Score</p>
                    </div>
                  )}
                </div>
                {primary.parsed_summary && (
                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Extracted Summary
                    </p>
                    <p className="mt-1 text-sm text-foreground">{primary.parsed_summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <section>
            <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">
              All Versions
            </h2>
            <ul className="space-y-2">
              {resumes.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    {r.primary && (
                      <CheckCircle2 className="h-4 w-4 text-success" aria-label="Primary" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <a href={`/api/candidate/resumes/${r.id}/download`}>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        api
                          .delete(`/candidate/resumes/${r.id}`)
                          .then(load)
                          .catch(() => {})
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
