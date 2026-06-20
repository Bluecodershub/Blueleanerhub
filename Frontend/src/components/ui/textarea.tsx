import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[112px] w-full resize-y rounded-[8px] border border-input bg-background/55 px-3 py-2.5 text-sm leading-relaxed text-foreground shadow-inner shadow-black/10 ring-offset-background transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/75 hover:border-muted-foreground/45 focus-visible:border-primary/60 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
