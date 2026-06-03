'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Google',
    content:
      'Bluelearnerhub helped me transition from bootcamp graduate to working at Google. The hackathons gave me real-world experience!',
    rating: 5,
    initials: 'SC',
    color: 'from-blue-500 to-primary',
  },
  {
    name: 'Raj Patel',
    role: 'Backend Developer',
    company: 'Meta',
    content:
      'The system design and algorithm modules are top-notch. I went through the entire CS track and it significantly improved my technical interview performance.',
    rating: 5,
    initials: 'RP',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Emma Wilson',
    role: 'Full Stack Developer',
    company: 'Stripe',
    content:
      'I loved the interactive tutorials. Learning by doing actually stuck with me, unlike traditional courses.',
    rating: 5,
    initials: 'EW',
    color: 'from-primary to-blue-500',
  },
  {
    name: 'Alex Kumar',
    role: 'Frontend Architect',
    company: 'Microsoft',
    content:
      'The Deep Dive tutorials on React and Next.js are the best I have found. The community feedback on my code reviews helped me master clean code principles.',
    rating: 5,
    initials: 'AK',
    color: 'from-primary to-primary',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}`}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.85
      const index = Math.round(scrollLeft / cardWidth)
      setActiveIndex(Math.min(index, testimonials.length - 1))
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="relative overflow-hidden bg-card/30 px-4 py-16 md:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-level-purple/5 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center md:mb-16"
        >
          <span className="mb-4 inline-block rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
            Success Stories
          </span>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Join Our{' '}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Founding Cohort
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
            Be among the first to experience Bluelearnerhub — and help shape the future of engineering education
          </p>
        </motion.div>

        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden"
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="min-w-[85%] snap-center"
            >
              <TestimonialCard testimonial={testimonial} index={idx} />
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2 md:hidden">
          {testimonials.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-6 bg-purple-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-2">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              <TestimonialCard testimonial={testimonial} index={idx} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: (typeof testimonials)[0]
  index: number
}) {
  return (
    <div className="group h-full rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-card md:p-8">
      <Quote className="mb-4 h-8 w-8 text-purple-500/30 transition-colors group-hover:text-purple-500/50" />
      <p className="mb-6 text-sm leading-relaxed text-foreground/80 md:text-base">
        &ldquo;{testimonial.content}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileInView={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className={`h-10 w-10 rounded-full bg-gradient-to-br ${testimonial.color} flex flex-shrink-0 items-center justify-center`}
            >
              <span className="text-sm font-bold text-white">{testimonial.initials}</span>
            </div>
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${testimonial.color} opacity-0`}
              animate={{ opacity: [0, 0.4, 0], scale: [1, 1.5, 1.8] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.5, ease: 'easeOut' }}
            />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">
              {testimonial.role} at{' '}
              <span className="font-medium text-foreground/70">{testimonial.company}</span>
            </p>
          </div>
        </div>
        <StarRating rating={testimonial.rating} />
      </div>
    </div>
  )
}
