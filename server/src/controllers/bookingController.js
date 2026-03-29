import { validationResult } from 'express-validator';
import * as bookingService from '../services/bookingService.js';

export const getPublicEventType = async (req, res, next) => {
  try {
    const eventType = await bookingService.getPublicEventType(req.params.slug);
    res.json(eventType);
  } catch (err) {
    next(err);
  }
};

export const getPublicEventTypes = async (req, res, next) => {
  try {
    const eventTypes = await bookingService.getPublicEventTypes();
    res.json(eventTypes);
  } catch (err) {
    next(err);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Query param "date" must be YYYY-MM-DD' });
    }
    const slots = await bookingService.getAvailableSlots(req.params.slug, date);
    res.json(slots);
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const booking = await bookingService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUserBookings(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const getUpcomingBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getUpcomingBookings(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const getPastBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getPastBookings(req.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.userId);
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const booking = await bookingService.rescheduleBooking(
      req.params.id,
      req.userId,
      req.body.startTime
    );
    res.json(booking);
  } catch (err) {
    next(err);
  }
};
