import { Request, Response } from 'express';
/**
 * Health controller for service status endpoints
 * Requirements: 8.5
 */
export declare const healthController: {
    /**
     * GET /api/health
     * Returns comprehensive health status of all services
     * Requirements: 8.5
     */
    check(_req: Request, res: Response): Promise<void>;
    /**
     * GET /api/health/live
     * Simple liveness probe for container orchestration
     * Returns 200 if the service is running
     */
    live(_req: Request, res: Response): void;
    /**
     * GET /api/health/ready
     * Readiness probe - checks if service is ready to accept traffic
     * Returns 200 if database is connected
     */
    ready(_req: Request, res: Response): void;
};
//# sourceMappingURL=health.controller.d.ts.map