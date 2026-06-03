'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'Interactive Labs',
    description: 'Master engineering environments via brute-force practice.',
  },
  {
    title: 'Smart Protocols',
    description: 'Intelligent hints and progressive difficulty tracking.',
  },
  {
    title: 'Innovation Kernels',
    description: 'Participate in global computational challenges.',
  },
  {
    title: 'Core Management',
    description: 'Monitor skill frequency and deployment metrics.',
  },
]

export default function Features() {
  return (
    <section id="features" className="border-y border-white/10 bg-black px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
            / Protocol_Capabilities
          </span>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">
            System_Features
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group border border-white/10 bg-black p-8 transition-none hover:bg-white hover:text-black"
            >
              <h3 className="mb-4 font-mono text-sm font-black uppercase tracking-widest">
                [{idx.toString().padStart(2, '0')}] {feature.title}
              </h3>
              <p className="font-mono text-xs uppercase leading-relaxed text-white/40 group-hover:text-black/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
