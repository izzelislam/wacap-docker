import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { messagingService, SendTextRequest, SendMediaRequest, SendLocationRequest, SendContactRequest } from './messaging.service';

/**
 * Controller for messaging endpoints
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export class MessagingController {
  /**
   * Send a text message
   * POST /api/send/text
   * Requirements: 4.1
   */
  async sendText(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { sessionId, to, message, mentions } = req.body;

      // Validate required fields
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sessionId is required',
          },
        });
        return;
      }

      if (!to || typeof to !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'to (phone number) is required',
          },
        });
        return;
      }

      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'message is required',
          },
        });
        return;
      }

      const request: SendTextRequest = {
        sessionId,
        to,
        message,
        mentions: Array.isArray(mentions) ? mentions : undefined,
      };

      const result = await messagingService.sendText(userId, request);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SEND_ERROR',
            message: result.error || 'Failed to send message',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      console.error('Send text controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send text message',
        },
      });
    }
  }

  /**
   * Send media (image, video, document)
   * POST /api/send/media
   * Requirements: 4.2
   */
  async sendMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { sessionId, to, url, base64, mimetype, caption, fileName } = req.body;

      // Validate required fields
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sessionId is required',
          },
        });
        return;
      }

      if (!to || typeof to !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'to (phone number) is required',
          },
        });
        return;
      }

      if (!url && !base64) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either url or base64 must be provided',
          },
        });
        return;
      }

      if (!mimetype || typeof mimetype !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'mimetype is required',
          },
        });
        return;
      }

      const request: SendMediaRequest = {
        sessionId,
        to,
        url,
        base64,
        mimetype,
        caption,
        fileName,
      };

      const result = await messagingService.sendMedia(userId, request);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SEND_ERROR',
            message: result.error || 'Failed to send media',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      console.error('Send media controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send media',
        },
      });
    }
  }

  /**
   * Send location message
   * POST /api/send/location
   * Requirements: 4.4
   */
  async sendLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { sessionId, to, latitude, longitude, name, address } = req.body;

      // Validate required fields
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sessionId is required',
          },
        });
        return;
      }

      if (!to || typeof to !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'to (phone number) is required',
          },
        });
        return;
      }

      if (typeof latitude !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'latitude is required and must be a number',
          },
        });
        return;
      }

      if (typeof longitude !== 'number') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'longitude is required and must be a number',
          },
        });
        return;
      }

      const request: SendLocationRequest = {
        sessionId,
        to,
        latitude,
        longitude,
        name,
        address,
      };

      const result = await messagingService.sendLocation(userId, request);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SEND_ERROR',
            message: result.error || 'Failed to send location',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      console.error('Send location controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send location',
        },
      });
    }
  }

  /**
   * Send contact card (vCard)
   * POST /api/send/contact
   * Requirements: 4.5
   */
  async sendContact(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { sessionId, to, contact } = req.body;

      // Validate required fields
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sessionId is required',
          },
        });
        return;
      }

      if (!to || typeof to !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'to (phone number) is required',
          },
        });
        return;
      }

      if (!contact || typeof contact !== 'object') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'contact object is required',
          },
        });
        return;
      }

      if (!contact.fullName || typeof contact.fullName !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'contact.fullName is required',
          },
        });
        return;
      }

      if (!contact.phoneNumber || typeof contact.phoneNumber !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'contact.phoneNumber is required',
          },
        });
        return;
      }

      const request: SendContactRequest = {
        sessionId,
        to,
        contact: {
          fullName: contact.fullName,
          phoneNumber: contact.phoneNumber,
          organization: contact.organization,
        },
      };

      const result = await messagingService.sendContact(userId, request);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'SEND_ERROR',
            message: result.error || 'Failed to send contact',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          messageId: result.messageId,
          timestamp: result.timestamp,
        },
      });
    } catch (error) {
      console.error('Send contact controller error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to send contact',
        },
      });
    }
  }
}

// Export singleton instance
export const messagingController = new MessagingController();
