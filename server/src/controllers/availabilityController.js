import { validationResult } from 'express-validator';
import * as availabilityService from '../services/availabilityService.js';

export const getAvailability = async (req, res, next) => {
  try {
    const availability = await availabilityService.getAvailability(req.userId);
    res.json(availability);
  } catch (err) {
    next(err);
  }
};

export const getDateOverrides = async (req, res, next) => {
  try {
    const overrides = await availabilityService.getDateOverrides(req.userId);
    res.json(overrides);
  } catch (err) {
    next(err);
  }
};

export const upsertAvailability = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Accept either a single slot or an array of slots
    const slots = Array.isArray(req.body) ? req.body : [req.body];
    const result = await availabilityService.upsertAvailability(req.userId, slots);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateAvailability = async (req, res, next) => {
  try {
    const availability = await availabilityService.updateAvailabilityById(
      req.params.id,
      req.userId,
      req.body
    );
    res.json(availability);
  } catch (err) {
    next(err);
  }
};

export const upsertDateOverrides = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const overrides = Array.isArray(req.body) ? req.body : [req.body];
    const result = await availabilityService.upsertDateOverrides(req.userId, overrides);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteDateOverride = async (req, res, next) => {
  try {
    const result = await availabilityService.deleteDateOverrideById(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
