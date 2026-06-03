'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  GitFork,
  MapPin,
  Link2,
  Calendar,
  Award,
  Code2,
  Activity,
  Flame,
  Trophy,
  ChevronRight,
  Lock,
  Globe,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Mock data — replace with API call: GET /api/repositories/:username
const MOCK_USER = {
  username: 'arjunsharma',
  fullName: 'Arjun Sharma',
  bio: 'Full-stack engineer passionate about systems design and open-source. Building @ BlueLearnerHub.',
  location: 'Bengaluru, India',
  website: 'https://arjunsharma.dev',
  joinedAt: '2024-01-15',
  followers: 248,
  following: 92,
  totalStars: 512,
  totalCommits: 1847,
  currentStreak: 14,
  longestStreak: 42,
  xp: 12450,
  level: 18,
  rank: 'Senior Engineer',
  skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Rust'],
  certificates: [
    { id: 'BLH-001', title: 'Full-Stack Engineering', issuerName: 'BlueLearnerHub' },
    { id: 'BLH-002', title: 'System Design Mastery', issuerName: 'BlueLearnerHub' },
  ],
}

const MOCK_REPOS = [
  {
    id: 1,
    name: 'turbo-cache',
    description: 'High-performance Redis-compatible in-memory cache written in Rust.',
    language: 'Rust',
    stars: 241,
    forks: 38,
    visibility: 'public',
    topics: ['rust', 'cache', 'performance'],
    updatedAt: '2026-03-08',
  },
  {
    id: 2,
    name: 'react-query-builder',
    description: 'Visual SQL query builder component for React applications.',
    language: 'TypeScript',
    stars: 189,
    forks: 22,
    visibility: 'public',
    topics: ['react', 'sql', 'ui'],
    updatedAt: '2026-03-06',
  },
  {
    id: 3,
    name: 'distributed-scheduler',
    description: 'Distributed cron job scheduler with Postgres-backed persistence.',
    language: 'Go',
    stars: 74,
    forks: 11,
    visibility: 'public',
    topics: ['go', 'cron', 'distributed'],
    updatedAt: '2026-02-28',
  },
  {
    id: 4,
    name: 'dotfiles',
    description: 'My personal dev environment — zsh, tmux, neovim configs.',
    language: 'Shell',
    stars: 8,
    forks: 3,
    visibility: 'public',
    topics: ['dotfiles', 'neovim'],
    updatedAt: '2026-02-10',
  },
]

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Shell: '#89e051',
  CSS: '#563d7c',
}

// Contribution graph mock (12 weeks × 7 days)
function ContributionGraph() {
  const weeks = 16
  const days = 7
  const cells = Array.from({ length: weeks * days }, () => {
    const v = Math.random()
    return v < 0.4 ? 0 : v < 0.6 ? 1 : v < 0.75 ? 2 : v < 0.9 ? 3 : 4
  })

  const levelColor = (l: number) =>
    ['bg-gray-800', 'bg-muted', 'bg-primary/80', 'bg-primary', 'bg-primary/70'][l]

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-[3px]">
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {Array.from({ length: days }, (_, d) => (
              <div
                key={d}
                title={`${cells[w * days + d]} contributions`}
                className={`h-3 w-3 rounded-sm ${levelColor(cells[w * days + d])}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`h-3 w-3 rounded-sm ${levelColor(l)}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default function DeveloperProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  React.use(params)
  const user = MOCK_USER
  const repos = MOCK_REPOS

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="shrink-0 lg:w-64">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              {/* Avatar */}
              <div className="flex flex-col items-center lg:items-start">
                <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <h1 className="text-xl font-bold">{user.fullName}</h1>
                <p className="text-sm text-gray-400">@{user.username}</p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">{user.bio}</p>

              {/* Meta */}
              <div className="mt-4 space-y-1.5 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.location}
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5" />
                    <a
                      href={user.website}
                      className="text-blue-400 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {user.website.replace('https://', '')}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined{' '}
                  {new Date(user.joinedAt).toLocaleDateString('en', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {/* Follow stats */}
              <div className="mt-4 flex gap-4 text-sm">
                <span>
                  <strong className="text-white">{user.followers}</strong>{' '}
                  <span className="text-gray-500">followers</span>
                </span>
                <span>
                  <strong className="text-white">{user.following}</strong>{' '}
                  <span className="text-gray-500">following</span>
                </span>
              </div>

              {/* XP / Level */}
              <div className="mt-5 rounded-xl border border-gray-800 bg-gray-900 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-gray-500">
                    Level {user.level}
                  </span>
                  <Badge className="bg-purple-900/50 text-xs text-purple-400">{user.rank}</Badge>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${(user.xp % 1000) / 10}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">{user.xp.toLocaleString()} XP</p>
              </div>

              {/* Streaks */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-center">
                  <Flame className="mx-auto mb-1 h-5 w-5 text-foreground/70" />
                  <p className="text-lg font-bold text-white">{user.currentStreak}</p>
                  <p className="text-[10px] text-gray-600">day streak</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-center">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-foreground/70" />
                  <p className="text-lg font-bold text-white">{user.longestStreak}</p>
                  <p className="text-[10px] text-gray-600">best streak</p>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certificates */}
              {user.certificates.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                    Certificates
                  </p>
                  {user.certificates.map((c) => (
                    <Link key={c.id} href={`/certificates/verify/${c.id}`}>
                      <div className="flex items-center gap-2 py-1.5 text-sm text-gray-400 transition-colors hover:text-white">
                        <Award className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
                        <span className="text-xs">{c.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </aside>

          {/* ── Main ─────────────────────────────────────────────────────── */}
          <main className="min-w-0 flex-1">
            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 grid grid-cols-3 gap-3"
            >
              {[
                { label: 'Repositories', value: repos.length, icon: Code2, color: 'text-blue-400' },
                {
                  label: 'Total Stars',
                  value: user.totalStars,
                  icon: Star,
                  color: 'text-foreground/70',
                },
                {
                  label: 'Commits',
                  value: user.totalCommits.toLocaleString(),
                  icon: Activity,
                  color: 'text-foreground/70',
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-gray-800 bg-gray-900">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className={`h-5 w-5 ${color} shrink-0`} />
                    <div>
                      <p className="text-lg font-bold text-white">{value}</p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Contribution graph */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-6 border-gray-800 bg-gray-900">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Activity className="h-4 w-4 text-foreground/70" />
                      Contribution Activity
                    </h2>
                    <span className="text-xs text-gray-600">
                      {user.totalCommits.toLocaleString()} contributions in the last year
                    </span>
                  </div>
                  <ContributionGraph />
                </CardContent>
              </Card>
            </motion.div>

            {/* Pinned / Popular repos */}
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Popular Repositories</h2>
              <Link
                href={`/dev/${user.username}/repos`}
                className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
              >
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {repos.map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                >
                  <Link href={`/dev/${user.username}/${repo.name}`}>
                    <Card className="group h-full border-gray-800 bg-gray-900 transition-all hover:border-gray-700">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex min-w-0 items-center gap-2">
                            {repo.visibility === 'private' ? (
                              <Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                            ) : (
                              <Globe className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                            )}
                            <span className="truncate text-sm font-semibold text-blue-400 group-hover:text-blue-300">
                              {repo.name}
                            </span>
                          </div>
                          <Badge className="shrink-0 border border-gray-700 bg-gray-800 text-[10px] text-gray-400">
                            {repo.visibility}
                          </Badge>
                        </div>
                        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-500">
                          {repo.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: LANG_COLORS[repo.language] ?? '#888' }}
                              />
                              {repo.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
