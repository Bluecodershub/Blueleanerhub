// src/components/dashboard/QuickActions.tsx

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Action {
  label: string
  icon: string
  href: string
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'primary'
}

interface QuickActionsProps {
  actions: Action[]
}

const colorClasses = {
  blue: 'bg-blue-50/10 border-blue-500/20 hover:bg-blue-50/20 text-blue-400',
  green: 'bg-blue-50/10 border-blue-500/20 hover:bg-blue-50/20 text-blue-400',
  purple: 'bg-purple-50/10 border-purple-500/20 hover:bg-purple-50/20 text-purple-400',
  yellow: 'bg-yellow-50/10 border-yellow-500/20 hover:bg-yellow-50/20 text-yellow-400',
  primary: 'bg-primary/10 border-primary/20 hover:bg-primary/20 text-primary',
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {actions.map((action, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Link href={action.href}>
            <button
              className={`w-full transform rounded-2xl border p-6 font-bold shadow-lg shadow-black/5 transition-all hover:scale-105 active:scale-95 ${colorClasses[action.color]}`}
            >
              <div className="mb-3 text-3xl transition-transform group-hover:scale-110">
                {action.icon}
              </div>
              <div className="text-sm tracking-tight">{action.label}</div>
            </button>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
