'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  GraduationCap,
  Briefcase,
  Building2,
  UserCog,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

type Role = 'student' | 'candidate' | 'corporate' | 'mentor'

const ROLES: { key: Role; label: string; description: string; icon: typeof GraduationCap }[] = [
  {
    key: 'student',
    label: 'Student / Learner',
    description: 'Learn from tutorials, take quizzes, join hackathons.',
    icon: GraduationCap,
  },
  {
    key: 'candidate',
    label: 'Job Candidate',
    description: 'Apply to jobs, take interviews, showcase your resume.',
    icon: Briefcase,
  },
  {
    key: 'corporate',
    label: 'Corporate / Recruiter',
    description: 'Post jobs, host hackathons, hire candidates.',
    icon: Building2,
  },
  {
    key: 'mentor',
    label: 'Mentor',
    description: 'Offer 1:1 sessions and classes to learners.',
    icon: UserCog,
  },
]

const DOMAINS = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Management',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState<string | null>(null)
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))

  const finish = async () => {
    setSaving(true)
    try {
      await api.post('/onboarding', { role, full_name: name, primary_domain: domain, interests })
      router.replace(`/${role === 'candidate' ? 'candidate' : role === 'corporate' ? 'corporate' : role === 'mentor' ? 'mentor' : ''}/dashboard`)
    } finally {
      setSaving(false)
    }
  }

  const canNext =
    (step === 0 && !!role) ||
    (step === 1 && name.trim().length > 1) ||
    (step === 2 && !!domain) ||
    step === 3

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 w-16 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-secondary'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="space-y-6 p-8">
            {step === 0 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold">Which best describes you?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We&apos;ll tailor your experience. You can change this later.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {ROLES.map((r) => {
                    const Icon = r.icon
                    const selected = role === r.key
                    return (
                      <button
                        key={r.key}
                        onClick={() => setRole(r.key)}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{r.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold">What should we call you?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This appears on your public profile.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold">Which domain interests you most?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Determines the default content mix and lesson domain.
                  </p>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {DOMAINS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDomain(d)}
                      className={`rounded-lg border p-3 text-sm font-semibold transition-colors ${
                        domain === d
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground/80'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <h1 className="text-2xl font-bold">Pick a few interests</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Optional — helps us surface hackathons and content you actually want.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Web dev',
                    'Data science',
                    'Machine learning',
                    'DSA',
                    'System design',
                    'Cybersecurity',
                    'DevOps',
                    'Mobile',
                    'Robotics',
                    'IoT',
                    'Finance',
                    'Product',
                  ].map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        interests.includes(i)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {interests.includes(i) && <Check className="mr-1 inline h-3 w-3" />}
                      {i}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-4">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <Button
                  onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2 | 3)}
                  disabled={!canNext}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finish
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
