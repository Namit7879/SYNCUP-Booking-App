import { Router } from 'express';
import { body } from 'express-validator';
import {
  getEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../controllers/eventTypeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(apiLimiter);
router.use(authMiddleware);

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must be lowercase alphanumeric with hyphens'),
  body('duration').isInt({ min: 5 }).withMessage('Duration must be at least 5 minutes'),
];

router.get('/', getEventTypes);
router.post('/', createValidation, createEventType);
router.get('/:id', getEventTypeById);
router.put('/:id', updateEventType);
router.delete('/:id', deleteEventType);

export default router;
