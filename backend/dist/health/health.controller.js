"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const database_1 = require("../database");
const sessions_1 = require("../sessions");
/**
 * Health controller for service status endpoints
 * Requirements: 8.5
 */
exports.healthController = {
    /**
     * GET /api/health
     * Returns comprehensive health status of all services
     * Requirements: 8.5
     */
    async check(_req, res) {
        // Check database connectivity
        let dbStatus = 'disconnected';
        let dbLatency;
        try {
            const dbStart = Date.now();
            const db = (0, database_1.getDatabase)();
            db.prepare('SELECT 1').get();
            dbLatency = Date.now() - dbStart;
            dbStatus = 'connected';
        }
        catch {
            dbStatus = 'disconnected';
        }
        // Check Wacap wrapper status
        let wacapStatus = 'not_initialized';
        let activeSessions;
        if ((0, sessions_1.isWacapInitialized)()) {
            wacapStatus = 'initialized';
            try {
                const wacap = (0, sessions_1.getWacap)();
                const sessionIds = await wacap.sessions.list();
                // Count sessions - list() returns session IDs as strings
                activeSessions = sessionIds.length;
            }
            catch {
                // Wacap is initialized but couldn't get sessions
                activeSessions = 0;
            }
        }
        // Determine overall health status
        let overallStatus = 'healthy';
        if (dbStatus === 'disconnected') {
            overallStatus = 'unhealthy';
        }
        else if (wacapStatus === 'not_initialized') {
            overallStatus = 'degraded';
        }
        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: {
                    status: dbStatus,
                    latency: dbLatency
                },
                wacap: {
                    status: wacapStatus,
                    activeSessions
                }
            }
        };
        // Set appropriate HTTP status code
        const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;
        res.status(httpStatus).json(response);
    },
    /**
     * GET /api/health/live
     * Simple liveness probe for container orchestration
     * Returns 200 if the service is running
     */
    live(_req, res) {
        res.status(200).json({ status: 'alive' });
    },
    /**
     * GET /api/health/ready
     * Readiness probe - checks if service is ready to accept traffic
     * Returns 200 if database is connected
     */
    ready(_req, res) {
        try {
            const db = (0, database_1.getDatabase)();
            db.prepare('SELECT 1').get();
            res.status(200).json({ status: 'ready' });
        }
        catch {
            res.status(503).json({ status: 'not_ready', reason: 'Database not connected' });
        }
    }
};
//# sourceMappingURL=health.controller.js.map