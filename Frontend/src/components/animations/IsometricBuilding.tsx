'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface IsometricBuildingProps {
  icon: LucideIcon
  label: string
  color: string
  glowColor: string
  delay?: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { width: 70, height: 50, roofHeight: 16, iconSize: 18 },
  md: { width: 90, height: 65, roofHeight: 20, iconSize: 22 },
  lg: { width: 110, height: 80, roofHeight: 24, iconSize: 26 },
}

export default function IsometricBuilding({
  icon: Icon,
  label,
  color,
  glowColor,
  delay = 0,
  size = 'md',
}: IsometricBuildingProps) {
  const dims = sizeMap[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="group relative cursor-pointer"
      style={{ width: dims.width + 30, height: dims.height + dims.roofHeight + 40 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay * 0.5,
        }}
        className="relative"
        style={{ willChange: 'transform' }}
      >
        <div
          className="absolute inset-0 rounded-lg opacity-30 blur-xl transition-opacity duration-500 group-hover:opacity-50"
          style={{ background: glowColor }}
        />

        <svg
          width={dims.width + 30}
          height={dims.height + dims.roofHeight + 40}
          viewBox={`0 0 ${dims.width + 30} ${dims.height + dims.roofHeight + 40}`}
          fill="none"
          className="relative z-10"
        >
          <defs>
            <linearGradient id={`face-left-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id={`face-right-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`face-top-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <g transform={`translate(15, ${dims.roofHeight + 5})`}>
            {/* Left face */}
            <path
              d={`M0,${dims.height * 0.4} L${dims.width * 0.5},${dims.height} L${dims.width * 0.5},${dims.height * 0.6} L0,0 Z`}
              fill={`url(#face-left-${label})`}
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="0.5"
            />
            {/* Right face */}
            <path
              d={`M${dims.width * 0.5},${dims.height * 0.6} L${dims.width},${dims.height * 0.2} L${dims.width},${dims.height * 0.6} L${dims.width * 0.5},${dims.height} Z`}
              fill={`url(#face-right-${label})`}
              stroke={color}
              strokeOpacity="0.3"
              strokeWidth="0.5"
            />
            {/* Top face */}
            <path
              d={`M0,${dims.height * 0.4} L${dims.width * 0.5},0 L${dims.width},${dims.height * 0.2} L${dims.width * 0.5},${dims.height * 0.6} Z`}
              fill={`url(#face-top-${label})`}
              stroke={color}
              strokeOpacity="0.4"
              strokeWidth="0.5"
            />

            {/* Window rows on left face */}
            {[0.15, 0.35, 0.55].map((yFrac, i) => (
              <rect
                key={`wl-${i}`}
                x={dims.width * 0.08}
                y={dims.height * (0.42 + yFrac * 0.5)}
                width={dims.width * 0.15}
                height={3}
                rx={1}
                fill="white"
                opacity={0.15 + i * 0.05}
                transform={`skewY(${-30})`}
              />
            ))}
          </g>
        </svg>

        <div
          className="absolute z-20 flex items-center justify-center rounded-lg"
          style={{
            top: dims.roofHeight - 2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: dims.iconSize + 16,
            height: dims.iconSize + 16,
            background: `${color}33`,
            border: `1px solid ${color}55`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <Icon size={dims.iconSize} color={color} strokeWidth={1.5} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5, duration: 0.4 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span
            className="text-[10px] font-medium uppercase tracking-wide"
            style={{ color: `${color}cc` }}
          >
            {label}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
