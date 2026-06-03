import { PaymentTransaction } from '../db/models';
import logger from '../utils/logger';

export interface MockPaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  message: string;
}

export class MockPaymentService {
  private static generateTransactionId(): string {
    return `TXN_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  static async processPayment(
    userId: string | number,
    hackathonId: string | number,
    amount: number,
  ): Promise<MockPaymentResult> {
    try {
      const transactionId = this.generateTransactionId();
      logger.info(`Mock payment processing: ${transactionId} for user ${userId}, hackathon ${hackathonId}, amount ${amount}`);

      await PaymentTransaction.create({
        transactionId,
        amount,
        currency: 'usd',
        status:   'succeeded',
        metadata: { userId: String(userId), hackathonId: String(hackathonId), mock: true },
      });

      return { success: true, transactionId, amount, status: 'completed', message: 'Payment successful (mock)' };
    } catch (error) {
      logger.error('Mock payment failed:', error);
      return { success: false, transactionId: '', amount: 0, status: 'failed', message: 'Payment processing failed' };
    }
  }

  static async getPaymentStatus(transactionId: string): Promise<MockPaymentResult | null> {
    try {
      const payment = await PaymentTransaction.findOne({ transactionId }).lean();
      if (!payment) return null;

      return {
        success:       payment.status === 'succeeded',
        transactionId: payment.transactionId,
        amount:        payment.amount,
        status:        payment.status === 'succeeded' ? 'completed' : 'pending',
        message:       payment.status === 'succeeded' ? 'Payment successful' : 'Payment pending',
      };
    } catch (error) {
      logger.error('Error getting payment status:', error);
      return null;
    }
  }
}
