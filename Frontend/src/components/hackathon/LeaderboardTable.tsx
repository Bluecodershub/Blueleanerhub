// src/components/hackathon/LeaderboardTable.tsx

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface LeaderboardEntry {
  rank: number
  user_id: number
  full_name: string
  team_name: string | null
  final_score: number
  submitted_at: string
}

interface LeaderboardTableProps {
  hackathonId: string
}

export default function LeaderboardTable({ hackathonId }: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hackathonId) return

    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const response = await api.get(`/hackathons/${hackathonId}/leaderboard`)
        const data = response.data?.data || response.data || []
        
        if (Array.isArray(data)) {
          setLeaderboard(data)
        } else if (data?.data) {
          setLeaderboard(data.data)
        } else {
          setLeaderboard([])
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        setError('Failed to load leaderboard')
        setLeaderboard([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [hackathonId])

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {error}
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No submissions yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Be the first to submit and top the leaderboard!
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-border dark:bg-card"
    >
      {/* Table Header */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-border dark:bg-popover/50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Coder
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Points
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Solved
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Submissions
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <motion.tr
                key={entry.user_id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-border dark:hover:bg-gray-700/30"
              >
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {getMedalEmoji(entry.rank)}
                    <span>#{entry.rank}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold">
                      {(entry.full_name || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {entry.full_name || 'Anonymous'}
                      </span>
                      {entry.team_name && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({entry.team_name})
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                    {entry.final_score || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-muted-foreground">
                  {entry.final_score ? Math.floor(entry.final_score / 100) : 0} problems
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-muted-foreground">
                  {entry.submitted_at ? new Date(entry.submitted_at).toLocaleDateString() : '-'}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
