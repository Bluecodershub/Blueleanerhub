'use client'

import { motion } from 'framer-motion'

interface LearningCharacterProps {
  className?: string
  size?: number
}

export default function LearningCharacter({ className = '', size = 200 }: LearningCharacterProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Floating lightbulb */}
        <motion.g
          animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="140" cy="45" r="12" fill="#fbbf24" opacity="0.2" />
          <circle cx="140" cy="45" r="8" fill="#fbbf24" opacity="0.4" />
          <path
            d="M135 40 L140 32 L145 40"
            stroke="#fbbf24"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M136 50 Q140 54 144 50"
            stroke="#fbbf24"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <line
            x1="140"
            y1="50"
            x2="140"
            y2="53"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Rays */}
          <motion.g
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '140px 45px' }}
          >
            <line
              x1="140"
              y1="30"
              x2="140"
              y2="26"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="152"
              y1="37"
              x2="155"
              y2="34"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="128"
              y1="37"
              x2="125"
              y2="34"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="154"
              y1="45"
              x2="158"
              y2="45"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.6"
            />
            <line
              x1="126"
              y1="45"
              x2="122"
              y2="45"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.6"
            />
          </motion.g>
        </motion.g>

        {/* Second lightbulb (smaller) */}
        <motion.g
          animate={{ y: [0, -5, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        >
          <circle cx="60" cy="55" r="6" fill="#60a5fa" opacity="0.3" />
          <circle cx="60" cy="55" r="4" fill="#60a5fa" opacity="0.5" />
        </motion.g>

        {/* Floor shadow */}
        <ellipse cx="95" cy="180" rx="35" ry="5" fill="#0f172a" opacity="0.3" />

        {/* Book */}
        <motion.g
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '85px 145px' }}
        >
          <path d="M60 135 L85 130 L110 135 L110 160 L85 155 L60 160 Z" fill="#1e40af" />
          <line x1="85" y1="130" x2="85" y2="155" stroke="#3b82f6" strokeWidth="1" />
          <rect x="67" y="138" width="14" height="2" rx="1" fill="#93c5fd" opacity="0.6" />
          <rect x="67" y="143" width="10" height="2" rx="1" fill="#93c5fd" opacity="0.4" />
          <rect x="67" y="148" width="12" height="2" rx="1" fill="#93c5fd" opacity="0.5" />
          <rect x="89" y="138" width="14" height="2" rx="1" fill="#93c5fd" opacity="0.6" />
          <rect x="89" y="143" width="10" height="2" rx="1" fill="#93c5fd" opacity="0.4" />
        </motion.g>

        {/* Body - sitting cross-legged */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Legs crossed */}
          <path
            d="M78 165 Q70 175 65 175 Q60 175 62 170"
            stroke="hsl(var(--secondary))"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M102 165 Q110 175 115 175 Q120 175 118 170"
            stroke="hsl(var(--secondary))"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Torso */}
          <path d="M82 135 Q90 128 100 135 L98 165 Q90 168 82 165 Z" fill="#8b5cf6" />

          {/* Arms holding book */}
          <motion.g
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '82px 140px' }}
          >
            <path
              d="M82 140 L65 145 L62 140"
              stroke="#d4a574"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [1, -1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 140px' }}
          >
            <path
              d="M100 140 L115 145 L112 140"
              stroke="#d4a574"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Head */}
          <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '90px 115px' }}
          >
            <circle cx="90" cy="113" r="15" fill="#d4a574" />
            {/* Hair */}
            <path
              d="M75 107 Q78 94 90 92 Q102 94 105 107 Q102 100 90 99 Q78 100 75 107Z"
              fill="#92400e"
            />
            {/* Eyes - looking down at book */}
            <motion.g
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 3,
                times: [0, 0.05, 0.1],
              }}
              style={{ transformOrigin: '90px 113px' }}
            >
              <ellipse cx="85" cy="113" rx="1.5" ry="2" fill="hsl(var(--secondary))" />
              <ellipse cx="95" cy="113" rx="1.5" ry="2" fill="hsl(var(--secondary))" />
            </motion.g>
            {/* Content smile */}
            <path
              d="M86 119 Q90 122 94 119"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>
        </motion.g>

        {/* Floating knowledge particles */}
        <motion.circle
          cx="50"
          cy="90"
          r="2"
          fill="#a78bfa"
          animate={{ y: [0, -15, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.circle
          cx="130"
          cy="80"
          r="1.5"
          fill="#60a5fa"
          animate={{ y: [0, -12, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.circle
          cx="115"
          cy="95"
          r="2"
          fill="#60a5fa"
          animate={{ y: [0, -10, 0], opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </svg>
    </div>
  )
}
