'use client'

import { Building } from 'lucide-react'
import LessonPage from '../_shared/LessonPage'
import { civilTopics } from './content'

export default function CivilPage() {
  return (
    <LessonPage
      domainLabel="Civil Engineering"
      domainIcon={Building}
      domainColor="#2e7d32"
      topics={civilTopics}
    />
  )
}
