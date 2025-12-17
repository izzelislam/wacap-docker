"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const health_controller_1 = require("./health.controller");
/**
 * Health check routes
 * Requirements: 8.5
 */
exports.healthRouter = (0, express_1.Router)();
/**
 * GET /api/health
 * Comprehensive health check endpoint
 * Returns service status, database connectivity, and Wacap wrapper status
 */
exports.healthRouter.get('/', (req, res) => health_controller_1.healthController.check(req, res));
/**
 * GET /api/health/live
 * Liveness probe for container orchestration (Kubernetes, Docker)
 * Returns 200 if the service process is running
 */
exports.healthRouter.get('/live', health_controller_1.healthController.live);
/**
 * GET /api/health/ready
 * Readiness probe for container orchestration
 * Returns 200 if the service is ready to accept traffic (database connected)
 */
exports.healthRouter.get('/ready', health_controller_1.healthController.ready);
//# sourceMappingURL=health.routes.js.map