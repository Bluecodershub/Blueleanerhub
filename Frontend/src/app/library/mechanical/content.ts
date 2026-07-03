import type { LessonTopic } from '../_shared/types'
import { thermoLessons } from './thermo-content'
import { fluidLessons } from './fluid-content'
import { manufacturingLessons } from './manufacturing-content'
import { cadCamLessons } from './cadcam-content'

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
  {
    id: 'cad-cam',
    name: 'CAD & CAM',
    description: 'Parametric CAD, drawings, mass properties, CNC feeds and speeds, toolpaths, and G-code setup.',
    icon: 'Box',
    lessons: cadCamLessons,
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing Processes',
    description: 'Casting design (Chvorinov\'s Rule, riser design), metal cutting, Taylor\'s tool life equation, and MRR optimization.',
    icon: 'Factory',
    lessons: manufacturingLessons,
  },
]
