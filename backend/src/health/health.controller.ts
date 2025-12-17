import { Request, Response } from 'express';
import { getDatabase } from '../database';
import { isWacapInitialized, getWacap } from '../sessions';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
    wacap: {
      status: 'initialized' | 'not_initialized';
      activeSessions?: number;
    };
  };
}

/**
 * Health controller for service status endpoints
 * Requirements: 8.5
 */
export const healthController = {
  /**
   * GET /api/health
   * Returns comprehensive health status of all services
   * Requirements: 8.5
   */
  async check(_req: Request, res: Response): Promise<void> {
    // Check database connectivity
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    let dbLatency: number | undefined;
    
    try {
      const dbStart = Date.now();
      const db = getDatabase();
      db.prepare('SELECT 1').get();
      dbLatency = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    // Check Wacap wrapper status
    let wacapStatus: 'initialized' | 'not_initialized' = 'not_initialized';
    let activeSessions: number | undefined;
    
    if (isWacapInitialized()) {
      wacapStatus = 'initialized';
      try {
        const wacap = getWacap();
        const sessionIds = await wacap.sessions.list();
        // Count sessions - list() returns session IDs as strings
        activeSessions = sessionIds.length;
      } catch {
        // Wacap is initialized but couldn't get sessions
        activeSessions = 0;
      }
    }

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (dbStatus === 'disconnected') {
      overallStatus = 'unhealthy';
    } else if (wacapStatus === 'not_initialized') {
      overallStatus = 'degraded';
    }

    const response: HealthCheckResponse = {
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
  live(_req: Request, res: Response): void {
    res.status(200).json({ status: 'alive' });
  },

  /**
   * GET /api/health/ready
   * Readiness probe - checks if service is ready to accept traffic
   * Returns 200 if database is connected
   */
  ready(_req: Request, res: Response): void {
    try {
      const db = getDatabase();
      db.prepare('SELECT 1').get();
      res.status(200).json({ status: 'ready' });
    } catch {
      res.status(503).json({ status: 'not_ready', reason: 'Database not connected' });
    }
  }
};
