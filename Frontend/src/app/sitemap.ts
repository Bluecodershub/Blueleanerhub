import { MetadataRoute } from 'next'

const BASE_URL = 'https://bluelearnerhub.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static marketing pages — highest priority for Google
  const marketing: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/tutorials`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/hackathons`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/exercises`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${BASE_URL}/learning-tracks`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/organizations`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/certificates`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    { url: `${BASE_URL}/qna`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/spaces`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/premium`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Auth pages — low priority, no-index handled in page metadata
  const auth: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${BASE_URL}/get-started`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Legal & trust pages — needed for Google trust signals
  const legal: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]

  // High-value SEO landing pages per domain
  const domains = [
    'python',
    'javascript',
    'typescript',
    'react',
    'nodejs',
    'system-design',
    'data-structures',
    'algorithms',
    'docker',
    'machine-learning',
    'sql',
    'devops',
  ]
  const domainPages: MetadataRoute.Sitemap = domains.map((d) => ({
    url: `${BASE_URL}/learning-tracks/${d}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...marketing, ...auth, ...legal, ...domainPages]
}
