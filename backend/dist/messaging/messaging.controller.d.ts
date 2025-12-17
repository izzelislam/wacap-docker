import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
/**
 * Controller for messaging endpoints
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export declare class MessagingController {
    /**
     * Send a text message
     * POST /api/send/text
     * Requirements: 4.1
     */
    sendText(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Send media (image, video, document)
     * POST /api/send/media
     * Requirements: 4.2
     */
    sendMedia(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Send location message
     * POST /api/send/location
     * Requirements: 4.4
     */
    sendLocation(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Send contact card (vCard)
     * POST /api/send/contact
     * Requirements: 4.5
     */
    sendContact(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export declare const messagingController: MessagingController;
//# sourceMappingURL=messaging.controller.d.ts.map