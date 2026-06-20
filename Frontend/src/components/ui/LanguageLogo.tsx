import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getRuntimeLanguage } from '@/lib/languages'

interface LanguageLogoProps {
  language: string
  size?: number
  className?: string
}

export function LanguageLogo({ language, size = 28, className }: LanguageLogoProps) {
  const runtime = getRuntimeLanguage(language)

  return (
    <Image
      src={runtime.iconPath}
      alt={`${runtime.name} logo`}
      width={size}
      height={size}
      className={cn('shrink-0 rounded-md', className)}
    />
  )
}

interface LanguageBadgeProps {
  language: string
  showVersion?: boolean
  className?: string
}

export function LanguageBadge({ language, showVersion = false, className }: LanguageBadgeProps) {
  const runtime = getRuntimeLanguage(language)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground',
        className
      )}
    >
      <LanguageLogo language={runtime.id} size={18} />
      {runtime.name}
      {showVersion && <span className="text-muted-foreground">{runtime.version}</span>}
    </span>
  )
}
