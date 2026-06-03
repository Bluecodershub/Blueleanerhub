// src/components/tutorials/NextPrevButtons.tsx

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface NextPrevButtonsProps {
  prevLesson?: string
  nextLesson?: string
}

export default function NextPrevButtons({ prevLesson, nextLesson }: NextPrevButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 flex gap-4 border-t border-gray-200 pt-8 dark:border-gray-700"
    >
      {prevLesson ? (
        <Link href={prevLesson}>
          <button className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">
            ← Previous Lesson
          </button>
        </Link>
      ) : (
        <button
          disabled
          className="flex cursor-not-allowed items-center gap-2 px-4 py-2 text-gray-400"
        >
          ← Previous Lesson
        </button>
      )}

      <div className="flex-1" />

      {nextLesson ? (
        <Link href={nextLesson}>
          <button className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-700 transition-colors hover:text-primary dark:text-gray-300 dark:hover:text-blue-400">
            Next Lesson →
          </button>
        </Link>
      ) : (
        <button
          disabled
          className="flex cursor-not-allowed items-center gap-2 px-4 py-2 text-gray-400"
        >
          Next Lesson →
        </button>
      )}
    </motion.div>
  )
}
