import type { Metadata } from 'next'
import LegalDocument from '@/components/legal/LegalDocument'
import GrievanceForm from '@/components/legal/GrievanceForm'
import { legalDocs } from '@/data/legal'

const doc = legalDocs['grievance']

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  robots: { index: true, follow: true },
}

export default function GrievancePage() {
  return (
    <LegalDocument doc={doc}>
      <GrievanceForm />
    </LegalDocument>
  )
}
