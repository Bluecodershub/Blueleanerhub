'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

// global-error.tsx replaces the root layout on fatal crashes.
// It must include its own <html>/<body> tags.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError] Fatal:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#020617',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <AlertTriangle style={{ width: 40, height: 40, color: '#ef4444' }} />
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '-0.05em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              CRITICAL_ERROR
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              The application encountered a fatal error and could not continue.
            </p>
            {error.digest && (
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 24,
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Reload_Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
