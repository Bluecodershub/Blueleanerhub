// ─── Shared types for all library lesson pages ───────────────────────────────

export interface CodeExample {
  title: string
  language: string
  code: string
  output?: string
  explanation: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number          // index into options
  explanation: string
}

export interface TopicLesson {
  id: string
  title: string
  intro: string
  whatIsIt: string
  whyImportant: string
  simpleExplanation: string
  detailedExplanation: string
  realWorldExample: string
  technicalDetails?: string
  formula?: string
  syntaxBlock?: string
  codeExamples: CodeExample[]
  commonMistakes?: string[]
  bestPractices?: string[]
  exercises: string[]
  quizQuestions: QuizQuestion[]
  interviewQuestions: string[]
  summary: string
  nextTopic?: string
}

export interface LessonTopic {
  id: string
  name: string
  description: string
  icon?: string
  lessons: TopicLesson[]
}
