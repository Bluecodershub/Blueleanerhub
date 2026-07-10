'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  KeyRound,
  Loader2,
  LogOut,
  Save,
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/api'

interface Prefs {
  email: string
  full_name: string
  email_notifications: boolean
  marketing_emails: boolean
  weekly_digest: boolean
  two_factor_enabled: boolean
  theme: 'system' | 'light' | 'dark'
}

const DEFAULT: Prefs = {
  email: '',
  full_name: '',
  email_notifications: true,
  marketing_emails: false,
  weekly_digest: true,
  two_factor_enabled: false,
  theme: 'system',
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/settings')
      .then((r) => setPrefs({ ...DEFAULT, ...(r.data?.data ?? r.data) }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/settings', prefs)
    } finally {
      setSaving(false)
    }
  }
  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl">Account Settings</h1>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" /> Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={prefs.full_name} onChange={(e) => update('full_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={prefs.email} onChange={(e) => update('email', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                ['email_notifications', 'Email notifications for messages & activity'],
                ['weekly_digest', 'Weekly learning digest'],
                ['marketing_emails', 'Product updates and offers'],
              ] as [keyof Prefs, string][]
            ).map(([k, label]) => (
              <label key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm text-foreground">{label}</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={Boolean(prefs[k])}
                  onChange={(e) => update(k as keyof Prefs, e.target.checked as never)}
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Adds an OTP code on every login.</p>
              </div>
              <Link href="/login/2fa">
                <Button variant="outline" size="sm">
                  {prefs.two_factor_enabled ? 'Manage' : 'Enable'}
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Change your password.</p>
              </div>
              <Link href="/reset-password">
                <Button variant="outline" size="sm">
                  <KeyRound className="mr-2 h-3.5 w-3.5" />
                  Change
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Sign out of all devices</p>
                <p className="text-xs text-muted-foreground">Revokes every active session.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => api.post('/auth/logout-all').catch(() => {})}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign out all
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-primary" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('theme', t)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${
                    prefs.theme === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" /> Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/billing">
              <Button variant="outline">Manage subscription & invoices →</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
