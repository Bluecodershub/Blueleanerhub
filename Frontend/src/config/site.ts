// src/config/site.ts

import { brandConfig } from './theme'

export const siteConfig = {
  name: brandConfig.name,
  description:
    'Master coding skills with interactive tutorials, hackathons, and AI-powered interview prep',
  url: `https://${brandConfig.domain}`,
  ogImage: `https://${brandConfig.domain}/og.jpg`,
  links: {
    twitter: `https://twitter.com/${brandConfig.social.twitter}`,
    github: `https://github.com/${brandConfig.social.github}`,
    linkedin: `https://linkedin.com/company/${brandConfig.social.linkedin}`,
  },
}
