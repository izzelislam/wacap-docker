import { Request, Response } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
/**
 * Auth controller with route handlers
 */
export declare const authController: {
    /**
     * Register a new user
     * POST /api/auth/register
     * Requirements: 1.1
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     * POST /api/auth/login
     * Requirements: 1.2, 1.3
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * Logout user (invalidate token on client side)
     * POST /api/auth/logout
     * Note: JWT tokens are stateless, so logout is handled client-side
     */
    logout(_req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get current user info
     * GET /api/auth/me
     */
    me(req: AuthenticatedRequest, res: Response): Promise<void>;
};
/**
 * Auth router with all authentication routes
 */
export declare const authRouter: import("express-serve-static-core").Router;
//# sourceMappingURL=auth.controller.d.ts.map