import { Router } from 'express';
import { body } from 'express-validator';
import { getBufferTime, upsertBufferTime } from '../controllers/bufferTimeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(apiLimiter);
router.use(authMiddleware);

const bufferValidation = [
  body('beforeMinutes').isInt({ min: 0 }).withMessage('beforeMinutes must be a non-negative integer'),
  body('afterMinutes').isInt({ min: 0 }).withMessage('afterMinutes must be a non-negative integer'),
];

router.get('/', getBufferTime);
router.post('/', bufferValidation, upsertBufferTime);

export default router;
