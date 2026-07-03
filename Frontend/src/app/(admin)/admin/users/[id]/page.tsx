'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Zap, Trophy, BarChart3, Loader2, Ban, CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface UserDetail {
  _id: string; fullName: string; email: string; role: string; domain?: string
  isActive: boolean; isBanned: boolean; totalPoints: number; level: number
  currentStreak: number; longestStreak: number; bio?: string
  collegeName?: string; educationLevel?: string; graduationYear?: number
  createdAt: string; lastLoginAt?: string
}

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'text-sky-400', MENTOR: 'text-emerald-400',
  CORPORATE: 'text-amber-400', ADMIN: 'text-rose-400',
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [stats, setStats] = useState<{ quizCount: number; hackathonCount: number; xpTotal: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState('')

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(r => {
        setUser(r.data.data.user)
        setStats(r.data.data.stats)
        setRole(r.data.data.user.role)
      })
      .catch(() => toast.error('Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  const saveRole = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      toast.success('Role updated')
      setUser(u => u ? { ...u, role } : u)
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  const toggleBan = async () => {
    if (!user) return
    setSaving(true)
    try {
      const r = await api.put(`/admin/users/${id}/ban`, { banned: !user.isBanned })
      setUser(u => u ? { ...u, isBanned: r.data.data.isBanned, isActive: r.data.data.isActive } : u)
      toast.success(user.isBanned ? 'User unbanned' : 'User banned')
    } catch {
      toast.error('Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  )
  if (!user) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground">User not found.</p>
    </div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6 glass flex items-start gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary flex-shrink-0">
          {user.fullName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.fullName || '—'}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className={cn('text-xs font-mono font-bold uppercase mt-1 inline-block', ROLE_COLORS[user.role])}>
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {user.isBanned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-1 text-[10px] font-mono font-bold text-rose-400">
                  <Ban className="h-2.5 w-2.5" /> Banned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[10px] font-mono font-bold text-emerald-400">
                  <CheckCircle className="h-2.5 w-2.5" /> Active
                </span>
              )}
            </div>
          </div>
          {user.bio && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground font-mono">
            {user.collegeName && <span>🎓 {user.collegeName}</span>}
            {user.domain && <span>🏷 {user.domain}</span>}
            <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            {user.lastLoginAt && <span>🕐 Last login {new Date(user.lastLoginAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total XP', value: user.totalPoints?.toLocaleString() ?? 0, icon: Zap, color: 'text-sky-400' },
          { label: 'Level', value: user.level ?? 1, icon: BarChart3, color: 'text-sky-400' },
          { label: 'Quiz Attempts', value: stats?.quizCount ?? 0, icon: Shield, color: 'text-amber-400' },
          { label: 'Hackathons', value: stats?.hackathonCount ?? 0, icon: Trophy, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <Icon className={cn('mx-auto h-5 w-5 mb-2', color)} />
            <p className="text-xl font-bold font-mono text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="rounded-xl border border-border bg-card p-6 glass space-y-4">
        <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-muted-foreground">Admin Actions</h2>

        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs font-mono font-bold uppercase tracking-wide text-muted-foreground mb-1.5 block">Change Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {['STUDENT','CORPORATE','ADMIN'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <Button onClick={saveRole} disabled={saving || role === user.role} className="bg-rose-600 hover:bg-rose-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Role'}
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <label className="text-xs font-mono font-bold uppercase tracking-wide text-muted-foreground mb-2 block">
            {user.isBanned ? 'This user is currently banned.' : 'Ban this user from the platform.'}
          </label>
          <Button
            variant="outline"
            onClick={toggleBan}
            disabled={saving}
            className={cn(user.isBanned
              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
              : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
            {user.isBanned ? 'Unban User' : 'Ban User'}
          </Button>
        </div>
      </div>
    </div>
  )
}
