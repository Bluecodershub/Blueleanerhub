'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Trophy, Award, Code2, Brain, Zap } from 'lucide-react'

const CODE_LINES = [
  { text: '// BluelearnerHub — Your Learning OS', dim: true },
  { text: '', dim: false },
  { text: 'const engineer = new Student({', dim: false },
  { text: '  name: "You",', dim: true },
  { text: '  domains: ["CS", "AI", "Mech", "Civil"],', dim: true },
  { text: '  goal: "Become Unstoppable",', dim: true },
  { text: '})', dim: false },
  { text: '', dim: false },
  { text: 'await engineer', dim: false },
  { text: '  .study(1400 + " guided lessons")', dim: true },
  { text: '  .compete(50 + " hackathons")', dim: true },
  { text: '  .learnFrom("industry mentors")', dim: true },
  { text: '  .getCertified()', dim: true },
  { text: '', dim: false },
  { text: '// 🚀  Career unlocked.', dim: true },
]

const _STATS = [
  { icon: Users, value: '12,000+', label: 'Active Learners', delay: 0.4 },
  { icon: BookOpen, value: '1,400+', label: 'Lessons', delay: 0.55 },
  { icon: Trophy, value: '50+', label: 'Hackathons', delay: 0.7 },
  { icon: Award, value: '200+', label: 'Certificates', delay: 0.85 },
]

const _BADGES = [
  { icon: Zap, text: '+500 XP Earned', delay: 2.0 },
  { icon: Brain, text: 'AI Mentor Active', delay: 2.8 },
  { icon: Code2, text: 'Challenge Complete', delay: 3.6 },
]

function TypewriterCode() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) return
    const line = CODE_LINES[visibleLines].text
    if (charCount < line.length) {
      const t = setTimeout(() => setCharCount((c) => c + 1), 25)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(
        () => {
          setVisibleLines((v) => v + 1)
          setCharCount(0)
        },
        line === '' ? 60 : 90
      )
      return () => clearTimeout(t)
    }
  }, [visibleLines, charCount])

  return (
    <div className="space-y-0 font-mono text-[11px] leading-6 sm:text-[12px]">
      {CODE_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i} className="flex gap-4">
          <span className="w-5 shrink-0 select-none text-right tabular-nums text-foreground/15">
            {i + 1}
          </span>
          <span className={line.dim ? 'text-foreground/40' : 'text-foreground/90'}>
            {line.text || '\u00A0'}
          </span>
        </div>
      ))}
      {visibleLines < CODE_LINES.length && (
        <div className="flex gap-4">
          <span className="w-5 shrink-0 select-none text-right tabular-nums text-foreground/15">
            {visibleLines + 1}
          </span>
          <span
            className={CODE_LINES[visibleLines].dim ? 'text-foreground/40' : 'text-foreground/90'}
          >
            {CODE_LINES[visibleLines].text.slice(0, charCount)}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
              className="ml-[1px] inline-block h-[13px] w-[2px] bg-foreground/80 align-middle"
            />
          </span>
        </div>
      )}
    </div>
  )
}

export default function IsometricScene() {
  return (
    <div className="relative flex h-full w-full flex-col gap-8">
      {/* Upper Content: Editor */}
      <div className="flex flex-col gap-4">
        {/* Code Editor Window */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden border border-white/20 bg-black"
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2">
            <div className="flex-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                / main.sys.protocal
              </span>
            </div>
          </div>

          {/* Code content */}
          <div className="min-h-[220px] p-6">
            <TypewriterCode />
          </div>
        </motion.div>

        {/* Binary Stream Overlay */}
        <div className="flex justify-between px-4">
          <span className="font-mono text-[10px] text-white/10">01011001 01010101</span>
          <span className="font-mono text-[10px] text-white/10">AUTHENTICATED_ACCESS</span>
        </div>
      </div>
    </div>
  )
}
