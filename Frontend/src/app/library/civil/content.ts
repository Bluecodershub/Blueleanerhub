import type { LessonTopic } from '../_shared/types'
import { structureLessons } from './structures-content'
import { geotechLessons } from './geotech-content'

export const civilTopics: LessonTopic[] = [
  {
    id: 'structural-analysis',
    name: 'Structural Analysis',
    description: 'Structural loads, bending moment and shear force diagrams, beam design fundamentals.',
    icon: 'Building',
    lessons: structureLessons,
  },
  {
    id: 'geotechnical-engineering',
    name: 'Geotechnical Engineering',
    description: 'Soil classification, phase relationships, Atterberg limits, bearing capacity, and foundation design per IS 6403.',
    icon: 'Layers',
    lessons: geotechLessons,
  },
]
