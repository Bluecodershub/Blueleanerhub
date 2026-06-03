import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Hackathons — Compete Globally & Win Prizes',
  description:
    'Join live AI-powered coding hackathons on BlueLearnerHub. Compete globally, earn prizes, get noticed by top tech companies. Free to enter.',
  keywords: [
    'online hackathon',
    'coding competition',
    'AI hackathon',
    'programming contest',
    'win prizes coding',
    'hackathon for students',
    'tech competition India',
    'competitive programming',
  ],
  openGraph: {
    title: 'AI Hackathons — Compete Globally on BlueLearnerHub',
    description: 'Real-world AI-powered hackathons. Win prizes. Get hired. Free to enter.',
    images: ['/og-image.png'],
  },
}

export default function HackathonsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
