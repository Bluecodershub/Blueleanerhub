'use client'

import { Suspense } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const paymentType = searchParams.get('type')
  const hackathonId = searchParams.get('hackathonId')
  const isHackathonPayment = paymentType === 'hackathon' && hackathonId

  const dashboardHref = isHackathonPayment ? `/hackathons/${hackathonId}` : '/student/dashboard'
  const secondaryHref = isHackathonPayment ? '/hackathons' : '/premium'

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6">
      <Card className="glass-morphism relative w-full max-w-md space-y-8 overflow-hidden border-border bg-card/60 p-10 text-center">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-border bg-primary/10"
        >
          <CheckCircle2 className="h-12 w-12 text-foreground/80" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-black uppercase italic tracking-tighter text-white">
            {isHackathonPayment ? 'REGISTRATION_CONFIRMED' : 'PAYMENT_CONFIRMED'}
          </h1>
          <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-muted-foreground">
            {isHackathonPayment
              ? 'Your hackathon checkout completed. Registration is finalized after payment confirmation syncs.'
              : 'Your high-tier ops sequence has been initialized. All premium vectors are now online.'}
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase italic text-muted-foreground">
              Status:
            </span>
            <Badge className="border-none bg-primary/10 text-[8px] font-black text-foreground/70">
              {isHackathonPayment ? 'PAID_REGISTRATION' : 'ACTIVE_SUBSCRIPTION'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase italic text-muted-foreground">
              {isHackathonPayment ? 'Entry:' : 'AI_Credits:'}
            </span>
            <span className="text-xs font-black text-white">
              {isHackathonPayment ? 'SYNCING...' : 'REGENERATING...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link href={dashboardHref}>
            <Button className="h-12 w-full bg-primary/90 font-black uppercase italic tracking-widest text-white hover:bg-primary/80">
              {isHackathonPayment ? 'VIEW_HACKATHON' : 'LAUNCH_DASHBOARD'} <Rocket className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={secondaryHref}>
            <Button
              variant="ghost"
              className="h-12 w-full text-[10px] font-black uppercase italic tracking-widest text-muted-foreground hover:text-white"
            >
              {isHackathonPayment ? 'BROWSE_HACKATHONS' : 'VIEW_PRICING_DETAILS'}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center p-6" />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
