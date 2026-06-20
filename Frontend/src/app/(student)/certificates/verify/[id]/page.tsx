'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, CheckCircle2, XCircle, Award, ExternalLink, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { certificatesAPI } from '@/lib/api-civilization'

interface VerifiedCert {
  credentialId: string
  title: string
  issuedFor: string
  issuerName: string
  recipientName: string
  issuedAt: string | null
  expiresAt: string | null
  status: 'valid' | 'expired' | string
}

function safeDate(value: string | null, fallback = 'N/A') {
  if (!value) return fallback
  const d = new Date(value)
  return isNaN(d.getTime()) ? fallback : format(d, 'MMMM d, yyyy')
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [loading, setLoading] = useState(true)
  const [cert, setCert] = useState<VerifiedCert | null>(null)
  const [valid, setValid] = useState(false)

  useEffect(() => {
    let active = true
    certificatesAPI
      .verify(id)
      .then((res: any) => {
        if (!active) return
        const body = res?.data
        if (body?.data) {
          setCert(body.data as VerifiedCert)
          setValid(Boolean(body.valid))
        } else {
          setCert(null)
          setValid(false)
        }
      })
      .catch(() => {
        if (!active) return
        setCert(null)
        setValid(false)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 py-12 text-white">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-foreground/60" />
              <p className="text-sm text-gray-400">Verifying credential…</p>
              <p className="font-mono text-xs text-gray-600">{id}</p>
            </div>
          ) : (
            <>
              {/* Verification badge */}
              <div className="mb-6 text-center">
                {cert && valid ? (
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background">
                        <Shield className="h-10 w-10 text-foreground/70" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground/70">Certificate Verified</h1>
                      <p className="mt-1 text-sm text-gray-400">
                        This credential is authentic and was issued by Bluelearnerhub.
                      </p>
                    </div>
                  </div>
                ) : cert && !valid ? (
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-950">
                      <Clock className="h-10 w-10 text-amber-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-amber-400">Certificate Expired</h1>
                      <p className="mt-1 text-sm text-gray-400">
                        This credential was genuine but is no longer valid.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-950">
                      <XCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-red-400">Certificate Not Found</h1>
                      <p className="mt-1 text-sm text-gray-400">
                        No credential matches this ID. It may be mistyped or revoked.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate details — only when a real record exists */}
              {cert && (
                <Card className="border-gray-800 bg-gray-900">
                  <div className="h-2 rounded-t-xl bg-gradient-to-r from-primary to-primary/70" />
                  <CardContent className="p-6">
                    <div className="mb-5 text-center">
                      <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
                        Certificate of Achievement
                      </p>
                      <h2 className="text-xl font-bold text-white">{cert.title}</h2>
                      {cert.issuedFor && cert.issuedFor !== cert.title && (
                        <p className="mt-1 text-sm text-gray-400">{cert.issuedFor}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 border-y border-gray-800 py-4">
                      <Award className="h-5 w-5 text-foreground/70" />
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Awarded to</p>
                        <p className="text-lg font-bold text-white">{cert.recipientName}</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Credential ID</span>
                        <span className="font-mono text-xs text-gray-300">{cert.credentialId}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Issued by</span>
                        <span className="text-gray-300">{cert.issuerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Issue date</span>
                        <span className="text-gray-300">{safeDate(cert.issuedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        {valid ? (
                          <span className="flex items-center gap-1.5 font-medium text-foreground/70">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Valid · {cert.expiresAt ? `expires ${safeDate(cert.expiresAt)}` : 'does not expire'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-medium text-amber-400">
                            <Clock className="h-3.5 w-3.5" /> Expired {safeDate(cert.expiresAt, '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="mt-4 text-center text-xs text-gray-600">
                Verified on Bluelearnerhub · {format(new Date(), 'PPP')}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="gap-1.5 border-gray-700 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Visit Bluelearnerhub
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
