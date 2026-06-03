export interface CodeExample {
  code: string
  output?: string
  language?: string
  fileName?: string
}

export interface ContentSection {
  type:
    | 'text'
    | 'code'
    | 'note'
    | 'warning'
    | 'table'
    | 'formula'
    | 'diagram'
    | 'steps'
    | 'comparison'
  content: string
  example?: CodeExample
  table?: { headers: string[]; rows: string[][] }
  steps?: string[]
  items?: string[]
}

export interface Exercise {
  question: string
  hint?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface InterviewQuestion {
  question: string
  answer: string
  difficulty: 'junior' | 'mid' | 'senior'
}

export interface TopicContent {
  id: string
  title: string
  introduction: string
  whyLearn: string
  sections: ContentSection[]
  commonMistakes?: string[]
  bestPractices?: string[]
  exercises?: Exercise[]
  quiz?: QuizQuestion[]
  interviewQuestions?: InterviewQuestion[]
  summary: string
  nextTopic?: string
}

export interface LessonTopic {
  id: string
  title: string
  subtopics?: string[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  domain: string
  domainSlug: string
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all-levels'
  topics: LessonTopic[]
  content: Record<string, TopicContent>
}
