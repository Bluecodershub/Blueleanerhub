/**
 * Civilization API — typed client wrappers for all new modules.
 * Uses the shared `api` axios instance (baseURL = /api, withCredentials: true).
 */

import api from './api'
import type {
  ApiResponse,
  LearningTrack,
  Exercise,
  ExerciseListParams,
  PublicQuiz,
  DailyQuizResult,
  Achievement,
  LeaderboardEntry,
} from '@/types'

async function handleApiResponse<T>(promise: Promise<{ data: T }>): Promise<T> {
  const response = await promise
  return response.data
}

function createErrorResponse<T>(error: unknown): ApiResponse<T> {
  const message = error instanceof Error ? error.message : 'An error occurred'
  return { error: message, data: undefined as T }
}

// ─── Learning Tracks ─────────────────────────────────────────────────────────

export const tracksAPI = {
  list: async (): Promise<ApiResponse<LearningTrack[]>> => {
    try {
      const data = await handleApiResponse<LearningTrack[]>(api.get('/tracks'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (slug: string): Promise<ApiResponse<LearningTrack>> => {
    try {
      const data = await handleApiResponse<LearningTrack>(api.get(`/tracks/${slug}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  enroll: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const data = await handleApiResponse<{ success: boolean }>(api.post(`/tracks/${id}/enroll`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  progress: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/tracks/${id}/progress`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Tutorials ────────────────────────────────────────────────────────────────

export const tutorialsAPI = {
  list: async (params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/tutorials', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  search: async (query: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/tutorials/search', { params: { q: query } }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (slug: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/tutorials/${slug}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  complete: async (id: number, sectionId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/tutorials/${id}/progress`, { sectionId, completed: true }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  runCode: async (id: number, code: string, language: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/tutorials/${id}/run-code`, { code, language }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  trackBehavior: async (id: number, eventType: string, eventPayload?: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/tutorials/${id}/behavior-events`, { eventType, eventPayload }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  adaptiveGuidance: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/tutorials/${id}/adaptive-guidance`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Tracking Telemetry & Wishlist ──────────────────────────────────────────

export const publicSearchAPI = {
  search: async (query: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/public/search', { params: { q: query } }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

export const spacesAPI = {
  listSpaces: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/spaces/spaces'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  listChallenges: async (params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/spaces/challenges', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getChallenge: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/spaces/challenges/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  execute: async (
    challengeId: string | number,
    language: string,
    code: string
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/spaces/execute', { challengeId, language, code }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getSubmissions: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/spaces/submissions'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getDaily: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/spaces/daily'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getStats: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/spaces/stats'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

export const trackingAPI = {
  saveLesson: async (tutorialId: string, lessonId: string): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.post('/tracking/wishlist', { tutorialId, lessonId }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getSavedLessons: async (): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.get('/tracking/wishlist'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  removeSavedLesson: async (tutorialId: string, lessonId: string): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.delete(`/tracking/wishlist/${tutorialId}/${lessonId}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  trackProgress: async (tutorialId: string, lessonId: string, completionPercent: number, timeSpent: number): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.post('/tracking/progress', { tutorialId, lessonId, completionPercent, timeSpent }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  logLessonView: async (tutorialId: string, lessonId: string): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.post('/tracking/view', { tutorialId, lessonId }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  heartbeatSession: async (duration: number): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.post('/tracking/session', { duration }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getContinueLearning: async (): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.get('/tracking/continue'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getRecommendations: async (): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.get('/tracking/recommendations'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getStats: async (): Promise<ApiResponse<any>> => {
    try {
      const data = await handleApiResponse(api.get('/tracking/stats'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Study Notebooks ───────────────────────────────────────────────────────

export const notebooksAPI = {
  list: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/notebooks'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/notebooks/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  create: async (body: { title: string; description?: string; emoji?: string }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/notebooks', body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  update: async (id: number, body: { title?: string; description?: string; emoji?: string }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.patch(`/notebooks/${id}`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  delete: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.delete(`/notebooks/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  addSource: async (
    id: number,
    body: { title: string; sourceType: string; content?: string; url?: string }
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/notebooks/${id}/sources`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  deleteSource: async (id: number, sourceId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.delete(`/notebooks/${id}/sources/${sourceId}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  chat: async (id: number, message: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/notebooks/${id}/chat`, { message }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  generate: async (id: number, type: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/notebooks/${id}/generate`, { type }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  trackBehavior: async (id: number, eventType: string, eventPayload?: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/notebooks/${id}/behavior-events`, { eventType, eventPayload }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  adaptiveGuidance: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/notebooks/${id}/adaptive-guidance`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Hackathons ───────────────────────────────────────────────────────────

export const hackathonsAPI = {
  list: async (params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/hackathons', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/hackathons/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  create: async (data: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    try {
      const result = await handleApiResponse(api.post('/hackathons', data))
      return { data: result }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  register: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/hackathons/${id}/register`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  processPayment: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/hackathons/${id}/pay`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getRegistrations: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/hackathons/${id}/registrations`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getHosted: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/hackathons/hosted'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createTeam: async (id: string | number, teamName: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/hackathons/${id}/teams`, { teamName }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  joinTeam: async (id: string | number, teamCode: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/hackathons/${id}/teams/join`, { teamCode }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  submitCode: async (id: string | number, data: {
    language: string
    sourceCode: string
    repoUrl?: string
    demoUrl?: string
    presentationUrl?: string
  }): Promise<ApiResponse<unknown>> => {
    try {
      const result = await handleApiResponse(api.post(`/hackathons/${id}/submit`, data))
      return { data: result }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  trackBehavior: async (id: string | number, eventType: string, eventPayload?: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/hackathons/${id}/behavior-events`, { eventType, eventPayload }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  adaptiveGuidance: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/hackathons/${id}/adaptive-guidance`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Quizzes ───────────────────────────────────────────────────────────────

export const quizzesAPI = {
  trackBehavior: async (id: number, eventType: string, eventPayload?: Record<string, unknown>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/quiz/${id}/behavior-events`, { eventType, eventPayload }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  adaptiveGuidance: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/quiz/${id}/adaptive-guidance`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Q&A ─────────────────────────────────────────────────────────────────────

export const qnaAPI = {
  listQuestions: async (params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/qna/questions', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  searchQuestions: async (q: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/qna/questions/search', { params: { q } }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getQuestion: async (id: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/qna/questions/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  askQuestion: async (body: { title: string; body: string; domain: string; tags: string[] }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/qna/questions', body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  postAnswer: async (questionId: number, body: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/qna/questions/${questionId}/answers`, { body }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  vote: async (
    questionId: number,
    targetId: number,
    targetType: 'question' | 'answer',
    voteType: 'up' | 'down'
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/qna/questions/${questionId}/vote`, { targetId, targetType, voteType }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  acceptAnswer: async (questionId: number, answerId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/qna/questions/${questionId}/answers/${answerId}/accept`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  listTags: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/qna/tags'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Repositories ─────────────────────────────────────────────────────────────

export const reposAPI = {
  getUserRepos: async (username: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/repositories/${username}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getRepo: async (username: string, slug: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/repositories/${username}/${slug}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  getFile: async (repoId: number, path: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/repositories/${repoId}/files`, { params: { path } }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createRepo: async (body: { name: string; description?: string; visibility: string }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/repositories', body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createCommit: async (
    repoId: number,
    body: { message: string; files: { path: string; content: string }[] }
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/repositories/${repoId}/commits`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  listIssues: async (repoId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/repositories/${repoId}/issues`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createIssue: async (repoId: number, body: { title: string; body: string }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/repositories/${repoId}/issues`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  listPRs: async (repoId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/repositories/${repoId}/pulls`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createPR: async (
    repoId: number,
    body: { title: string; body: string; sourceBranch: string; targetBranch: string }
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/repositories/${repoId}/pulls`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  toggleStar: async (repoId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/repositories/${repoId}/star`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Certificates ────────────────────────────────────────────────────────────

export const certificatesAPI = {
  mine: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/certificates/me'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  verify: async (id: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/certificates/verify/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  issue: async (body: { userId: number; trackId: number; templateId: number }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/certificates/issue', body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Organizations ───────────────────────────────────────────────────────────

export const orgsAPI = {
  list: async (params?: Record<string, string>): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/organizations', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (slug: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/organizations/${slug}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  create: async (body: { name: string; slug: string; orgType: string; description?: string }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/organizations', body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  invite: async (orgId: number, userId: number, role?: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/organizations/${orgId}/members`, { userId, role }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  talentPool: async (orgId: number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/organizations/${orgId}/talent`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  joinTalentPool: async (orgId: number, body: { skills: string[]; score: number }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/organizations/${orgId}/talent`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  listChallenges: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/organizations/challenges'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  createChallenge: async (
    orgId: number,
    body: {
      title: string
      description: string
      domain: string
      prizePool: string
      deadline: string
    }
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/organizations/${orgId}/challenges`, body))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Daily Quiz ───────────────────────────────────────────────────────────────

export const dailyQuizAPI = {
  domains: async (): Promise<ApiResponse<string[]>> => {
    try {
      const data = await handleApiResponse<string[]>(api.get('/daily-quiz/domains'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },

  getQuiz: async (domain: string): Promise<ApiResponse<PublicQuiz>> => {
    try {
      const data = await handleApiResponse<PublicQuiz>(api.get(`/daily-quiz/${encodeURIComponent(domain)}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },

  submitAnswers: async (domain: string, answers: number[]): Promise<ApiResponse<DailyQuizResult>> => {
    try {
      const data = await handleApiResponse<DailyQuizResult>(api.post('/daily-quiz/submit', { domain, answers }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Gamification ───────────────────────────────────────────────────────────

export const gamificationAPI = {
  achievements: async (): Promise<ApiResponse<Achievement[]>> => {
    try {
      const data = await handleApiResponse<Achievement[]>(api.get('/gamification/achievements'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  leaderboard: async (limit?: number): Promise<ApiResponse<LeaderboardEntry[]>> => {
    try {
      const data = await handleApiResponse<LeaderboardEntry[]>(
        api.get('/gamification/leaderboard', { params: limit ? { limit: String(limit) } : undefined })
      )
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export const exercisesAPI = {
  list: async (params?: ExerciseListParams): Promise<ApiResponse<Exercise[]>> => {
    try {
      const data = await handleApiResponse<Exercise[]>(api.get('/exercises', { params }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  get: async (id: string | number): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/exercises/${id}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Code Execution (Session-backed Judge0) ──────────────────────────────────

const SANDBOX_SESSION_KEY = 'sandbox_session_id'

export function getSandboxSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SANDBOX_SESSION_KEY)
}

export function setSandboxSessionId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SANDBOX_SESSION_KEY, id)
}

export function clearSandboxSessionId(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SANDBOX_SESSION_KEY)
}

export const codeAPI = {
  status: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/code/status'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  execute: async (
    code: string,
    language: string,
    stdin?: string,
    sessionId?: string,
    options?: { sandboxType?: 'education' | 'hackathon'; persistSession?: boolean; cellIndex?: number }
  ): Promise<ApiResponse<unknown>> => {
    try {
      const payload: Record<string, any> = { code, language }
      if (stdin !== undefined) payload.stdin = stdin
      if (sessionId) payload.sessionId = sessionId
      if (options?.sandboxType) payload.sandboxType = options.sandboxType
      if (options?.persistSession) payload.persistSession = true
      if (typeof options?.cellIndex === 'number') payload.cellIndex = options.cellIndex
      const data = await handleApiResponse(api.post('/code/execute', payload))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  executeCell: async (
    code: string,
    language: string,
    sessionId: string,
    cellIndex?: number,
    sandboxType: 'education' | 'hackathon' = 'hackathon'
  ): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/code/execute/cell', {
        code,
        language,
        sessionId,
        cellIndex,
        sandboxType,
      }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  clearSession: async (sessionId: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post(`/code/session/${sessionId}/clear`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  languages: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/code/languages'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  session: async (sessionId: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get(`/code/session/${sessionId}`))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── AI Services ─────────────────────────────────────────────────────────────

export const aiAPI = {
  chat: async (message: string, persona = 'tutor'): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/ai/chat', { message, persona }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  generateQuiz: async (topic: string, count = 5): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/ai/quiz', { topic, count }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  reviewCode: async (code: string, language: string): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/ai/review', { code, language }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  // Structured AI review (scores + strengths/weaknesses/roadmap) via FastAPI.
  reviewSubmission: async (payload: {
    submissionType: 'code' | 'assignment' | 'project' | 'capstone' | 'hackathon'
    content: string
    language?: string
    context?: string
  }): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/ai/review/submission', payload))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  generatePath: async (goal: string, currentSkills: string[]): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.post('/ai/learning-path', { goal, current_skills: currentSkills }))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsAPI = {
  platform: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/analytics/platform'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
  userStats: async (): Promise<ApiResponse<unknown>> => {
    try {
      const data = await handleApiResponse(api.get('/analytics/user/stats'))
      return { data }
    } catch (error) {
      return createErrorResponse(error)
    }
  },
}
