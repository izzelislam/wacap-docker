import { Router } from 'express';
import { sessionController } from './session.controller';
import { verifyAuth } from '../auth/auth.middleware';

const router = Router();

// All session routes require authentication (JWT or device token)

/**
 * GET /api/sessions
 * List all sessions for the authenticated user
 * Requirements: 3.1
 */
router.get('/', verifyAuth, (req, res) => sessionController.list(req, res));

/**
 * POST /api/sessions
 * Create a new session
 * Requirements: 3.1
 */
router.post('/', verifyAuth, (req, res) => sessionController.create(req, res));

/**
 * GET /api/sessions/:id
 * Get a specific session
 * Requirements: 3.1
 */
router.get('/:id', verifyAuth, (req, res) => sessionController.get(req, res));

/**
 * POST /api/sessions/:id/stop
 * Stop a session (disconnect without logout)
 * Requirements: 3.4
 */
router.post('/:id/stop', verifyAuth, (req, res) => sessionController.stop(req, res));

/**
 * DELETE /api/sessions/:id
 * Delete a session (logout and remove all data)
 * Requirements: 3.5
 */
router.delete('/:id', verifyAuth, (req, res) => sessionController.delete(req, res));

/**
 * GET /api/sessions/:id/qr
 * Get QR code for a session
 * Requirements: 3.2
 */
router.get('/:id/qr', verifyAuth, (req, res) => sessionController.getQR(req, res));

/**
 * POST /api/sessions/:id/restart
 * Restart a session (reconnect with existing credentials)
 * Requirements: 3.6
 */
router.post('/:id/restart', verifyAuth, (req, res) => sessionController.restart(req, res));

export { router as sessionRouter };
