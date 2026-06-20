import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'card' | 'text' | 'circle' | 'rectangle'
  count?: number
}

export function LoadingSkeleton({
  className,
  variant = 'rectangle',
  count = 1,
}: LoadingSkeletonProps) {
  const variants = {
    card: 'h-64 rounded-[8px]',
    text: 'h-4 rounded-md',
    circle: 'rounded-full aspect-square',
    rectangle: 'h-32 rounded-[8px]',
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('animate-pulse bg-secondary/85', variants[variant], className)} />
      ))}
    </>
  )
}

// Specialized skeleton components
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[8px] border border-border bg-card">
          <LoadingSkeleton variant="rectangle" className="h-48" />
          <div className="space-y-3 p-6">
            <LoadingSkeleton variant="text" className="w-3/4" />
            <LoadingSkeleton variant="text" className="w-full" />
            <LoadingSkeleton variant="text" className="w-2/3" />
            <div className="flex gap-2 pt-2">
              <LoadingSkeleton className="h-8 w-20 rounded" />
              <LoadingSkeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-1/3" />
            <LoadingSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
