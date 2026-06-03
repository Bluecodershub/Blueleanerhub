// src/components/hackathon/CountdownTimer.tsx

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CountdownTimerProps {
  endTime: string
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [time, setTime] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime()
      const now = new Date().getTime()
      const difference = end - now

      if (difference > 0) {
        setTime({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-4"
    >
      {[
        { label: 'Days', value: time.days },
        { label: 'Hours', value: time.hours },
        { label: 'Mins', value: time.minutes },
        { label: 'Secs', value: time.seconds },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="rounded-lg bg-white/10 px-3 py-2 text-center backdrop-blur-sm"
        >
          <div className="text-2xl font-bold">{String(item.value).padStart(2, '0')}</div>
          <div className="text-xs text-white/70">{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}
