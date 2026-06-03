import type { LessonTopic } from '../_shared/types'
import { circuitLessons } from './circuits-content'

export const electricalTopics: LessonTopic[] = [
  {
    id: 'circuit-analysis',
    name: 'Circuit Analysis',
    description: "Ohm's Law, Kirchhoff's Laws, AC phasors, impedance, Thévenin/Norton theorems, and power analysis.",
    icon: 'CircuitBoard',
    lessons: circuitLessons,
  },
]
