/**
 * Moodle LMS client wrapper.
 * Talks to the backend /moodle/* admin routes. Every call degrades gracefully:
 * when Moodle is not configured the backend returns { connected: false }.
 */
import api from '@/lib/api'

export interface MoodleStatus {
  configured: boolean
  connected: boolean
  baseUrl: string | null
  serviceName: string | null
  siteName?: string
  release?: string
  message: string
}

export interface MoodleSyncResult {
  connected: boolean
  synced?: number
  message?: string
}

export interface MoodleSyncLog {
  type: 'COURSES' | 'USERS' | 'ALL'
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED'
  itemsSynced: number
  message: string
  createdAt: string
}

export interface MoodleSummary extends MoodleStatus {
  lastSync: MoodleSyncLog | null
  courseMappings: number
  userMappings: number
}

export async function getMoodleSummary(): Promise<MoodleSummary> {
  try {
    const res = await api.get('/moodle/summary')
    return res.data?.data as MoodleSummary
  } catch {
    return {
      configured: false,
      connected: false,
      baseUrl: null,
      serviceName: null,
      message: 'Moodle status unavailable.',
      lastSync: null,
      courseMappings: 0,
      userMappings: 0,
    }
  }
}

export async function checkMoodleConnection(): Promise<MoodleStatus> {
  try {
    const res = await api.get('/moodle/status')
    return res.data?.data as MoodleStatus
  } catch {
    return {
      configured: false,
      connected: false,
      baseUrl: null,
      serviceName: null,
      message: 'Moodle status unavailable.',
    }
  }
}

export async function getMoodleCourses() {
  const res = await api.get('/moodle/courses')
  return res.data?.data
}

export async function getMoodleUsers() {
  const res = await api.get('/moodle/users')
  return res.data?.data
}

export async function syncMoodleCourses(): Promise<MoodleSyncResult> {
  const res = await api.post('/moodle/sync/courses')
  return res.data?.data
}

export async function syncMoodleUsers(): Promise<MoodleSyncResult> {
  const res = await api.post('/moodle/sync/users')
  return res.data?.data
}

export async function syncAllMoodle() {
  const res = await api.post('/moodle/sync')
  return res.data?.data
}
