'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export const Hero: React.FC = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white px-4 dark:from-background dark:to-background-secondary">
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
          BlueLearner Hub
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-muted-foreground">
          The comprehensive platform for learning, skill development, and career advancement.
        </p>
        <div className="gap=4 flex justify-center">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
