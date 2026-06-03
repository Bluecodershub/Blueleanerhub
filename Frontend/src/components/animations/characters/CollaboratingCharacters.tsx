'use client'

import { motion } from 'framer-motion'

interface CollaboratingCharactersProps {
  className?: string
  size?: number
}

export default function CollaboratingCharacters({
  className = '',
  size = 200,
}: CollaboratingCharactersProps) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Floor shadow */}
        <ellipse cx="100" cy="185" rx="55" ry="6" fill="#0f172a" opacity="0.2" />

        {/* Connection spark between hands */}
        <motion.g
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 105px' }}
        >
          <circle cx="100" cy="105" r="5" fill="#fbbf24" opacity="0.3" />
          <circle cx="100" cy="105" r="3" fill="#fbbf24" opacity="0.6" />
        </motion.g>

        {/* Spark lines */}
        <motion.g
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '100px 105px' }}
        >
          <line
            x1="100"
            y1="95"
            x2="100"
            y2="90"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="108"
            y1="100"
            x2="113"
            y2="97"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="92"
            y1="100"
            x2="87"
            y2="97"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="106"
            y1="110"
            x2="110"
            y2="114"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="94"
            y1="110"
            x2="90"
            y2="114"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Left person */}
        <motion.g
          animate={{ x: [0, 2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Legs */}
          <line
            x1="55"
            y1="160"
            x2="50"
            y2="180"
            stroke="hsl(var(--secondary))"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="65"
            y1="160"
            x2="68"
            y2="180"
            stroke="hsl(var(--secondary))"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Body */}
          <path d="M48 130 Q60 124 72 130 L70 162 Q60 166 50 162 Z" fill="#3b82f6" />

          {/* Head */}
          <motion.g
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '60px 108px' }}
          >
            <circle cx="60" cy="108" r="14" fill="#d4a574" />
            <path
              d="M46 102 Q48 90 60 88 Q72 90 74 102 Q72 96 60 95 Q48 96 46 102Z"
              fill="hsl(var(--secondary))"
            />
            <motion.g
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2.5,
                times: [0, 0.05, 0.1],
              }}
              style={{ transformOrigin: '60px 107px' }}
            >
              <circle cx="55" cy="107" r="1.5" fill="hsl(var(--secondary))" />
              <circle cx="65" cy="107" r="1.5" fill="hsl(var(--secondary))" />
            </motion.g>
            <path
              d="M55 114 Q60 118 65 114"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Arm reaching for high-five */}
          <motion.g
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '72px 132px' }}
          >
            <path
              d="M72 132 L88 115 L95 108"
              stroke="#d4a574"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Other arm */}
          <path
            d="M48 135 L38 150"
            stroke="#d4a574"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Right person */}
        <motion.g
          animate={{ x: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Legs */}
          <line
            x1="135"
            y1="160"
            x2="132"
            y2="180"
            stroke="hsl(var(--secondary))"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="145"
            y1="160"
            x2="150"
            y2="180"
            stroke="hsl(var(--secondary))"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Body */}
          <path d="M128 130 Q140 124 152 130 L150 162 Q140 166 130 162 Z" fill="#0ea5e9" />

          {/* Head */}
          <motion.g
            animate={{ rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '140px 108px' }}
          >
            <circle cx="140" cy="108" r="14" fill="#e0a87c" />
            <path
              d="M126 104 Q130 90 140 88 Q150 90 154 104 Q148 98 140 97 Q132 98 126 104Z"
              fill="#92400e"
            />
            <motion.g
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 3,
                times: [0, 0.05, 0.1],
              }}
              style={{ transformOrigin: '140px 107px' }}
            >
              <circle cx="135" cy="107" r="1.5" fill="hsl(var(--secondary))" />
              <circle cx="145" cy="107" r="1.5" fill="hsl(var(--secondary))" />
            </motion.g>
            <path
              d="M135 114 Q140 118 145 114"
              stroke="hsl(var(--secondary))"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Arm reaching for high-five */}
          <motion.g
            animate={{ rotate: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '128px 132px' }}
          >
            <path
              d="M128 132 L112 115 L105 108"
              stroke="#e0a87c"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.g>

          {/* Other arm */}
          <path
            d="M152 135 L162 150"
            stroke="#e0a87c"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* Floating hearts/stars */}
        <motion.text
          x="90"
          y="75"
          fontSize="14"
          animate={{ y: [75, 60, 75], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⭐
        </motion.text>
        <motion.text
          x="105"
          y="68"
          fontSize="10"
          animate={{ y: [68, 55, 68], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ✨
        </motion.text>
      </svg>
    </div>
  )
}
