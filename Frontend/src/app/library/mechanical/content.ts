import type { LessonTopic } from '../_shared/types'
import { thermoLessons } from './thermo-content'
import { fluidLessons } from './fluid-content'

export const mechanicalTopics: LessonTopic[] = [
  {
    id: 'thermodynamics',
    name: 'Thermodynamics',
    description: 'Laws of thermodynamics, entropy, Carnot efficiency, thermodynamic cycles, and heat transfer fundamentals.',
    icon: 'FlaskConical',
    lessons: thermoLessons,
  },
  {
    id: 'fluid-mechanics',
    name: 'Fluid Mechanics',
    description: 'Fluid properties, Bernoulli equation, pipe flow, head losses, pumps, and turbines.',
    icon: 'Droplets',
    lessons: fluidLessons,
  },
]
