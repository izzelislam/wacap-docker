import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
/**
 * Controller for session endpoints
 * Requirements: 3.1, 3.4, 3.5
 */
export declare class SessionController {
    /**
     * List all sessions for the authenticated user
     * GET /api/sessions
     * Requirements: 3.1
     */
    list(req: AuthenticatedRequest, res: Response): void;
    /**
     * Create a new session
     * POST /api/sessions
     * Requirements: 3.1
     */
    create(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get a specific session
     * GET /api/sessions/:id
     * Requirements: 3.1
     */
    get(req: AuthenticatedRequest, res: Response): void;
    /**
     * Stop a session (disconnect without logout)
     * POST /api/sessions/:id/stop
     * Requirements: 3.4
     */
    stop(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Delete a session (logout and remove all data)
     * DELETE /api/sessions/:id
     * Requirements: 3.5
     */
    delete(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get QR code for a session
     * GET /api/sessions/:id/qr
     * Requirements: 3.2
     */
    getQR(req: AuthenticatedRequest, res: Response): void;
    /**
     * Restart a session (reconnect with existing credentials)
     * POST /api/sessions/:id/restart
     * Requirements: 3.6
     */
    restart(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const sessionController: SessionController;
//# sourceMappingURL=session.controller.d.ts.map