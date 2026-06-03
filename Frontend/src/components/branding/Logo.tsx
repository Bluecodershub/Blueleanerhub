import { brandConfig } from '@/config/theme'

interface LogoProps {
  variant?: 'default' | 'white'
  className?: string
  showText?: boolean
}

export function Logo({ variant = 'default', className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill={variant === 'white' ? '#fff' : '#3b82f6'} />
        <path d="M8 12h8v8H8z" fill={variant === 'white' ? '#3b82f6' : '#fff'} opacity="0.8" />
        <path d="M12 8h8v8h-8z" fill={variant === 'white' ? '#3b82f6' : '#fff'} />
      </svg>

      {showText && (
        <span
          className={`text-xl font-bold ${variant === 'white' ? 'text-white' : 'text-foreground'}`}
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
