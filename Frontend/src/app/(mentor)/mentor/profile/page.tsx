'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Loader2, Save, GraduationCap, Globe, Link as LinkIcon, GitBranch,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

interface MentorProfileData {
  bio?: string
  expertise?: string[]
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  hourlyRate?: number
  isAvailable?: boolean
}

export default function MentorProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<MentorProfileData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expertise, setExpertise] = useState('')

  useEffect(() => {
    api.get('/mentor/profile').then(r => {
      if (r.data?.success) setProfile(r.data.data ?? {})
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const expertiseArr = expertise
        ? expertise.split(',').map(s => s.trim()).filter(Boolean)
        : profile.expertise ?? []
      await api.put('/mentor/profile', { ...profile, expertise: expertiseArr })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (profile.expertise?.length) setExpertise(profile.expertise.join(', '))
  }, [profile.expertise])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">Profile</span>
        </div>
        <h1 className="text-2xl font-bold">Mentor Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Update your public mentor profile.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 space-y-5 glass"
        >
          {/* Name display */}
          <div className="flex items-center gap-4 pb-4 border-b border-border/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/20 text-2xl font-bold text-emerald-400">
              {user?.fullName?.[0]?.toUpperCase() ?? 'M'}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{user?.fullName ?? 'Mentor'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <span className="inline-block mt-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">Mentor</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
            <textarea
              value={profile.bio ?? ''}
              onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell students about your background and teaching style..."
              rows={4}
              className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expertise (comma-separated)</label>
            <Input value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="React, Node.js, Machine Learning..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                <LinkIcon className="h-3.5 w-3.5" /> LinkedIn URL
              </label>
              <Input value={profile.linkedinUrl ?? ''} onChange={e => setProfile(p => ({ ...p, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                <GitBranch className="h-3.5 w-3.5" /> GitHub URL
              </label>
              <Input value={profile.githubUrl ?? ''} onChange={e => setProfile(p => ({ ...p, githubUrl: e.target.value }))} placeholder="https://github.com/..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5 block">
                <Globe className="h-3.5 w-3.5" /> Portfolio URL
              </label>
              <Input value={profile.portfolioUrl ?? ''} onChange={e => setProfile(p => ({ ...p, portfolioUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hourly Rate (USD)</label>
              <Input type="number" value={profile.hourlyRate ?? ''} onChange={e => setProfile(p => ({ ...p, hourlyRate: parseFloat(e.target.value) || undefined }))} placeholder="0" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.isAvailable ?? true}
                onChange={e => setProfile(p => ({ ...p, isAvailable: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted-foreground">Available for new students</span>
            </label>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Profile
          </Button>
        </motion.div>
      )}
    </div>
  )
}
