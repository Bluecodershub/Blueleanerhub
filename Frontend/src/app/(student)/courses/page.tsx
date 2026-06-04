import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BetaComingSoon } from '@/components/beta/BetaComingSoon'

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16">
        <BetaComingSoon
          title="Courses are coming soon"
          featureLabel="Courses locked during beta"
          description="The structured course catalog, enrollment flow, modules, and course certificates are locked while Bluelearnerhub is in beta. Lessons, library tracks, quizzes, and hackathons remain available."
        />
      </main>
      <Footer />
    </div>
  )
}
