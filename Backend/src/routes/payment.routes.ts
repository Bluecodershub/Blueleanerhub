import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { apiLimiter, webhookLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { aiValidators } from '../utils/validators';

const router = Router();

router.post('/checkout', authenticate, apiLimiter, aiValidators.checkout, validate, PaymentController.createCheckoutSession);
router.post('/portal',   authenticate, apiLimiter,                               PaymentController.createPortalSession);
router.post('/webhook',  webhookLimiter,                                      PaymentController.handleWebhook);

export default router;
