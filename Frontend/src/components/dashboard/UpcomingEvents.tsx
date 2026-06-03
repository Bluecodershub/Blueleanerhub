// src/components/dashboard/UpcomingEvents.tsx

'use client'

import { motion } from 'framer-motion'

const events = [
  {
    title: 'AI Hackathon 2026',
    date: 'Mar 15, 2026',
    icon: '🤖',
    status: 'upcoming' as const,
  },
  {
    title: 'JS Master Challenge',
    date: 'Mar 20, 2026',
    icon: '⚡',
    status: 'upcoming' as const,
  },
  {
    title: 'Interview Prep Q&A',
    date: 'Mar 10, 2026',
    icon: '💬',
    status: 'today' as const,
  },
]

export default function UpcomingEvents() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
          >
            <span className="text-xl">{event.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {event.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.date}</p>
            </div>
            {event.status === 'today' && (
              <span className="whitespace-nowrap rounded-full bg-muted px-2 py-1 text-xs font-semibold text-foreground/70 dark:bg-muted/60 dark:text-foreground/70">
                Today
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
