/**
 * Moodle LMS Integration Service
 * ==============================
 * Thin wrapper over the Moodle Web Services REST API.
 *
 * Configuration (all optional — the platform runs a local LMS fallback when
 * these are unset):
 *   MOODLE_BASE_URL      e.g. https://moodle.yourschool.edu
 *   MOODLE_API_TOKEN     a Web Services token for a service account
 *   MOODLE_SERVICE_NAME  the external service shortname (informational)
 *
 * Every method is SAFE when Moodle is not configured: it returns a structured
 * fallback ({ connected: false, ... }) instead of throwing, so the app never
 * breaks if credentials are missing.
 *
 * Moodle REST call shape:
 *   GET {BASE}/webservice/rest/server.php
 *       ?wstoken=TOKEN&wsfunction=FUNC&moodlewsrestformat=json&...params
 */

import axios from 'axios';
import logger from '../utils/logger';
import { db } from '../db';

/** Writes a sync-log row. Best-effort — never throws into the caller. */
async function recordSyncLog(
  type: 'COURSES' | 'USERS' | 'ALL',
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'SKIPPED',
  itemsSynced: number,
  message: string,
  triggeredBy?: string,
  durationMs?: number,
) {
  try {
    await db.query.moodleSyncLogs.create({
      type, status, itemsSynced, message,
      triggeredBy: triggeredBy || undefined,
      durationMs,
      createdAt: new Date(),
    });
  } catch (err) {
    logger.warn(`[Moodle] failed to write sync log: ${(err as Error).message}`);
  }
}

const MOODLE_BASE_URL = process.env.MOODLE_BASE_URL?.trim() || '';
const MOODLE_API_TOKEN = process.env.MOODLE_API_TOKEN?.trim() || '';
const MOODLE_SERVICE_NAME = process.env.MOODLE_SERVICE_NAME?.trim() || 'bluelearnerhub';

const REQUEST_TIMEOUT_MS = 8000;

export interface MoodleStatus {
  configured: boolean;
  connected: boolean;
  baseUrl: string | null;
  serviceName: string | null;
  siteName?: string;
  release?: string;
  message: string;
}

export function isMoodleConfigured(): boolean {
  return Boolean(MOODLE_BASE_URL && MOODLE_API_TOKEN);
}

/** Build the Moodle Web Services REST endpoint URL. */
function moodleUrl(): string {
  return `${MOODLE_BASE_URL.replace(/\/$/, '')}/webservice/rest/server.php`;
}

/**
 * Low-level call to a Moodle web service function.
 * Returns null (never throws) on any error or when not configured.
 */
async function callMoodle<T = any>(
  wsfunction: string,
  params: Record<string, any> = {},
): Promise<T | null> {
  if (!isMoodleConfigured()) return null;
  try {
    const { data } = await axios.get(moodleUrl(), {
      params: {
        wstoken: MOODLE_API_TOKEN,
        wsfunction,
        moodlewsrestformat: 'json',
        ...params,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });
    // Moodle returns an "exception" object on auth/function errors (HTTP 200)
    if (data && typeof data === 'object' && 'exception' in data) {
      logger.warn(`[Moodle] ${wsfunction} returned exception: ${(data as any).errorcode}`);
      return null;
    }
    return data as T;
  } catch (err) {
    logger.warn(`[Moodle] ${wsfunction} request failed: ${(err as Error).message}`);
    return null;
  }
}

const notConnected = (resource: string) => ({
  connected: false,
  source: 'local-fallback' as const,
  message: `Moodle not connected — using local ${resource}.`,
  data: [] as any[],
});

// ─── Public API ───────────────────────────────────────────────────────────────

export async function checkMoodleConnection(): Promise<MoodleStatus> {
  const base = {
    configured: isMoodleConfigured(),
    baseUrl: MOODLE_BASE_URL || null,
    serviceName: MOODLE_SERVICE_NAME || null,
  };

  if (!isMoodleConfigured()) {
    return {
      ...base,
      connected: false,
      message: 'Moodle not connected — set MOODLE_BASE_URL and MOODLE_API_TOKEN to enable sync.',
    };
  }

  const info = await callMoodle<{ sitename: string; release: string }>('core_webservice_get_site_info');
  if (!info) {
    return { ...base, connected: false, message: 'Moodle configured but unreachable or token invalid.' };
  }

  return {
    ...base,
    connected: true,
    siteName: info.sitename,
    release: info.release,
    message: `Connected to ${info.sitename}.`,
  };
}

export async function getMoodleCourses() {
  if (!isMoodleConfigured()) return notConnected('courses');
  const data = await callMoodle<any[]>('core_course_get_courses');
  if (!data) return notConnected('courses');
  return { connected: true, source: 'moodle' as const, message: 'OK', data };
}

export async function syncMoodleCourses(triggeredBy?: string) {
  const startedAt = Date.now();
  const result = await getMoodleCourses();

  if (!result.connected) {
    await recordSyncLog('COURSES', 'SKIPPED', 0, result.message, triggeredBy, Date.now() - startedAt);
    return { connected: false, synced: 0, message: result.message };
  }

  // Persist a mapping per Moodle course (id ↔ metadata) — never the full payload.
  let synced = 0;
  let failed = 0;
  for (const c of result.data) {
    if (!c || typeof c.id !== 'number') continue;
    try {
      await db.query.moodleCourseMappings.upsert(c.id, {
        moodleCourseId: c.id,
        shortName: c.shortname,
        fullName: c.fullname || c.displayname,
        categoryId: c.categoryid,
        visible: c.visible !== 0,
        lastSyncedAt: new Date(),
      });
      synced++;
    } catch {
      failed++;
    }
  }

  const status = failed === 0 ? 'SUCCESS' : 'PARTIAL';
  const message = `Synced ${synced} course mapping(s) from Moodle${failed ? `, ${failed} failed` : ''}.`;
  await recordSyncLog('COURSES', status, synced, message, triggeredBy, Date.now() - startedAt);
  return { connected: true, synced, failed, message };
}

export async function getMoodleUsers() {
  if (!isMoodleConfigured()) return notConnected('users');
  // core_user_get_users requires criteria; fetch by a permissive criterion
  const data = await callMoodle<{ users: any[] }>('core_user_get_users', {
    'criteria[0][key]': 'deleted',
    'criteria[0][value]': '0',
  });
  if (!data) return notConnected('users');
  return { connected: true, source: 'moodle' as const, message: 'OK', data: data.users || [] };
}

export async function syncMoodleUsers(triggeredBy?: string) {
  const startedAt = Date.now();
  const result = await getMoodleUsers();

  if (!result.connected) {
    await recordSyncLog('USERS', 'SKIPPED', 0, result.message, triggeredBy, Date.now() - startedAt);
    return { connected: false, synced: 0, message: result.message };
  }

  // Persist a mapping per Moodle user and link to a local account by email when one exists.
  let synced = 0;
  let failed = 0;
  for (const u of result.data) {
    if (!u || typeof u.id !== 'number') continue;
    try {
      let localUserId: any;
      if (u.email) {
        const local = await db.query.users.findFirst({ email: String(u.email).toLowerCase() });
        if (local) localUserId = local._id;
      }
      await db.query.moodleUserMappings.upsert(u.id, {
        moodleUserId: u.id,
        username: u.username,
        email: u.email,
        localUserId,
        lastSyncedAt: new Date(),
      });
      synced++;
    } catch {
      failed++;
    }
  }

  const status = failed === 0 ? 'SUCCESS' : 'PARTIAL';
  const message = `Synced ${synced} user mapping(s) from Moodle${failed ? `, ${failed} failed` : ''}.`;
  await recordSyncLog('USERS', status, synced, message, triggeredBy, Date.now() - startedAt);
  return { connected: true, synced, failed, message };
}

export async function getMoodleQuizzes(courseId?: number) {
  if (!isMoodleConfigured()) return notConnected('quizzes');
  const data = await callMoodle<{ quizzes: any[] }>('mod_quiz_get_quizzes_by_courses',
    courseId ? { 'courseids[0]': courseId } : {});
  if (!data) return notConnected('quizzes');
  return { connected: true, source: 'moodle' as const, message: 'OK', data: data.quizzes || [] };
}

export async function getMoodleAssignments(courseId?: number) {
  if (!isMoodleConfigured()) return notConnected('assignments');
  const data = await callMoodle<{ courses: any[] }>('mod_assign_get_assignments',
    courseId ? { 'courseids[0]': courseId } : {});
  if (!data) return notConnected('assignments');
  return { connected: true, source: 'moodle' as const, message: 'OK', data: data.courses || [] };
}

export async function getMoodleGrades(courseId: number, userId?: number) {
  if (!isMoodleConfigured()) return notConnected('grades');
  const data = await callMoodle<any>('gradereport_user_get_grade_items', {
    courseid: courseId,
    ...(userId ? { userid: userId } : {}),
  });
  if (!data) return notConnected('grades');
  return { connected: true, source: 'moodle' as const, message: 'OK', data: data.usergrades || [] };
}

export async function getMoodleCertificates(courseId?: number) {
  if (!isMoodleConfigured()) return notConnected('certificates');
  // Moodle's mod_customcert plugin (if installed) exposes issued certificates
  const data = await callMoodle<{ certificates: any[] }>('mod_customcert_get_customcerts_by_courses',
    courseId ? { 'courseids[0]': courseId } : {});
  if (!data) return notConnected('certificates');
  return { connected: true, source: 'moodle' as const, message: 'OK', data: data.certificates || [] };
}

/** Run all syncs in one pass — used by the admin "Sync now" action. */
export async function syncAllMoodle(triggeredBy?: string) {
  const [courses, users] = await Promise.all([
    syncMoodleCourses(triggeredBy),
    syncMoodleUsers(triggeredBy),
  ]);
  return {
    connected: courses.connected && users.connected,
    courses,
    users,
    syncedAt: new Date().toISOString(),
  };
}

/** Most recent sync log + mapping counts, for the Admin dashboard. */
export async function getMoodleSyncSummary() {
  const [lastSync, courseCount, userCount] = await Promise.all([
    db.query.moodleSyncLogs.findFirst({}),
    db.query.moodleCourseMappings.count({}),
    db.query.moodleUserMappings.count({}),
  ]);
  return {
    lastSync: lastSync || null,
    courseMappings: courseCount,
    userMappings: userCount,
  };
}
