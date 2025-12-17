"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = void 0;
const express_1 = require("express");
const session_controller_1 = require("./session.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
exports.sessionRouter = router;
// All session routes require authentication (JWT or device token)
/**
 * GET /api/sessions
 * List all sessions for the authenticated user
 * Requirements: 3.1
 */
router.get('/', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.list(req, res));
/**
 * POST /api/sessions
 * Create a new session
 * Requirements: 3.1
 */
router.post('/', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.create(req, res));
/**
 * GET /api/sessions/:id
 * Get a specific session
 * Requirements: 3.1
 */
router.get('/:id', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.get(req, res));
/**
 * POST /api/sessions/:id/stop
 * Stop a session (disconnect without logout)
 * Requirements: 3.4
 */
router.post('/:id/stop', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.stop(req, res));
/**
 * DELETE /api/sessions/:id
 * Delete a session (logout and remove all data)
 * Requirements: 3.5
 */
router.delete('/:id', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.delete(req, res));
/**
 * GET /api/sessions/:id/qr
 * Get QR code for a session
 * Requirements: 3.2
 */
router.get('/:id/qr', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.getQR(req, res));
/**
 * POST /api/sessions/:id/restart
 * Restart a session (reconnect with existing credentials)
 * Requirements: 3.6
 */
router.post('/:id/restart', auth_middleware_1.verifyAuth, (req, res) => session_controller_1.sessionController.restart(req, res));
//# sourceMappingURL=session.routes.js.map