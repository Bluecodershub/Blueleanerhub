jest.mock('../../src/db', () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      userSubscriptions: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    },
  },
}));

jest.mock('../../src/db/models', () => ({
  Hackathon: {
    findById: jest.fn(),
  },
  HackathonTeam: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  PaymentTransaction: {
    findOneAndUpdate: jest.fn(),
  },
}));

import { db } from '../../src/db';
import { Hackathon, HackathonTeam, PaymentTransaction } from '../../src/db/models';
import { StripeService, stripe } from '../../src/services/stripe.service';

const mockLean = (value: unknown) => ({ lean: jest.fn().mockResolvedValue(value) });

describe('StripeService hackathon payments', () => {
  beforeEach(() => {
    process.env.FRONTEND_URL = 'https://bluelearnerhub.com';
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  });

  it('creates a one-time Stripe checkout session for paid hackathon registration', async () => {
    (db.query.users.findFirst as jest.Mock).mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'student@example.com',
    });
    (Hackathon.findById as jest.Mock).mockReturnValue(mockLean({
      _id: '507f1f77bcf86cd799439012',
      name: 'AI Hiring Challenge',
      entryFee: 25,
      currency: 'usd',
    }));
    (HackathonTeam.findOne as jest.Mock).mockReturnValue(mockLean(null));
    jest.spyOn(stripe.checkout.sessions, 'create').mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    } as any);

    const session = await StripeService.createHackathonCheckoutSession(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439012',
    );

    expect(session.id).toBe('cs_test_123');
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'payment',
      success_url: expect.stringContaining('type=hackathon'),
      cancel_url: expect.stringContaining('hackathonId=507f1f77bcf86cd799439012'),
      metadata: expect.objectContaining({
        type: 'hackathon_registration',
        userId: '507f1f77bcf86cd799439011',
        hackathonId: '507f1f77bcf86cd799439012',
      }),
    }));
    expect(PaymentTransaction.findOneAndUpdate).toHaveBeenCalledWith(
      { transactionId: 'cs_test_123' },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          amount: 25,
          currency: 'usd',
          status: 'pending',
        }),
      }),
      { upsert: true },
    );
  });

  it('marks hackathon checkout successful and creates a solo team from webhook metadata', async () => {
    (HackathonTeam.findOne as jest.Mock).mockReturnValue(mockLean(null));

    await StripeService.handleWebhook({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_456',
          amount_total: 5000,
          currency: 'usd',
          payment_intent: 'pi_test_123',
          metadata: {
            type: 'hackathon_registration',
            userId: '507f1f77bcf86cd799439011',
            hackathonId: '507f1f77bcf86cd799439012',
          },
        },
      },
    } as any);

    expect(PaymentTransaction.findOneAndUpdate).toHaveBeenCalledWith(
      { transactionId: 'cs_test_456' },
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'succeeded',
          amount: 50,
          currency: 'usd',
        }),
      }),
      { upsert: true },
    );
    expect(HackathonTeam.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Solo-439011',
      memberIds: expect.any(Array),
    }));
  });
});
