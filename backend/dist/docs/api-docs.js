"use strict";
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Get service health status
 *     description: Returns comprehensive health status including database and Wacap wrapper status
 *     responses:
 *       200:
 *         description: Service is healthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=api-docs.js.map