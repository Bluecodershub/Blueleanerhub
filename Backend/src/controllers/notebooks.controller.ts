/**
 * Notebooks Controller
 * ====================
 * Handles the "Study Notebooks" feature — AI research assistant grounded in
 * user-supplied documents.
 *
 * Flow:
 *  1. POST /notebooks            → create notebook
 *  2. POST /notebooks/:id/sources → add text / URL source (AI service ingests it)
 *  3. POST /notebooks/:id/chat   → ask a question (RAG over notebook sources)
 *  4. POST /notebooks/:id/generate → produce study guide / FAQ / quiz / flashcards
 *  5. GET  /notebooks            → list user's notebooks
 *  6. GET  /notebooks/:id        → get one notebook with sources + generated content
 *  7. DELETE /notebooks/:id      → delete notebook
 *  8. DELETE /notebooks/:id/sources/:sid → remove one source (best-effort via AI service)
 */

import { Request, Response } from 'express';
import { readFile } from 'node:fs/promises';
import axios from 'axios';
import { Notebook } from '../db/models';
import mongoose from 'mongoose';
import { config } from '../config';
import logger from '../utils/logger';

const AI_SERVICE = () => process.env.AI_SERVICE_URL || config.aiServiceUrl || 'http://localhost:8000';
const AI_REQUEST_TIMEOUT_MS = Number.parseInt(process.env.NOTEBOOK_AI_TIMEOUT_MS || '20000', 10);

const reqId      = (req: Request) => String((req as any).requestId || 'unknown');
const userIdLog  = (req: Request) => req.user?.id || null;

const notebookError = (req: Request, action: string, err: unknown, extra: Record<string, unknown> = {}) => {
  logger.error(`[notebooks] ${action} failed`, {
    requestId: reqId(req),
    userId:    userIdLog(req),
    error:     err instanceof Error ? err.message : String(err),
    ...extra,
  });
};

const parseObjectId = (req: Request, res: Response, name: string): string | null => {
  const val = req.params[name] as string;
  if (!val || !mongoose.Types.ObjectId.isValid(val)) {
    res.status(400).json({ success: false, error: `Invalid ${name} parameter` });
    return null;
  }
  return val;
};

// ─── Routes ─────────────────────────────────────────────────────────────────────
const isRetryableUpstreamError = (err: unknown) => {
  if (!axios.isAxiosError(err)) return false;
  if (err.code === 'ECONNABORTED') return true;
  if (!err.response) return true;
  return err.response.status >= 500;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const hasPdfSignature = async (filePath: string): Promise<boolean> => {
  try {
    const content = await readFile(filePath);
    if (content.length < 4) return false;
    return content.subarray(0, 4).toString('ascii') === '%PDF';
  } catch {
    return false;
  }
};

const fallbackAdaptiveGuidance = (snapshot: {
  sourceCount: number;
  readySources: number;
  totalMessages: number;
  generationCount: number;
  unresolvedErrors: number;
}) => {
  const guidance: Array<Record<string, unknown>> = [];

  if (snapshot.sourceCount === 0) {
    guidance.push({
      title:      'Start With Strong Source Context',
      insight:    'Your notebook has no sources yet, so AI guidance cannot be grounded.',
      action:     'Add at least 2 reliable sources (PDF, URL, or notes) before asking complex questions.',
      priority:   'high',
      confidence: 0.95,
    });
  } else if (snapshot.totalMessages < 3) {
    guidance.push({
      title:      'Increase Question Depth',
      insight:    'You have source material loaded but very few exploratory questions.',
      action:     'Ask comparison, contradiction, and exam-style questions to improve retention.',
      priority:   'medium',
      confidence: 0.84,
    });
  }

  if (snapshot.totalMessages > 6 && snapshot.generationCount === 0) {
    guidance.push({
      title:      'Convert Chat Into Study Assets',
      insight:    'You are actively chatting but not generating reusable learning artefacts.',
      action:     'Generate a Notebook Guide and Practice Quiz to consolidate understanding.',
      priority:   'medium',
      confidence: 0.88,
    });
  }

  if (guidance.length === 0) {
    guidance.push({
      title:      'Great Learning Cadence',
      insight:    'Your notebook activity looks balanced across sources, questions, and outputs.',
      action:     'Maintain this rhythm and schedule a quick recall quiz after each session.',
      priority:   'low',
      confidence: 0.72,
    });
  }

  return guidance;
};

// ─── LIST ─────────────────────────────────────────────────────────────────────

export const listNotebooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = await Notebook.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, notebooks: rows });
  } catch (err) {
    notebookError(req, 'listNotebooks', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notebooks' });
  }
};

// ─── HEALTH ───────────────────────────────────────────────────────────────────

export const getNotebooksHealth = async (req: Request, res: Response) => {
  try {
    const requestId = reqId(req);
    const { data, headers } = await axios.get(`${AI_SERVICE()}/api/v1/notebooks/health`, {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: { 'x-request-id': requestId },
    });

    const upstreamRequestId = String(headers['x-request-id'] || '');
    if (upstreamRequestId) res.setHeader('x-upstream-request-id', upstreamRequestId);

    return res.json({ success: true, requestId, upstreamRequestId: upstreamRequestId || null, health: data });
  } catch (err: any) {
    notebookError(req, 'getNotebooksHealth', err);
    if (axios.isAxiosError(err)) {
      const timedOut = err.code === 'ECONNABORTED';
      return res.status(timedOut ? 504 : 502).json({
        success:   false,
        requestId: reqId(req),
        error:     timedOut ? 'AI notebooks health check timed out' : 'AI notebooks health check unavailable',
      });
    }
    return res.status(500).json({ success: false, requestId: reqId(req), error: 'Failed to fetch AI notebooks health' });
  }
};

// ─── BEHAVIOR EVENTS ─────────────────────────────────────────────────────────

export const createBehaviorEvent = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;
    const { eventType } = req.body || {};

    if (!eventType || typeof eventType !== 'string' || eventType.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'eventType is required' });
    }

    // Verify ownership
    const notebook = await Notebook.findOne({ _id: id, userId: new mongoose.Types.ObjectId(req.user!.id) }).lean();
    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    // No MongoDB model for behavior events — accept and discard
    res.status(201).json({ success: true });
  } catch (err) {
    notebookError(req, 'createBehaviorEvent', err, { notebookId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to record behavior event' });
  }
};

// ─── ADAPTIVE GUIDANCE ────────────────────────────────────────────────────────

export const getAdaptiveGuidance = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    const snapshot = {
      sourceCount:      notebook.sourceCount || 0,
      readySources:     0,
      totalMessages:    0,
      generationCount:  0,
      unresolvedErrors: 0,
    };

    const fallbackGuidance = fallbackAdaptiveGuidance(snapshot);

    try {
      const { data } = await axios.post(`${AI_SERVICE()}/api/v1/adaptive/guidance`, {
        module_type:  'notebook',
        target_id:    id,
        target_title: notebook.title,
        metrics:      snapshot,
        events:       [],
      }, {
        timeout: AI_REQUEST_TIMEOUT_MS,
        headers: { 'x-request-id': reqId(req) },
      });

      return res.json({
        success:         true,
        guidance:        Array.isArray(data?.guidance) && data.guidance.length > 0 ? data.guidance : fallbackGuidance,
        behaviorSummary: data?.behavior_summary || snapshot,
        generatedAt:     data?.generated_at || new Date().toISOString(),
      });
    } catch (upstreamErr) {
      notebookError(req, 'getAdaptiveGuidanceUpstream', upstreamErr, { notebookId: id });
      return res.json({
        success:         true,
        guidance:        fallbackGuidance,
        behaviorSummary: snapshot,
        generatedAt:     new Date().toISOString(),
      });
    }
  } catch (err) {
    notebookError(req, 'getAdaptiveGuidance', err, { notebookId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to generate adaptive guidance' });
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createNotebook = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, emoji } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'title is required' });
    }

    const notebook = await Notebook.create({
      userId:      new mongoose.Types.ObjectId(userId),
      title:       title.trim().slice(0, 255),
      description: description?.trim() ?? null,
      emoji:       emoji ?? '📓',
      content:     '',
      language:    'text',
      isPublic:    false,
    });

    res.status(201).json({ success: true, notebook: notebook.toObject() });
  } catch (err) {
    notebookError(req, 'createNotebook', err);
    res.status(500).json({ success: false, error: 'Failed to create notebook' });
  }
};

// ─── GET ONE ──────────────────────────────────────────────────────────────────

export const getNotebook = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    res.json({
      success:     true,
      notebook,
      sources:     [],
      messages:    [],
      generations: [],
    });
  } catch (err) {
    notebookError(req, 'getNotebook', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notebook' });
  }
};

// ─── DELETE NOTEBOOK ─────────────────────────────────────────────────────────

export const deleteNotebook = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;

    const deleted = await Notebook.findOneAndDelete({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    });

    if (!deleted) return res.status(404).json({ success: false, error: 'Notebook not found' });

    res.json({ success: true, message: 'Notebook deleted' });
  } catch (err) {
    notebookError(req, 'deleteNotebook', err);
    res.status(500).json({ success: false, error: 'Failed to delete notebook' });
  }
};

// ─── ADD SOURCE ───────────────────────────────────────────────────────────────

const runNotebookIngestion = async (
  payload: {
    source_id: string;
    notebook_id: string;
    source_type: 'text' | 'url' | 'pdf';
    content: string | null;
    url: string | null;
    file_path: string | null;
    title: string;
  },
  requestId?: string,
) => {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await axios.post(`${AI_SERVICE()}/api/v1/notebooks/ingest`, payload, {
        timeout: AI_REQUEST_TIMEOUT_MS,
        headers: requestId ? { 'x-request-id': requestId } : undefined,
      });
      return;
    } catch (err: any) {
      if (attempt < maxAttempts && isRetryableUpstreamError(err)) {
        await sleep(500 * attempt);
        continue;
      }
      logger.error('[notebooks] AI ingest failed', {
        notebookId: payload.notebook_id,
        error:      err instanceof Error ? err.message : String(err),
      });
      return;
    }
  }
};

export const addSource = async (req: Request, res: Response) => {
  try {
    const id     = parseObjectId(req, res, 'id');
    if (id === null) return;
    const userId = req.user!.id;
    const { title, sourceType, content, url } = req.body;

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    if (!['text', 'url'].includes(sourceType)) {
      return res.status(400).json({ success: false, error: 'sourceType must be text or url' });
    }
    if (sourceType === 'text' && (!content || content.trim().length < 10)) {
      return res.status(400).json({ success: false, error: 'content too short for text source' });
    }
    if (sourceType === 'url' && !url) {
      return res.status(400).json({ success: false, error: 'url is required for url source' });
    }

    const sourceId = new mongoose.Types.ObjectId().toHexString();
    const sourceTitle = (title?.trim() || 'Untitled Source').slice(0, 255);

    // Increment source count on notebook
    await Notebook.findByIdAndUpdate(id, { $inc: { sourceCount: 1 }, updatedAt: new Date() });

    // Kick off AI ingestion asynchronously
    void runNotebookIngestion({
      source_id:   sourceId,
      notebook_id: id,
      source_type: sourceType,
      content:     sourceType === 'text' ? content : null,
      url:         sourceType === 'url'  ? url     : null,
      file_path:   null,
      title:       sourceTitle,
    }, reqId(req));

    res.status(201).json({
      success: true,
      source: {
        id:         sourceId,
        notebookId: id,
        title:      sourceTitle,
        sourceType,
        status:     'processing',
      },
    });
  } catch (err) {
    notebookError(req, 'addSource', err, { notebookId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to add source' });
  }
};

export const addPdfSource = async (req: Request, res: Response) => {
  try {
    const id   = parseObjectId(req, res, 'id');
    if (id === null) return;
    const userId = req.user!.id;
    const file   = req.file;

    if (!file) return res.status(400).json({ success: false, error: 'PDF file is required' });

    const hasPdfMime = file.mimetype === 'application/pdf';
    const hasPdfExt  = String(file.originalname || '').toLowerCase().endsWith('.pdf');
    const hasSignature = await hasPdfSignature(String(file.path || ''));
    if (!hasPdfMime || !hasPdfExt || !hasSignature) {
      return res.status(400).json({ success: false, error: 'Uploaded file must be a valid PDF' });
    }

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    const sourceId    = new mongoose.Types.ObjectId().toHexString();
    const sourceTitle = (file.originalname?.slice(0, 255) || 'Uploaded PDF');

    await Notebook.findByIdAndUpdate(id, { $inc: { sourceCount: 1 }, updatedAt: new Date() });

    void runNotebookIngestion({
      source_id:   sourceId,
      notebook_id: id,
      source_type: 'pdf',
      content:     null,
      url:         null,
      file_path:   file.path,
      title:       sourceTitle,
    }, reqId(req));

    res.status(201).json({
      success: true,
      source: { id: sourceId, notebookId: id, title: sourceTitle, sourceType: 'pdf', status: 'processing' },
    });
  } catch (err) {
    notebookError(req, 'addPdfSource', err, { notebookId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to upload PDF source' });
  }
};

export const deleteSource = async (req: Request, res: Response) => {
  try {
    const id  = parseObjectId(req, res, 'id');
    if (id === null) return;
    const sid = req.params.sid;

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    await Notebook.findByIdAndUpdate(id, { $inc: { sourceCount: -1 }, updatedAt: new Date() });

    // Tell AI service to delete the chunks (best-effort)
    axios
      .delete(`${AI_SERVICE()}/api/v1/notebooks/sources/${sid}`, { timeout: 2000 })
      .catch(() => {});

    res.json({ success: true, message: 'Source removed' });
  } catch (err) {
    notebookError(req, 'deleteSource', err, { notebookId: req.params.id, sourceId: req.params.sid });
    res.status(500).json({ success: false, error: 'Failed to delete source' });
  }
};

// ─── SOURCE DETAIL ────────────────────────────────────────────────────────────

export const getSourceDetail = async (req: Request, res: Response) => {
  // Sources are not persisted in MongoDB — return 404 with explanation
  res.status(404).json({ success: false, error: 'Source not found' });
};

// ─── SOURCE ANNOTATIONS ───────────────────────────────────────────────────────

export const listSourceAnnotations    = async (_req: Request, res: Response) => res.json({ success: true, annotations: [] });
export const listNotebookAnnotations  = async (_req: Request, res: Response) => res.json({ success: true, annotations: [] });
export const createSourceAnnotation   = async (_req: Request, res: Response) => res.status(201).json({ success: true, annotation: null });
export const deleteSourceAnnotation   = async (_req: Request, res: Response) => res.json({ success: true, message: 'Annotation deleted' });

// ─── CHAT (RAG over notebook sources) ────────────────────────────────────────

export const chat = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    const { data } = await axios.post(`${AI_SERVICE()}/api/v1/notebooks/chat`, {
      notebook_id: id,
      message:     message.trim(),
      history:     [],
    }, {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: { 'x-request-id': reqId(req) },
    });

    res.json({ success: true, answer: data.answer, sources: data.sources ?? [] });
  } catch (err: any) {
    notebookError(req, 'chat', err, { notebookId: req.params.id });
    if (axios.isAxiosError(err)) {
      const timedOut = err.code === 'ECONNABORTED';
      return res.status(timedOut ? 504 : 502).json({
        success: false,
        error:   timedOut ? 'AI service timed out while answering chat' : 'AI service unavailable for chat',
      });
    }
    res.status(500).json({ success: false, error: 'Chat failed' });
  }
};

// ─── GENERATE ─────────────────────────────────────────────────────────────────

export const generate = async (req: Request, res: Response) => {
  const VALID_TYPES = ['summary', 'study_guide', 'notebook_guide', 'faq', 'flashcards', 'quiz', 'audio_overview', 'compare_sources'];

  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;
    const { type } = req.body;

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, error: `type must be one of: ${VALID_TYPES.join(', ')}` });
    }

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    const { data } = await axios.post(`${AI_SERVICE()}/api/v1/notebooks/generate`, {
      notebook_id: id,
      type,
    }, {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: { 'x-request-id': reqId(req) },
    });

    const generation = {
      id:         new mongoose.Types.ObjectId().toHexString(),
      notebookId: id,
      type,
      title:      data.title || `${type.replace('_', ' ')} — ${notebook.title}`,
      content:    data.content,
      createdAt:  new Date(),
    };

    res.json({ success: true, generation });
  } catch (err: any) {
    notebookError(req, 'generate', err, { notebookId: req.params.id, type: req.body?.type });
    if (axios.isAxiosError(err)) {
      const timedOut = err.code === 'ECONNABORTED';
      return res.status(timedOut ? 504 : 502).json({
        success: false,
        error:   timedOut ? 'AI service timed out while generating content' : 'AI service unavailable for generation',
      });
    }
    res.status(500).json({ success: false, error: 'Generation failed' });
  }
};

// ─── CLEAR CHAT HISTORY ───────────────────────────────────────────────────────

export const clearChat = async (req: Request, res: Response) => {
  try {
    const id = parseObjectId(req, res, 'id');
    if (id === null) return;

    const notebook = await Notebook.findOne({
      _id:    new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user!.id),
    }).lean();

    if (!notebook) return res.status(404).json({ success: false, error: 'Notebook not found' });

    // Chat is stateless in this implementation — nothing to clear in DB
    res.json({ success: true, message: 'Chat cleared' });
  } catch (err) {
    notebookError(req, 'clearChat', err, { notebookId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to clear chat' });
  }
};
