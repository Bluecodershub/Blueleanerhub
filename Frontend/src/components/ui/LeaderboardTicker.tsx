'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Zap, Award, TrendingUp } from 'lucide-react'

const ACHIEVEMENTS = [
  { id: '1', user: 'Rahul S.', action: 'earned 500 XP in Data Structures', icon: Trophy, color: 'text-yellow-500' },
  { id: '2', user: 'Priya K.', action: 'completed Python Mastery path', icon: Award, color: 'text-blue-500' },
  { id: '3', user: 'Amit M.', action: 'won the IoT Hackathon Challenge', icon: Zap, color: 'text-emerald-500' },
  { id: '4', user: 'Sneha R.', action: 'solved 50 consecutive problems', icon: Star, color: 'text-purple-500' },
  { id: '5', user: 'Vikram A.', action: 'ranked #1 in Electrical Quiz', icon: TrendingUp, color: 'text-orange-500' },
  { id: '6', user: 'Anita J.', action: 'earned Gold Badge in Algorithms', icon: Award, color: 'text-yellow-600' },
]

export function LeaderboardTicker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-10 border-t border-border bg-background/80 flex items-center overflow-hidden backdrop-blur-md">
      <div className="flex h-full items-center bg-primary px-4 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl">
        Live Feed
      </div>
      
      <div className="relative flex flex-1 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1500] }}
          transition={{ 
            duration: 40, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex whitespace-nowrap py-2"
        >
          {/* Double the list for seamless loop */}
          {[...ACHIEVEMENTS, ...ACHIEVEMENTS, ...ACHIEVEMENTS].map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`} 
              className="mx-8 flex items-center gap-2 text-xs text-muted-foreground"
            >
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="font-bold text-foreground">{item.user}</span>
              <span>{item.action}</span>
              <span className="mx-4 text-border opacity-50">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
