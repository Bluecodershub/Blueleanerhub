export const UserRole = {
  STUDENT: 'STUDENT',
  MENTOR: 'MENTOR',
  ADMIN: 'ADMIN',
  CORPORATE: 'CORPORATE',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface UserSkill {
  name: string
  level: number
}

export interface AvatarConfig {
  seed?: string
  backgroundColor?: string
  backgroundType?: string
  clothes?: string
  clothesColor?: string
  eyes?: string
  eyesColor?: string
  facialHair?: string
  facialHairColor?: string
  hair?: string
  hairColor?: string
  mouth?: string
  skinColor?: string
}

export interface User {
  _id: string
  email: string
  fullName: string
  role: UserRole
  domain?: string
  level?: number
  avatarUrl?: string
  avatarConfig?: AvatarConfig
  profilePicture?: string
  bio?: string
  location?: string
  totalPoints?: number
  currentStreak?: number
  longestStreak?: number
  skills?: UserSkill[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface UserStats {
  total_points?: number
  current_streak?: number
  longest_streak?: number
  level?: number
  enrolled_paths?: number
  quizzes_taken?: number
  avg_quiz_score?: number
  hackathons_participated?: number
  jobs_applied?: number
}
