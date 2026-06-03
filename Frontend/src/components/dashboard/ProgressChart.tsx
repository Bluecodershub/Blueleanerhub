// src/components/dashboard/ProgressChart.tsx

'use client'

import { motion } from 'framer-motion'

export default function ProgressChart() {
  const weekData = [
    { day: 'Mon', xp: 450 },
    { day: 'Tue', xp: 520 },
    { day: 'Wed', xp: 380 },
    { day: 'Thu', xp: 610 },
    { day: 'Fri', xp: 700 },
    { day: 'Sat', xp: 550 },
    { day: 'Sun', xp: 490 },
  ]

  const maxXP = Math.max(...weekData.map((d) => d.xp))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
        This Week's Progress
      </h3>

      <div className="flex h-64 items-end gap-2">
        {weekData.map((data, idx) => (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${(data.xp / maxXP) * 100}%` }}
            transition={{ delay: idx * 0.1 }}
            className="group relative flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-opacity hover:opacity-80"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
              {data.xp} XP
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-between text-xs text-gray-600 dark:text-gray-400">
        {weekData.map((data, idx) => (
          <span key={idx}>{data.day}</span>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">3,700 XP</span> this week
        </p>
      </div>
    </motion.div>
  )
}
