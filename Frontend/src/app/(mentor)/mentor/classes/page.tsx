'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, CalendarDays, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface MentorClass {
  _id: string
  name?: string
  title?: string
  description?: string
  studentCount: number
  sessionCount: number
}

export default function MentorClassesPage() {
  const [classes, setClasses] = useState<MentorClass[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/mentor/classes')
      .then((r) => active && setClasses(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => active && setClasses([]))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mentor</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">My Classes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Batches you mentor and their students.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-30" />
          <p className="text-sm font-semibold text-foreground">No classes yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Classes assigned to you will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="font-semibold text-foreground">{c.name || c.title || 'Untitled class'}</h3>
              {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {c.studentCount} students</span>
                <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {c.sessionCount} sessions</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
