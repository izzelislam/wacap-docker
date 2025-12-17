import { Router } from 'express';
import { webhookController } from './webhook.controller';
import { verifyAuth } from '../auth/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyAuth);

// Get available events
router.get('/events', (req, res) => webhookController.getEvents(req as any, res));

// List all webhooks for user
router.get('/list', (req, res) => webhookController.list(req as any, res));

// Get webhook configuration for a session
router.get('/session/:sessionId', (req, res) => webhookController.getBySession(req as any, res));

// Create webhook
router.post('/', (req, res) => webhookController.create(req as any, res));

// Update webhook
router.put('/:id', (req, res) => webhookController.update(req as any, res));

// Delete webhook
router.delete('/:id', (req, res) => webhookController.delete(req as any, res));

export { router as webhookRouter };
