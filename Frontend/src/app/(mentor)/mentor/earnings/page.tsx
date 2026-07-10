'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, IndianRupee, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface EarningsSummary {
  lifetime_paid: number
  pending_payout: number
  this_month: number
  last_month: number
  next_payout_date?: string
  currency: string
}

interface Payout {
  id: number
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  requested_at: string
  paid_at?: string
  method?: string
  reference?: string
}

export default function MentorEarningsPage() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/mentor/earnings/summary').catch(() => ({ data: null })),
      api.get('/mentor/earnings/payouts').catch(() => ({ data: [] })),
    ])
      .then(([sRes, pRes]) => {
        setSummary(sRes.data?.data ?? sRes.data)
        setPayouts(pRes.data?.data ?? pRes.data ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const cur = summary?.currency ?? 'INR'
  const fmt = (n?: number) =>
    typeof n === 'number' ? `${cur === 'INR' ? '₹' : cur} ${n.toLocaleString()}` : '—'

  const monthDelta =
    summary && summary.last_month
      ? ((summary.this_month - summary.last_month) / summary.last_month) * 100
      : null

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          Earnings &amp; <span className="text-primary">Payouts</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Session fees minus platform commission. Payouts run weekly.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase text-muted-foreground">Lifetime Paid</p>
            <p className="mt-2 text-2xl font-bold">{fmt(summary?.lifetime_paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase text-muted-foreground">Pending Payout</p>
            <p className="mt-2 text-2xl font-bold text-primary">{fmt(summary?.pending_payout)}</p>
            {summary?.next_payout_date && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Next: {new Date(summary.next_payout_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase text-muted-foreground">This Month</p>
            <p className="mt-2 text-2xl font-bold">{fmt(summary?.this_month)}</p>
            {monthDelta !== null && (
              <p
                className={`mt-1 flex items-center gap-1 text-[10px] ${
                  monthDelta >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {monthDelta.toFixed(1)}% vs last month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase text-muted-foreground">Last Month</p>
            <p className="mt-2 text-2xl font-bold">{fmt(summary?.last_month)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold">Payout History</CardTitle>
          <a href="/api/mentor/earnings/statements.csv" download>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </a>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No payouts yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        {new Date(p.requested_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="inline-flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {p.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.method ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge
                          className={`border-none text-[10px] uppercase ${
                            p.status === 'paid'
                              ? 'bg-success-light text-success'
                              : p.status === 'failed'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {p.reference ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
