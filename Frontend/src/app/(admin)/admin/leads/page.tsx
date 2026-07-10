'use client'

import { useEffect, useState } from 'react'
import { Users, Loader2, Mail, Phone, Building2, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

interface Lead {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  source?: string
  message?: string
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  created_at: string
}

const STATUS: Record<string, string> = {
  new: 'bg-primary/10 text-primary',
  contacted: 'bg-blue-500/10 text-blue-500',
  qualified: 'bg-amber-500/10 text-amber-500',
  won: 'bg-success-light text-success',
  lost: 'bg-muted text-muted-foreground',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Lead['status']>('all')
  const [query, setQuery] = useState('')

  const load = () => {
    setLoading(true)
    api
      .get('/admin/leads')
      .then((r) => setLeads(r.data?.data ?? r.data ?? []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const setStatus = (id: number, status: Lead['status']) =>
    api.patch(`/admin/leads/${id}`, { status }).then(load).catch(() => {})

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.company ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            Sales <span className="text-primary">Leads</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inbound leads from marketing pages, referrals, and forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, company"
            className="md:w-72"
          />
          <a href="/api/admin/leads.csv" download>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </a>
        </div>
      </header>

      <div className="flex gap-2 border-b border-border pb-3">
        {(['all', 'new', 'contacted', 'qualified', 'won', 'lost'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              filter === k
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No leads match.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-secondary/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold text-foreground">{l.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <a
                        href={`mailto:${l.email}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Mail className="h-3 w-3" /> {l.email}
                      </a>
                      {l.phone && (
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center gap-1 text-muted-foreground"
                        >
                          <Phone className="h-3 w-3" /> {l.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {l.company && (
                      <span className="flex items-center gap-1 text-xs">
                        <Building2 className="h-3 w-3" /> {l.company}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {l.source ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={l.status}
                      onChange={(e) => setStatus(l.id, e.target.value as Lead['status'])}
                      className={`rounded-full border-none px-2 py-1 text-[10px] font-bold uppercase ${STATUS[l.status]}`}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="qualified">qualified</option>
                      <option value="won">won</option>
                      <option value="lost">lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
