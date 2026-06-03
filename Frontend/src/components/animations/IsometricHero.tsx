'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

import IsometricScene from './IsometricScene'

export default function IsometricHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen flex-col overflow-hidden bg-black"
    >
      <motion.div
        style={{ y, opacity }}
        className="relative z-20 flex flex-1 flex-col justify-center px-5 py-20 sm:px-8 md:py-24"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex max-w-2xl flex-1 flex-col items-center text-center lg:max-w-none lg:items-start lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl font-black uppercase leading-[0.9] tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl"
            >
              Learn.
              <br />
              Build.
              <br />
              Master.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 font-mono text-sm uppercase tracking-widest text-white/40"
            >
              Elite Engineering Protocols Only
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
            >
              <Link
                href="/login"
                className="w-full border-2 border-white bg-white px-12 py-4 text-center text-xs font-black uppercase tracking-widest text-black transition-all duration-200 hover:bg-black hover:text-white sm:w-auto"
              >
                <span>Initialize_Access</span>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xl flex-1 lg:max-w-none"
          >
            <IsometricScene />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="relative z-10 flex flex-col items-center gap-2 pb-8"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
          System_v2.0 // Bluelearnerhub
        </span>
      </motion.div>
    </section>
  )
}
