'use client'

import Link from 'next/link'
import { ArrowRight, Code2, History, Trophy } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PracticeHackathonsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Code2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Practice Arena</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Practice coding challenges, run solutions in the online IDE, review history, and earn XP before live events.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Online Compiler', icon: Code2, body: 'Run code in supported languages with AI debugging support.', href: '/ide' },
            { title: 'Problem Sets', icon: Trophy, body: 'Solve exercises across domains and difficulty levels.', href: '/exercises' },
            { title: 'Submission History', icon: History, body: 'Track attempts and progress from your student dashboard.', href: '/student/dashboard' },
          ].map(({ title, icon: Icon, body, href }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{body}</p>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link href={href}>
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
