# BlueLearnerHub Page-by-Page Flow

Generated from `Frontend/src/app/**/page.tsx` on 2026-06-08.

The current frontend contains 128 page routes. Route groups such as `(student)`, `(auth)`, and `(marketing)` do not appear in the URL.

## Global Flow

```text
Visitor
  -> Marketing pages
  -> Role selection or signup/login
  -> Role home
     -> Student: dashboard, onboarding, roadmap, lessons, quizzes, IDE, notebooks, hackathons
     -> Mentor: dashboard, classes, assignments, sessions, submissions, grades
     -> Corporate: dashboard, hackathons, candidates, jobs, reports
     -> Admin: dashboard, users, content, submissions, payments, RBAC
```

## Route Protection Summary

| Area | Frontend protection |
| --- | --- |
| `/student/*` | Protected by proxy and student `RoleGuard` for student shell routes. |
| `/mentor/*` | Protected by proxy and mentor `RoleGuard`. |
| `/corporate/*` | Protected by proxy; backend corporate routes also require corporate auth. |
| `/admin/*` | Protected by proxy and admin `RoleGuard`. |
| `/candidate/*` | Protected by proxy. |
| `/assessment/*`, `/ide`, `/learn/*`, `/ai-companion`, `/premium`, `/payment/*`, `/notifications`, `/daily-quiz`, `/quiz` | Protected by proxy and/or student layout condition. |
| `/dev/new`, `/hackathons/{id}/submit`, `/hackathons/{id}/team` | Treated as student-protected special cases. |
| Other public-looking routes under `(student)` | Some render without student shell protection and rely on page behavior or backend API auth. |

## Public and Marketing Pages

| Page | Purpose | Main movement |
| --- | --- | --- |
| `/` | Marketing landing page. | Sends users toward role selection, signup, login, spaces, or learning surfaces. |
| `/contact` | Contact page. | Lead/contact capture or support entry. |
| `/privacy` | Privacy policy. | Legal/static page. |
| `/terms` | Terms of service. | Legal/static page. |
| `/spaces` | Marketing/public spaces overview. | Leads to explore or create spaces. |
| `/spaces/explore` | Explore public spaces. | Moves to a space detail or signup/login. |
| `/spaces/new` | New public/marketing space creation entry. | Likely transitions into authenticated creation. |
| `/signup` | General signup entry. | Creates or routes new users into role-specific onboarding. |
| `/leaderboard` | Public/global leaderboard page. | Uses gamification leaderboard APIs. |
| `/lessons` | Lessons landing/list page. | Sends into tutorials, library, or course routes. |

## Authentication Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/get-started` | Start/signup path selection. | Sends users to role selection, signup, or role login. |
| `/select-role` | Choose student, mentor, corporate, or general login path. | Routes to role-specific auth pages. |
| `/login` | General login. | Calls `/api/v1/auth/login`, then redirects by role. |
| `/login/student` | Student login. | Calls `/api/v1/auth/login`, then `/student/dashboard`. |
| `/login/mentor` | Mentor login. | Calls `/api/v1/auth/mentor/login`, then `/mentor/dashboard`. |
| `/login/corporate` | Corporate login. | Calls `/api/v1/auth/corporate/login`, then `/corporate/dashboard`. |
| `/forgot-password` | Request reset email. | Calls `/api/v1/auth/forgot-password`. |
| `/reset-password` | Submit password reset token and new password. | Calls `/api/v1/auth/reset-password`. |
| `/oauth/callback` | OAuth redirect landing. | Completes OAuth flow and returns to app home. |

## Student Entry and Adaptive Learning

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/student/dashboard` | Student home with progress, quiz attempts, hackathon previews. | Calls hackathons and quiz attempts APIs, links into roadmap, quiz, IDE, hackathons. |
| `/student/onboarding` | Student profile/onboarding form. | Calls `/api/v1/auth/profile`, then dashboard or assessment. |
| `/assessment/onboarding` | Adaptive onboarding assessment. | Calls `/api/v1/adaptive-learning/onboarding`, `/assessment/answer`, `/assessment/finalize`. |
| `/student/roadmap` | AI roadmap after assessment. | Calls `/api/v1/adaptive-learning/roadmap`. |
| `/student/skill-report` | Skill report for selected domain. | Calls `/api/v1/adaptive-learning/roadmap` and score data. |
| `/learn/{nodeId}` | Generated lesson content for roadmap node. | Calls `/api/v1/adaptive-learning/content/{nodeId}`, `/content/generate`, `/progress/update`. |

## Student Learning and Content Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/tutorials` | Tutorial index. | Uses tutorial list/search APIs or static tutorial data, links into tutorial routes. |
| `/tutorials/{pathId}` | Tutorial path detail. | Select a path/course. |
| `/tutorials/{pathId}/{courseId}` | Course within a tutorial path. | Select a lesson. |
| `/tutorials/{pathId}/{courseId}/{lessonId}` | Lesson page. | Lesson view, code examples, progress tracking. |
| `/tutorials/view/{slug}/{lessonId}` | Alternate tutorial lesson viewer. | Uses tutorial slug and lesson id. |
| `/tutorials/python/variables` | Specific Python variables tutorial. | Static/tutorial flow. |
| `/library` | Domain library landing. | Links to engineering/management domain libraries. |
| `/library/computer-science` | Computer science library. | Static CS content and lessons. |
| `/library/mechanical` | Mechanical engineering library. | Static mechanical content. |
| `/library/electrical` | Electrical engineering library. | Static electrical content and tools. |
| `/library/civil` | Civil engineering library. | Static civil content. |
| `/library/management` | Management library. | Static management/finance content. |
| `/student/library` | Student library alias/surface. | Links into library/tutorial content. |
| `/courses` | Course catalog. | Enabled. Calls `/api/v1/learning/courses` (falls back to preview catalog), links to course detail. |
| `/courses/{id}` | Course detail. | Enabled. Enrollment (`/api/v1/courses/{id}/enroll`, gated on domain assessment), progress, capstone entry. |
| `/learning-tracks` | Learning track catalog. | Uses `/api/v1/tracks`. |
| `/learning-tracks/{slug}` | Track detail. | Track enroll/progress flow. |
| `/student/portfolio` | Student portfolio. | Show profile/projects/certificates. |
| `/student/profile` | Student profile and settings. | Reads/updates auth profile. |

## Student Practice, Labs, and AI Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/daily-quiz` | Domain daily quiz. | Calls `/api/v1/daily-quiz/domains`, `/{domain}`, `/submit`. |
| `/quiz` | Standard quiz page. | Calls `/api/v1/quiz`, `/quiz/{id}/submit`. |
| `/exercises` | Practice exercise list. | Calls `/api/v1/exercises`. |
| `/exercises/{id}` | Exercise detail. | Uses exercise detail and code execution APIs. |
| `/ide` | Code sandbox and AI-assisted IDE. | Calls `/api/v1/code/*` and `/api/v1/adaptive-learning/sandbox/assist`. |
| `/labs` | Lab category landing. | Links to software, civil, mechanical, electrical labs. |
| `/labs/software` | Software lab tools. | Code and software practice tooling. |
| `/labs/civil` | Civil lab tools. | Civil engineering simulators/tools. |
| `/labs/mechanical` | Mechanical lab tools. | CAD, FEA, calculator style tools. |
| `/labs/electrical` | Electrical lab tools. | Circuit, oscilloscope, waveform tools. |
| `/ai-companion` | AI tutor/assistant page. | Calls `/api/v1/ai/chat` or related AI wrappers. |
| `/tools` | Utility tools page. | Domain tools and supporting utilities. |
| `/premium` | Subscription upsell and plan selection. | Calls `/api/v1/payments/checkout`. |
| `/payment/success` | Stripe success return. | Confirms user payment completion. |
| `/payment/cancel` | Stripe cancel return. | Returns user to premium flow. |
| `/notifications` | Notification inbox. | Calls `/api/v1/notifications`, read and read-all endpoints. |

## Student Community, Projects, and Credentials

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/community` | Community landing. | Links Q&A, spaces, dev portal, notebooks. |
| `/qna` | Q&A hub. | Calls `/api/v1/qna/questions` and tags/search APIs. |
| `/qna/ask` | Ask a question. | Calls `/api/v1/qna/questions`. |
| `/qna/questions/{id}` | Question detail and answers. | Calls question detail, answer, vote, accept APIs. |
| `/dev` | Developer portal home. | Lists repositories or public developer activity. |
| `/dev/new` | Create repository. | Calls `/api/v1/repositories`. |
| `/dev/{username}` | User repository profile. | Calls `/api/v1/repositories/{username}`. |
| `/dev/{username}/{repo}` | Repository detail. | Calls repository, files, commits, issues, PR APIs. |
| `/notebooks` | Study notebook list. | Calls `/api/v1/notebooks`. |
| `/notebooks/{id}` | Notebook workspace. | Calls notebook detail, sources, PDF upload, chat, generate, annotations, adaptive guidance. |
| `/organizations` | Organizations directory. | Calls `/api/v1/organizations`. |
| `/organizations/{slug}` | Organization profile. | Calls organization detail, talent/challenge flows. |
| `/certificates` | Student certificate wallet. | Calls `/api/v1/certificates/me`. |
| `/certificates/verify/{id}` | Public certificate verification. | Calls `/api/v1/certificates/verify/{credentialId}`. |
| `/student/spaces` | Student spaces list. | Space/challenge participation surface. |
| `/student/spaces/{id}` | Student space detail. | Challenge or quiz arena detail. |

## Hackathon Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/hackathons` | Public/student hackathon browse. | Calls `/api/v1/hackathons`. |
| `/hackathons/{hackathonId}` | Hackathon detail. | Calls hackathon detail, register, pay, leaderboard/adaptive guidance as needed. |
| `/hackathons/{hackathonId}/team` | Team creation/join flow. | Calls `/api/v1/hackathons/{id}/teams` or `/teams/join`. |
| `/hackathons/{hackathonId}/submit` | Hackathon submission flow. | Calls `/api/v1/hackathons/{id}/submit` and code run APIs. |
| `/hackathons/practice` | Practice hackathon mode. | Sends users into practice challenges. |
| `/hackathons/live` | Live hackathon mode. | Sends users into active events. |
| `/hackathons/capstone` | Capstone hackathon mode. | Capstone project/hackathon route. |
| `/student/hackathons` | Student hackathon dashboard/list alias. | Calls `/api/v1/hackathons`. |

## Student Career Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/student/jobs` | Student job board and applications. | Calls `/api/v1/jobs` and `/api/v1/jobs/applications/me`; apply calls `/jobs/{id}/apply`. |
| `/mentors` | AI mentor discovery + chat (domain personas). | Enabled. Calls `/api/v1/adaptive-learning/mentor/chat` (streamed). |
| `/student/leaderboard` | Student leaderboard. | Calls `/api/v1/gamification/leaderboard`. |

## Mentor Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/mentor/dashboard` | Mentor home. | Calls `/api/v1/mentor/dashboard/stats` and class summaries. |
| `/mentor/classes` | Manage classes. | Calls `/api/v1/mentor/classes` create/list/delete/update. |
| `/mentor/students` | Student roster/progress. | Uses admin or mentor student APIs depending on page implementation. |
| `/mentor/assignments` | Manage assignments. | Calls `/api/v1/mentor/classes/{id}/assignments` and `/mentor/assignments`. |
| `/mentor/sessions` | Manage live sessions. | Calls `/api/v1/mentor/classes/{id}/sessions` and `/mentor/sessions`. |
| `/mentor/quizzes` | Mentor quiz overview. | Calls `/api/v1/quiz`. |
| `/mentor/hackathons` | Mentor hackathon overview. | Calls `/api/v1/hackathons`. |
| `/mentor/grades` | Grade submissions. | Calls `/api/v1/mentor/submissions` and `/submissions/{id}/grade`. |
| `/mentor/submissions` | Submission review queue. | Mentor submissions surface. |
| `/mentor/results` | Results reporting. | Result/score summary surface. |
| `/mentor/analytics` | Mentor analytics. | Calls `/api/v1/mentor/dashboard/stats`. |
| `/mentor/profile` | Mentor profile. | Calls `/api/v1/mentor/profile`. |

## Corporate Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/corporate/dashboard` | Corporate overview. | Calls `/api/v1/corporate/dashboard/stats`, `/hackathons`, `/candidates`. |
| `/corporate/hackathons` | Corporate event management. | Calls `/api/v1/corporate/hackathons`; can delete events. |
| `/corporate/hackathons/new` | Create corporate hackathon. | Calls `/api/v1/hackathons` with corporate/admin authorization. |
| `/corporate/host-hackathon` | Host hackathon alternate entry. | Hackathon creation flow. |
| `/corporate/candidates` | Candidate search/list. | Calls `/api/v1/corporate/candidates` and shortlist APIs. |
| `/corporate/candidates/{id}` | Candidate profile detail. | Candidate detail/review surface. |
| `/corporate/participants` | Participant/candidate list. | Calls `/api/v1/corporate/candidates`. |
| `/corporate/shortlist` | Shortlisted candidates. | Calls `/api/v1/corporate/shortlist`. |
| `/corporate/jobs` | Manage jobs. | Calls `/api/v1/corporate/jobs`. |
| `/corporate/ai-screening` | AI resume/candidate screening. | Calls corporate candidates and ATS screening routes. |
| `/corporate/bounties` | Bounty management. | Calls `/api/v1/corporate/bounties`. |
| `/corporate/analytics` | Hiring/event analytics. | Corporate analytics surface. |
| `/corporate/reports` | Corporate reports. | Calls dashboard stats and hackathon data. |
| `/corporate/profile` | Company profile. | Calls `/api/v1/corporate/profile`. |

## Candidate Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/candidate/dashboard` | Candidate dashboard. | Candidate-specific home; protected by proxy. |

## Admin Pages

| Page | Purpose | Main API or movement |
| --- | --- | --- |
| `/admin/dashboard` | Admin overview. | Calls `/api/v1/admin/analytics`. |
| `/admin/analytics` | Platform analytics. | Calls `/api/v1/admin/analytics`. |
| `/admin/users` | User management. | Calls `/api/v1/admin/users`, role update, ban endpoints. |
| `/admin/users/{id}` | User detail. | Calls `/api/v1/admin/users/{id}`, role and ban endpoints. |
| `/admin/rbac` | Role/access overview. | Calls `/api/v1/admin/rbac`. |
| `/admin/courses` | Course admin. | Route exists; nav currently marks courses as disabled/soon. |
| `/admin/lessons` | Lesson admin. | Calls admin collection style endpoints. |
| `/admin/assessments` | Assessment admin. | Calls `/api/v1/admin/assessments`. |
| `/admin/quizzes` | Quiz admin. | Calls `/api/v1/admin/quizzes`. |
| `/admin/hackathons` | Hackathon moderation. | Calls `/api/v1/admin/hackathons`, status update, delete. |
| `/admin/submissions` | Submission review. | Calls `/api/v1/admin/submissions`. |
| `/admin/results` | Results and reports. | Admin result surface. |
| `/admin/certificates` | Certificate management. | Calls `/api/v1/admin/certificates`, revoke/delete. |
| `/admin/payments` | Payment/subscription review. | Calls `/api/v1/admin/payments`. |

## Backend Flow by User Role

### Student

1. Login or register.
2. Complete onboarding/profile.
3. Complete adaptive assessment.
4. Review roadmap and skill report.
5. Open a roadmap node and generate content.
6. Practice through tutorials, daily quiz, quiz, exercises, IDE, labs.
7. Use community features: Q&A, dev repositories, organizations, notebooks.
8. Join hackathons, form team, submit work.
9. Earn XP, achievements, certificates, and leaderboard placement.

### Mentor

1. Login through mentor login.
2. View dashboard stats.
3. Create/manage classes.
4. Create assignments and sessions.
5. Review submissions and grade.
6. Monitor analytics and student progress.

### Corporate

1. Login through corporate login.
2. View dashboard.
3. Create jobs or hackathons.
4. Browse candidates and participants.
5. Shortlist candidates.
6. Use AI screening and reports.
7. Maintain company profile.

### Admin

1. Login as admin.
2. View platform analytics.
3. Manage users and roles.
4. Moderate hackathons and certificates.
5. Review courses, lessons, assessments, quizzes, submissions, payments, results, and RBAC.

## Duplicate or Parallel Surfaces

These routes appear to cover overlapping product concepts:

| Concept | Routes |
| --- | --- |
| Hackathons | `/hackathons`, `/student/hackathons`, `/corporate/hackathons`, `/mentor/hackathons`, `/admin/hackathons`. |
| Library | `/library`, `/student/library`, and domain pages under `/library/*`. |
| Leaderboard | `/leaderboard`, `/student/leaderboard`, hackathon leaderboard components. |
| Spaces | `/spaces`, `/spaces/explore`, `/spaces/new`, `/student/spaces`, `/student/spaces/{id}`. |
| Courses/tutorials | `/courses`, `/tutorials`, `/library`, `/learning-tracks`, `/learn/{nodeId}`. |

Treat these as intentional only after confirming product direction. Otherwise, consolidate navigation and page ownership to reduce drift.
