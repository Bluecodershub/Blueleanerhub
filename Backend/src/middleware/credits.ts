import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

export const checkCredits = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        // Fetch user credits
        let credits = await db.query.userCredits.findFirst({
            userId,
        });

        // Initialize credits if not exists (should be done on user creation, but guard here)
        if (!credits) {
            await db.query.userCredits.create({ userId, aiTokensBalance: 50, bonusCredits: 0 });
            credits = await db.query.userCredits.findFirst({
                userId,
            });
        }

        if (!credits || credits.aiTokensBalance + credits.bonusCredits <= 0) {
            return res.status(403).json({
                message: 'Insufficient AI credits. Please upgrade to INNOVATOR tier for unlimited access.',
                code: 'INSUFFICIENT_CREDITS'
            });
        }

        return next();
    } catch (error) {
        return res.status(500).json({ message: 'Error checking credits' });
    }
};

export const consumeCredit = async (userId: string) => {
    // Basic logic: Decrement balance, then bonus if balance is 0
    // Skip if user is on UNLIMITED tier (should be checked before calling this)
    const subscription = await db.query.userSubscriptions.findFirst({
        userId,
    });

    if (subscription?.tier === 'INNOVATOR' || subscription?.tier === 'ENTERPRISE') {
        return; // Unlimited
    }

    // Get current credits
    const credits = await db.query.userCredits.findFirst({ userId });
    if (!credits) return;

    // Decrement balance
    const newBalance = Math.max(0, credits.aiTokensBalance - 1);
    const newBonus = credits.aiTokensBalance === 0 
        ? Math.max(0, credits.bonusCredits - 1) 
        : credits.bonusCredits;

    await db.query.userCredits.update({ userId }, { aiTokensBalance: newBalance, bonusCredits: newBonus });
};
