export interface Tutorial {
  _id: string
  title: string
  description: string
  difficulty: string
  category?: string
  language?: string
  duration?: number
  path?: string
  isPublished: boolean
  imageUrl?: string
  createdBy?: string
  createdAt: string
}

export interface Exercise {
  _id: string
  title: string
  description?: string
  difficulty: string
  category?: string
  starterCode?: string
  testCases?: { input: string; expected: string }[]
  tags?: string[]
  createdBy?: string
  createdAt: string
}

export interface ExerciseSubmission {
  _id: string
  exerciseId: string
  userId: string
  code: string
  language: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  output?: string
  submittedAt: string
}

export interface Certificate {
  _id: string
  userId: string
  title: string
  type: string
  issuedAt: string
  expiresAt?: string
  verificationCode: string
}

export interface LearningTrack {
  _id: string
  title: string
  slug: string
  description?: string
  difficulty: string
  domain?: string
  estimatedWeeks?: number
  enrollmentCount: number
  isPublished: boolean
  phases?: {
    phase: number
    title: string
    weeks: number
    courses: { id: string; title: string; lessons: number; hours: number }[]
  }[]
}
