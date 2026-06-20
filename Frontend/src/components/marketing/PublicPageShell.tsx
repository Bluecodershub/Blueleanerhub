import Link from 'next/link'

/** Consistent hero block used across the public marketing pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: React.ReactNode
  subtitle: string
  children?: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-6xl border-b border-border px-6 pt-28 pb-14">
      <p className="mb-4 text-xs font-semibold text-primary">{eyebrow}</p>
      <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{subtitle}</p>
      {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
    </section>
  )
}

/** Closing call-to-action band, reused at the bottom of each page. */
export function CtaBand({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string
  subtitle: string
  primary: { label: string; href: string }
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="my-24 border-y border-border bg-secondary/25">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="max-w-3xl text-3xl font-semibold text-white">{title}</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">{subtitle}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={primary.href} className="btn btn-primary">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="btn btn-outline">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

/** Section heading used between content blocks. */
export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <h2 className="mb-3 text-3xl font-semibold text-white">{title}</h2>
      {subtitle && <p className="max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
