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
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="mb-5 h-32 w-32 rounded-[8px] object-cover opacity-75" />
      ) : Icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] border border-border bg-secondary/70">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : null}

      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>

      {actionLabel && onAction && <Button onClick={onAction} size="sm" className="mt-5">{actionLabel}</Button>}
    </div>
  )
}
