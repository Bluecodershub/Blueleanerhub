import Image from 'next/image'
import { brandConfig } from '@/config/theme'

interface BrandMarkProps {
  size?: number
  className?: string
  priority?: boolean
  alt?: string
}

interface LogoProps {
  variant?: 'default' | 'white'
  className?: string
  showText?: boolean
  markSize?: number
}

export function BrandMark({
  size = 32,
  className = '',
  priority = false,
  alt = 'BlueLearnerHub logo',
}: BrandMarkProps) {
  return (
    <Image
      src="/images/branding/bluelearnerhub-mark.svg"
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-[10px] shadow-sm shadow-primary/20 ${className}`}
      priority={priority}
    />
  )
}

export function Logo({ variant = 'default', className = '', showText = true, markSize = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrandMark size={markSize} priority />
      {showText && (
        <span
          className={`whitespace-nowrap font-heading text-xl font-bold ${variant === 'white' ? 'text-white' : 'text-foreground'}`}
        >
          {brandConfig.name}
        </span>
      )}
    </div>
  )
}

export function PoweredByBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 ${className}`}
    >
      <span className="whitespace-nowrap font-medium">Powered by</span>
      <span className="text-xs font-bold normal-case tracking-normal text-primary/80">
        {brandConfig.poweredBy}
      </span>
    </div>
  )
}
