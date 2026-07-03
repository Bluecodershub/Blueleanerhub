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

export function BrandMark(_props: BrandMarkProps) {
  return null
}

export function Logo({ variant = 'default', className = '', showText = true, markSize: _markSize = 32 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
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
