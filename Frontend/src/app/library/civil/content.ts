import type { LessonTopic } from '../_shared/types'
import { structureLessons } from './structures-content'

export const civilTopics: LessonTopic[] = [
  {
    id: 'structural-analysis',
    name: 'Structural Analysis',
    description: 'Structural loads, bending moment and shear force diagrams, beam design fundamentals.',
    icon: 'Building',
    lessons: structureLessons,
  },
]
