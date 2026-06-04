import type { LessonTopic } from '../_shared/types'
import { circuitLessons } from './circuits-content'
import { embeddedLessons } from './embedded-content'

export const electricalTopics: LessonTopic[] = [
  {
    id: 'circuit-analysis',
    name: 'Circuit Analysis',
    description: "Ohm's Law, Kirchhoff's Laws, AC phasors, impedance, Thévenin/Norton theorems, and power analysis.",
    icon: 'CircuitBoard',
    lessons: circuitLessons,
  },
  {
    id: 'embedded-systems',
    name: 'Embedded Systems',
    description: 'Microcontrollers, GPIO, interrupts, PWM, and serial protocols (UART, SPI, I2C) with MicroPython examples.',
    icon: 'Cpu',
    lessons: embeddedLessons,
  },
]
