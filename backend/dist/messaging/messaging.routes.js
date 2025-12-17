"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingRouter = void 0;
const express_1 = require("express");
const messaging_controller_1 = require("./messaging.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
/**
 * Messaging routes
 * All routes require authentication (JWT or device token)
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
exports.messagingRouter = (0, express_1.Router)();
// Apply authentication middleware to all routes
exports.messagingRouter.use(auth_middleware_1.verifyAuth);
/**
 * POST /api/send/text
 * Send a text message
 * Requirements: 4.1
 */
exports.messagingRouter.post('/text', (req, res) => messaging_controller_1.messagingController.sendText(req, res));
/**
 * POST /api/send/media
 * Send media (image, video, document)
 * Requirements: 4.2
 */
exports.messagingRouter.post('/media', (req, res) => messaging_controller_1.messagingController.sendMedia(req, res));
/**
 * POST /api/send/location
 * Send location message
 * Requirements: 4.4
 */
exports.messagingRouter.post('/location', (req, res) => messaging_controller_1.messagingController.sendLocation(req, res));
/**
 * POST /api/send/contact
 * Send contact card (vCard)
 * Requirements: 4.5
 */
exports.messagingRouter.post('/contact', (req, res) => messaging_controller_1.messagingController.sendContact(req, res));
//# sourceMappingURL=messaging.routes.js.map