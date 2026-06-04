import { BetaComingSoon } from '@/components/beta/BetaComingSoon'

export default function AdminCoursesPage() {
  return (
    <BetaComingSoon
      title="Course management is coming soon"
      featureLabel="Admin course tools locked during beta"
      description="Course publishing and catalog management are disabled in the beta version. This prevents draft course access and enrollment changes until the course system is ready."
      backHref="/admin/dashboard"
      backLabel="Back to admin dashboard"
    />
  )
}
