import { Request, Response } from 'express';
import { db } from '../db';
import logger from '../utils/logger';

// Leads controller using MongoDB
export const captureLeadEmail = async (req: Request, res: Response) => {
  try {
    const { email, source = 'homepage_newsletter' } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Use MongoDB - create if not exists
    const existing = await db.query.leads.findFirst({ email: email.toLowerCase() });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    await db.query.leads.create({
      email: email.toLowerCase(),
      source,
      createdAt: new Date(),
    });

    logger.info(`[leads] New lead: ${email} from ${source}`);
    res.json({ success: true, message: 'Email captured successfully' });
  } catch (err) {
    logger.error('[leads] captureLeadEmail error:', err);
    res.status(500).json({ success: false, message: 'Failed to capture email' });
  }
};

export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await db.query.leads.findMany({});
    res.json({ success: true, data: leads });
  } catch (err) {
    logger.error('[leads] getLeads error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
};
