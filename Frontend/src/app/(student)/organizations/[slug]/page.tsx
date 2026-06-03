'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Trophy,
  Globe,
  MapPin,
  ExternalLink,
  ChevronRight,
  Clock,
  Code2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

const MOCK_ORG = {
  slug: 'infosys-labs',
  name: 'Infosys Innovation Labs',
  orgType: 'corporate',
  description:
    'Infosys Innovation Labs is the R&D and talent development arm of Infosys Limited. We connect the best engineering minds in India with real-world enterprise challenges, cutting-edge research, and career acceleration programs.',
  website: 'https://infosys.com',
  location: 'Bengaluru, India',
  memberCount: 1240,
  gradient: 'from-blue-600 to-cyan-600',
  tags: ['AI/ML', 'Cloud', 'DevOps', 'Blockchain', 'IoT'],
  challenges: [
    {
      id: 1,
      title: 'AI-Powered Supply Chain Optimizer',
      description:
        'Build an ML model to predict supply chain disruptions using historical logistics data.',
      domain: 'AI/ML',
      deadline: '2026-04-30',
      prizePool: '₹2,00,000',
      participants: 187,
      isActive: true,
    },
    {
      id: 2,
      title: 'Cloud Cost Reduction Framework',
      description:
        'Design an automated cloud resource optimization system that reduces AWS/GCP costs by 30%.',
      domain: 'Cloud',
      deadline: '2026-05-15',
      prizePool: '₹1,50,000',
      participants: 134,
      isActive: true,
    },
    {
      id: 3,
      title: 'Zero-Trust Security Architecture',
      description:
        'Implement a zero-trust security model for a microservices-based enterprise application.',
      domain: 'Security',
      deadline: '2026-06-01',
      prizePool: '₹1,00,000',
      participants: 92,
      isActive: true,
    },
  ],
  members: [
    { name: 'Dr. Ravi Shankar', role: 'Head of Innovation', avatar: 'R' },
    { name: 'Priya Nair', role: 'Senior Architect', avatar: 'P' },
    { name: 'Arjun Menon', role: 'ML Research Lead', avatar: 'A' },
    { name: 'Kavitha Iyer', role: 'Cloud Evangelist', avatar: 'K' },
  ],
  benefits: [
    'Direct internship/PPO pipeline for top performers',
    'Mentorship from Infosys senior architects',
    'Access to Infosys Springboard learning resources',
    'Certificate of participation & performance',
    'Chance to present at Infosys Innovation Summit',
  ],
}

export default function OrganizationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  React.use(params)
  const org = MOCK_ORG
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleJoin = async () => {
    setJoining(true)
    await new Promise((r) => setTimeout(r, 800))
    setJoined(true)
    setJoining(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="border-b border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/organizations" className="hover:text-white">
              Organizations
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-300">{org.name}</span>
          </div>

          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <div
                className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${org.gradient} mb-4 px-4 py-1.5`}
              >
                <Briefcase className="h-4 w-4 text-white" />
                <span className="text-sm font-medium capitalize text-white">
                  {org.orgType} Partner
                </span>
              </div>
              <h1 className="mb-3 text-3xl font-bold text-white">{org.name}</h1>
              <p className="mb-5 max-w-2xl leading-relaxed text-gray-400">{org.description}</p>

              <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {org.memberCount.toLocaleString()} members
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-foreground/70" />
                  {org.challenges.length} active challenges
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {org.location}
                </span>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {org.website.replace('https://', '')} <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {org.tags.map((t) => (
                  <Badge key={t} className="bg-gray-800 text-xs text-gray-300">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Join card */}
            <div className="w-full shrink-0 md:w-64">
              <Card className="sticky top-6 border-gray-700 bg-gray-900">
                <div className={`h-2 rounded-t-xl bg-gradient-to-r ${org.gradient}`} />
                <CardContent className="p-5">
                  <div className="mb-5 space-y-2.5 text-sm">
                    {org.benefits.map((b) => (
                      <div key={b} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/80" />
                        <span className="text-xs leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={joined ? undefined : handleJoin}
                    disabled={joining}
                    className={`w-full font-semibold ${joined ? 'bg-primary/80 hover:bg-primary/90' : `bg-gradient-to-r ${org.gradient} hover:opacity-90`}`}
                  >
                    {joining ? 'Joining…' : joined ? '✓ Joined' : 'Join Organization'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Tabs defaultValue="challenges">
          <TabsList className="mb-6 border border-gray-800 bg-gray-900">
            <TabsTrigger value="challenges">Challenges ({org.challenges.length})</TabsTrigger>
            <TabsTrigger value="members">Team ({org.members.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <div className="space-y-4">
              {org.challenges.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className="border-gray-800 bg-gray-900 transition-all hover:border-gray-700">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center gap-2">
                            <h3 className="font-semibold text-white">{c.title}</h3>
                            {c.isActive && (
                              <Badge className="bg-muted text-[10px] text-foreground/70">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="mb-3 text-sm leading-relaxed text-gray-500">
                            {c.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Code2 className="h-3.5 w-3.5" />
                              {c.domain}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {c.participants} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Deadline:{' '}
                              {new Date(c.deadline).toLocaleDateString('en', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <div className="text-center">
                            <p className="mb-0.5 text-xs text-gray-600">Prize Pool</p>
                            <p className="text-lg font-bold text-foreground/70">{c.prizePool}</p>
                          </div>
                          <Button
                            size="sm"
                            className={`bg-gradient-to-r text-xs ${org.gradient} hover:opacity-90`}
                          >
                            Participate <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {org.members.map((m) => (
                <Card key={m.name} className="border-gray-800 bg-gray-900 text-center">
                  <CardContent className="p-5">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xl font-bold">
                      {m.avatar}
                    </div>
                    <p className="text-sm font-semibold text-white">{m.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{m.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
