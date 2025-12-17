import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
/**
 * Controller for device token endpoints
 * Requirements: 2.1, 2.2, 2.3
 */
export declare class DeviceTokenController {
    /**
     * List all device tokens for the authenticated user
     * GET /api/tokens
     * Requirements: 2.2
     */
    list(req: AuthenticatedRequest, res: Response): void;
    /**
     * Create a new device token
     * POST /api/tokens
     * Requirements: 2.1
     */
    create(req: AuthenticatedRequest, res: Response): void;
    /**
     * Revoke (delete) a device token
     * DELETE /api/tokens/:id
     * Requirements: 2.3
     */
    revoke(req: AuthenticatedRequest, res: Response): void;
}
export declare const deviceTokenController: DeviceTokenController;
//# sourceMappingURL=device-token.controller.d.ts.map