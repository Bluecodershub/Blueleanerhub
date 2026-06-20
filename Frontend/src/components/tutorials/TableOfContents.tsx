// src/components/tutorials/TableOfContents.tsx

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface TOCItem {
  id: string
  title: string
  level: number
  href: string
}

interface TableOfContentsProps {
  items: TOCItem[]
  currentId?: string
}

export default function TableOfContents({ items, currentId }: TableOfContentsProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6 dark:border-border dark:bg-card"
    >
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">On This Page</h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
          >
            <Link href={item.href}>
              <a
                className={`text-sm transition-colors hover:text-primary dark:hover:text-sky-400 ${
                  currentId === item.id
                    ? 'font-semibold text-primary dark:text-sky-400'
                    : 'text-gray-600 dark:text-muted-foreground'
                }`}
              >
                {item.title}
              </a>
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}
