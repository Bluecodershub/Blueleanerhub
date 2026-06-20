'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Download,
  ExternalLink,
  CheckCircle2,
  Shield,
  Calendar,
  Trophy,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { certificatesAPI } from '@/lib/api-civilization'

interface Certificate {
  id?: string
  credentialId: string
  title: string
  issuedFor?: string
  type: string
  issuedAt: string | null
  issuerName: string
  skills?: string[]
  verificationUrl: string
  gradient: string
}

const CERT_TYPE_ICONS: Record<string, typeof Award> = {
  track: Trophy,
  hackathon: Award,
  course: Sparkles,
  mentorship: Trophy,
  achievement: Trophy,
}
const CERT_TYPE_LABELS: Record<string, string> = {
  track: 'Career Track',
  hackathon: 'Hackathon',
  course: 'Course',
  mentorship: 'Mentorship',
  achievement: 'Achievement',
}
const CERT_TYPE_GRADIENTS: Record<string, string> = {
  course: 'from-primary to-cyan-600',
  hackathon: 'from-primary to-primary/90',
  mentorship: 'from-sky-600 to-purple-600',
  achievement: 'from-amber-500 to-orange-600',
  track: 'from-sky-600 to-purple-600',
}

/** Maps a raw Certificate record from the API into the card's view model. */
function normalizeCert(raw: any): Certificate {
  const type = String(raw.type ?? 'course').toLowerCase()
  const credentialId = raw.verificationCode ?? raw.credentialId ?? raw._id ?? ''
  return {
    id: raw._id ?? raw.id,
    credentialId,
    title: raw.title ?? 'Certificate',
    issuedFor: raw.issuedFor ?? raw.title,
    type,
    issuedAt: raw.issuedAt ?? null,
    issuerName: raw.issuerName ?? 'Bluelearnerhub',
    skills: Array.isArray(raw.skills)
      ? raw.skills.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : undefined,
    verificationUrl: raw.verificationUrl ?? `/certificates/verify/${credentialId}`,
    gradient: CERT_TYPE_GRADIENTS[type] ?? 'from-primary to-primary/80',
  }
}

function CertificateCard({ cert }: { cert: Certificate }) {
  const [copied, setCopied] = useState(false)
  const TypeIcon = CERT_TYPE_ICONS[cert.type as keyof typeof CERT_TYPE_ICONS] ?? Award

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://bluelearnerhub.com${cert.verificationUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden border-gray-800 bg-gray-900 transition-colors hover:border-gray-700">
      {/* Certificate visual */}
      <div className={`relative h-40 bg-gradient-to-br ${cert.gradient} p-6`}>
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative">
          <div className="mb-3 flex items-center gap-2">
            <TypeIcon className="h-5 w-5 text-white" />
            <Badge className="border-0 bg-white/20 text-xs text-white">
              {CERT_TYPE_LABELS[cert.type as keyof typeof CERT_TYPE_LABELS]}
            </Badge>
          </div>
          <h3 className="text-lg font-bold leading-snug text-white">{cert.title}</h3>
        </div>
        <div className="absolute bottom-4 right-4">
          <Shield className="h-8 w-8 text-white/30" />
        </div>
      </div>

      <CardContent className="p-5">
        {/* Details */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            Issued {cert.issuedAt ? format(new Date(cert.issuedAt), 'MMMM d, yyyy') : 'N/A'} by{' '}
            {cert.issuerName}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-foreground/80" />
            Credential ID: <span className="font-mono text-gray-400">{cert.credentialId}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(cert.skills ?? (cert as any).metadata?.skills ?? []).map((s: string) => (
            <span key={s} className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
              {s}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={cert.verificationUrl} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 border-gray-700 text-xs text-gray-300 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Verify
            </Button>
          </Link>
          <Button
            onClick={copyLink}
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-700 text-xs text-gray-300 hover:text-white"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-foreground/70" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied' : 'Share'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-gray-700 text-xs text-gray-300 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    certificatesAPI
      .mine()
      .then((res: any) => {
        if (!active) return
        const rows = res?.data?.data ?? res?.data ?? []
        setCerts(Array.isArray(rows) ? rows.map(normalizeCert) : [])
      })
      .catch(() => active && setCerts([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-5 w-5 text-foreground/70" />
              <span className="text-sm font-medium uppercase tracking-wider text-foreground/70">
                Credentials
              </span>
            </div>
            <h1 className="text-3xl font-bold">My Certificates</h1>
            <p className="mt-2 text-gray-400">
              Verifiable credentials for courses, tracks, and hackathon achievements.
            </p>
          </motion.div>

          <div className="mt-6 flex gap-6">
            {[
              { label: 'Earned', value: certs.length, icon: Award, color: 'text-foreground/70' },
              {
                label: 'Course Certs',
                value: certs.filter((c) => c.type === 'course').length,
                icon: Sparkles,
                color: 'text-sky-400',
              },
              {
                label: 'Hackathon Certs',
                value: certs.filter((c) => c.type === 'hackathon').length,
                icon: Trophy,
                color: 'text-purple-400',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="font-bold">{value}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
            ))}
          </div>
        ) : certs.length === 0 ? (
          <div className="py-20 text-center">
            <Award className="mx-auto mb-4 h-16 w-16 opacity-20" />
            <h2 className="mb-2 text-lg font-semibold text-gray-400">No certificates yet</h2>
            <p className="mb-6 text-sm text-gray-500">
              Complete courses and tracks to earn verifiable certificates.
            </p>
            <Link href="/learning-tracks">
              <Button className="bg-primary hover:bg-primary/90">Browse Learning Tracks</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((cert, i: number) => (
              <motion.div
                key={cert.id ?? cert.credentialId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <CertificateCard cert={cert} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
