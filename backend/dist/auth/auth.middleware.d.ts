import { Request, Response, NextFunction } from 'express';
/**
 * Extended Request interface with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        email: string;
    };
    authMethod?: 'jwt' | 'device_token';
}
/**
 * Middleware to verify JWT token
 * Requirements: 1.4, 1.5
 */
export declare function verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware to verify device token
 * Requirements: 2.4, 2.5
 */
export declare function verifyDeviceToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware that accepts either JWT or device token
 * Tries JWT first, then falls back to device token
 * Requirements: 1.5, 2.4
 */
export declare function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Middleware factory for auth - allows specifying which methods to accept
 */
export declare const authMiddleware: {
    jwt: typeof verifyJWT;
    deviceToken: typeof verifyDeviceToken;
    any: typeof verifyAuth;
};
//# sourceMappingURL=auth.middleware.d.ts.map