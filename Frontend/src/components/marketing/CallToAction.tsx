'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CallToAction() {
  return (
    <section className="border-t border-white/10 bg-black px-4 py-32 text-center">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="mb-12 block font-mono text-[10px] uppercase tracking-[0.5em] text-white/30">
            / Deployment_Ready
          </span>

          <h2 className="mb-12 text-5xl font-black uppercase leading-none tracking-tighter text-white md:text-8xl">
            Initialize
            <br />
            Greatness
          </h2>

          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full border-2 border-white bg-white px-16 py-5 text-xs font-black uppercase tracking-widest text-black transition-all duration-200 hover:bg-black hover:text-white">
                Execute_Initialization
              </button>
            </Link>
          </div>

          <div className="mt-20 flex flex-wrap justify-center gap-10 font-mono text-[10px] uppercase tracking-widest text-white/20">
            <span>NO_CREDENTIALS_REQUIRED</span>
            <span>PURE_ENGINEERING</span>
            <span>SYSTEM_READY</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
