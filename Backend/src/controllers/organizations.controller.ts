/**
 * Organizations Controller
 * ========================
 * Corporate & university ecosystem.
 */

import { Request, Response } from 'express';
import { Organization, User } from '../db/models';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// ─── Organizations ────────────────────────────────────────────────────────────

export const listOrganizations = async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query as Record<string, string>;

    const filter: any = {};
    if (type) filter.type = { $regex: type, $options: 'i' };

    let orgs = await Organization.find(filter).sort({ createdAt: -1 }).lean();

    if (search) {
      orgs = orgs.filter((o: any) =>
        o.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, data: orgs });
  } catch (err) {
    logger.error('listOrganizations error', err);
    res.status(500).json({ success: false, message: 'Failed to load organizations' });
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;

    // Try ObjectId lookup first, then name/slug match
    let org: any = null;
    if (mongoose.Types.ObjectId.isValid(slug)) {
      org = await Organization.findById(slug).lean();
    }
    if (!org) {
      org = await Organization.findOne({ slug }).lean();
    }
    if (!org) {
      org = await Organization.findOne({ name: { $regex: `^${slug}$`, $options: 'i' } }).lean();
    }
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    // Populate admin members
    const adminUsers = await User.find({ _id: { $in: org.adminIds || [] } })
      .select('fullName email profilePicture')
      .lean();

    const members = adminUsers.map((u: any) => ({
      user:     u,
      role:     'ADMIN',
      joinedAt: org.createdAt,
    }));

    res.json({
      success: true,
      data: { ...org, members, challenges: [] },
    });
  } catch (err) {
    logger.error('getOrganization error', err);
    res.status(500).json({ success: false, message: 'Failed to load organization' });
  }
};

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const { name: rawName, slug: rawSlug, description: rawDesc, orgType, website, logoUrl } = req.body;

    const name        = sanitizeText(rawName || '').slice(0, 200);
    const slug        = sanitizeText(rawSlug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
    const description = rawDesc ? sanitizeRichText(rawDesc).slice(0, 2_000) : undefined;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Organization name and slug are required' });
    }

    const existing = await Organization.findOne({ slug }).lean();
    if (existing) {
      return res.status(409).json({ success: false, message: 'Slug already taken' });
    }

    const org = await Organization.create({
      name,
      slug,
      description,
      type:     orgType || 'COMPANY',
      website,
      logoUrl,
      adminIds: [new mongoose.Types.ObjectId(adminId)],
      talentPool: [],
    });

    res.status(201).json({ success: true, data: org.toObject() });
  } catch (err) {
    logger.error('createOrganization error', err);
    res.status(500).json({ success: false, message: 'Failed to create organization' });
  }
};

// ─── Members ─────────────────────────────────────────────────────────────────

export const inviteMember = async (req: Request, res: Response) => {
  try {
    const adminId = req.user!.id;
    const id = req.params.id as string;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid org id' });
    }

    const org = await Organization.findById(id).lean();
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    const adminOid = new mongoose.Types.ObjectId(adminId);
    const isAdmin  = org.adminIds.some((aid: any) => String(aid) === String(adminOid));
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const userOid   = new mongoose.Types.ObjectId(userId);
    const isMember  = org.adminIds.some((aid: any) => String(aid) === String(userOid));
    if (isMember) {
      return res.status(409).json({ success: false, message: 'User already a member' });
    }

    await Organization.findByIdAndUpdate(id, { $addToSet: { adminIds: userOid } });

    res.status(201).json({ success: true, data: { orgId: id, userId, role: 'MEMBER' } });
  } catch (err) {
    logger.error('inviteMember error', err);
    res.status(500).json({ success: false, message: 'Failed to invite member' });
  }
};

// ─── Talent Pool ─────────────────────────────────────────────────────────────

export const listTalentPool = async (req: Request, res: Response) => {
  try {
    const id    = req.params.id as string;
    const adminId   = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid org id' });
    }

    const org = await Organization.findById(id).lean();
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    const adminOid = new mongoose.Types.ObjectId(adminId);
    const isAdmin  = org.adminIds.some((aid: any) => String(aid) === String(adminOid));
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const poolUsers = await User.find({ _id: { $in: org.talentPool || [] } })
      .select('fullName email profilePicture totalPoints level')
      .lean();

    const data = poolUsers.map((u: any) => ({
      entry: { orgId: id, candidateId: u._id, stage: 'prospects', addedAt: org.createdAt },
      user:  u,
    }));

    res.json({ success: true, data });
  } catch (err) {
    logger.error('listTalentPool error', err);
    res.status(500).json({ success: false, message: 'Failed to load talent pool' });
  }
};

export const addToTalentPool = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid org id' });
    }

    const userOid = new mongoose.Types.ObjectId(userId);
    const org     = await Organization.findById(id).lean();
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

    const already = org.talentPool.some((uid: any) => String(uid) === String(userOid));
    if (already) {
      return res.json({ success: true, data: { orgId: id, candidateId: userId, stage: 'prospects' }, message: 'Already in talent pool' });
    }

    await Organization.findByIdAndUpdate(id, { $addToSet: { talentPool: userOid } });

    res.status(201).json({ success: true, data: { orgId: id, candidateId: userId, stage: 'prospects' } });
  } catch (err) {
    logger.error('addToTalentPool error', err);
    res.status(500).json({ success: false, message: 'Failed to update talent pool' });
  }
};

// ─── Innovation Challenges (no MongoDB model — return empty) ──────────────────

export const listChallenges = async (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
};

export const createChallenge = async (req: Request, res: Response) => {
  res.status(503).json({ success: false, message: 'Innovation challenges are not available in this version' });
};
