'use client'

import React from 'react'
import { TutorialsIndex } from '@/components/tutorials/TutorialsIndex'

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            <span className="bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              Interactive Tutorials
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Learn to code with our interactive step-by-step tutorials. 
            Write and run code directly in your browser, track your progress, and earn certificates.
          </p>
        </div>

        {/* Tutorials Index */}
        <TutorialsIndex />
      </div>
    </main>
  )
}
