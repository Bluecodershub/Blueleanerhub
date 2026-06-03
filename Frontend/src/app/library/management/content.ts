import type { LessonTopic } from '../_shared/types'
import { financeLessons } from './finance-content'

export const managementTopics: LessonTopic[] = [
  {
    id: 'financial-management',
    name: 'Financial Management',
    description: 'Time value of money, NPV/IRR capital budgeting, financial ratio analysis, and corporate finance fundamentals.',
    icon: 'Calculator',
    lessons: financeLessons,
  },
]
