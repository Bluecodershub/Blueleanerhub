/**
 * Central source of truth for all Bluelearnerhub legal & compliance documents.
 *
 * These documents are drafted to align with applicable Indian law — the Digital
 * Personal Data Protection Act, 2023 (DPDP), the Information Technology Act and
 * Intermediary Guidelines, and consumer-protection / e-commerce transparency
 * requirements. They are written in plain English so users can actually read them.
 *
 * ⚠️  Every document is marked "Requires review by a qualified Indian lawyer
 *     before publication." Placeholders in [square brackets] must be filled in
 *     with the registered business entity's real details before launch.
 */

export const CONTACT_EMAIL = 'connect@bluelearnerhub.com'
export const GRIEVANCE_EMAIL = 'grievance@bluelearnerhub.com'
export const POLICY_VERSION = '2026.06'
export const LAST_UPDATED = 'June 2026'
export const COMPANY_PLACEHOLDER = '[Registered Business Name Pvt. Ltd.]'
export const ADDRESS_PLACEHOLDER = '[Registered Office Address, City, State, PIN, India]'

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  table?: { headers: string[]; rows: string[][] }
}

export interface LegalDoc {
  slug: string
  href: string
  title: string
  category: 'core' | 'policy' | 'community'
  summary: string
  sections: LegalSection[]
}

/** Ordered nav used by the footer legal column and the in-page cross-links. */
export const legalNav: { href: string; label: string }[] = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund', label: 'Refund & Cancellation' },
  { href: '/cookie', label: 'Cookie Policy' },
  { href: '/data-protection', label: 'Data Protection & Consent' },
  { href: '/community-guidelines', label: 'Community Guidelines' },
  { href: '/hackathon-terms', label: 'Hackathon Terms' },
  { href: '/certificate-policy', label: 'Certificate Policy' },
  { href: '/ai-disclaimer', label: 'AI Review Disclaimer' },
  { href: '/mentor-policy', label: 'Mentor Review Policy' },
  { href: '/child-policy', label: 'Child & Minor Policy' },
  { href: '/grievance', label: 'Grievance Redressal' },
]

const privacy: LegalDoc = {
  slug: 'privacy',
  href: '/privacy',
  title: 'Privacy Policy',
  category: 'core',
  summary:
    'How Bluelearnerhub collects, uses, stores, and protects your personal data, and the rights you have over it under the Digital Personal Data Protection Act, 2023.',
  sections: [
    {
      heading: '1. Who We Are',
      paragraphs: [
        `Bluelearnerhub ("the Platform") is operated by ${COMPANY_PLACEHOLDER}, with its registered office at ${ADDRESS_PLACEHOLDER} ("we", "us", "our"). We act as the Data Fiduciary for personal data processed through the Platform.`,
        `This policy applies to all users — students, mentors/professors, colleges/universities, corporate partners, and administrators — who access the Platform.`,
      ],
    },
    {
      heading: '2. Personal Data We Collect',
      bullets: [
        'Identity & contact data: name, email, phone number, profile photo.',
        'Account data: password (stored only as a salted hash — never in plain text), role, and approval status.',
        'Organisation data: college name, company name, designation (where applicable).',
        'Learning data: course progress, quiz answers, coding and project submissions, hackathon submissions, certificates earned.',
        'Payment data: transaction ID, payment status, and invoice references only — we never store your full card or bank details.',
        'Technical data: IP address, browser and device details, and cookies used to operate and secure the service.',
        'AI & review data: AI review outputs and mentor feedback associated with your submissions.',
      ],
    },
    {
      heading: '3. Why We Collect It & Our Lawful Basis',
      paragraphs: [
        'We process personal data on the basis of the consent you provide at signup and at specific points of use (for example, before AI review or hackathon registration), and where processing is necessary to deliver a service you requested or to meet a legal obligation.',
      ],
      bullets: [
        'To create and secure your account and authenticate you.',
        'To deliver, personalise, and improve lessons, courses, practice, hackathons, and events.',
        'To generate AI and mentor feedback, certificates, and analytics.',
        'To process payments and maintain financial records required by law.',
        'To send transactional communications (password resets, certificate notifications) and — only with your consent — optional updates.',
        'To comply with applicable law and respond to lawful requests.',
      ],
    },
    {
      heading: '4. AI Review, Coding & Hackathon Submissions',
      paragraphs: [
        'When you opt in, your submissions may be processed by automated AI review systems to generate learning-focused feedback and preliminary scores. AI feedback is assistive only and may be reviewed or overridden by a mentor or admin. You can decline AI review where it is offered as optional.',
        'Hackathon and capstone submissions may be shared with the relevant organisers, judges, and mentors strictly for evaluation, and — only with your consent — winning entries may be displayed on the Platform.',
      ],
    },
    {
      heading: '5. College & Corporate Dashboards',
      paragraphs: [
        'If you join through a college or corporate partner, aggregated and individual progress data relevant to your participation may be visible to that organisation’s authorised administrators for the purposes of tracking learning outcomes and event participation. Organisations are contractually bound to use this data only for legitimate educational and hiring-readiness purposes.',
      ],
    },
    {
      heading: '6. Children & Minors',
      paragraphs: [
        'The Platform may be used by school and college students. Where a user is below the age of majority, we require verifiable parent/guardian consent and we do not undertake behavioural tracking or targeted advertising directed at children. See our Child & Minor User Policy for details.',
      ],
    },
    {
      heading: '7. Data Sharing & Third Parties',
      paragraphs: [
        'We do not sell your personal data. We share data only with service providers (Data Processors) who process it on our behalf under data-processing agreements — for example hosting, email delivery, and PCI-DSS-compliant payment gateways — and where required by law or to protect the rights and safety of users.',
      ],
    },
    {
      heading: '8. Cookies & Analytics',
      paragraphs: [
        'We use strictly necessary cookies (such as HttpOnly authentication tokens) and, with your consent, optional analytics and preference cookies. See our Cookie Policy. You can manage optional cookies at any time.',
      ],
    },
    {
      heading: '9. Data Storage, Retention & Cross-Border Transfer',
      paragraphs: [
        'We retain personal data for as long as your account is active or as needed to provide the service and to meet legal, tax, and accounting obligations, after which it is deleted or anonymised. Where data is processed outside India by our service providers, we take steps to ensure protections consistent with applicable Indian law.',
      ],
    },
    {
      heading: '10. Security Safeguards & Breach Handling',
      paragraphs: [
        'We apply reasonable security safeguards including password hashing, encrypted transport, role-based access control, rate limiting, and audit logging. In the event of a personal data breach, we will act to contain it and notify the Data Protection Board of India and affected users where required.',
      ],
    },
    {
      heading: '11. Your Rights',
      bullets: [
        'Access — request a copy of the personal data we hold about you.',
        'Correction — ask us to correct inaccurate or incomplete data.',
        'Erasure — request deletion of your account and associated data.',
        'Withdraw consent — withdraw any consent you previously gave, without affecting prior lawful processing.',
        'Grievance redressal — escalate concerns to our Grievance Officer.',
      ],
      paragraphs: [
        `To exercise any of these rights, use the in-app privacy controls or email ${CONTACT_EMAIL}.`,
      ],
    },
    {
      heading: '12. Grievance Officer',
      paragraphs: [
        `If you have any concern about how your data is handled, contact our Grievance Officer at ${GRIEVANCE_EMAIL} or file a complaint through our Grievance Redressal page. We aim to acknowledge complaints promptly and resolve them within 30 days.`,
      ],
    },
    {
      heading: '13. Changes to This Policy',
      paragraphs: [
        'We may update this policy from time to time. Where changes are material, we will notify registered users by email or in-app notice and, where the law requires, re-collect your consent. The current policy version is shown at the top of this page.',
      ],
    },
  ],
}

const terms: LegalDoc = {
  slug: 'terms',
  href: '/terms',
  title: 'Terms & Conditions',
  category: 'core',
  summary: 'The agreement that governs your use of Bluelearnerhub, including your rights, responsibilities, and the limits of our liability.',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      paragraphs: [
        `By creating an account or using Bluelearnerhub, operated by ${COMPANY_PLACEHOLDER}, you agree to these Terms & Conditions, our Privacy Policy, and the other policies referenced here. If you do not agree, please do not use the Platform.`,
      ],
    },
    {
      heading: '2. Eligibility & Accounts',
      bullets: [
        'You must provide accurate information and keep your account credentials secure.',
        'Minors must have verifiable parent/guardian consent (see the Child & Minor User Policy).',
        'You are responsible for all activity under your account.',
        'Mentor, college, and corporate accounts require admin approval before special access is granted.',
      ],
    },
    {
      heading: '3. Roles & Responsibilities',
      bullets: [
        'Students: learn, practise, submit work honestly, and respect community standards.',
        'Mentors/Professors: provide fair, constructive review and protect student data.',
        'Colleges: manage their students and data responsibly and only for legitimate educational purposes.',
        'Corporates: post genuine challenges and evaluate participants fairly.',
        'Admins: operate the Platform and enforce these terms.',
      ],
    },
    {
      heading: '4. Use of Platform Features',
      paragraphs: [
        'Lessons, courses, coding practice, the online IDE, hackathons, events, AI review, and mentor review are provided for learning and skill development. You agree to use them lawfully and not to misuse compute resources, attempt to break security controls, or interfere with other users.',
      ],
    },
    {
      heading: '5. Payments, Subscriptions & Refunds',
      paragraphs: [
        'Paid courses, certificates, premium practice, subscriptions, and event/hackathon fees are governed by the pricing shown at checkout and our Refund & Cancellation Policy. Payments are processed by third-party PCI-DSS-compliant gateways; we store only transaction references.',
      ],
    },
    {
      heading: '6. User-Generated Content & Intellectual Property',
      bullets: [
        'You retain ownership of original code, projects, and submissions you create.',
        'You grant us a limited licence to host, process, and display your content as needed to operate the service and, where you consent, to showcase winning hackathon entries.',
        'Platform content (lessons, courses, branding) remains our or our licensors’ intellectual property.',
        'You must not upload content that infringes others’ rights or violates the Community Guidelines.',
      ],
    },
    {
      heading: '7. Prohibited Activities',
      bullets: [
        'Cheating, plagiarism, or submitting work that is not your own.',
        'Uploading malware or harmful files, or attempting to hack or overload the Platform.',
        'Harassment, hate speech, fraud, or impersonation.',
        'Scraping, reselling, or misusing Platform content or other users’ data.',
      ],
    },
    {
      heading: '8. No Guarantee of Outcomes',
      paragraphs: [
        'Bluelearnerhub provides career-focused learning and placement-readiness support. We do not guarantee jobs, placements, salaries, or hiring outcomes. Certificates recognise skill completion and do not guarantee employment. Hiring challenges may create opportunities but do not promise them.',
      ],
    },
    {
      heading: '9. Suspension & Termination',
      paragraphs: [
        'We may suspend or terminate accounts that violate these terms, engage in fraud or abuse, or pose a security risk. You may close your account at any time.',
      ],
    },
    {
      heading: '10. Limitation of Liability',
      paragraphs: [
        'The Platform is provided "as is". To the maximum extent permitted by law, we are not liable for indirect or consequential losses arising from your use of the Platform. Nothing in these terms excludes liability that cannot lawfully be excluded.',
      ],
    },
    {
      heading: '11. Governing Law & Dispute Resolution',
      paragraphs: [
        'These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the competent courts at [City, State], India. We encourage you to first raise concerns through our Grievance Redressal process.',
      ],
    },
    {
      heading: '12. Changes to These Terms',
      paragraphs: [
        'We may update these terms; material changes will be notified to registered users. Continued use after changes take effect constitutes acceptance.',
      ],
    },
  ],
}

const refund: LegalDoc = {
  slug: 'refund',
  href: '/refund',
  title: 'Refund & Cancellation Policy',
  category: 'policy',
  summary: 'When and how you can cancel a purchase or subscription and receive a refund.',
  sections: [
    {
      heading: '1. Scope',
      paragraphs: ['This policy covers one-time course purchases, subscriptions, certificate fees, and hackathon/event registration fees made on Bluelearnerhub.'],
    },
    {
      heading: '2. Course Purchases',
      bullets: [
        'You may request a refund within 7 days of purchase if you have completed less than 20% of the course content.',
        'Once a course is substantially accessed or its certificate has been issued, the purchase is non-refundable.',
      ],
    },
    {
      heading: '3. Subscriptions',
      bullets: [
        'You can cancel a subscription at any time; cancellation stops future renewals.',
        'Monthly plans are not refunded for the current billing cycle. Annual plans may be eligible for a pro-rated refund within 14 days of the initial purchase if usage is minimal.',
      ],
    },
    {
      heading: '4. Hackathon & Event Fees',
      bullets: [
        'Registration fees are refundable up to 48 hours before the event start time, unless stated otherwise on the event page.',
        'Fees become non-refundable once the event begins or submissions open.',
      ],
    },
    {
      heading: '5. Certificate Fees',
      paragraphs: ['Certificate issuance fees are non-refundable once the certificate has been generated, as the verification record is created at that point.'],
    },
    {
      heading: '6. Failed & Duplicate Payments',
      paragraphs: [
        'If you are charged but your purchase does not activate, or you are charged more than once for the same item, contact us and we will verify with the payment gateway and refund any duplicate or failed charge to the original payment method.',
      ],
    },
    {
      heading: '7. Refund Timeline & Mode',
      paragraphs: [
        `Approved refunds are issued to the original payment method and typically settle within 5–10 business days, subject to payment-gateway timelines. For payment disputes, email ${CONTACT_EMAIL}.`,
      ],
    },
  ],
}

const cookie: LegalDoc = {
  slug: 'cookie',
  href: '/cookie',
  title: 'Cookie Policy',
  category: 'policy',
  summary: 'The cookies we use and how you can control them.',
  sections: [
    {
      heading: '1. What Are Cookies',
      paragraphs: ['Cookies are small files stored on your device that help the Platform function, remember preferences, and understand usage.'],
    },
    {
      heading: '2. Cookies We Use',
      table: {
        headers: ['Type', 'Purpose', 'Consent required'],
        rows: [
          ['Strictly necessary', 'Authentication (HttpOnly tokens), security, load balancing', 'No — required to run the service'],
          ['Preference', 'Remember settings such as theme and language', 'Yes'],
          ['Analytics', 'Understand aggregate usage to improve learning outcomes', 'Yes'],
          ['Marketing', 'Only if used in future; measure campaign performance', 'Yes'],
        ],
      },
    },
    {
      heading: '3. Third-Party Cookies',
      paragraphs: ['Some analytics or payment providers may set their own cookies, governed by their respective privacy policies.'],
    },
    {
      heading: '4. Managing Cookies',
      paragraphs: [
        'You can accept or decline optional cookies via our cookie banner and change your choice later. You can also block or delete cookies in your browser settings, though disabling strictly necessary cookies may break core functionality.',
      ],
    },
  ],
}

const dataProtection: LegalDoc = {
  slug: 'data-protection',
  href: '/data-protection',
  title: 'Data Protection & Consent Policy',
  category: 'policy',
  summary: 'A detailed map of the data we process, why we process it, and the consent we record under the DPDP Act, 2023.',
  sections: [
    {
      heading: '1. Consent Framework',
      paragraphs: [
        'We record consent as an append-only audit trail. Each consent record stores the user, consent type, policy version, timestamp, IP address, and whether consent was granted or withdrawn. When a policy materially changes we re-collect consent.',
      ],
    },
    {
      heading: '2. Consent Collected at Signup',
      bullets: [
        'Acceptance of the Terms & Conditions (mandatory).',
        'Acknowledgement of the Privacy Policy (mandatory).',
        'Consent to processing of personal data to deliver the service (mandatory).',
        'Consent to optional account and learning communications (optional).',
        'Parent/guardian consent confirmation for minors (where applicable).',
      ],
    },
    {
      heading: '3. Consent Collected During Use',
      bullets: [
        'Before AI review, plagiarism checks, and mentor review of submissions.',
        'Before public leaderboard display of your name or rank.',
        'During hackathon registration: sharing participation data with organisers, evaluation by judges, and publication of winners.',
        'During college/corporate onboarding: organisation verification and data processing.',
      ],
    },
    {
      heading: '4. Data Categories We Process',
      table: {
        headers: ['Data', 'Purpose', 'Mandatory?', 'Shared?'],
        rows: [
          ['Name, email', 'Account, communication', 'Yes', 'Processors only'],
          ['Phone number', 'Account security, support', 'Optional', 'No'],
          ['Password (hashed)', 'Authentication', 'Yes', 'No'],
          ['Profile photo', 'Profile display', 'Optional', 'No'],
          ['College / company', 'Org features, analytics', 'Optional', 'With your org'],
          ['Course & quiz progress', 'Learning, certificates', 'Yes', 'With your org'],
          ['Code / project / hackathon submissions', 'Review, evaluation', 'Yes', 'Mentors, judges'],
          ['Payment status & references', 'Billing, compliance', 'Yes', 'Payment gateway'],
          ['IP, device, login logs', 'Security, fraud prevention', 'Yes', 'No'],
          ['AI review & mentor feedback', 'Learning feedback', 'Yes', 'You, mentors'],
        ],
      },
    },
    {
      heading: '5. Withdrawing Consent & Exercising Rights',
      paragraphs: [
        `You can withdraw optional consents and exercise your data rights (access, correction, deletion, portability) through the in-app privacy controls or by emailing ${CONTACT_EMAIL}. Withdrawing consent does not affect processing carried out lawfully before withdrawal.`,
      ],
    },
  ],
}

const community: LegalDoc = {
  slug: 'community-guidelines',
  href: '/community-guidelines',
  title: 'Community Guidelines',
  category: 'community',
  summary: 'The standards every member of the Bluelearnerhub community agrees to follow.',
  sections: [
    {
      heading: '1. Be Respectful',
      paragraphs: ['Treat students, mentors, and partners with respect. Harassment, hate speech, threats, and abuse are not tolerated.'],
    },
    {
      heading: '2. Be Honest',
      bullets: [
        'No cheating, plagiarism, or copying others’ code as your own.',
        'No fake submissions or manipulating leaderboards.',
        'No fraud, impersonation, or misrepresentation.',
      ],
    },
    {
      heading: '3. Keep the Platform Safe',
      bullets: [
        'Do not upload malware or harmful files.',
        'Do not share illegal content or the personal data of others.',
        'Do not attempt to hack, overload, or probe the Platform’s security.',
        'Do not spam other users.',
      ],
    },
    {
      heading: '4. Consequences',
      paragraphs: ['Depending on severity, violations may result in:'],
      bullets: [
        'A warning.',
        'Rejection of the affected submission.',
        'Temporary account suspension.',
        'Permanent ban.',
        'Legal action and revocation of certificates where warranted.',
      ],
    },
    {
      heading: '5. Reporting',
      paragraphs: [`Report violations or unsafe behaviour through the Grievance Redressal page or by emailing ${GRIEVANCE_EMAIL}.`],
    },
  ],
}

const hackathonTerms: LegalDoc = {
  slug: 'hackathon-terms',
  href: '/hackathon-terms',
  title: 'Hackathon Participation Terms',
  category: 'policy',
  summary: 'Rules that govern registration, submission, judging, and prizes for hackathons and challenges.',
  sections: [
    { heading: '1. Eligibility & Registration', bullets: ['Participants must meet the eligibility stated on the hackathon page.', 'Registration may require consent to data sharing with organisers and judges.', 'Teams must follow the size and composition rules of each event.'] },
    { heading: '2. Submissions', bullets: ['Submissions must be your team’s original work.', 'You may submit code, GitHub links, PPT/PDF, and demo video links as specified.', 'Submissions must be made before the deadline; late entries may be disqualified.'] },
    { heading: '3. Judging & Reviews', paragraphs: ['Submissions may be reviewed by AI for preliminary scoring and by mentors/judges for final evaluation. AI scores are assistive and may be overridden. The judging panel’s decision is final for the purposes of the event.'] },
    { heading: '4. Plagiarism & Disqualification', paragraphs: ['Copied, harmful, illegal, or fraudulent submissions may be rejected and may lead to disqualification, certificate revocation, and account action.'] },
    { heading: '5. Intellectual Property', paragraphs: ['You retain ownership of your submission. By participating you grant the Platform and the organiser a limited licence to evaluate it, and — only with your consent — to display winning entries for promotional purposes.'] },
    { heading: '6. Prizes & Certificates', paragraphs: ['Prizes and certificates are awarded as described on the event page. Certificates of participation or merit do not guarantee employment.'] },
    { heading: '7. Corporate Problem Statements', paragraphs: ['Where a corporate partner provides a problem statement, the partner may view registered participants and submissions strictly for evaluation and shortlisting, subject to applicable consent and data-protection terms.'] },
  ],
}

const certificate: LegalDoc = {
  slug: 'certificate-policy',
  href: '/certificate-policy',
  title: 'Certificate Policy',
  category: 'policy',
  summary: 'How certificates are issued, verified, and — where necessary — revoked.',
  sections: [
    { heading: '1. When Certificates Are Issued', bullets: ['Completion of a course, capstone, or skill assessment that meets the stated criteria.', 'Participation or success in eligible hackathons and events.'] },
    { heading: '2. What a Certificate Contains', bullets: ['Recipient name and the course/event/hackathon name.', 'Completion date and a unique Certificate ID.', 'A verification link (and QR code where available) and the issuer name.'] },
    { heading: '3. Verification', paragraphs: ['Each certificate has a public verification link so third parties can confirm its authenticity using the Certificate ID.'] },
    { heading: '4. Limitations', bullets: ['A certificate recognises skill or completion — it does not guarantee employment.', 'A certificate is not a government- or university-recognised qualification unless explicitly stated and true.'] },
    { heading: '5. Revocation', paragraphs: ['Certificates may be revoked for cheating, plagiarism, fraud, or policy violations. Revoked certificates are marked invalid on the verification system.'] },
  ],
}

const aiDisclaimer: LegalDoc = {
  slug: 'ai-disclaimer',
  href: '/ai-disclaimer',
  title: 'AI Review Disclaimer',
  category: 'policy',
  summary: 'What our AI review does, its limits, and how human review fits in.',
  sections: [
    { heading: '1. Purpose of AI Review', paragraphs: ['AI review provides learning-focused, preliminary feedback on submissions — covering aspects such as code quality, logic, documentation, and completeness — to help you improve.'] },
    { heading: '2. AI Is Assistive, Not Final', bullets: ['AI review is for assistance and preliminary evaluation only.', 'AI scores may not always be accurate or complete.', 'A mentor or admin can review and override AI results.', 'AI feedback should not be treated as final professional advice.', 'You should manually verify important outputs.'] },
    { heading: '3. Your Control', paragraphs: ['Where AI review is optional, you may decline it. Your submissions are processed for AI review only with your consent.'] },
  ],
}

const mentorPolicy: LegalDoc = {
  slug: 'mentor-policy',
  href: '/mentor-policy',
  title: 'Mentor Review Policy',
  category: 'policy',
  summary: 'How mentors review student work fairly and what students can expect.',
  sections: [
    { heading: '1. Mentor Responsibilities', bullets: ['Provide fair, constructive, rubric-based feedback.', 'Review submissions objectively and without conflict of interest.', 'Protect the confidentiality of student data and submissions.'] },
    { heading: '2. The Review Process', bullets: ['Mentors may score, comment, approve, reject, or request resubmission.', 'Mentors may override AI-generated scores.', 'Each review records the reviewer, score, comments, status, and timestamp.'] },
    { heading: '3. Fairness & Escalation', paragraphs: ['If you believe a review was unfair, you can raise it through the Grievance Redressal process for an independent look by an admin.'] },
  ],
}

const childPolicy: LegalDoc = {
  slug: 'child-policy',
  href: '/child-policy',
  title: 'Child & Minor User Policy',
  category: 'policy',
  summary: 'How we protect users who are minors, in line with the DPDP Act’s requirements for children’s data.',
  sections: [
    { heading: '1. Age Declaration', paragraphs: ['Users declare their age at signup. Users below the age of majority are treated as minors under this policy.'] },
    { heading: '2. Parent / Guardian Consent', paragraphs: ['Where required by law, processing of a minor’s personal data is carried out only with verifiable parent/guardian consent, which is recorded in our consent audit trail.'] },
    { heading: '3. Protections for Minors', bullets: ['No behavioural tracking that is likely to cause harm to a child.', 'No targeted advertising directed at children.', 'A safe, moderated learning environment.', 'Mentor–student communication takes place within Platform-monitored channels.'] },
    { heading: '4. Reporting & Deletion', paragraphs: [`Parents/guardians can report unsafe interactions and request deletion of a minor’s data by contacting ${GRIEVANCE_EMAIL} or using the Grievance Redressal page.`] },
  ],
}

const grievance: LegalDoc = {
  slug: 'grievance',
  href: '/grievance',
  title: 'Grievance Redressal',
  category: 'core',
  summary: 'How to raise a complaint and how we resolve it, in line with the IT Rules and the DPDP Act, 2023.',
  sections: [
    {
      heading: '1. Grievance Officer',
      paragraphs: [
        `In accordance with applicable Indian law, we have appointed a Grievance Officer. Name: [Grievance Officer Name]. Email: ${GRIEVANCE_EMAIL}. Address: ${ADDRESS_PLACEHOLDER}.`,
      ],
    },
    {
      heading: '2. What You Can Complain About',
      bullets: [
        'Privacy and personal-data concerns.',
        'Payment, billing, and refund issues.',
        'Objectionable or infringing content.',
        'Harassment or unsafe behaviour.',
        'Account access and security.',
        'Certificate accuracy or verification.',
      ],
    },
    {
      heading: '3. How to File',
      paragraphs: [
        `Use the form below, or email ${GRIEVANCE_EMAIL} with a clear description, your contact details, and any supporting information. You will receive a reference number to track your complaint.`,
      ],
    },
    {
      heading: '4. Response Timeline & Escalation',
      paragraphs: [
        'We aim to acknowledge complaints promptly and resolve them within 30 days. If you are not satisfied with the outcome, you may escalate to the Data Protection Board of India or the appropriate authority as provided under applicable law.',
      ],
    },
  ],
}

export const legalDocs: Record<string, LegalDoc> = {
  grievance,
  privacy,
  terms,
  refund,
  cookie,
  'data-protection': dataProtection,
  'community-guidelines': community,
  'hackathon-terms': hackathonTerms,
  'certificate-policy': certificate,
  'ai-disclaimer': aiDisclaimer,
  'mentor-policy': mentorPolicy,
  'child-policy': childPolicy,
}
