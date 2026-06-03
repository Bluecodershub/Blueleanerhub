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

export interface UserSkill {
  skill_name: string
  proficiency_level: number
}

export interface User {
  id: string
  email: string
  name: string
  role?: string
  fullName?: string
  avatar?: string
  domain?: string
  profilePicture?: string
  level?: number
  totalPoints?: number
  currentStreak?: number
  longestStreak?: number
  avatarConfig?: AvatarConfig
  bio?: string
  location?: string
  stats?: UserStats
  skills?: UserSkill[]
  githubUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  collegeName?: string
  graduationYear?: number
  createdAt: Date
}

export interface AvatarConfig {
  seed: string
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

export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration: number
  progress?: number
}

export interface Hackathon {
  id: string
  title: string
  description: string
  organizer: string
  startDate: Date
  endDate: Date
  status: 'upcoming' | 'active' | 'completed'
  participants: number
  prizes: string[]
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary?: string
  postedAt: Date
}

export interface Quiz {
  id: string
  title: string
  questions: Question[]
  timeLimit?: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface Exercise {
  id: string
  title: string
  domain: string
  subDomain?: string
  difficulty: string
  points: number
  successRate?: string
  solved: boolean
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface ExerciseListParams {
  domain?: string
  search?: string
  sort?: string
  page?: number
  limit?: number
}

export interface LearningTrackCourse {
  id: number
  title: string
  lessons: number
  hours: number
  locked: boolean
}

export interface LearningTrackPhase {
  phase: number
  title: string
  weeks: number
  courses: LearningTrackCourse[]
}

export interface LearningTrackInstructor {
  name: string
  role: string
  avatar?: string
}

export interface LearningTrackEnrollment {
  progressPercentage: number
  completedCourses: number
  totalCourses: number
}

export interface LearningTrack {
  id: number
  title: string
  slug: string
  description: string
  difficulty: string
  estimatedWeeks: number
  enrollmentCount: number
  rating: number
  reviewCount: number
  hasCertificate: boolean
  gradient?: string
  phases: LearningTrackPhase[]
  skills: string[]
  instructors: LearningTrackInstructor[]
  isEnrolled?: boolean
  progressPercent?: number
  enrollment?: LearningTrackEnrollment | null
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon?: string
  badgeIcon?: string
  badge_icon?: string
  status: 'locked' | 'new' | 'unlocked'
  earned?: boolean
  unlocked?: boolean
}

export interface LeaderboardEntry {
  rank: number
  name: string
  xp: number
  totalPoints?: number
  level: number
  avatar?: string
  avatarConfig?: AvatarConfig
  trend: 'up' | 'down' | 'same'
  isCurrentUser?: boolean
}

export interface GamificationLeaderboardResponse {
  data?: LeaderboardEntry[]
  leaderboard?: LeaderboardEntry[]
}

export interface GamificationAchievementsResponse {
  achievements?: Achievement[]
  data?: Achievement[]
}

export interface MCQPublic {
  question: string
  options: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface DailyQuizResult {
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  correctAnswers: number[]
  explanations: string[]
}

export interface PublicQuiz {
  domain: string
  date: string
  questions: MCQPublic[]
  alreadySubmitted: boolean
  previousResult?: {
    score: number
    xp_earned: number
  } | null
}

export interface ProfileAchievement {
  title: string
  desc: string
  icon: string
  unlocked: boolean
}

export interface ProfileLeaderboardEntry {
  rank: number
  name: string
  xp: number
  isUser: boolean
  trend: 'up' | 'down' | 'same'
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export function createApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string }; status?: number } }
    return {
      message: err.response?.data?.message ?? 'An error occurred',
      status: err.response?.status,
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: (error as { message: string }).message }
  }
  return { message: 'An unexpected error occurred' }
}

export interface CodeExecutionResult {
  success?: boolean
  stdout?: string
  stderr?: string
  compile_output?: string
  output?: string
  time?: number
  memory?: number
  sessionId?: string
  sessionRecreated?: boolean
}

export interface CodeExecutionResponse {
  data?: CodeExecutionResult
  success?: boolean
  stdout?: string
  stderr?: string
  compile_output?: string
  output?: string
  time?: number
  memory?: number
  sessionId?: string
  sessionRecreated?: boolean
}

export interface AIChatResponse {
  response?: string
  text?: string
  data?: {
    response?: string
    text?: string
  }
}

export interface Candidate {
  userId: number
  fullName: string
  totalPoints: number
  level: number
  rank: number
  avatar?: string
  avatarConfig?: AvatarConfig
}

export interface Track {
  id: number
  title: string
  domain: string
  enrollmentCount: number
  description?: string
  difficulty?: string
  rating?: number
}
