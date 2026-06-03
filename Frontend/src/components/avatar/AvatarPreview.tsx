import React from 'react'
import { generateAvatarURL, AvatarConfig } from '@/utils/generateAvatar'
import { cn } from '@/lib/utils'

interface AvatarPreviewProps {
  config: AvatarConfig
  className?: string
  size?: number
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ config, className, size = 120 }) => {
  const url = generateAvatarURL(config)

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-muted/20',
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt="User Avatar"
        className="h-full w-full object-cover"
        onError={(e) => {
          // Fallback if API fails
          e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${config.seed}`
        }}
      />
    </div>
  )
}
