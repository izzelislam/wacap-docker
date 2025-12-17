import { Router } from 'express';
import { deviceTokenController } from './device-token.controller';
import { verifyJWT } from '../auth/auth.middleware';

const router = Router();

// All device token routes require JWT authentication
// (Device tokens shouldn't be managed using device tokens themselves)

/**
 * GET /api/tokens
 * List all device tokens for the authenticated user
 * Requirements: 2.2
 */
router.get('/', verifyJWT, (req, res) => deviceTokenController.list(req, res));

/**
 * POST /api/tokens
 * Create a new device token
 * Requirements: 2.1
 */
router.post('/', verifyJWT, (req, res) => deviceTokenController.create(req, res));

/**
 * DELETE /api/tokens/:id
 * Revoke a device token
 * Requirements: 2.3
 */
router.delete('/:id', verifyJWT, (req, res) => deviceTokenController.revoke(req, res));

export { router as deviceTokenRouter };
