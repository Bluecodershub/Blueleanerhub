/**
 * Q&A Knowledge Network Controller
 * =================================
 * Community Q&A — ask questions, post answers, vote.
 *
 * Routes:
 *   GET  /api/qna/questions              — list questions
 *   GET  /api/qna/questions/search       — semantic search
 *   GET  /api/qna/questions/:id          — question detail
 *   POST /api/qna/questions              — ask question
 *   POST /api/qna/questions/:id/answers  — post / update answer
 *   POST /api/qna/votes                  — upvote question
 *   POST /api/qna/questions/:id/accept/:answerId — accept answer (no-op for single-answer model)
 *   GET  /api/qna/tags                   — distinct tags
 */

import { Request, Response } from 'express';
import axios from 'axios';
import { QnA } from '../db/models';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';
import mongoose from 'mongoose';
import { GamificationService } from '../services/gamification.service';
import { config } from '../config';
import logger from '../utils/logger';

// ─── LIST QUESTIONS ──────────────────────────────────────────────────────────

export const listQuestions = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const rawSort = String(req.query.sort ?? 'recent');
    const sort = ['recent', 'votes'].includes(rawSort) ? rawSort : 'recent';
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const offset = (parseInt(page) - 1) * safeLimit;

    const sortField: any = sort === 'votes' ? { upvotes: -1 } : { createdAt: -1 };

    const rows = await QnA.find({})
      .sort(sortField)
      .skip(offset)
      .limit(safeLimit)
      .populate('authorId', 'fullName')
      .lean();

    const data = rows.map((q: any) => ({
      id:          String(q._id),
      title:       q.question,
      domain:      q.category,
      voteScore:   q.upvotes,
      answerCount: q.answer ? 1 : 0,
      viewCount:   q.views,
      isAnswered:  !!q.answer,
      createdAt:   q.createdAt,
      authorName:  q.authorId?.fullName || null,
      authorId:    q.authorId?._id || q.authorId,
    }));

    res.json({ success: true, data, page: parseInt(page) });
  } catch (err) {
    logger.error('listQuestions error', err);
    res.status(500).json({ success: false, message: 'Failed to list questions' });
  }
};

// ─── SEMANTIC SEARCH ─────────────────────────────────────────────────────────

export const searchQuestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query as { q: string };
    if (!q?.trim()) return res.json({ success: true, data: [] });

    try {
      const { data } = await axios.post(`${config.aiServiceUrl}/api/v1/search/semantic`, {
        query: q,
        content_type: 'qna_question',
        top_k: 10,
      });
      return res.json({ success: true, data: data.results });
    } catch {
      // Fallback: basic regex search
      const results = await QnA.find({
        question: { $regex: q, $options: 'i' },
      }).limit(10).lean();
      return res.json({ success: true, data: results, fallback: true });
    }
  } catch (err) {
    logger.error('searchQuestions error', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// ─── GET QUESTION ─────────────────────────────────────────────────────────────

export const getQuestion = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question id' });
    }

    const question = await QnA.findById(id)
      .populate('authorId', 'fullName')
      .populate('answeredBy', 'fullName')
      .lean();

    if (!question) return res.status(404).json({ success: false, message: 'Not found' });

    // Increment views
    QnA.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec().catch(() => {});

    const answers = question.answer
      ? [{
          id:         String(question._id) + '_answer',
          body:       question.answer,
          authorId:   question.answeredBy,
          authorName: (question.answeredBy as any)?.fullName || null,
          isAccepted: true,
          voteScore:  0,
        }]
      : [];

    res.json({
      success: true,
      data: {
        id:          String(question._id),
        title:       question.question,
        body:        question.question,
        domain:      question.category,
        tags:        question.tags,
        voteScore:   question.upvotes,
        viewCount:   question.views,
        isAnswered:  !!question.answer,
        createdAt:   question.createdAt,
        authorName:  (question.authorId as any)?.fullName || null,
        answers,
      },
    });
  } catch (err) {
    logger.error('getQuestion error', err);
    res.status(500).json({ success: false, message: 'Failed to load question' });
  }
};

// ─── ASK A QUESTION ──────────────────────────────────────────────────────────

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const userId   = req.user!.id;
    const { title: rawTitle, body: rawBody, domain: rawDomain, tagNames } = req.body;

    if (!rawTitle || typeof rawTitle !== 'string' || rawTitle.trim().length < 15 || rawTitle.length > 300) {
      return res.status(400).json({ success: false, message: 'Title must be 15-300 characters' });
    }
    if (!rawDomain || typeof rawDomain !== 'string') {
      return res.status(400).json({ success: false, message: 'Domain is required' });
    }

    const questionText = sanitizeText(rawTitle);
    const category     = sanitizeText(rawDomain);
    const tags         = Array.isArray(tagNames)
      ? tagNames.slice(0, 5).map((t: string) => sanitizeText(t).slice(0, 50)).filter(Boolean)
      : [];

    // Check for semantic duplicates (best-effort)
    try {
      const { data } = await axios.post(`${config.aiServiceUrl}/api/v1/search/semantic`, {
        query: `${questionText} ${rawBody || ''}`,
        content_type: 'qna_question',
        top_k: 3,
        similarity_threshold: 0.92,
      });
      if ((data.results ?? []).length > 0) {
        return res.status(409).json({
          success:    false,
          message:    'Similar questions already exist',
          duplicates: data.results,
        });
      }
    } catch {
      // Semantic check is best-effort
    }

    const created = await QnA.create({
      question: questionText,
      category,
      tags,
      authorId: new mongoose.Types.ObjectId(userId),
    });

    await GamificationService.awardXP(userId, 5, 'QUESTION_ASKED');

    res.status(201).json({ success: true, data: { id: String(created._id), ...created.toObject() } });
  } catch (err) {
    logger.error('askQuestion error', err);
    res.status(500).json({ success: false, message: 'Failed to post question' });
  }
};

// ─── POST AN ANSWER ──────────────────────────────────────────────────────────

export const postAnswer = async (req: Request, res: Response) => {
  try {
    const userId     = req.user!.id;
    const id          = req.params.id as string;
    const { body: rawBody } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question id' });
    }
    if (!rawBody || typeof rawBody !== 'string' || rawBody.trim().length < 10 || rawBody.length > 20_000) {
      return res.status(400).json({ success: false, message: 'Answer body must be 10-20,000 characters' });
    }

    const body = sanitizeRichText(rawBody);

    const updated = await QnA.findByIdAndUpdate(
      id,
      { answer: body, answeredBy: new mongoose.Types.ObjectId(userId) },
      { new: true },
    ).lean();

    if (!updated) return res.status(404).json({ success: false, message: 'Question not found' });

    await GamificationService.awardXP(userId, 10, 'ANSWER_POSTED');

    res.status(201).json({
      success: true,
      data: {
        id:         String(updated._id) + '_answer',
        questionId: String(updated._id),
        body,
        authorId:   userId,
        isAccepted: true,
        voteScore:  0,
      },
    });
  } catch (err) {
    logger.error('postAnswer error', err);
    res.status(500).json({ success: false, message: 'Failed to post answer' });
  }
};

// ─── VOTE ─────────────────────────────────────────────────────────────────────

export const castVote = async (req: Request, res: Response) => {
  try {
    const { targetType, targetId, vote } = req.body;

    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'Invalid target type' });
    }
    if (!['up', 'down'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'vote must be "up" or "down"' });
    }
    if (!mongoose.Types.ObjectId.isValid(String(targetId).split('_')[0])) {
      return res.status(400).json({ success: false, message: 'Invalid target id' });
    }

    const qnaId = String(targetId).split('_')[0];  // strip '_answer' suffix if present
    const delta  = vote === 'up' ? 1 : -1;

    await QnA.findByIdAndUpdate(qnaId, { $inc: { upvotes: delta } });

    res.json({ success: true });
  } catch (err) {
    logger.error('castVote error', err);
    res.status(500).json({ success: false, message: 'Vote failed' });
  }
};

// ─── ACCEPT ANSWER ───────────────────────────────────────────────────────────

export const acceptAnswer = async (req: Request, res: Response) => {
  // In the single-document QnA model, the answer is always the accepted one.
  res.json({ success: true });
};

// ─── TAGS ─────────────────────────────────────────────────────────────────────

export const listTags = async (req: Request, res: Response) => {
  try {
    const { domain } = req.query as { domain?: string };

    const filter: any = {};
    if (domain) filter.category = domain;

    const distinctTags = await QnA.distinct('tags', filter);

    const tags = distinctTags.map((name: string) => ({
      name,
      slug:       name.toLowerCase().replace(/\s+/g, '-'),
      usageCount: 0,  // not tracked per-tag in this model
      domain:     domain || null,
    }));

    res.json({ success: true, data: tags });
  } catch (err) {
    logger.error('listTags error', err);
    res.status(500).json({ success: false, message: 'Failed to load tags' });
  }
};
