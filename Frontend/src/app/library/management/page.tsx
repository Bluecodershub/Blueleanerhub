'use client'

import { Calculator } from 'lucide-react'
import LessonPage from '../_shared/LessonPage'
import { managementTopics } from './content'

export default function ManagementPage() {
  return (
    <LessonPage
      domainLabel="Management"
      domainIcon={Calculator}
      domainColor="#6a1b9a"
      topics={managementTopics}
    />
  )
}
