'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Globe, Mail, Phone, MapPin, Users,
  Loader2, Save, ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import { toast } from 'sonner'

interface CorporateProfile {
  companyName: string
  industry: string
  companySize: string
  website: string
  location: string
  description: string
  contactEmail: string
  contactPhone: string
  logoUrl: string
}

const EMPTY: CorporateProfile = {
  companyName:  '',
  industry:     '',
  companySize:  '',
  website:      '',
  location:     '',
  description:  '',
  contactEmail: '',
  contactPhone: '',
  logoUrl:      '',
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
  'Manufacturing', 'Media & Entertainment', 'Consulting', 'Other',
]

const SIZE_OPTIONS = [
  '1–10', '11–50', '51–200', '201–500', '501–1000', '1000+',
]

export default function CorporateProfilePage() {
  const [form, setForm] = useState<CorporateProfile>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/corporate/profile')
        if (res.data?.success && res.data.data) {
          setForm({ ...EMPTY, ...res.data.data })
        }
      } catch {
        // no profile yet — start with empty form
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const set = (field: keyof CorporateProfile) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    if (!form.companyName.trim()) {
      toast.error('Company name is required')
      return
    }
    setSaving(true)
    try {
      await api.put('/corporate/profile', form)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Corporate Portal</span>
        </div>
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your organisation details visible to candidates.</p>
      </div>

      {/* Avatar / Logo preview */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-6 flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-gradient-to-br from-sky-600 to-primary text-3xl font-bold text-white shadow-lg">
              {form.companyName?.[0]?.toUpperCase() || <Building2 className="h-8 w-8" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-lg truncate">{form.companyName || 'Your Company'}</p>
              <p className="text-sm text-muted-foreground">{form.industry || 'Industry not set'}</p>
              {form.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" /> {form.location}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  value={form.industry}
                  onChange={set('industry')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select industry</option>
                  {INDUSTRY_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="companySize" className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Company Size
                </Label>
                <select
                  id="companySize"
                  value={form.companySize}
                  onChange={set('companySize')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select size</option>
                  {SIZE_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Website
              </Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={set('website')}
                placeholder="https://acme.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">About the Company</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={set('description')}
                placeholder="Describe your company, culture, and mission..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={set('contactEmail')}
                placeholder="hr@acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone
              </Label>
              <Input
                id="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={set('contactPhone')}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-primary hover:bg-primary/90 min-w-[140px]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}
