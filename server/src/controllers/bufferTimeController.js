import { validationResult } from 'express-validator';
import * as bufferTimeService from '../services/bufferTimeService.js';

export const getBufferTime = async (req, res, next) => {
  try {
    const buffer = await bufferTimeService.getBufferTime(req.userId);
    res.json(buffer);
  } catch (err) {
    next(err);
  }
};

export const upsertBufferTime = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const buffer = await bufferTimeService.upsertBufferTime(req.userId, req.body);
    res.json(buffer);
  } catch (err) {
    next(err);
  }
};
