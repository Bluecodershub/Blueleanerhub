'use client'

import { motion } from 'framer-motion'

interface CodingCharacterProps {
  className?: string
  size?: number
}

export default function CodingCharacter({ className = '', size = 200 }: CodingCharacterProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Desk */}
        <rect x="30" y="140" width="140" height="8" rx="3" fill="hsl(var(--secondary))" />
        <rect x="50" y="148" width="8" height="30" rx="2" fill="#334155" />
        <rect x="142" y="148" width="8" height="30" rx="2" fill="#334155" />

        {/* Monitor */}
        <motion.g
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect
            x="60"
            y="90"
            width="80"
            height="50"
            rx="4"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="2"
          />
          <rect x="65" y="95" width="70" height="40" rx="2" fill="hsl(var(--background))" />
          <rect x="95" y="140" width="10" height="5" fill="#334155" />

          {/* Code lines on screen */}
          <motion.g
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="70" y="100" width="30" height="3" rx="1" fill="#60a5fa" opacity="0.8" />
            <rect x="70" y="106" width="45" height="3" rx="1" fill="#60a5fa" opacity="0.6" />
            <rect x="70" y="112" width="20" height="3" rx="1" fill="#c084fc" opacity="0.7" />
            <rect x="75" y="118" width="35" height="3" rx="1" fill="#fbbf24" opacity="0.5" />
            <rect x="70" y="124" width="25" height="3" rx="1" fill="#60a5fa" opacity="0.6" />
          </motion.g>

          {/* Blinking cursor */}
          <motion.rect
            x="96"
            y="124"
            width="2"
            height="4"
            fill="#60a5fa"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear', times: [0, 0.5, 1] }}
          />
        </motion.g>

        {/* Chair */}
        <ellipse cx="100" cy="170" rx="20" ry="4" fill="hsl(var(--secondary))" />

        {/* Body */}
        <motion.g
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Torso */}
          <path d="M88 130 Q100 125 112 130 L110 155 Q100 158 90 155 Z" fill="#3b82f6" />

          {/* Head */}
          <motion.g
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '100px 110px' }}
          >
            <circle cx="100" cy="108" r="14" fill="#fbbf24" opacity="0.9" />
            <circle cx="100" cy="108" r="14" fill="#d4a574" />
            {/* Hair */}
            <path
              d="M86 102 Q88 90 100 88 Q112 90 114 102 Q112 96 100 95 Q88 96 86 102Z"
              fill="hsl(var(--secondary))"
            />
            {/* Eyes */}
            <motion.g
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, times: [0, 0.05, 0.1] }}
              style={{ transformOrigin: '100px 107px' }}
            >
              <circle cx="95" cy="107" r="1.5" fill="hsl(var(--secondary))" />
              <circle cx="105" cy="107" r="1.5" fill="hsl(var(--secondary))" />
            </motion.g>
            {/* Smile */}
            <path
              d="M96 113 Q100 116 104 113"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Glasses */}
            <circle cx="95" cy="107" r="5" stroke="#64748b" strokeWidth="1" fill="none" />
            <circle cx="105" cy="107" r="5" stroke="#64748b" strokeWidth="1" fill="none" />
            <line x1="100" y1="107" x2="100" y2="107" stroke="#64748b" strokeWidth="1" />
          </motion.g>

          {/* Arms typing */}
          <motion.g
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '88px 135px' }}
          >
            <path
              d="M88 133 L70 138 L72 142"
              stroke="#d4a574"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
          <motion.g
            animate={{ rotate: [3, -3, 3] }}
            transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '112px 135px' }}
          >
            <path
              d="M112 133 L130 138 L128 142"
              stroke="#d4a574"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>
        </motion.g>

        {/* Floating code symbols */}
        <motion.text
          x="40"
          y="80"
          fill="#60a5fa"
          fontSize="12"
          fontFamily="monospace"
          opacity="0.4"
          animate={{ y: [80, 70, 80], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {'</>'}
        </motion.text>
        <motion.text
          x="150"
          y="75"
          fill="#60a5fa"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.3"
          animate={{ y: [75, 65, 75], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          {'{ }'}
        </motion.text>
      </svg>
    </div>
  )
}
