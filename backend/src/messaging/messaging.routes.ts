import { Router } from 'express';
import { messagingController } from './messaging.controller';
import { verifyAuth } from '../auth/auth.middleware';

/**
 * Messaging routes
 * All routes require authentication (JWT or device token)
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export const messagingRouter = Router();

// Apply authentication middleware to all routes
messagingRouter.use(verifyAuth);

/**
 * POST /api/send/text
 * Send a text message
 * Requirements: 4.1
 */
messagingRouter.post('/text', (req, res) => messagingController.sendText(req, res));

/**
 * POST /api/send/media
 * Send media (image, video, document)
 * Requirements: 4.2
 */
messagingRouter.post('/media', (req, res) => messagingController.sendMedia(req, res));

/**
 * POST /api/send/location
 * Send location message
 * Requirements: 4.4
 */
messagingRouter.post('/location', (req, res) => messagingController.sendLocation(req, res));

/**
 * POST /api/send/contact
 * Send contact card (vCard)
 * Requirements: 4.5
 */
messagingRouter.post('/contact', (req, res) => messagingController.sendContact(req, res));
