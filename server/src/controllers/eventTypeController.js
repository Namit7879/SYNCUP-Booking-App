import { validationResult } from 'express-validator';
import * as eventTypeService from '../services/eventTypeService.js';

export const getEventTypes = async (req, res, next) => {
  try {
    const eventTypes = await eventTypeService.getEventTypes(req.userId);
    res.json(eventTypes);
  } catch (err) {
    next(err);
  }
};

export const getEventTypeById = async (req, res, next) => {
  try {
    const eventType = await eventTypeService.getEventTypeById(req.params.id, req.userId);
    res.json(eventType);
  } catch (err) {
    next(err);
  }
};

export const createEventType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const eventType = await eventTypeService.createEventType(req.userId, req.body);
    res.status(201).json(eventType);
  } catch (err) {
    next(err);
  }
};

export const updateEventType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const eventType = await eventTypeService.updateEventType(req.params.id, req.userId, req.body);
    res.json(eventType);
  } catch (err) {
    next(err);
  }
};

export const deleteEventType = async (req, res, next) => {
  try {
    await eventTypeService.deleteEventType(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
