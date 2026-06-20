'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import api from '@/lib/api'

interface MentorProfile {
  expertise?: string[] | string
  experience?: string
  bio?: string
  hourlyRate?: number
  isAvailable?: boolean
  stats?: { totalClasses: number; totalStudents: number; completedSessions: number }
}

export default function MentorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<MentorProfile['stats'] | null>(null)
  const [form, setForm] = useState({ expertise: '', experience: '', bio: '', hourlyRate: '', isAvailable: true })

  useEffect(() => {
    let active = true
    api.get('/mentor/profile')
      .then((r) => {
        if (!active) return
        const p: MentorProfile | null = r.data?.data
        if (p) {
          setForm({
            expertise: Array.isArray(p.expertise) ? p.expertise.join(', ') : (p.expertise ?? ''),
            experience: p.experience ?? '',
            bio: p.bio ?? '',
            hourlyRate: p.hourlyRate != null ? String(p.hourlyRate) : '',
            isAvailable: p.isAvailable ?? true,
          })
          setStats(p.stats ?? null)
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/mentor/profile', {
        expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
        experience: form.experience,
        bio: form.bio,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        isAvailable: form.isAvailable,
      })
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mentor</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground"><UserCircle className="h-6 w-6 text-primary" /> My Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">How students see you, and your mentoring availability.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Classes', value: stats.totalClasses },
            { label: 'Students', value: stats.totalStudents },
            { label: 'Sessions', value: stats.completedSessions },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-3 py-3 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Areas of expertise (comma-separated)</label>
          <Input value={form.expertise} onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))} placeholder="React, System Design, DSA" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Experience</label>
          <Input value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))} placeholder="e.g. 6 years, Senior Engineer @ …" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={4} placeholder="Tell students about your background and how you mentor." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Hourly rate (₹, optional)</label>
            <Input type="number" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} placeholder="0" />
          </div>
          <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm text-foreground">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))} className="h-4 w-4 accent-primary" />
            Available for mentoring
          </label>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
          </Button>
        </div>
      </div>
    </div>
  )
}
