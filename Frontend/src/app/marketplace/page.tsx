'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ShoppingBag, Star, Search, Filter } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Product {
  id: number
  slug: string
  title: string
  description?: string
  price: number
  currency: string
  category?: string
  rating?: number
  ratings_count?: number
  cover_url?: string
  domain?: string
  tag?: string
}

export default function MarketplacePage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  useEffect(() => {
    api
      .get('/products')
      .then((r) => setItems(r.data?.data ?? r.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean)),
  ) as string[]

  const filtered = items.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    if (!query) return true
    const q = query.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl md:text-4xl">
              <span className="text-primary">Marketplace</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Courses, e-books, project templates, and mentor bundles.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9 md:w-72"
            />
          </div>
        </header>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                category === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  category === c
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No products match your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                {p.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.cover_url}
                    alt={p.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-primary/10">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                )}
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground">{p.title}</h3>
                    {p.tag && (
                      <Badge className="border-none bg-primary/10 text-[10px] text-primary">
                        {p.tag}
                      </Badge>
                    )}
                  </div>
                  {p.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                      {p.currency === 'INR' ? '₹' : p.currency} {p.price.toLocaleString()}
                    </p>
                    {typeof p.rating === 'number' && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        {p.rating.toFixed(1)}
                        {p.ratings_count && (
                          <span className="text-[10px]">({p.ratings_count})</span>
                        )}
                      </span>
                    )}
                  </div>
                  <Link href={`/marketplace/${p.slug}`}>
                    <Button size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
