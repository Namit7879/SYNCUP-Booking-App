import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAvailability,
  getDateOverrides,
  upsertAvailability,
  upsertDateOverrides,
  updateAvailability,
  deleteDateOverride,
} from '../controllers/availabilityController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(apiLimiter);
router.use(authMiddleware);

const slotValidation = [
  body('*.dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('dayOfWeek must be 0–6'),
  body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('dayOfWeek must be 0–6'),
  body('startTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('startTime must be HH:MM'),
  body('endTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('endTime must be HH:MM'),
];

const dateOverrideValidation = [
  body('*.date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be YYYY-MM-DD'),
  body('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('date must be YYYY-MM-DD'),
  body('*.startTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('startTime must be HH:MM'),
  body('*.endTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('endTime must be HH:MM'),
  body('startTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('startTime must be HH:MM'),
  body('endTime')
    .optional()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('endTime must be HH:MM'),
];

router.get('/', getAvailability);
router.post('/', slotValidation, upsertAvailability);
router.put('/:id', updateAvailability);
router.get('/date-overrides', getDateOverrides);
router.post('/date-overrides', dateOverrideValidation, upsertDateOverrides);
router.delete('/date-overrides/:id', deleteDateOverride);

export default router;
