import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Online Tutorials — Python, JavaScript, React & More',
  description:
    'Interactive coding tutorials in Python, JavaScript, TypeScript, React, Node.js, System Design, and more. Learn at your own pace. 100% free on BlueLearnerHub.',
  keywords: [
    'free coding tutorials',
    'learn python free',
    'javascript tutorial',
    'react tutorial beginner',
    'node js tutorial',
    'typescript course',
    'system design tutorial',
    'web development free',
    'programming tutorial for beginners',
    'interactive coding course',
  ],
  openGraph: {
    title: 'Free Coding Tutorials — BlueLearnerHub',
    description: 'Interactive tutorials in Python, JS, React, System Design & more. Free forever.',
    images: ['/og-image.png'],
  },
}

export default function TutorialsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
