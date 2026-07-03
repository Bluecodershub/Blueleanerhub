/**
 * Developer Portal — Repositories Controller
 * ============================================
 * GitHub-style code repository system integrated into BlueLearnerHub.
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import mongoose from 'mongoose';
import { Repository, RepositoryFile, Commit, Issue, PullRequest, RepositoryStar } from '../db';
import { User } from '../db/models';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';
import { config } from '../config';
import logger from '../utils/logger';

// ─── LIST USER REPOSITORIES ──────────────────────────────────────────────────

export const getUserRepositories = async (req: Request, res: Response) => {
  try {
    const username = String(req.params.username);
    const requesterId = req.user?.id;

    const owner = await User.findOne({ fullName: username }).lean();
    if (!owner) return res.status(404).json({ success: false, message: 'User not found' });

    const ownerId = String(owner._id);
    const isOwnProfile = requesterId === ownerId;

    const filter: Record<string, any> = { ownerId };
    if (!isOwnProfile) filter.visibility = 'public';

    const rows = await Repository.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: rows });
  } catch (err) {
    logger.error('getUserRepositories error', err);
    res.status(500).json({ success: false, message: 'Failed to load repositories' });
  }
};

// ─── GET REPOSITORY DETAIL + FILE TREE ───────────────────────────────────────

export const getRepository = async (req: Request, res: Response) => {
  try {
    const username = String(req.params.username);
    const slug = String(req.params.slug);
    const requesterId = req.user?.id;

    const owner = await User.findOne({ fullName: username }).lean();
    if (!owner) return res.status(404).json({ success: false, message: 'User not found' });

    const ownerId = String(owner._id);
    const repo = await Repository.findOne({ ownerId, slug }).lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && String(repo.ownerId) !== requesterId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const [files, recentCommits] = await Promise.all([
      RepositoryFile.find({ repoId: repo._id })
        .select('_id path language sizeBytes')
        .lean(),
      Commit.find({ repoId: repo._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    let isStarred = false;
    if (requesterId) {
      const star = await RepositoryStar.findOne({ userId: requesterId, repoId: repo._id }).lean();
      isStarred = !!star;
    }

    res.json({
      success: true,
      data: {
        ...repo,
        owner: owner.fullName,
        files: buildTree(files as any[]),
        recentCommits,
        isStarred,
      },
    });
  } catch (err) {
    logger.error('getRepository error', err);
    res.status(500).json({ success: false, message: 'Failed to load repository' });
  }
};

function buildTree(files: { _id: any; path: string; language?: string; sizeBytes: number }[]) {
  const tree: any = {};
  for (const f of files) {
    const parts = f.path.split('/');
    let node = tree;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = { __type: 'dir', children: {} };
      node = node[parts[i]].children;
    }
    const filename = parts[parts.length - 1];
    node[filename] = { __type: 'file', id: String(f._id), path: f.path, language: f.language, sizeBytes: f.sizeBytes };
  }
  return tree;
}

// ─── GET FILE CONTENT ────────────────────────────────────────────────────────

export const getFileContent = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const { path } = req.query as { path: string };
    const requesterId = req.user?.id;

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(404).json({ success: false, message: 'Repository not found' });
    }

    const repo = await Repository.findById(repoId).select('ownerId visibility').lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && String(repo.ownerId) !== requesterId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const file = await RepositoryFile.findOne({ repoId, path }).lean();
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    res.json({ success: true, data: file });
  } catch (err) {
    logger.error('getFileContent error', err);
    res.status(500).json({ success: false, message: 'Failed to load file' });
  }
};

// ─── CREATE REPOSITORY ───────────────────────────────────────────────────────

export const createRepository = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user!.id;
    const { name: rawName, description: rawDesc, visibility, language, topics, license } = req.body;

    const name = sanitizeText(rawName).slice(0, 100);
    const description = sanitizeText(rawDesc ?? '').slice(0, 500);

    if (!name) {
      return res.status(400).json({ success: false, message: 'Repository name is required' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const repo = await Repository.create({
      ownerId, name, slug, description,
      visibility: visibility ?? 'public',
      language, topics, license,
    });

    // Auto-create README.md
    await RepositoryFile.create({
      repoId: repo._id,
      path: 'README.md',
      content: `# ${name}\n\n${description}\n`,
      language: 'markdown',
      sizeBytes: name.length + description.length + 10,
    });

    res.status(201).json({ success: true, data: repo });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Repository name already taken' });
    }
    logger.error('createRepository error', err);
    res.status(500).json({ success: false, message: 'Failed to create repository' });
  }
};

// ─── COMMIT FILES ────────────────────────────────────────────────────────────

export const createCommit = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const authorId = req.user!.id;
    const { message: rawMessage, files, branch = 'main' } = req.body;

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const message = sanitizeText(rawMessage).slice(0, 500) || 'Update files';

    const repo = await Repository.findById(repoId).select('ownerId totalCommits').lean();
    if (!repo || repo.ownerId !== authorId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const sha = crypto
      .createHash('sha256')
      .update(`${message}${Date.now()}${authorId}`)
      .digest('hex')
      .substring(0, 40);

    let additions = 0;
    let filesChanged = 0;

    for (const f of (files as { path: string; content: string; language?: string }[])) {
      const sizeBytes = Buffer.byteLength(f.content ?? '', 'utf8');
      await RepositoryFile.findOneAndUpdate(
        { repoId, path: f.path },
        { $set: { content: f.content, language: f.language, sizeBytes, updatedAt: new Date() } },
        { upsert: true, new: true },
      );
      additions += (f.content?.split('\n').length ?? 0);
      filesChanged++;
    }

    const commit = await Commit.create({
      repoId, authorId, sha, message, branch,
      changesSummary: { filesChanged, additions, deletions: 0 },
    });

    await Repository.findByIdAndUpdate(repoId, {
      $inc: { totalCommits: 1 },
      $set: { updatedAt: new Date() },
    });

    res.status(201).json({ success: true, data: commit });
  } catch (err) {
    logger.error('createCommit error', err);
    res.status(500).json({ success: false, message: 'Commit failed' });
  }
};

// ─── ISSUES ──────────────────────────────────────────────────────────────────

export const listIssues = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const requesterId = req.user?.id;
    const { status = 'open', page = 1, limit = 30 } = req.query as { status?: string; page?: string; limit?: string };

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 30));
    const skip = (pageNum - 1) * limitNum;

    const repo = await Repository.findById(repoId).select('ownerId visibility').lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && requesterId !== repo.ownerId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const filter = { repoId, status };
    const [rows, total] = await Promise.all([
      Issue.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Issue.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { data: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load issues' });
  }
};

export const createIssue = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const authorId = req.user!.id;
    const { title: rawTitle, body: rawBody, labels } = req.body;

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const title = sanitizeText(rawTitle).slice(0, 300);
    const body = sanitizeRichText(rawBody ?? '').slice(0, 20_000);

    if (!title) {
      return res.status(400).json({ success: false, message: 'Issue title is required' });
    }

    const repo = await Repository.findById(repoId).select('ownerId visibility').lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && authorId !== repo.ownerId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const count = await Issue.countDocuments({ repoId });
    const issue = await Issue.create({ repoId, authorId, number: count + 1, title, body, labels: labels ?? [] });

    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    logger.error('createIssue error', err);
    res.status(500).json({ success: false, message: 'Failed to create issue' });
  }
};

// ─── PULL REQUESTS ───────────────────────────────────────────────────────────

export const listPullRequests = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const requesterId = req.user?.id;
    const { page = 1, limit = 30 } = req.query as { page?: string; limit?: string };

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 30));
    const skip = (pageNum - 1) * limitNum;

    const repo = await Repository.findById(repoId).select('ownerId visibility').lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && requesterId !== repo.ownerId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const [rows, total] = await Promise.all([
      PullRequest.find({ repoId }).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      PullRequest.countDocuments({ repoId }),
    ]);

    res.json({
      success: true,
      data: { data: rows, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load pull requests' });
  }
};

export const createPullRequest = async (req: Request, res: Response) => {
  try {
    const repoId = String(req.params.id);
    const authorId = req.user!.id;
    const { title: rawTitle, description: rawDesc, sourceBranch, targetBranch = 'main', diffContent } = req.body;

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const title = sanitizeText(rawTitle).slice(0, 300);
    const description = sanitizeRichText(rawDesc ?? '').slice(0, 20_000);

    if (!title) {
      return res.status(400).json({ success: false, message: 'Pull request title is required' });
    }

    const repo = await Repository.findById(repoId).select('ownerId visibility').lean();
    if (!repo) return res.status(404).json({ success: false, message: 'Repository not found' });

    if (repo.visibility === 'private' && authorId !== repo.ownerId) {
      return res.status(403).json({ success: false, message: 'Repository is private' });
    }

    const count = await PullRequest.countDocuments({ repoId });
    const pr = await PullRequest.create({
      repoId, authorId,
      number: count + 1,
      title, description, sourceBranch, targetBranch, diffContent,
    });

    if (diffContent) {
      triggerAICodeReview(String(pr._id), diffContent).catch((e) =>
        logger.error('AI code review failed', e),
      );
    }

    res.status(201).json({ success: true, data: pr });
  } catch (err) {
    logger.error('createPullRequest error', err);
    res.status(500).json({ success: false, message: 'Failed to create pull request' });
  }
};

export const requestAIReview = async (req: Request, res: Response) => {
  try {
    const { prId } = req.params;
    const pr = await PullRequest.findById(prId).lean();
    if (!pr) return res.status(404).json({ success: false, message: 'PR not found' });

    const review = await triggerAICodeReview(String(pr._id), pr.diffContent ?? '');
    res.json({ success: true, data: { review } });
  } catch (err) {
    logger.error('requestAIReview error', err);
    res.status(500).json({ success: false, message: 'AI review failed' });
  }
};

async function triggerAICodeReview(prId: string, diffContent: string): Promise<string> {
  const { data } = await axios.post(`${config.aiServiceUrl}/api/v1/review/code`, {
    diff: diffContent,
    context: 'pull_request',
  });

  const review: string = data.review ?? 'No review generated.';
  const score: number = data.score ?? 0;

  await PullRequest.findByIdAndUpdate(prId, { $set: { aiReview: review, aiReviewScore: score } });

  return review;
}

// ─── STAR / UNSTAR ───────────────────────────────────────────────────────────

export const toggleStar = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const repoId = String(req.params.id);

    if (!mongoose.isValidObjectId(repoId)) {
      return res.status(400).json({ success: false, message: 'Invalid repository id' });
    }

    const existing = await RepositoryStar.findOne({ userId, repoId }).lean();

    if (existing) {
      await RepositoryStar.findOneAndDelete({ userId, repoId });
      await Repository.findByIdAndUpdate(repoId, { $inc: { starCount: -1 } });
      return res.json({ success: true, starred: false });
    }

    await RepositoryStar.create({ userId, repoId });
    await Repository.findByIdAndUpdate(repoId, { $inc: { starCount: 1 } });

    res.json({ success: true, starred: true });
  } catch (err) {
    logger.error('toggleStar error', err);
    res.status(500).json({ success: false, message: 'Failed to star repository' });
  }
};
