'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export const Hero: React.FC = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white md:text-6xl">
          BlueLearner Hub
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-300">
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
