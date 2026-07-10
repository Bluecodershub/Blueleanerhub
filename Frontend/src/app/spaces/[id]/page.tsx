'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Users, MessageSquare, TrendingUp, Send, Hash } from 'lucide-react'
import Header from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Space {
  id: number
  slug: string
  name: string
  description?: string
  member_count: number
  post_count: number
  joined?: boolean
  tags?: string[]
}
interface Post {
  id: number
  author_name: string
  title: string
  body_preview: string
  created_at: string
  reply_count: number
  upvote_count: number
}

export default function SpacePage() {
  const { id } = useParams<{ id: string }>()
  const [space, setSpace] = useState<Space | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/spaces/${id}`).catch(() => ({ data: null })),
      api.get(`/spaces/${id}/posts`).catch(() => ({ data: [] })),
    ])
      .then(([s, p]) => {
        setSpace(s.data?.data ?? s.data)
        setPosts(p.data?.data ?? p.data ?? [])
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  const toggleJoin = () =>
    api
      .post(`/spaces/${id}/${space?.joined ? 'leave' : 'join'}`)
      .then(load)
      .catch(() => {})

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setPosting(true)
    try {
      await api.post(`/spaces/${id}/posts`, { title: draft.slice(0, 100), body: draft })
      setDraft('')
      load()
    } finally {
      setPosting(false)
    }
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
  if (!space) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-sm text-muted-foreground">Space not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="h-3 w-3" /> {space.slug}
            </div>
            <h1 className="text-3xl md:text-4xl">{space.name}</h1>
            {space.description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{space.description}</p>
            )}
            {space.tags && space.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {space.tags.map((t) => (
                  <Badge key={t} variant="outline" className="border-border text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" /> {space.member_count.toLocaleString()} members
              </p>
              <p className="flex items-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3 w-3" /> {space.post_count.toLocaleString()} posts
              </p>
            </div>
            <Button onClick={toggleJoin} variant={space.joined ? 'outline' : 'default'}>
              {space.joined ? 'Leave' : 'Join'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            {space.joined && (
              <Card>
                <CardContent className="p-4">
                  <form onSubmit={submit} className="space-y-3">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      placeholder={`What's on your mind, ${space.name} community?`}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={posting || !draft.trim()}>
                        <Send className="mr-2 h-3.5 w-3.5" />
                        Post
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  No posts yet. Be the first to start a thread.
                </CardContent>
              </Card>
            ) : (
              <ul className="space-y-3">
                {posts.map((p) => (
                  <li key={p.id}>
                    <Card>
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground">
                          {p.author_name} • {new Date(p.created_at).toLocaleString()}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-foreground">{p.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{p.body_preview}</p>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> {p.upvote_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> {p.reply_count}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase">About this space</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>{space.description ?? 'A place for community discussion.'}</p>
                <div className="border-t border-border pt-2">
                  <p>
                    <span className="font-bold text-foreground">
                      {space.member_count.toLocaleString()}
                    </span>{' '}
                    members
                  </p>
                  <p>
                    <span className="font-bold text-foreground">
                      {space.post_count.toLocaleString()}
                    </span>{' '}
                    posts
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
