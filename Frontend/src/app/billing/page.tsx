'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Loader2, Download, Check, Zap } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Subscription {
  plan: 'free' | 'pro' | 'team'
  status: 'active' | 'past_due' | 'cancelled'
  renews_at?: string
  amount?: number
  currency?: string
  method?: string
  last4?: string
}
interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'failed'
  issued_at: string
  pdf_url?: string
}

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '₹0',
    features: ['Public lessons', '3 quiz attempts / week', 'Community access'],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '₹499 / mo',
    features: ['All lessons + labs', 'Unlimited quizzes', 'Mentor 1:1s', 'Priority support'],
    recommended: true,
  },
  {
    key: 'team',
    label: 'Team',
    price: 'Contact sales',
    features: ['SSO', 'Custom cohorts', 'Analytics dashboard', 'Dedicated CS'],
  },
]

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/billing/subscription').catch(() => ({ data: null })),
      api.get('/billing/invoices').catch(() => ({ data: [] })),
    ])
      .then(([s, i]) => {
        setSub(s.data?.data ?? s.data)
        setInvoices(i.data?.data ?? i.data ?? [])
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const upgrade = async (plan: string) => {
    try {
      const r = await api.post('/billing/checkout', { plan })
      const url = r.data?.data?.url ?? r.data?.url
      if (url) window.location.href = url
    } catch {}
  }

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
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <h1 className="text-3xl">Billing &amp; Subscription</h1>

        <Card className="border-t-2 border-t-primary">
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold capitalize text-primary">
                  {sub?.plan ?? 'free'}
                </p>
                {sub?.status && (
                  <Badge
                    className={`border-none text-[10px] uppercase ${
                      sub.status === 'active'
                        ? 'bg-success-light text-success'
                        : sub.status === 'past_due'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {sub.status}
                  </Badge>
                )}
              </div>
              {sub?.renews_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Renews {new Date(sub.renews_at).toLocaleDateString()}
                </p>
              )}
              {sub?.last4 && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <CreditCard className="h-3 w-3" /> {sub.method ?? 'Card'} •••• {sub.last4}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => api.post('/billing/portal').then((r) => {
                  const url = r.data?.data?.url ?? r.data?.url
                  if (url) window.location.href = url
                }).catch(() => {})}
              >
                Manage Payment
              </Button>
              {sub?.plan !== 'pro' && (
                <Button onClick={() => upgrade('pro')}>
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase text-muted-foreground">Plans</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.key}
                className={p.recommended ? 'border-t-2 border-t-primary' : undefined}
              >
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{p.label}</h3>
                    {p.recommended && (
                      <Badge className="border-none bg-primary/10 text-[10px] text-primary">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl font-bold">{p.price}</p>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                        <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={sub?.plan === p.key ? 'outline' : 'default'}
                    className="w-full"
                    disabled={sub?.plan === p.key}
                    onClick={() => (p.key === 'team' ? window.open('/contact') : upgrade(p.key))}
                  >
                    {sub?.plan === p.key ? 'Current Plan' : p.key === 'team' ? 'Contact Sales' : 'Choose'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-4 py-3">
                        {new Date(inv.issued_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {inv.currency === 'INR' ? '₹' : inv.currency} {inv.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border-none text-[10px] uppercase ${
                            inv.status === 'paid'
                              ? 'bg-success-light text-success'
                              : inv.status === 'failed'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-secondary text-muted-foreground'
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {inv.pdf_url && (
                          <a href={inv.pdf_url} target="_blank" rel="noreferrer">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
