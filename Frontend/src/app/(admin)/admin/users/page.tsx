'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Filter, Shield, GraduationCap, Building2,
  Zap, MoreHorizontal, Ban, RefreshCw, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle,
} from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

interface UserRow {
  _id: string
  fullName: string
  email: string
  role: string
  domain?: string
  isActive: boolean
  isBanned: boolean
  totalPoints: number
  level: number
  createdAt: string
  lastLoginAt?: string
}

const ROLE_COLORS: Record<string, string> = {
  STUDENT:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MENTOR:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CORPORATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ADMIN:     'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  STUDENT: Zap, MENTOR: GraduationCap, CORPORATE: Building2, ADMIN: Shield,
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search)     params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const r = await api.get(`/admin/users?${params}`)
      setUsers(r.data.data.users)
      setTotal(r.data.data.total)
      setTotalPages(r.data.data.totalPages)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Debounced search
  useEffect(() => { setPage(1) }, [search, roleFilter])

  const changeRole = async (userId: string, role: string) => {
    setActionLoading(userId + '-role')
    try {
      await api.put(`/admin/users/${userId}/role`, { role })
      toast.success(`Role updated to ${role}`)
      fetchUsers()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to update role')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleBan = async (userId: string, banned: boolean) => {
    setActionLoading(userId + '-ban')
    try {
      await api.put(`/admin/users/${userId}/ban`, { banned })
      toast.success(banned ? 'User banned' : 'User unbanned')
      fetchUsers()
    } catch {
      toast.error('Failed to update ban status')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-4 w-4 text-rose-500" />
          <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest">User Management</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Users</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{total.toLocaleString()} registered users</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 font-mono text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="MENTOR">Mentor</option>
          <option value="CORPORATE">Corporate</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hidden md:table-cell">XP / Lvl</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u, i) => {
                  const RoleIcon = ROLE_ICONS[u.role] ?? Shield
                  return (
                    <motion.tr key={u._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }} className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u._id}`} className="flex items-center gap-3 hover:underline">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                            {u.fullName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">{u.fullName || '—'}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold uppercase', ROLE_COLORS[u.role] ?? '')}>
                          <RoleIcon className="h-2.5 w-2.5" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {u.totalPoints?.toLocaleString() ?? 0} XP · Lv{u.level ?? 1}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400">
                            <XCircle className="h-3 w-3" /> Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            disabled={actionLoading === u._id + '-role'}
                            onChange={e => changeRole(u._id, e.target.value)}
                            className="rounded border border-input bg-card px-2 py-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {['STUDENT','MENTOR','CORPORATE','ADMIN'].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => toggleBan(u._id, !u.isBanned)}
                            disabled={actionLoading === u._id + '-ban'}
                            title={u.isBanned ? 'Unban' : 'Ban'}
                            className={cn(
                              'rounded-lg border p-1.5 transition-colors',
                              u.isBanned
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                            )}
                          >
                            {actionLoading === u._id + '-ban'
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Ban className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-mono text-xs">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
