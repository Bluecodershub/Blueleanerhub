'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  dx: number
  delay: number
  shape: 'rect' | 'circle'
}

const CONFETTI_COLORS = [
  '#fbbf24',
  '#60a5fa',
  '#f472b6',
  '#60a5fa',
  '#a78bfa',
  '#fb923c',
  '#22d3ee',
  '#e879f9',
]

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    dx: (Math.random() - 0.5) * 60,
    delay: Math.random() * 0.5,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }))
}

interface ConfettiProps {
  active: boolean
  duration?: number
  count?: number
}

export default function Confetti({ active, duration = 3000, count = 40 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setPieces(generatePieces(count))
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    }
  }, [active, count, duration])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              left: `${piece.x}%`,
              top: `${piece.y}%`,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              top: '110%',
              left: `${piece.x + piece.dx}%`,
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: piece.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute"
            style={{
              width: piece.size,
              height: piece.shape === 'rect' ? piece.size * 0.6 : piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '1px',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useConfetti() {
  const [active, setActive] = useState(false)

  const fire = useCallback(() => {
    setActive(false)
    requestAnimationFrame(() => setActive(true))
  }, [])

  return { active, fire, Confetti: () => <Confetti active={active} /> }
}
