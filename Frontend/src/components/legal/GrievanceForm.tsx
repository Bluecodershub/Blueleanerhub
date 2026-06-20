'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'PRIVACY', label: 'Privacy / Data' },
  { value: 'PAYMENT', label: 'Payment / Billing' },
  { value: 'CONTENT', label: 'Content' },
  { value: 'HARASSMENT', label: 'Harassment / Abuse' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' },
]

export default function GrievanceForm() {
  const [form, setForm] = useState({ name: '', email: '', category: 'PRIVACY', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/legal/grievance', form)
      setTicketId(res.data?.data?.ticketId ?? 'recorded')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Could not submit your grievance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (ticketId) {
    return (
      <div className="mt-10 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-200">
        <div className="mb-2 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-5 w-5" />
          Grievance recorded
        </div>
        <p className="text-sm leading-relaxed">
          Your reference number is <span className="font-mono font-semibold text-white">{ticketId}</span>. Our
          Grievance Officer will respond within 30 days at the email you provided. Please keep this reference for
          follow-up.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-xl border border-border bg-card p-6">
      <h2 className="text-xl font-bold text-white">File a Grievance</h2>
      <p className="text-sm text-muted-foreground">
        Use this form to raise a complaint. You do not need an account — parents/guardians can also file on behalf of a minor.
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="g-name">Your name</Label>
          <Input id="g-name" value={form.name} onChange={update('name')} required minLength={2} maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="g-email">Email</Label>
          <Input id="g-email" type="email" value={form.email} onChange={update('email')} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="g-category">Category</Label>
        <select
          id="g-category"
          value={form.category}
          onChange={update('category')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="g-subject">Subject</Label>
        <Input id="g-subject" value={form.subject} onChange={update('subject')} required minLength={3} maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="g-message">Describe your grievance</Label>
        <Textarea id="g-message" value={form.message} onChange={update('message')} required minLength={10} maxLength={5000} rows={5} />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? 'Submitting…' : 'Submit Grievance'}
      </Button>
    </form>
  )
}
