'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Loader2, CheckCheck, Award, MessageSquare, Trophy, AlertCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Notification {
  _id: string
  type: string
  title: string
  body: string
  read: boolean
  link?: string
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  CERT_EARNED:        Award,
  FEEDBACK_RECEIVED:  MessageSquare,
  HACKATHON_DEADLINE: Trophy,
  GRADED:             CheckCheck,
  SYSTEM:             Info,
}

const TYPE_COLORS: Record<string, string> = {
  CERT_EARNED:        'bg-amber-500/10 text-amber-400',
  FEEDBACK_RECEIVED:  'bg-blue-500/10 text-blue-400',
  HACKATHON_DEADLINE: 'bg-rose-500/10 text-rose-400',
  GRADED:             'bg-emerald-500/10 text-emerald-400',
  SYSTEM:             'bg-muted text-muted-foreground',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications?limit=50')
      setNotifications(res.data?.data?.notifications ?? [])
      setUnreadCount(res.data?.data?.unreadCount ?? 0)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">Inbox</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} disabled={markingAll} variant="outline" size="sm" className="gap-2">
              {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-primary/10 p-5 mb-4">
              <Bell className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground">You have no notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n, i) => {
              const Icon = TYPE_ICONS[n.type] ?? Info
              const colorClass = TYPE_COLORS[n.type] ?? 'bg-muted text-muted-foreground'
              return (
                <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <div
                    onClick={() => { if (!n.read) markRead(n._id); if (n.link) window.location.href = n.link }}
                    className={cn(
                      'flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm',
                      n.read ? 'border-border bg-card opacity-70 hover:opacity-100' : 'border-primary/20 bg-primary/5 hover:border-primary/40'
                    )}
                  >
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shrink-0', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('font-semibold text-sm', n.read ? 'text-muted-foreground' : 'text-foreground')}>{n.title}</p>
                        {!n.read && <span className="flex h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
