'use client'

import { Wrench } from 'lucide-react'
import LessonPage from '../_shared/LessonPage'
import { mechanicalTopics } from './content'

export default function MechanicalPage() {
  return (
    <LessonPage
      domainLabel="Mechanical Engineering"
      domainIcon={Wrench}
      domainColor="#e65100"
      topics={mechanicalTopics}
    />
  )
}
