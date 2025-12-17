import { Router } from 'express';
import { healthController } from './health.controller';

/**
 * Health check routes
 * Requirements: 8.5
 */
export const healthRouter = Router();

/**
 * GET /api/health
 * Comprehensive health check endpoint
 * Returns service status, database connectivity, and Wacap wrapper status
 */
healthRouter.get('/', (req, res) => healthController.check(req, res));

/**
 * GET /api/health/live
 * Liveness probe for container orchestration (Kubernetes, Docker)
 * Returns 200 if the service process is running
 */
healthRouter.get('/live', healthController.live);

/**
 * GET /api/health/ready
 * Readiness probe for container orchestration
 * Returns 200 if the service is ready to accept traffic (database connected)
 */
healthRouter.get('/ready', healthController.ready);
