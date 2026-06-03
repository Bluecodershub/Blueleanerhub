// src/components/hackathon/HackathonGrid.tsx

'use client'

import { motion } from 'framer-motion'
import HackathonCard from './HackathonCard'

interface HackathonGridProps {
  hackathons: any[]
}

export default function HackathonGrid({ hackathons }: HackathonGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {hackathons.map((hackathon, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <HackathonCard {...hackathon} />
        </motion.div>
      ))}
    </motion.div>
  )
}
