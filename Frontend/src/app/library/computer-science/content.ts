import type { LessonTopic } from '../_shared/types'
import { pythonLessons } from './python-content'
import { pythonLessons2 } from './python-content2'
import { dsaLessons } from './dsa-content'
import { dsaLessons2 } from './dsa-content2'

export const csTopics: LessonTopic[] = [
  {
    id: 'python',
    name: 'Python Programming',
    description: 'From variables and loops to OOP, NumPy, and interview preparation — a complete Python tour.',
    icon: 'Terminal',
    lessons: [...pythonLessons, ...pythonLessons2],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Arrays, linked lists, trees, graphs, sorting, DP, and backtracking with real code examples.',
    icon: 'Binary',
    lessons: [...dsaLessons, ...dsaLessons2],
  },
]
