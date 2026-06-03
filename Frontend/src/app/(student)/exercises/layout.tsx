import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coding Challenges & Exercises — Practice DSA & Algorithms',
  description:
    'Solve 1,200+ coding challenges in Python, JavaScript, and more. DSA, algorithms, system design exercises with instant AI feedback. Free on BlueLearnerHub.',
  keywords: [
    'coding challenges',
    'dsa practice',
    'algorithm problems',
    'leetcode alternative free',
    'competitive programming practice',
    'python exercises',
    'javascript challenges',
    'data structures problems',
    'coding interview prep free',
  ],
  openGraph: {
    title: 'Coding Challenges & Exercises — BlueLearnerHub',
    description: '1,200+ DSA & algorithm challenges with instant AI feedback. Free.',
    images: ['/og-image.png'],
  },
}

export default function ExercisesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
