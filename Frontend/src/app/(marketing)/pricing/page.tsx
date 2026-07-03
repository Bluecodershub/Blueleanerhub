import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PageHero, SectionHeading, CtaBand } from '@/components/marketing/PublicPageShell'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for individual learners, colleges, and corporates. Start free, upgrade when you are ready.',
  robots: { index: true, follow: true },
}

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Everything you need to start learning and practising.',
    cta: { label: 'Get Started', href: '/get-started' },
    highlight: false,
    features: [
      'Access to free lessons and tutorials',
      'Coding practice with the online IDE',
      'Join public hackathons and events',
      'Community Q&A access',
      'Basic progress tracking',
    ],
  },
  {
    name: 'Pro',
    price: 'from ₹499',
    period: '/month',
    description: 'For serious learners building career-ready skills.',
    cta: { label: 'Upgrade to Pro', href: '/premium' },
    highlight: true,
    features: [
      'Everything in Free',
      'All premium courses and learning tracks',
      'Advanced AI review on submissions',
      'Skill-based certificates',
      'Priority hackathon entry',
      'Detailed analytics and career readiness score',
    ],
  },
  {
    name: 'Teams & Enterprise',
    price: 'Custom',
    period: '',
    description: 'For colleges, universities, and corporates.',
    cta: { label: 'Contact Sales', href: '/contact' },
    highlight: false,
    features: [
      'College & corporate dashboards',
      'Student / cohort analytics',
      'Host private hackathons & hiring challenges',
      'Enterprise LMS access',
      'Dedicated support & onboarding',
    ],
  },
]

const oneTime = [
  { label: 'Individual course purchase', detail: 'Lifetime access to a single course with certificate eligibility.' },
  { label: 'Certificate fee', detail: 'Issue a verifiable, shareable certificate on completion.' },
  { label: 'Hackathon participation', detail: 'Entry to premium and partner-hosted hackathons.' },
  { label: 'Capstone review', detail: 'In-depth mentor review of a capstone project.' },
]

export default function PricingPage() {
  return (
    <main className="text-foreground">
      <PageHero
        eyebrow="Pricing"
        title="Start free. Upgrade when you’re ready."
        subtitle="Transparent pricing for learners and organizations. No hidden fees — see exactly what’s included before you pay."
      />

      {/* Plan cards */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-3xl border p-8 ${
              plan.highlight ? 'border-primary/40 bg-primary/5 shadow-[0_0_40px_hsl(var(--primary)/0.08)]' : 'border-border/50 bg-card/40'
            }`}
          >
            {plan.highlight && (
              <span className="mb-4 inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-serif text-4xl font-medium text-white">{plan.price}</span>
              {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.cta.href}
              className={`mt-8 w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                plan.highlight ? 'bg-primary text-primary-foreground hover:scale-[1.01]' : 'border border-border text-foreground hover:bg-secondary'
              }`}
            >
              {plan.cta.label}
            </Link>
          </div>
        ))}
      </section>

      <p className="mx-auto max-w-2xl px-6 pb-16 text-center text-xs text-muted-foreground">
        Prices shown are indicative and billed via a secure, PCI-DSS-compliant payment gateway. Review our{' '}
        <Link href="/refund" className="text-primary underline">Refund &amp; Cancellation Policy</Link>{' '}
        and{' '}
        <Link href="/terms" className="text-primary underline">Terms</Link>{' '}
        before purchase.
      </p>

      {/* One-time options */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <SectionHeading title="One-time purchases" subtitle="Prefer to pay as you go? Buy exactly what you need." />
        <div className="grid gap-4 sm:grid-cols-2">
          {oneTime.map((o) => (
            <div key={o.label} className="rounded-2xl border border-border/40 bg-card/40 p-6">
              <h3 className="mb-1.5 font-semibold text-white">{o.label}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{o.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <CtaBand
        title="Have questions about pricing?"
        subtitle="Talk to our team about student plans, college partnerships, or corporate hackathon hosting."
        primary={{ label: 'Get Started Free', href: '/get-started' }}
        secondary={{ label: 'Contact Sales', href: '/contact' }}
      />
    </main>
  )
}
