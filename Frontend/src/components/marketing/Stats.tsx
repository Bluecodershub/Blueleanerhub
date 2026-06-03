'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, Lightbulb, Trophy, Briefcase } from 'lucide-react'
import dynamic from 'next/dynamic'

const CelebrationCharacter = dynamic(
  () => import('@/components/animations/characters/CelebrationCharacter'),
  { ssr: false }
)

interface StatItem {
  label: string
  value: string
  icon: number // index into iconComponents array
}

interface StatsProps {
  stats: StatItem[]
}

// Icon components ordered by the stat items passed from the page
const iconComponents: React.ElementType[] = [Users, Lightbulb, Trophy, Briefcase]

const colorMap: Record<number, string> = {
  0: 'from-blue-500 to-primary',
  1: 'from-purple-500 to-pink-500',
  2: 'from-primary to-primary',
  3: 'from-primary to-blue-500',
}

function AnimatedCounter({
  value,
  inView,
  onComplete,
}: {
  value: string
  inView: boolean
  onComplete?: () => void
}) {
  const [displayValue, setDisplayValue] = useState('0')
  const numericMatch = value.match(/^([\d,]+)/)
  const suffix = value.replace(/^[\d,]+/, '')

  useEffect(() => {
    if (!inView || !numericMatch) {
      setDisplayValue(value)
      return
    }

    const target = parseInt(numericMatch[1].replace(/,/g, ''), 10)
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), target)
      setDisplayValue(current.toLocaleString() + suffix)
      if (step >= steps) {
        clearInterval(timer)
        onComplete?.()
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [inView, value, numericMatch, suffix, onComplete])

  return <span>{displayValue}</span>
}

export default function Stats({ stats }: StatsProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const [showCelebration, setShowCelebration] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  }

  return (
    <section className="relative px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl" ref={ref}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4"
        >
          {stats.map((stat, idx) => {
            const Icon = iconComponents[idx] ?? iconComponents[0]
            const gradient = colorMap[idx] ?? colorMap[0]
            return (
              <motion.div key={idx} variants={itemVariants} className="group relative">
                <div className="rounded-xl border border-border/50 bg-card/50 p-5 text-center backdrop-blur-sm transition-all duration-300 hover:bg-card md:p-8">
                  <div
                    className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} mx-auto mb-4 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="mb-1 text-2xl font-bold text-foreground md:text-4xl">
                    <AnimatedCounter
                      value={stat.value}
                      inView={inView}
                      onComplete={
                        idx === stats.length - 1 ? () => setShowCelebration(true) : undefined
                      }
                    />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:text-sm">
                    {stat.label}
                  </p>
                  <div className={`mx-auto mt-4 h-1 overflow-hidden rounded-full bg-muted`}>
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                      initial={{ width: '0%' }}
                      animate={inView ? { width: '100%' } : { width: '0%' }}
                      transition={{ duration: 1.5, delay: idx * 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={
            showCelebration ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }
          }
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="mt-6 flex justify-center"
        >
          {showCelebration && <CelebrationCharacter size={80} />}
        </motion.div>
      </div>
    </section>
  )
}
