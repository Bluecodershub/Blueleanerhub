'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect to grades page which handles submissions/grading queue
export default function MentorSubmissionsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/mentor/grades') }, [router])
  return null
}
