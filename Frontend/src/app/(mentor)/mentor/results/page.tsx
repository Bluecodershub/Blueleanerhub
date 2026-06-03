'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to grades page which shows graded/published results
export default function MentorResultsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/mentor/grades') }, [router])
  return null
}
