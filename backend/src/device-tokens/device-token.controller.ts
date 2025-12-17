import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { deviceTokenService } from './device-token.service';

/**
 * Controller for device token endpoints
 * Requirements: 2.1, 2.2, 2.3
 */
export class DeviceTokenController {
  /**
   * List all device tokens for the authenticated user
   * GET /api/tokens
   * Requirements: 2.2
   */
  list(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const tokens = deviceTokenService.list(userId);

      res.json({
        success: true,
        data: {
          tokens
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list device tokens'
        }
      });
    }
  }

  /**
   * Create a new device token
   * POST /api/tokens
   * Requirements: 2.1
   */
  create(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const { name } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token name is required'
          }
        });
        return;
      }

      const token = deviceTokenService.create(userId, name.trim());

      // Return the full token only on creation
      res.status(201).json({
        success: true,
        data: {
          id: token.id,
          name: token.name,
          token: token.token, // Only returned on creation
          created_at: token.created_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create device token'
        }
      });
    }
  }

  /**
   * Revoke (delete) a device token
   * DELETE /api/tokens/:id
   * Requirements: 2.3
   */
  revoke(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const tokenId = parseInt(req.params.id, 10);

      if (isNaN(tokenId)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid token ID'
          }
        });
        return;
      }

      const revoked = deviceTokenService.revoke(userId, tokenId);

      if (!revoked) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Token not found or already revoked'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Token revoked successfully'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to revoke device token'
        }
      });
    }
  }
}

// Export singleton instance
export const deviceTokenController = new DeviceTokenController();
