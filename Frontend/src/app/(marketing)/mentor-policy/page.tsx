import type { Metadata } from 'next'
import LegalDocument from '@/components/legal/LegalDocument'
import { legalDocs } from '@/data/legal'

const doc = legalDocs['mentor-policy']

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  robots: { index: true, follow: true },
}

export default function MentorPolicyPage() {
  return <LegalDocument doc={doc} />
}
