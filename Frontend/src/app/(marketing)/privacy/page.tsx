import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How BlueLearnerHub collects, uses, and protects your personal data.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-foreground">
      <h1 className="mb-4 font-serif text-5xl font-medium text-white">Privacy Policy</h1>
      <p className="mb-12 text-sm text-muted-foreground">Last updated: March 2025</p>

      <section className="prose prose-invert max-w-none space-y-10">
        <div>
          <h2 className="mb-3 text-xl font-bold text-white">1. Information We Collect</h2>
          <p className="leading-relaxed text-muted-foreground">
            We collect information you provide directly to us (name, email, profile details),
            information generated through your use of the platform (quiz results, course progress,
            hackathon submissions), and standard technical data (IP address, browser type, cookies)
            to operate and improve the service.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            <li>Provide, personalise, and improve the BlueLearnerHub platform</li>
            <li>Send transactional emails (password reset, certificate notifications)</li>
            <li>Send optional marketing communications (you can unsubscribe at any time)</li>
            <li>Analyse aggregate usage to improve learning outcomes</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">3. Cookies</h2>
          <p className="leading-relaxed text-muted-foreground">
            We use strictly necessary cookies (authentication tokens stored as HttpOnly cookies) and
            optional analytics cookies. You may disable optional cookies in your browser settings
            without affecting core platform functionality.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">4. Data Sharing</h2>
          <p className="leading-relaxed text-muted-foreground">
            We do not sell your personal data. We share data only with service providers who process
            it on our behalf (hosting, email delivery, payment processing) and are bound by data
            processing agreements. We may share data when required by law.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">5. Data Retention</h2>
          <p className="leading-relaxed text-muted-foreground">
            We retain your account data for as long as your account is active. You may request
            deletion of your account and associated data at any time by emailing{' '}
            <a href="mailto:connect@bluelearnerhub.com" className="text-primary underline">
              connect@bluelearnerhub.com
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">6. Your Rights</h2>
          <p className="leading-relaxed text-muted-foreground">
            Depending on your jurisdiction you have the right to access, correct, delete, and port
            your data. Contact us at{' '}
            <a href="mailto:connect@bluelearnerhub.com" className="text-primary underline">
              connect@bluelearnerhub.com
            </a>{' '}
            to exercise these rights.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">7. Changes to This Policy</h2>
          <p className="leading-relaxed text-muted-foreground">
            We may update this policy periodically. We will notify registered users of material
            changes via email or an in-app notification. Continued use of the platform after changes
            constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-xl font-bold text-white">8. Contact</h2>
          <p className="leading-relaxed text-muted-foreground">
            Questions? Email{' '}
            <a href="mailto:connect@bluelearnerhub.com" className="text-primary underline">
              connect@bluelearnerhub.com
            </a>{' '}
            or visit our{' '}
            <Link href="/contact" className="text-primary underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  )
}
