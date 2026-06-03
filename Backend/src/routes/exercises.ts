import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { listExercises, getExercise } from '../controllers/exercises.controller';

const router = Router();

// Exercises are protected — users must be logged in to practice
router.use(authenticate);

router.get('/',    apiLimiter, listExercises);
router.get('/:id', apiLimiter, getExercise);

export default router;
