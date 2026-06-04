import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  imageUrl?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  imageUrl,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon or Image */}
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="mb-6 h-64 w-64 opacity-50" />
      ) : Icon ? (
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border bg-secondary">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="mb-2 text-2xl">{title}</h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-muted-foreground">{description}</p>

      {/* Action Button */}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
