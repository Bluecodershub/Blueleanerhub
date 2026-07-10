'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, User, Globe, Code, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

interface Profile {
  full_name: string
  headline?: string
  bio?: string
  location?: string
  years_experience?: number
  primary_domain?: string
  skills?: string[]
  github_url?: string
  linkedin_url?: string
  portfolio_url?: string
  open_to_work: boolean
}

const EMPTY: Profile = {
  full_name: '',
  open_to_work: true,
}

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<Profile>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [skillsInput, setSkillsInput] = useState('')

  useEffect(() => {
    api
      .get('/candidate/profile')
      .then((r) => {
        const p = r.data?.data ?? r.data ?? EMPTY
        setProfile(p)
        setSkillsInput((p.skills ?? []).join(', '))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...profile,
        skills: skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      await api.put('/candidate/profile', payload)
    } finally {
      setSaving(false)
    }
  }

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }))

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            Candidate <span className="text-primary">Profile</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recruiters search these fields. Keep skills fresh and open-to-work flipped correctly.
          </p>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => update('full_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={profile.headline ?? ''}
              onChange={(e) => update('headline', e.target.value)}
              placeholder="Senior Frontend Engineer, ex-Amazon"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={profile.location ?? ''}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Years of experience</Label>
            <Input
              type="number"
              min={0}
              value={profile.years_experience ?? ''}
              onChange={(e) => update('years_experience', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Primary domain</Label>
            <Input
              value={profile.primary_domain ?? ''}
              onChange={(e) => update('primary_domain', e.target.value)}
              placeholder="Computer Science, Mechanical, Civil, Electrical, Management"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bio</Label>
            <textarea
              value={profile.bio ?? ''}
              onChange={(e) => update('bio', e.target.value)}
              rows={5}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Short professional bio (max 500 chars)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Comma-separated skills</Label>
          <Input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, TypeScript, Node.js, PostgreSQL, System Design"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="h-4 w-4" /> GitHub
            </Label>
            <Input
              value={profile.github_url ?? ''}
              onChange={(e) => update('github_url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> LinkedIn
            </Label>
            <Input
              value={profile.linkedin_url ?? ''}
              onChange={(e) => update('linkedin_url', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Portfolio
            </Label>
            <Input
              value={profile.portfolio_url ?? ''}
              onChange={(e) => update('portfolio_url', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="font-semibold text-foreground">Open to work</p>
            <p className="text-xs text-muted-foreground">
              Recruiters will only see your profile in searches when this is on.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={profile.open_to_work}
              onChange={(e) => update('open_to_work', e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative inline-block h-6 w-11 rounded-full bg-secondary transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5" />
          </label>
        </CardContent>
      </Card>
    </div>
  )
}
