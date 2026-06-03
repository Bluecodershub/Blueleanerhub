export const QuizDifficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const

export type QuizDifficulty = (typeof QuizDifficulty)[keyof typeof QuizDifficulty]

export const TutorialDifficulty = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
} as const

export type TutorialDifficulty = (typeof TutorialDifficulty)[keyof typeof TutorialDifficulty]

export const ExerciseDifficulty = TutorialDifficulty
export type ExerciseDifficulty = TutorialDifficulty

export interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  difficulty?: QuizDifficulty
}

export interface Quiz {
  _id: string
  title: string
  description?: string
  questions: Question[]
  timeLimit?: number
  difficulty?: QuizDifficulty
  category?: string
  createdBy?: string
  createdAt?: string
}

export interface QuizAttempt {
  _id: string
  quizId: string
  userId: string
  score: number
  totalQuestions: number
  answers: { questionId: string; selectedIndex: number; isCorrect: boolean }[]
  startedAt: string
  completedAt?: string
}

export interface MCQPublic {
  question: string
  options: string[]
  difficulty: string
}

export interface DailyQuizPublic {
  domain: string
  date: string
  questions: MCQPublic[]
  alreadySubmitted: boolean
  previousResult?: {
    score: number
    correctCount: number
    totalQuestions: number
    xpEarned: number
  }
}

export interface QuizSubmissionResult {
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  correctAnswers?: number[]
  explanations?: string[]
}
