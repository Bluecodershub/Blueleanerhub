'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  BookOpen,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function RoleSelectionContent() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl space-y-8"
      >
        <div className="text-center">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="mb-2 text-3xl font-bold">Start Your Journey</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose your role to get started. Free for students — no credit card needed.
          </p>
        </div>

        {/* Role Cards - 3 columns on desktop, stacked on mobile */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Student Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-blue-500/50 transition-all h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <h2 className="mb-2 text-xl font-bold">Student</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Learn, practice, compete, and grow. Access AI-powered quizzes, coding challenges, hackathons.
                </p>

                <ul className="mb-6 space-y-2">
                  {[
                    'Daily AI-powered quizzes',
                    'Coding challenges with live execution',
                    'Weekly hackathons',
                    'Progress tracking & XP',
                    'Free certificates',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/get-started" className="block">
                  <Button className="w-full gap-2">
                    Get Started Free
                    <Zap className="h-4 w-4" />
                  </Button>
                </Link>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professor Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-emerald-500/50 transition-all h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                  <BookOpen className="h-7 w-7" />
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-xl font-bold">Professor</h2>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    <Shield className="h-3 w-3" />
                    Faculty
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Manage classes, track student progress, and conduct live sessions. Perfect for educators.
                </p>

                <ul className="mb-6 space-y-2">
                  {[
                    'Create & manage classes',
                    'Track student progress',
                    'Schedule live sessions',
                    'Grade assignments',
                    'View analytics',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/login/mentor" className="block">
                  <Button variant="outline" className="w-full gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10">
                    Professor Login
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Organization Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-2 border-transparent hover:border-amber-500/50 transition-all h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="relative p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                  <Building2 className="h-7 w-7" />
                </div>

                <div className="mb-2 flex items-center gap-2">
                  <h2 className="text-xl font-bold">Organization</h2>
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Host hackathons, find talent, and track performance. Requires a corporate email address.
                </p>

                <ul className="mb-6 space-y-2">
                  {[
                    'Post jobs & find talent',
                    'Host hackathons with prizes',
                    'AI resume screening (ATS)',
                    'AI-conducted interviews',
                    'Bounties for top talent',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/login/corporate" className="block">
                  <Button variant="outline" className="w-full gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10">
                    Organization Login
                    <Building2 className="h-4 w-4" />
                  </Button>
                </Link>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-600">
                    Corporate email required.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Value Props */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-center font-semibold">Why BlueLearnerHub?</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: '100% Free', desc: 'No hidden fees, no paywalls' },
              { label: 'AI-Powered', desc: 'Smart quizzes generated daily' },
              { label: 'Industry Ready', desc: 'Skills employers actually want' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    }>
      <RoleSelectionContent />
    </Suspense>
  )
}
