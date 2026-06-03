import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../db';
import { AppError } from '../middleware/error';

const router = Router();

// GET /api/avatar/:userId - Return avatar config for a user
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await db.query.users.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const u = user as any;
    res.json({
      success: true,
      data: u.avatarConfig || { seed: u.email?.split('@')[0] || 'user', style: 'adventurer' },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/avatar/save - Save/Update avatar configuration
router.post('/save', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { config: avatarConfig } = req.body;

    if (!avatarConfig) {
      throw new AppError('Avatar configuration is required', 400);
    }

    const user = await db.query.users.updateById(userId, { avatarConfig, updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Avatar configuration saved successfully',
      data: (user as any)?.avatarConfig,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/avatar/update - Alias for save
router.put('/update', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { config: avatarConfig } = req.body;

    if (!avatarConfig) {
      throw new AppError('Avatar configuration is required', 400);
    }

    const user = await db.query.users.updateById(userId, { avatarConfig, updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Avatar configuration updated successfully',
      data: (user as any)?.avatarConfig,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
