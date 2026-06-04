import type { LessonTopic } from '../_shared/types'
import { pythonLessons } from './python-content'
import { pythonLessons2 } from './python-content2'
import { dsaLessons } from './dsa-content'
import { dsaLessons2 } from './dsa-content2'
import { webdevLessons } from './webdev-content'
import { mlLessons } from './ml-content'
import { sqlLessons } from './sql-content'

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
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'HTML semantics, CSS layout (Flexbox & Grid), JavaScript, React components, and Node.js REST APIs.',
    icon: 'Globe',
    lessons: webdevLessons,
  },
  {
    id: 'ml',
    name: 'Machine Learning & AI',
    description: 'ML pipeline, linear & logistic regression, neural networks, and model evaluation with scikit-learn and PyTorch.',
    icon: 'Brain',
    lessons: mlLessons,
  },
  {
    id: 'sql',
    name: 'SQL & Databases',
    description: 'SQL queries, JOINs, window functions, database design, normalization, and indexing strategies.',
    icon: 'Database',
    lessons: sqlLessons,
  },
]
