import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { CustomCursor } from '@/components/ui/CustomCursor'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://bluelearnerhub.com'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef2fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Bluelearnerhub — Engineering Learning Platform',
    template: '%s | Bluelearnerhub',
  },
  description:
    'India\'s premier EdTech platform for engineering students. Master programming with AI-powered quizzes, coding challenges, hackathons, and expert mentorship. Start your tech career today.',
  keywords: [
    'free coding bootcamp India',
    'learn programming free',
    'Python JavaScript React free',
    'system design course free',
    'hackathon platform India',
    'coding interview prep',
    'verified certificates',
    'Bluelearnerhub',
    'edtech India',
    'software engineering',
    'AI learning platform',
  ],
  authors: [{ name: 'Bluelearnerhub', url: BASE_URL }],
  creator: 'Bluelearnerhub',
  publisher: 'Bluelearnerhub',
  category: 'education',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'Bluelearnerhub',
    title: 'Bluelearnerhub — Engineering Learning Platform',
    description:
      'India\'s premier EdTech platform. AI-powered learning, coding challenges, hackathons, and mentorship for engineering students.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bluelearnerhub — Engineering Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bluelearnerhub',
    creator: '@bluelearnerhub',
    title: 'Bluelearnerhub — Engineering Learning Platform',
    description:
      'India\'s premier EdTech platform for engineering students. AI-powered learning, coding challenges, and hackathons.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        {/* Skip to main content - Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:font-semibold"
        >
          Skip to main content
        </a>
        <Providers>
          <CustomCursor />
          <div id="main-content">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
