import type { Metadata } from 'next'
import LegalDocument from '@/components/legal/LegalDocument'
import { legalDocs } from '@/data/legal'

const doc = legalDocs['terms']

export const metadata: Metadata = {
  title: doc.title,
  description: doc.summary,
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return <LegalDocument doc={doc} />
}
