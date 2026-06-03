import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of the BlueLearnerHub platform.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-foreground">
      <h1 className="mb-4 font-serif text-5xl font-medium text-white">Terms of Service</h1>
      <p className="mb-12 text-sm text-muted-foreground">Last updated: March 2025</p>

      <section className="space-y-10">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            By accessing or using BlueLearnerHub (&quot;the Platform&quot;) you agree to be bound by
            these Terms of Service. If you do not agree, please do not use the Platform.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">2. Eligibility</h2>
          <p className="leading-relaxed text-muted-foreground">
            You must be at least 13 years of age to create an account. If you are under 18, a parent
            or legal guardian must review and agree to these terms on your behalf.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">3. Account Responsibilities</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>
              You are responsible for maintaining the confidentiality of your account credentials.
            </li>
            <li>You must not share, sell, or transfer your account to another person.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">4. Acceptable Use</h2>
          <p className="leading-relaxed text-muted-foreground">
            You may not use the Platform to: upload malicious code, harass other users, attempt to
            gain unauthorised access to any system, violate any applicable law, or submit
            plagiarised content in hackathons or assessments.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">5. Intellectual Property</h2>
          <p className="leading-relaxed text-muted-foreground">
            All platform content (course material, problem sets, UI design) is owned by
            BlueLearnerHub or its licensors. You may use it solely for personal, non-commercial
            learning purposes. Code you write in the IDE belongs to you; by submitting to a
            hackathon you grant us a non-exclusive licence to display and evaluate it.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">6. Certificates</h2>
          <p className="leading-relaxed text-muted-foreground">
            Certificates are issued upon completion of the required track and assessment. We reserve
            the right to revoke certificates obtained through academic dishonesty.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">7. Disclaimer of Warranties</h2>
          <p className="leading-relaxed text-muted-foreground">
            The Platform is provided &quot;as is&quot; without warranties of any kind. We do not
            guarantee uninterrupted service, error-free operation, or specific learning outcomes.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">8. Limitation of Liability</h2>
          <p className="leading-relaxed text-muted-foreground">
            To the maximum extent permitted by law, BlueLearnerHub shall not be liable for indirect,
            incidental, or consequential damages arising from your use of the Platform.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">9. Changes to Terms</h2>
          <p className="leading-relaxed text-muted-foreground">
            We may update these terms. Continued use of the Platform after changes constitutes
            acceptance. We will notify registered users of material changes via email.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">10. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            Questions? Visit our{' '}
            <Link href="/contact" className="text-primary underline">
              contact page
            </Link>{' '}
            or email{' '}
            <a href="mailto:connect@bluelearnerhub.com" className="text-primary underline">
              connect@bluelearnerhub.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
