/**
 * INTERNAL API ROUTES
 * ===================
 * Backend-to-Backend communication
 * Protected by API key authentication
 *
 * Use cases:
 * - Payment verification (Stripe webhooks)
 * - Token verification between services
 * - Cross-service data queries
 * - Report generation
 */

import { Router } from 'express';
import { internalApiKeyAuth, verifyWebhookSignature } from '../middleware/internalAuth';
import { User, Hackathon, PaymentTransaction, UserSubscription } from '../db/models';
import { config } from '../config';
import logger from '../utils/logger';
import mongoose from 'mongoose';

const router = Router();

// All internal routes require API key
router.use(internalApiKeyAuth);

// ─── Health & Status ─────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'internal-api', timestamp: new Date().toISOString() });
});

// ─── Payment Verification (Stripe Webhooks) ──────────────────────────────────
router.post('/payments/webhook', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const payload   = JSON.stringify(req.body);

    if (!verifyWebhookSignature(payload, signature, config.stripe.webhookSecret || '')) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    logger.info(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        // $setOnInsert equivalent to ON CONFLICT DO NOTHING
        await PaymentTransaction.findOneAndUpdate(
          { transactionId: pi.id },
          { $setOnInsert: {
            transactionId: pi.id,
            amount:        pi.amount / 100,
            currency:      pi.currency,
            status:        'succeeded',
            metadata:      pi.metadata || {},
            createdAt:     new Date(),
          }},
          { upsert: true },
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        logger.warn(`Payment failed: ${pi.id}`);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { $set: { status: sub.status, updatedAt: new Date() } },
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// ─── Token Verification ────────────────────────────────────────────────────────
router.get('/verify-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, config.jwt.secret) as any;

    const user = await User.findById(decoded.userId)
      .select('email fullName role isActive isBanned')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        userId:   (user as any)._id,
        email:    user.email,
        fullName: user.fullName,
        role:     user.role,
        isActive: user.isActive,
        isBanned: user.isBanned,
      },
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

// ─── Cross-Service User Query ────────────────────────────────────────────────
// Maps the old SQL snake_case field names to MongoDB camelCase
const ALLOWED_FIELDS_MAP: Record<string, string> = {
  id:            '_id',
  email:         'email',
  full_name:     'fullName',
  role:          'role',
  is_active:     'isActive',
  created_at:    'createdAt',
  last_active_at: 'lastActiveAt',
};

router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rawFields    = (req.query.fields as string || '').split(',').map(f => f.trim()).filter(Boolean);
    const mongoFields  = rawFields.filter(f => f in ALLOWED_FIELDS_MAP).map(f => ALLOWED_FIELDS_MAP[f]);

    if (mongoFields.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid fields requested' });
    }

    const user = await User.findById(id).select(mongoFields.join(' ')).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Internal user query error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ─── Report Generation ────────────────────────────────────────────────────────
router.get('/reports/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    let data: any[];

    switch (type) {
      case 'user-growth':
        data = await User.aggregate([
          { $match:   { createdAt: { $gte: startDate, $lte: endDate } } },
          { $group:   { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, new_users: { $sum: 1 } } },
          { $sort:    { _id: -1 } },
          { $project: { date: '$_id', new_users: 1, _id: 0 } },
        ]);
        break;

      case 'hackathon-activity':
        data = await Hackathon.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $lookup: { from: 'hackathonteams',       localField: '_id', foreignField: 'hackathonId', as: 'teams' }},
          { $lookup: { from: 'hackathonsubmissions', localField: '_id', foreignField: 'hackathonId', as: 'subs'  }},
          { $project: {
            id:           '$_id',
            title:        '$name',
            participants: { $sum: { $map: { input: '$teams', as: 't', in: { $size: '$$t.memberIds' } } } },
            submissions:  { $size: '$subs' },
          }},
          { $sort:  { _id: -1 } },
          { $limit: 50 },
        ]);
        break;

      case 'engagement':
        data = await User.aggregate([
          { $match:   { lastActiveAt: { $gte: startDate, $lte: endDate } } },
          { $group:   { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActiveAt' } }, active_users: { $sum: 1 } } },
          { $sort:    { _id: -1 } },
          { $project: { date: '$_id', active_users: 1, _id: 0 } },
        ]);
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.json({
      success: true,
      data,
      meta: { type, startDate, endDate, generatedAt: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Report generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// ─── Bulk User Operations ─────────────────────────────────────────────────────
router.post('/users/bulk', async (req, res) => {
  try {
    const { action, userIds } = req.body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: 'action and userIds array are required' });
    }

    const objectIds = userIds.map((id: string) => new mongoose.Types.ObjectId(id));

    switch (action) {
      case 'activate':
        await User.updateMany({ _id: { $in: objectIds } }, { $set: { isActive: true,  updatedAt: new Date() } });
        break;
      case 'deactivate':
        await User.updateMany({ _id: { $in: objectIds } }, { $set: { isActive: false, updatedAt: new Date() } });
        break;
      case 'ban':
        await User.updateMany({ _id: { $in: objectIds } }, { $set: { isBanned: true, isActive: false, updatedAt: new Date() } });
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    res.json({ success: true, message: `Bulk action '${action}' completed for ${userIds.length} users` });
  } catch (error) {
    logger.error('Bulk user operation error:', error);
    res.status(500).json({ success: false, message: 'Bulk operation failed' });
  }
});

export default router;
