import { Router } from 'express';
import { body } from 'express-validator';
import {
  getPublicEventTypes,
  getPublicEventType,
  getAvailableSlots,
  createBooking,
  getUserBookings,
  getUpcomingBookings,
  getPastBookings,
  cancelBooking,
  rescheduleBooking,
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { apiLimiter, authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.get('/public-event-types', getPublicEventTypes);
router.get('/public/:slug', getPublicEventType);
router.get('/slots/:slug', getAvailableSlots);
router.post(
  '/',
  authLimiter,
  [
    body('slug').trim().notEmpty().withMessage('Event type slug is required'),
    body('inviteeName').trim().notEmpty().withMessage('Invitee name is required'),
    body('inviteeEmail').isEmail().withMessage('Valid invitee email is required'),
    body('startTime').isISO8601().withMessage('startTime must be a valid ISO 8601 datetime'),
  ],
  createBooking
);

// Protected routes
router.get('/', apiLimiter, authMiddleware, getUserBookings);
router.get('/upcoming', apiLimiter, authMiddleware, getUpcomingBookings);
router.get('/past', apiLimiter, authMiddleware, getPastBookings);
router.put('/:id/cancel', apiLimiter, authMiddleware, cancelBooking);
router.put(
  '/:id/reschedule',
  apiLimiter,
  authMiddleware,
  [body('startTime').isISO8601().withMessage('startTime must be a valid ISO 8601 datetime')],
  rescheduleBooking
);

export default router;
