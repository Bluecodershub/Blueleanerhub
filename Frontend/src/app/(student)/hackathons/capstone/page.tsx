'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, GraduationCap, UploadCloud } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const steps = [
  'Choose an enrolled course project',
  'Upload repository, demo link, and implementation notes',
  'Receive mentor review and feedback',
  'Publish result and certificate eligibility',
]

export default function CapstonePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Capstone Projects</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Submit course-based capstone work for mentor review, grading, feedback, result publishing, and certificate eligibility.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Review Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {steps.map((step) => (
                <div key={step} className="flex gap-3 rounded-md border p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <UploadCloud className="h-6 w-6 text-primary" />
              <CardTitle>Ready to Submit?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Open an enrolled course from your dashboard and submit its capstone from the course workspace.</p>
              <Button asChild className="w-full gap-2">
                <Link href="/student/dashboard">
                  Student Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
