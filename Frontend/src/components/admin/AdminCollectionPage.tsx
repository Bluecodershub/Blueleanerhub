'use client'

import { useEffect, useMemo, useState } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

type Column = {
  key: string
  label: string
}

function valueAt(row: Record<string, any>, key: string): string {
  const value = key.split('.').reduce<any>((acc, part) => acc?.[part], row)
  if (value === null || value === undefined || value === '') return '-'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return value.fullName || value.email || value.name || value.title || value._id || '-'
  return String(value)
}

export function AdminCollectionPage({
  title,
  description,
  endpoint,
  itemKey,
  columns,
}: {
  title: string
  description: string
  endpoint: string
  itemKey: string
  columns: Column[]
}) {
  const [rows, setRows] = useState<Record<string, any>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(endpoint)
      const data = res.data?.data ?? {}
      setRows(Array.isArray(data) ? data : data[itemKey] ?? data.roles ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [endpoint])

  const count = useMemo(() => rows.length, [rows])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Records</CardTitle>
          <Badge variant="secondary">{count}</Badge>
        </CardHeader>
        <CardContent>
          {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {!error && loading && <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
          {!error && !loading && rows.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No records found.</div>
          )}
          {!error && !loading && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    {columns.map((column) => (
                      <th key={column.key} className="px-3 py-2 font-medium">{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row._id ?? row.id ?? `${title}-${index}`} className="border-b last:border-0">
                      {columns.map((column) => (
                        <td key={column.key} className="max-w-[260px] truncate px-3 py-3">{valueAt(row, column.key)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
