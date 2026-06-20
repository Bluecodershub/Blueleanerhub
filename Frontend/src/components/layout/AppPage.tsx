import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Tone = 'primary' | 'info' | 'success' | 'warning' | 'neutral'

const toneStyles: Record<Tone, { icon: string; surface: string }> = {
  primary: { icon: 'text-primary', surface: 'border-primary/20 bg-primary/[0.08]' },
  info: { icon: 'text-info', surface: 'border-info/20 bg-info/[0.08]' },
  success: { icon: 'text-success', surface: 'border-success/20 bg-success/[0.08]' },
  warning: { icon: 'text-warning', surface: 'border-warning/20 bg-warning/[0.08]' },
  neutral: { icon: 'text-foreground/70', surface: 'border-border bg-secondary/60' },
}

export function AppPage({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('app-page space-y-7', className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  meta,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('app-page-header', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h1 className="text-balance text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
        {meta && <div className="mt-4 flex flex-wrap items-center gap-3">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function MetricGrid({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {children}
    </section>
  )
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'neutral',
  href,
  detail,
}: {
  label: string
  value: React.ReactNode
  description?: React.ReactNode
  icon: LucideIcon
  tone?: Tone
  href?: string
  detail?: React.ReactNode
}) {
  const styles = toneStyles[tone]
  const content = (
    <div
      className={cn(
        'group min-h-32 rounded-[8px] border border-border bg-card/90 p-5 shadow-sm transition-all duration-200',
        href && 'hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-[7px] border', styles.surface)}>
          <Icon className={cn('h-4.5 w-4.5', styles.icon)} />
        </div>
        {detail && <div className="text-xs font-medium text-muted-foreground">{detail}</div>}
      </div>
      <p className="mt-5 font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground/85">{label}</p>
      {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
    </div>
  )

  return href ? (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  ) : content
}

export function SectionPanel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn('rounded-[8px] border border-border bg-card/85 shadow-sm', className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-base font-semibold leading-6 text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', contentClassName)}>{children}</div>
    </section>
  )
}

export function PageState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
  className?: string
}) {
  return (
    <div className={cn('flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center', className)}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] border border-border bg-secondary/70">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && (
        <Button asChild size="sm" className="mt-5">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

export function DashboardLoading({ metrics = 4 }: { metrics?: number }) {
  return (
    <div className="space-y-7" aria-label="Loading dashboard">
      <div className="space-y-3 border-b border-border pb-6">
        <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-8 w-72 max-w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-secondary/70" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: metrics }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[8px] border border-border bg-card" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-[8px] border border-border bg-card lg:col-span-2" />
        <div className="h-72 animate-pulse rounded-[8px] border border-border bg-card" />
      </div>
    </div>
  )
}
