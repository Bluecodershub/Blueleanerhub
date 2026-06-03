// src/components/dashboard/StatsCard.tsx

'use client'

import { motion } from 'framer-motion'

interface TrendData {
  value: number
  isPositive: boolean
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  trend?: TrendData
  className?: string
}

export default function StatsCard({ title, value, icon, trend, className }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group rounded-3xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/50 ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
        {trend && (
          <span
            className={`text-sm font-semibold ${trend.isPositive ? 'text-primary' : 'text-red-600'}`}
          >
            {trend.isPositive ? '+' : '-'}
            {trend.value}%
          </span>
        )}
      </div>

      {trend && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {trend.isPositive ? 'Increased' : 'Decreased'} from last week
        </p>
      )}
    </motion.div>
  )
}
