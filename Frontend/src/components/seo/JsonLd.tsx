const BASE_URL = 'https://bluelearnerhub.com'

// Organization schema — tells Google this is a real education company
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'BlueLearnerHub',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.ico`,
  description:
    'BlueLearnerHub is a free online learning platform for computer science and software engineering. Learn Python, JavaScript, React, system design, and more with AI-powered courses and hackathons.',
  sameAs: [
    'https://twitter.com/bluelearnerhub',
    'https://linkedin.com/company/bluelearnerhub',
    'https://github.com/Blucoderhub',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'connect@bluelearnerhub.com',
    availableLanguage: 'English',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free access to all courses and learning tracks',
  },
}

// WebSite schema — enables Google Sitelinks Search Box
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BlueLearnerHub',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/tutorials?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// FAQ schema — gets Google FAQ rich results in SERPs
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is BlueLearnerHub free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. BlueLearnerHub offers a completely free tier with access to hundreds of courses, coding challenges, daily AI quizzes, and community Q&A. Premium plans unlock advanced features.',
      },
    },
    {
      '@type': 'Question',
      name: 'What courses are available on BlueLearnerHub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BlueLearnerHub covers Python, JavaScript, TypeScript, React, Node.js, System Design, Data Structures & Algorithms, Docker, Machine Learning, SQL, and DevOps — with new tracks added regularly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the certificates from BlueLearnerHub recognized?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. BlueLearnerHub certificates are verifiable via a unique public URL and are accepted by partner companies in hiring pipelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do AI-powered hackathons work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our hackathons use BlueLearner inbuilt AI to generate problem sets, evaluate submissions, and provide adaptive coaching. Students compete globally, earn prizes, and get noticed by top tech companies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can companies hire from BlueLearnerHub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Through our Organizations portal, companies can post challenges, browse verified talent profiles, and directly access students who have earned certificates in their required domains.',
      },
    },
  ],
}

// Course list schema — Google indexes individual courses
const courseListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'BlueLearnerHub Free Courses',
  description: 'Free online courses in computer science and software engineering',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Python Programming',
      url: `${BASE_URL}/learning-tracks/python`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'JavaScript Mastery',
      url: `${BASE_URL}/learning-tracks/javascript`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'React Development',
      url: `${BASE_URL}/learning-tracks/react`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'System Design',
      url: `${BASE_URL}/learning-tracks/system-design`,
    },
    {
      '@type': 'ListItem',
      position: 5,
      name: 'Data Structures & Algorithms',
      url: `${BASE_URL}/learning-tracks/data-structures`,
    },
    {
      '@type': 'ListItem',
      position: 6,
      name: 'Machine Learning',
      url: `${BASE_URL}/learning-tracks/machine-learning`,
    },
  ],
}

export function HomeJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListSchema) }}
      />
    </>
  )
}
