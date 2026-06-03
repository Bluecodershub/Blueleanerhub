'use client'

import { CircuitBoard } from 'lucide-react'
import LessonPage from '../_shared/LessonPage'
import { electricalTopics } from './content'

export default function ElectricalPage() {
  return (
    <LessonPage
      domainLabel="Electrical Engineering"
      domainIcon={CircuitBoard}
      domainColor="#f57f17"
      topics={electricalTopics}
    />
  )
}
