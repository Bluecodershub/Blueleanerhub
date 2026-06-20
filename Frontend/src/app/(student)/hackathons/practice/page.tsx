'use client'

import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  History,
  ShieldCheck,
  Terminal,
  Trophy,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { LanguageBadge } from '@/components/ui/LanguageLogo'
import { RUNTIME_LANGUAGES } from '@/lib/languages'

const paths = [
  {
    title: 'Online compiler',
    body: 'Open the Monaco workspace, select a runtime, run stdin-backed tests, and reset the execution session when needed.',
    href: '/ide',
    icon: Terminal,
    action: 'Open IDE',
  },
  {
    title: 'Problem sets',
    body: 'Work through coding exercises by domain and difficulty, then bring solutions into the sandbox for real execution.',
    href: '/exercises',
    icon: Trophy,
    action: 'Browse problems',
  },
  {
    title: 'Submission history',
    body: 'Review progress, streaks, saved lessons, hackathons, and recent attempts from your student dashboard.',
    href: '/student/dashboard',
    icon: History,
    action: 'View dashboard',
  },
]

export default function PracticeHackathonsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Real execution gateway
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Practice before the hackathon clock starts
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Use the same sandbox path as live events: frontend to authenticated backend, then to the configured code runner, Judge0, or local development Python runtime.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/ide">
                  <Code2 className="h-4 w-4" />
                  Start coding
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/hackathons">
                  View hackathons
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Supported runtimes
                </p>
                <h2 className="mt-1 text-xl font-semibold">Language assets included</h2>
              </div>
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {RUNTIME_LANGUAGES.map((language) => (
                <LanguageBadge key={language.id} language={language.id} showVersion />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {paths.map(({ title, body, href, icon: Icon, action }) => (
            <article key={title} className="flex min-h-[250px] flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/35">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{body}</p>
              <Button asChild variant="outline" className="mt-5 w-full justify-between">
                <Link href={href}>
                  {action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-secondary/35 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Sandbox rules</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Execution uses backend validation, rate limiting, CSRF-compatible authenticated requests, byte limits, and runtime availability checks.
              </p>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 md:min-w-[420px]">
              {['No fake output', 'Session reset available', 'Runtime status visible'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
