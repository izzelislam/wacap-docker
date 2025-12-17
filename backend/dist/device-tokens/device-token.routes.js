"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenRouter = void 0;
const express_1 = require("express");
const device_token_controller_1 = require("./device-token.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
exports.deviceTokenRouter = router;
// All device token routes require JWT authentication
// (Device tokens shouldn't be managed using device tokens themselves)
/**
 * GET /api/tokens
 * List all device tokens for the authenticated user
 * Requirements: 2.2
 */
router.get('/', auth_middleware_1.verifyJWT, (req, res) => device_token_controller_1.deviceTokenController.list(req, res));
/**
 * POST /api/tokens
 * Create a new device token
 * Requirements: 2.1
 */
router.post('/', auth_middleware_1.verifyJWT, (req, res) => device_token_controller_1.deviceTokenController.create(req, res));
/**
 * DELETE /api/tokens/:id
 * Revoke a device token
 * Requirements: 2.3
 */
router.delete('/:id', auth_middleware_1.verifyJWT, (req, res) => device_token_controller_1.deviceTokenController.revoke(req, res));
//# sourceMappingURL=device-token.routes.js.map