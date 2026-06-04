import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BetaComingSoon } from '@/components/beta/BetaComingSoon'

export default function MentorsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16">
        <BetaComingSoon
          title="Mentors are coming soon"
          featureLabel="Mentor access locked during beta"
          description="The mentor experience is disabled for this beta release while we finish safety, scheduling, and guidance workflows. You can continue using lessons, quizzes, hackathons, and the library."
        />
      </main>
      <Footer />
    </div>
  )
}
