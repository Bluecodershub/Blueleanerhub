import { MetadataRoute } from 'next'

const BASE_URL = 'https://bluelearnerhub.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/student/', // authenticated area — no indexing
          '/teacher/',
          '/admin/',
          '/mentor/',
          '/candidate/',
          '/corporate/',
          '/hr/',
          '/institution/',
          '/api/',
          '/_next/',
          '/login',
          '/get-started',
        ],
      },
      {
        // Allow Googlebot full access to public pages
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/student/', '/teacher/', '/admin/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
