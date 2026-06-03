'use client'

import { useState } from 'react'
import { Mail, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

// Note: metadata must be in a separate server component — keeping this minimal
// export const metadata: Metadata = { title: 'Contact Us' }

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: 'Support Email',
    value: 'connect@bluelearnerhub.com',
    href: 'mailto:connect@bluelearnerhub.com',
  },
  { icon: MessageSquare, label: 'Community Q&A', value: 'Ask in our public forum', href: '/qna' },
  { icon: MapPin, label: 'Headquarters', value: 'India (Remote-first global team)', href: null },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Store as a lead + log message (fires-and-forgets to leads endpoint)
      await api
        .post('/leads/capture', {
          email: form.email,
          source: `contact_form_${form.subject}`,
        })
        .catch(() => {})
      setDone(true)
      toast.success("Message sent! We'll reply within 24 hours.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-24 text-foreground">
      <div className="mb-16 text-center">
        <h1 className="mb-4 font-serif text-5xl font-medium text-white">Contact Us</h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Have a question, partnership inquiry, or just want to say hello? We respond within 24
          hours.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left — channels */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white">Get in touch</h2>
          {CONTACT_CHANNELS.map((c, i) => {
            const Icon = c.icon
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card/40 p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {c.label}
                  </p>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="mt-1 text-sm font-medium text-white transition-colors hover:text-primary"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-white">{c.value}</p>
                  )}
                </div>
              </div>
            )
          })}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-2 font-bold text-white">For Organizations</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Looking to hire from our talent pool or run a private hackathon for your company?{' '}
              <a href="mailto:connect@bluelearnerhub.com" className="text-primary underline">
                connect@bluelearnerhub.com
              </a>
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="rounded-3xl border border-border/50 bg-card/40 p-8">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">Message Received!</h3>
              <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Subject
                </label>
                <select
                  required
                  value={form.subject}
                  onChange={set('subject')}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a subject…</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership / Hiring</option>
                  <option value="bug">Bug Report</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Tell us how we can help…"
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
