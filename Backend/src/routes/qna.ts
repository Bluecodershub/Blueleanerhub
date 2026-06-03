import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter';
import * as ctrl from '../controllers/qna.controller';

const router = Router();

// Public reads
router.get('/questions',              apiLimiter, ctrl.listQuestions);
router.get('/questions/search',       apiLimiter, ctrl.searchQuestions);
router.get('/questions/:id',          apiLimiter, ctrl.getQuestion);
router.get('/tags',                   apiLimiter, ctrl.listTags);

// Authenticated writes — authLimiter prevents spam
router.post('/questions',                              authLimiter, authenticate, ctrl.askQuestion);
router.post('/questions/:id/answers',                  authLimiter, authenticate, ctrl.postAnswer);
router.post('/questions/:id/vote',                     apiLimiter,  authenticate, (req, _res, next) => {
  req.body = {
    targetType: req.body.targetType || 'question',
    targetId: req.body.targetId || req.params.id,
    vote: req.body.vote || req.body.voteType,
  };
  next();
}, ctrl.castVote);
router.post('/questions/:id/answers/:answerId/accept', apiLimiter,  authenticate, ctrl.acceptAnswer);
router.post('/votes',                                  apiLimiter,  authenticate, ctrl.castVote);
router.post('/questions/:id/accept/:answerId',         apiLimiter,  authenticate, ctrl.acceptAnswer);

export default router;
