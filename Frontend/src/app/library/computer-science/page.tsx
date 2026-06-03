'use client'

import { Code2 } from 'lucide-react'
import LessonPage from '../_shared/LessonPage'
import { csTopics } from './content'

export default function ComputerSciencePage() {
  return (
    <LessonPage
      domainLabel="Computer Science"
      domainIcon={Code2}
      domainColor="hsl(var(--primary))"
      topics={csTopics}
    />
  )
}
