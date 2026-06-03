export interface Achievement {
  id: string
  title: string
  description: string
  icon?: string
  badgeIcon?: string
  status: 'locked' | 'unlocked' | 'new'
  earned?: boolean
  unlockedAt?: string
}

export interface LeaderboardEntry {
  rank: number
  userId?: string
  name: string
  xp: number
  totalPoints?: number
  level: number
  avatar?: string
  avatarConfig?: Record<string, unknown>
  trend: 'up' | 'down' | 'same'
  isCurrentUser?: boolean
}

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all-time'

export interface MentorProfile {
  _id: string
  userId: string
  expertise: string[]
  experience: number
  bio?: string
  hourlyRate?: number
  isAvailable: boolean
}

export interface Organization {
  _id: string
  name: string
  type: string
  description?: string
  website?: string
  logoUrl?: string
  adminIds: string[]
  createdAt: string
}

export interface Space {
  _id: string
  name: string
  category: string
  description?: string
  icon?: string
  isActive: boolean
}
