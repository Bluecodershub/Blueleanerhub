import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BetaComingSoon } from '@/components/beta/BetaComingSoon'

export default function CourseDetailPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-16">
        <BetaComingSoon
          title="Course access is locked for beta"
          featureLabel="Course enrollment unavailable"
          description="Course details, modules, and enrollment are not available in this beta version. Use the lesson library and hackathons while the course experience is being prepared."
        />
      </main>
      <Footer />
    </div>
  )
}
