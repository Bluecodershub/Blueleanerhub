'use client'

import { motion } from 'framer-motion'

interface CelebrationCharacterProps {
  className?: string
  size?: number
}

const confettiPieces = [
  { x: 60, y: 30, color: '#fbbf24', delay: 0, dx: -15, size: 5 },
  { x: 80, y: 20, color: '#60a5fa', delay: 0.2, dx: -5, size: 4 },
  { x: 100, y: 15, color: '#f472b6', delay: 0.1, dx: 3, size: 6 },
  { x: 120, y: 22, color: '#60a5fa', delay: 0.3, dx: 8, size: 4 },
  { x: 140, y: 28, color: '#a78bfa', delay: 0.15, dx: 15, size: 5 },
  { x: 70, y: 40, color: '#fb923c', delay: 0.25, dx: -10, size: 3 },
  { x: 130, y: 38, color: '#22d3ee', delay: 0.35, dx: 12, size: 3 },
  { x: 90, y: 25, color: '#e879f9', delay: 0.4, dx: -3, size: 5 },
  { x: 110, y: 30, color: '#fbbf24', delay: 0.1, dx: 6, size: 4 },
  { x: 75, y: 35, color: '#60a5fa', delay: 0.3, dx: -8, size: 3 },
]

export default function CelebrationCharacter({
  className = '',
  size = 200,
}: CelebrationCharacterProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Confetti */}
        {confettiPieces.map((piece, i) => (
          <motion.rect
            key={i}
            x={piece.x}
            y={piece.y}
            width={piece.size}
            height={piece.size * 0.6}
            rx="1"
            fill={piece.color}
            animate={{
              y: [piece.y, piece.y + 80, piece.y + 160],
              x: [piece.x, piece.x + piece.dx, piece.x + piece.dx * 2],
              rotate: [0, 180, 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: piece.delay,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Floor shadow */}
        <motion.ellipse
          cx="100"
          cy="185"
          ry="5"
          fill="#0f172a"
          initial={{ rx: 25, opacity: 0.2 }}
          animate={{ rx: [25, 20, 25], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Character jumping */}
        <motion.g
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Legs - spread in jump */}
          <motion.g
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '90px 155px' }}
          >
            <path
              d="M90 155 L78 175 L75 180"
              stroke="hsl(var(--secondary))"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [10, -10, 10] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '110px 155px' }}
          >
            <path
              d="M110 155 L122 175 L125 180"
              stroke="hsl(var(--secondary))"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Body */}
          <path d="M85 125 Q100 118 115 125 L112 157 Q100 162 88 157 Z" fill="#f59e0b" />

          {/* Arms raised in celebration */}
          <motion.g
            animate={{ rotate: [-15, -5, -15] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '85px 128px' }}
          >
            <path
              d="M85 128 L65 100 L58 85"
              stroke="#d4a574"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left hand open */}
            <circle cx="56" cy="83" r="4" fill="#d4a574" />
          </motion.g>
          <motion.g
            animate={{ rotate: [15, 5, 15] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            style={{ transformOrigin: '115px 128px' }}
          >
            <path
              d="M115 128 L135 100 L142 85"
              stroke="#d4a574"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right hand open */}
            <circle cx="144" cy="83" r="4" fill="#d4a574" />
          </motion.g>

          {/* Head */}
          <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 103px' }}
          >
            <circle cx="100" cy="103" r="15" fill="#d4a574" />
            {/* Hair */}
            <path
              d="M85 97 Q88 84 100 82 Q112 84 115 97 Q112 90 100 89 Q88 90 85 97Z"
              fill="#7c3aed"
            />
            {/* Happy eyes - crescents */}
            <path
              d="M92 101 Q95 98 98 101"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M102 101 Q105 98 108 101"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Big smile */}
            <path
              d="M93 108 Q100 115 107 108"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Rosy cheeks */}
            <circle cx="90" cy="107" r="3" fill="#f472b6" opacity="0.3" />
            <circle cx="110" cy="107" r="3" fill="#f472b6" opacity="0.3" />
          </motion.g>
        </motion.g>

        {/* Trophy / Star above */}
        <motion.g
          animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 55px' }}
        >
          <polygon
            points="100,40 103,50 113,50 105,56 108,66 100,60 92,66 95,56 87,50 97,50"
            fill="#fbbf24"
            opacity="0.8"
          />
          <polygon
            points="100,43 102,49 110,49 104,54 106,62 100,58 94,62 96,54 90,49 98,49"
            fill="#fde68a"
            opacity="0.6"
          />
        </motion.g>
      </svg>
    </div>
  )
}
