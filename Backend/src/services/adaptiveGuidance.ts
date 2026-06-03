import axios from 'axios';
import { config } from '../config';

export type AdaptiveModuleType = 'notebook' | 'tutorial' | 'hackathon' | 'quiz';

export interface AdaptiveGuidanceItem {
  title: string;
  insight: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

const AI_TIMEOUT_MS = Number.parseInt(process.env.NOTEBOOK_AI_TIMEOUT_MS || '20000', 10);
const AI_SERVICE = () => process.env.AI_SERVICE_URL || config.aiServiceUrl || 'http://localhost:8000';

export const fetchAdaptiveGuidanceFromAI = async (
  moduleType: AdaptiveModuleType,
  requestId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> => {
  try {
    const internalSecret = process.env.INTERNAL_SERVICE_SECRET;
    const { data } = await axios.post(
      `${AI_SERVICE()}/api/v1/adaptive/guidance`,
      {
        module_type: moduleType,
        ...payload,
      },
      {
        timeout: AI_TIMEOUT_MS,
        headers: {
          'x-request-id': requestId,
          ...(internalSecret ? { 'X-Internal-Service': internalSecret } : {}),
        },
      },
    );

    return data as Record<string, unknown>;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response
        ? `Adaptive guidance request failed (${error.response.status})`
        : error.request
          ? 'Adaptive guidance request failed (no response)'
          : `Adaptive guidance request failed (${error.message})`;
      throw new Error(`${message} [requestId=${requestId}, module=${moduleType}]`);
    }
    throw new Error(`Adaptive guidance request failed [requestId=${requestId}, module=${moduleType}]`);
  }
};

export const fallbackTutorialGuidance = (snapshot: {
  completionPercent: number;
  totalSections: number;
  runCodeEvents: number;
  errorEvents: number;
}): AdaptiveGuidanceItem[] => {
  const items: AdaptiveGuidanceItem[] = [];

  if (snapshot.totalSections > 0 && snapshot.completionPercent < 40) {
    items.push({
      title: 'Build Momentum Early',
      insight: 'Your completion is still in the early stage of this tutorial.',
      action: 'Finish at least the next 2 sections before switching topics.',
      priority: 'high',
      confidence: 0.86,
    });
  }

  if (snapshot.runCodeEvents < 2) {
    items.push({
      title: 'Practice Through Execution',
      insight: 'Hands-on code runs are low relative to tutorial depth.',
      action: 'Run every exercise block once, then modify one parameter to test understanding.',
      priority: 'medium',
      confidence: 0.82,
    });
  }

  if (snapshot.errorEvents > 2) {
    items.push({
      title: 'Stabilize Before Advancing',
      insight: 'You are encountering repeated friction while progressing.',
      action: 'Revisit the previous section summary and re-run the smallest working example first.',
      priority: 'high',
      confidence: 0.8,
    });
  }

  if (items.length === 0) {
    items.push({
      title: 'Healthy Tutorial Progress',
      insight: 'Your progress and practice signals are balanced.',
      action: 'Finish current module and test recall with one self-generated question.',
      priority: 'low',
      confidence: 0.74,
    });
  }

  return items;
};

export const fallbackHackathonGuidance = (snapshot: {
  isRegistered: boolean;
  submissionCount: number;
  runEvents: number;
  errorEvents: number;
}): AdaptiveGuidanceItem[] => {
  const items: AdaptiveGuidanceItem[] = [];

  if (!snapshot.isRegistered) {
    items.push({
      title: 'Activate Participation',
      insight: 'You are viewing hackathon content without completing registration.',
      action: 'Register and create/join a team to unlock submission workflows.',
      priority: 'high',
      confidence: 0.95,
    });
  }

  if (snapshot.isRegistered && snapshot.submissionCount === 0) {
    items.push({
      title: 'Ship First Prototype Fast',
      insight: 'No submissions yet means no feedback loop has started.',
      action: 'Submit an MVP version now, then iterate based on evaluation output.',
      priority: 'high',
      confidence: 0.89,
    });
  }

  if (snapshot.runEvents < 2) {
    items.push({
      title: 'Increase Local Validation',
      insight: 'Code run frequency is low for competitive reliability.',
      action: 'Run key test paths before each submission to reduce avoidable failures.',
      priority: 'medium',
      confidence: 0.78,
    });
  }

  if (snapshot.errorEvents > 2) {
    items.push({
      title: 'Reduce Submission Risk',
      insight: 'Recent errors suggest unstable implementation loops.',
      action: 'Prioritize one stable core feature and freeze scope for the next submission.',
      priority: 'high',
      confidence: 0.81,
    });
  }

  if (items.length === 0) {
    items.push({
      title: 'Competitive Cadence Achieved',
      insight: 'Your registration, runs, and submission signals are healthy.',
      action: 'Focus next on polish: demo clarity, edge cases, and evaluation alignment.',
      priority: 'low',
      confidence: 0.73,
    });
  }

  return items;
};

export const fallbackQuizGuidance = (snapshot: {
  attemptCount: number;
  averageScore: number;
  latestScore: number;
  errorEvents: number;
}): AdaptiveGuidanceItem[] => {
  const items: AdaptiveGuidanceItem[] = [];

  if (snapshot.attemptCount === 0) {
    items.push({
      title: 'Start Assessment Loop',
      insight: 'You have not started attempts for this quiz yet.',
      action: 'Take a first attempt to establish baseline strengths and gaps.',
      priority: 'high',
      confidence: 0.93,
    });
  }

  if (snapshot.attemptCount > 0 && snapshot.averageScore < 60) {
    items.push({
      title: 'Target Core Gaps',
      insight: 'Your average score indicates key concept gaps.',
      action: 'Review weak topics, then retry with 5-question focused practice sets.',
      priority: 'high',
      confidence: 0.87,
    });
  }

  if (snapshot.attemptCount > 0 && snapshot.latestScore - snapshot.averageScore > 8) {
    items.push({
      title: 'Momentum Detected',
      insight: 'Recent performance improved compared to your average.',
      action: 'Continue with slightly harder quizzes to consolidate progress.',
      priority: 'medium',
      confidence: 0.8,
    });
  }

  if (snapshot.errorEvents > 2) {
    items.push({
      title: 'Stabilize Session Environment',
      insight: 'Repeated interaction issues may distort assessment rhythm.',
      action: 'Refresh and complete one uninterrupted timed attempt.',
      priority: 'medium',
      confidence: 0.72,
    });
  }

  if (items.length === 0) {
    items.push({
      title: 'Steady Performance',
      insight: 'Your attempt and score patterns look stable.',
      action: 'Challenge yourself with mixed-difficulty quizzes for retention.',
      priority: 'low',
      confidence: 0.71,
    });
  }

  return items;
};
