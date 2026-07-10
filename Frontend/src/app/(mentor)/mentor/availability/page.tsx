'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, Plus, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import api from '@/lib/api'

interface Slot {
  id?: number
  day_of_week: number  // 0=Sun, 6=Sat
  start_time: string   // "HH:MM"
  end_time: string
  timezone?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MentorAvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .get('/mentor/availability')
      .then((r) => setSlots(r.data?.data ?? r.data ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [])

  const addSlot = () =>
    setSlots((s) => [
      ...s,
      {
        day_of_week: 1,
        start_time: '18:00',
        end_time: '20:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    ])

  const remove = (i: number) => setSlots((s) => s.filter((_, idx) => idx !== i))
  const update = (i: number, patch: Partial<Slot>) =>
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)))

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/mentor/availability', { slots })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl md:text-4xl">
            My <span className="text-primary">Availability</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly recurring slots. Students book into these windows.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSlot}>
            <Plus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : slots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No availability yet.</p>
            <Button size="sm" onClick={addSlot} className="mt-3">
              Add First Slot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Recurring Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {slots.map((slot, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <select
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                    value={slot.day_of_week}
                    onChange={(e) => update(i, { day_of_week: Number(e.target.value) })}
                  >
                    {DAYS.map((d, dIdx) => (
                      <option key={dIdx} value={dIdx}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="time"
                    value={slot.start_time}
                    onChange={(e) => update(i, { start_time: e.target.value })}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={slot.end_time}
                    onChange={(e) => update(i, { end_time: e.target.value })}
                    className="w-32"
                  />
                  <span className="text-xs text-muted-foreground">
                    {slot.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </span>
                  <button
                    onClick={() => remove(i)}
                    className="ml-auto text-muted-foreground hover:text-destructive"
                    aria-label="Remove slot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
