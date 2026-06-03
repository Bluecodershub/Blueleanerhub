// src/components/dashboard/ActivityFeed.tsx

'use client'

import { motion } from 'framer-motion'

const activities = [
  {
    type: 'challenge',
    title: 'Completed JavaScript Challenge: Arrays & Objects',
    time: '2 hours ago',
    icon: '✅',
  },
  {
    type: 'hackathon',
    title: 'Ranked #45 in Web Dev Hackathon',
    time: '1 day ago',
    icon: '🏅',
  },
  {
    type: 'course',
    title: 'Completed React Fundamentals course',
    time: '3 days ago',
    icon: '🎓',
  },
  {
    type: 'achievement',
    title: 'Earned badge: 7-Day Streak Master',
    time: '5 days ago',
    icon: '🔥',
  },
]

export default function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Your Activity</h3>

      <div className="space-y-4">
        {activities.map((activity, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
          >
            <div className="flex-shrink-0 text-2xl">{activity.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="mt-6 text-sm font-semibold text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
        View all activity →
      </button>
    </motion.div>
  )
}
