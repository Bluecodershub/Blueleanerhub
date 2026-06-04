import Link from 'next/link'
import { BookOpen, Clock, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BetaComingSoonProps {
  title: string
  description: string
  featureLabel?: string
  backHref?: string
  backLabel?: string
}

export function BetaComingSoon({
  title,
  description,
  featureLabel = 'Beta feature',
  backHref = '/library',
  backLabel = 'Explore lessons',
}: BetaComingSoonProps) {
  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LockKeyhole className="h-7 w-7" />
        </div>

        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
          <Clock className="h-3.5 w-3.5" />
          {featureLabel}
        </p>

        <h1 className="mb-4">{title}</h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">{description}</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href={backHref}>
              <BookOpen className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/hackathons">View hackathons</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
