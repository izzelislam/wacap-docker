import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { webhookService } from './webhook.service';
import { WebhookEventType } from './types';

/**
 * Valid webhook event types
 */
const VALID_EVENTS: WebhookEventType[] = [
  'message.received',
  'message.sent',
  'session.connected',
  'session.disconnected',
  'session.qr',
  'typing.start',
  'typing.stop',
  'presence.update',
];

/**
 * Controller for webhook endpoints
 */
export class WebhookController {
  /**
   * Get webhook configuration for a session
   * GET /api/webhooks/session/:sessionId
   */
  getBySession(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      const sessionId = req.params.sessionId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' }
        });
        return;
      }

      const webhook = webhookService.getBySessionId(sessionId);

      res.json({
        success: true,
        data: { webhook }
      });
    } catch (error) {
      console.error('Error getting webhook:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get webhook configuration' }
      });
    }
  }

  /**
   * List all webhooks
   * GET /api/webhooks/list
   */
  list(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const webhooks = webhookService.list(userId);

      res.json({
        success: true,
        data: { webhooks }
      });
    } catch (error) {
      console.error('Error listing webhooks:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' }
      });
    }
  }

  /**
   * Create webhook configuration
   * POST /api/webhooks
   */
  create(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const { sessionId, url, events, secret } = req.body;

      // Validate session ID
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Session ID is required' }
        });
        return;
      }

      // Validate URL
      if (!url || typeof url !== 'string') {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Webhook URL is required' }
        });
        return;
      }

      try {
        new URL(url);
      } catch {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid webhook URL' }
        });
        return;
      }

      // Validate events
      if (!events || !Array.isArray(events) || events.length === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'At least one event must be selected' }
        });
        return;
      }

      const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e));
      if (invalidEvents.length > 0) {
        res.status(400).json({
          success: false,
          error: { 
            code: 'VALIDATION_ERROR', 
            message: `Invalid events: ${invalidEvents.join(', ')}. Valid events: ${VALID_EVENTS.join(', ')}` 
          }
        });
        return;
      }

      const webhook = webhookService.create(userId, sessionId, url, events, secret);

      res.status(201).json({
        success: true,
        data: { webhook }
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' }
      });
    }
  }

  /**
   * Update webhook configuration
   * PUT /api/webhooks/:id
   */
  update(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid webhook ID' }
        });
        return;
      }

      const { url, events, secret, is_active } = req.body;

      // Validate URL if provided
      if (url !== undefined) {
        if (typeof url !== 'string' || url.trim() === '') {
          res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid webhook URL' }
          });
          return;
        }
        try {
          new URL(url);
        } catch {
          res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Invalid webhook URL format' }
          });
          return;
        }
      }

      // Validate events if provided
      if (events !== undefined) {
        if (!Array.isArray(events) || events.length === 0) {
          res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'At least one event must be selected' }
          });
          return;
        }

        const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e));
        if (invalidEvents.length > 0) {
          res.status(400).json({
            success: false,
            error: { 
              code: 'VALIDATION_ERROR', 
              message: `Invalid events: ${invalidEvents.join(', ')}` 
            }
          });
          return;
        }
      }

      const webhook = webhookService.update(id, userId, { url, events, secret, is_active });

      if (!webhook) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Webhook not found' }
        });
        return;
      }

      res.json({
        success: true,
        data: { webhook }
      });
    } catch (error) {
      console.error('Error updating webhook:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' }
      });
    }
  }

  /**
   * Delete webhook configuration
   * DELETE /api/webhooks/:id
   */
  delete(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid webhook ID' }
        });
        return;
      }

      const deleted = webhookService.delete(id, userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Webhook not found' }
        });
        return;
      }

      res.json({
        success: true,
        data: { message: 'Webhook deleted successfully' }
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' }
      });
    }
  }

  /**
   * Get available webhook events
   * GET /api/webhooks/events
   */
  getEvents(_req: AuthenticatedRequest, res: Response): void {
    res.json({
      success: true,
      data: {
        events: VALID_EVENTS.map(event => ({
          type: event,
          description: this.getEventDescription(event),
        }))
      }
    });
  }

  private getEventDescription(event: WebhookEventType): string {
    const descriptions: Record<WebhookEventType, string> = {
      'message.received': 'Triggered when a new message is received',
      'message.sent': 'Triggered when a message is sent successfully',
      'session.connected': 'Triggered when a WhatsApp session connects',
      'session.disconnected': 'Triggered when a WhatsApp session disconnects',
      'session.qr': 'Triggered when a new QR code is generated',
      'typing.start': 'Triggered when someone starts typing',
      'typing.stop': 'Triggered when someone stops typing',
      'presence.update': 'Triggered when presence status changes (online/offline)',
    };
    return descriptions[event];
  }
}

export const webhookController = new WebhookController();
