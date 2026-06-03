import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Learning Tracks — Python, JavaScript, React & More',
  description:
    'Structured, job-ready learning paths in Python, JavaScript, React, System Design, ML, and more. Free online courses with verified certificates.',
  keywords: [
    'free python course',
    'javascript learning path',
    'react course free',
    'system design course',
    'machine learning course free',
    'data structures algorithms',
    'coding bootcamp free online',
    'software engineering course',
    'learn to code free',
  ],
  openGraph: {
    title: 'Free Learning Tracks — BlueLearnerHub',
    description:
      'Structured paths from beginner to job-ready. Python, JavaScript, React, ML, System Design. Free forever.',
    images: ['/og-image.png'],
  },
}

export default function LearningTracksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
