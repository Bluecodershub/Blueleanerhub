'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Selection',
    description: 'Define your engineering stack and target domain.',
  },
  {
    title: 'Execution',
    description: 'Execute intensive labs and binary challenges.',
  },
  {
    title: 'Innovation',
    description: 'Deploy solutions to active innovation kernels.',
  },
  {
    title: 'Validation',
    description: 'Receive definitive system certification.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-black px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">
            / Protocol_Workflow
          </span>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white md:text-6xl">
            System_Deployment
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.15 }}
              className="relative border border-white/5 bg-black p-10"
            >
              <div className="mb-6 font-mono text-[10px] tracking-widest text-white/20">
                STEP_0{idx + 1}
              </div>
              <h3 className="mb-4 text-xl font-black uppercase tracking-tighter text-white">
                {step.title}
              </h3>
              <p className="font-mono text-xs uppercase leading-relaxed text-white/40">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
