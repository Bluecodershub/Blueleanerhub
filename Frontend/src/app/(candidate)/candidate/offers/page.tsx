'use client'

import { useEffect, useState } from 'react'
import { Award, Loader2, Building2, Calendar, IndianRupee, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Offer {
  id: number
  job_title: string
  company?: string
  salary?: string
  currency?: string
  location?: string
  remote?: boolean
  offered_at: string
  expires_at?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  letter_url?: string
}

export default function CandidateOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api
      .get('/candidate/offers')
      .then((r) => setOffers(r.data?.data ?? r.data ?? []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const respond = (id: number, action: 'accepted' | 'declined') =>
    api
      .patch(`/candidate/offers/${id}`, { status: action })
      .then(load)
      .catch(() => {})

  return (
    <div className="space-y-6 pb-16">
      <header>
        <h1 className="text-3xl md:text-4xl">
          Job <span className="text-primary">Offers</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Formal offer letters land here. You have until each offer&apos;s expiry to accept or
          decline.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : offers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No offers yet — keep applying.</p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {offers.map((o) => (
            <li key={o.id}>
              <Card
                className={
                  o.status === 'pending' ? 'border-t-2 border-t-primary' : undefined
                }
              >
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{o.job_title}</h3>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {o.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {o.company}
                          </span>
                        )}
                        {o.salary && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" /> {o.salary}
                          </span>
                        )}
                        {o.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {o.location}
                            {o.remote && ' • Remote'}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Offered {new Date(o.offered_at).toLocaleDateString()}
                        </span>
                        {o.expires_at && o.status === 'pending' && (
                          <span className="text-destructive">
                            Expires {new Date(o.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === 'pending' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => respond(o.id, 'declined')}
                        >
                          Decline
                        </Button>
                        <Button size="sm" onClick={() => respond(o.id, 'accepted')}>
                          Accept
                        </Button>
                      </>
                    ) : (
                      <Badge
                        className={`border-none text-[10px] uppercase ${
                          o.status === 'accepted'
                            ? 'bg-success-light text-success'
                            : o.status === 'declined'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {o.status}
                      </Badge>
                    )}
                    {o.letter_url && (
                      <a href={o.letter_url} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="sm">
                          Letter
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
