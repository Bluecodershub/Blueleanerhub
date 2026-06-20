'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Trophy,
  Globe,
  ExternalLink,
  ChevronRight,
  Loader2,
  Building2,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { orgsAPI } from '@/lib/api-civilization'

interface OrgMember {
  name: string
  role?: string
}
interface Organization {
  name: string
  slug?: string
  type?: 'UNIVERSITY' | 'COMPANY' | 'COMMUNITY' | string
  description?: string
  website?: string
  members: OrgMember[]
  challenges: any[]
  talentPool?: any[]
}

const TYPE_LABEL: Record<string, string> = {
  UNIVERSITY: 'University',
  COMPANY: 'Company',
  COMMUNITY: 'Community',
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    orgsAPI
      .get(encodeURIComponent(slug))
      .then((res: any) => {
        if (!active) return
        const data = res?.data?.data
        setOrg(data && data.name ? data : null)
      })
      .catch(() => active && setOrg(null))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading organization…</p>
        </div>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-center text-white">
        <div>
          <Building2 className="mx-auto mb-4 h-14 w-14 opacity-20" />
          <h1 className="mb-1 text-xl font-bold">Organization not found</h1>
          <p className="mb-6 text-sm text-gray-500">
            No organization matches “{decodeURIComponent(slug)}”.
          </p>
          <Link href="/organizations" className="text-sm font-semibold text-sky-400 hover:underline">
            Back to Organizations
          </Link>
        </div>
      </div>
    )
  }

  const members = Array.isArray(org.members) ? org.members : []
  const challenges = Array.isArray(org.challenges) ? org.challenges : []
  const typeLabel = org.type ? TYPE_LABEL[org.type] ?? org.type : 'Organization'
  const TypeIcon = org.type === 'UNIVERSITY' ? GraduationCap : Building2

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="border-b border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/organizations" className="hover:text-white">Organizations</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-300">{org.name}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-primary">
            <TypeIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{typeLabel}</span>
          </div>
          <h1 className="mb-3 mt-4 text-3xl font-bold text-white">{org.name}</h1>
          {org.description && (
            <p className="mb-5 max-w-2xl leading-relaxed text-gray-400">{org.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {members.length} listed member{members.length === 1 ? '' : 's'}
            </span>
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-sky-400 hover:underline"
              >
                <Globe className="h-4 w-4" />
                {org.website.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Tabs defaultValue="challenges">
          <TabsList className="mb-6 border border-gray-800 bg-gray-900">
            <TabsTrigger value="challenges">Challenges ({challenges.length})</TabsTrigger>
            <TabsTrigger value="members">Team ({members.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            {challenges.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
                <Trophy className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-semibold text-gray-400">No active challenges yet</p>
                <p className="mt-1 text-xs text-gray-600">
                  This organization hasn’t published any challenges.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((c: any, i: number) => (
                  <motion.div
                    key={c._id ?? c.id ?? i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="border-gray-800 bg-gray-900">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-white">{c.title}</h3>
                        {c.description && (
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{c.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            {members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-semibold text-gray-400">No team members listed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                {members.map((m, i) => (
                  <Card key={`${m.name}-${i}`} className="border-gray-800 bg-gray-900 text-center">
                    <CardContent className="p-5">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-purple-500 text-xl font-bold">
                        {m.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      {m.role && <p className="mt-0.5 text-xs text-gray-500">{m.role}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
