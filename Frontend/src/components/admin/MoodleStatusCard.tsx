'use client'

import { useEffect, useState } from 'react'
import { Server, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { getMoodleSummary, syncAllMoodle, type MoodleSummary } from '@/lib/moodle'

/**
 * Admin dashboard card showing Moodle LMS connection status with a manual
 * "Sync now" action. Shows "Moodle not connected" when credentials are missing.
 */
export function MoodleStatusCard() {
  const [status, setStatus] = useState<MoodleSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    getMoodleSummary()
      .then(setStatus)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSync = async () => {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const result = await syncAllMoodle()
      setSyncMsg(
        result?.connected
          ? `Synced ${result?.courses?.synced ?? 0} courses, ${result?.users?.synced ?? 0} users.`
          : 'Moodle not connected — nothing to sync.'
      )
    } catch {
      setSyncMsg('Sync failed. Check Moodle configuration.')
    } finally {
      setSyncing(false)
      load()
    }
  }

  const connected = status?.connected
  const configured = status?.configured

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Moodle LMS Integration</h3>
            <p className="text-xs text-muted-foreground">Course, user, quiz & grade sync</p>
          </div>
        </div>

        {loading ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking
          </span>
        ) : connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold uppercase text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-bold uppercase text-warning">
            <AlertTriangle className="h-3.5 w-3.5" /> {configured ? 'Unreachable' : 'Not connected'}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <p>{status?.message ?? 'Loading Moodle status…'}</p>
        {status?.siteName && (
          <p className="text-foreground">
            Site: <span className="font-medium">{status.siteName}</span>
            {status.release && <span className="text-muted-foreground"> · {status.release}</span>}
          </p>
        )}
        {!configured && !loading && (
          <p className="text-xs">
            Set <code>MOODLE_BASE_URL</code> and <code>MOODLE_API_TOKEN</code> to enable sync.
            The platform uses its built-in local LMS until then.
          </p>
        )}
      </div>

      {/* Persisted sync state — real data only */}
      {configured && !loading && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
            <p className="text-lg font-bold text-foreground">{status?.courseMappings ?? 0}</p>
            <p className="text-[11px] text-muted-foreground">Course mappings</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
            <p className="text-lg font-bold text-foreground">{status?.userMappings ?? 0}</p>
            <p className="text-[11px] text-muted-foreground">User mappings</p>
          </div>
          <div className="col-span-2 text-xs text-muted-foreground">
            {status?.lastSync ? (
              <>
                Last sync: <span className="text-foreground">{status.lastSync.type.toLowerCase()}</span> ·{' '}
                {status.lastSync.status.toLowerCase()} · {status.lastSync.itemsSynced} item(s) ·{' '}
                {new Date(status.lastSync.createdAt).toLocaleString()}
              </>
            ) : (
              'No sync has run yet.'
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="btn btn-primary gap-2 text-sm disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {syncing ? 'Syncing…' : 'Sync now'}
        </button>
        <button onClick={load} disabled={loading} className="btn btn-outline gap-2 text-sm">
          Refresh
        </button>
        {syncMsg && <span className="text-xs text-muted-foreground">{syncMsg}</span>}
      </div>
    </div>
  )
}

export default MoodleStatusCard
