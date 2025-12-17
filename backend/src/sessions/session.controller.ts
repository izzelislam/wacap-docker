import { Response } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { sessionService } from './session.service';

/**
 * Controller for session endpoints
 * Requirements: 3.1, 3.4, 3.5
 */
export class SessionController {
  /**
   * List all sessions for the authenticated user
   * GET /api/sessions
   * Requirements: 3.1
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

      const sessions = sessionService.list(userId);

      res.json({
        success: true,
        data: {
          sessions
        }
      });
    } catch (error) {
      console.error('Error listing sessions:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to list sessions'
        }
      });
    }
  }

  /**
   * Create a new session
   * POST /api/sessions
   * Requirements: 3.1
   */
  async create(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const { sessionId, name } = req.body;

      if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      // Validate session ID format (alphanumeric, hyphens, underscores)
      const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
      if (!sessionIdRegex.test(sessionId.trim())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID must contain only alphanumeric characters, hyphens, and underscores'
          }
        });
        return;
      }

      const session = await sessionService.create(
        userId, 
        sessionId.trim(), 
        name?.trim() || undefined
      );

      res.status(201).json({
        success: true,
        data: {
          session
        }
      });
    } catch (error: any) {
      console.error('Error creating session:', error);
      
      if (error.message === 'Session ID already exists') {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Session ID already exists'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create session'
        }
      });
    }
  }

  /**
   * Get a specific session
   * GET /api/sessions/:id
   * Requirements: 3.1
   */
  get(req: AuthenticatedRequest, res: Response): void {
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

      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const session = sessionService.get(userId, sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          session
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get session'
        }
      });
    }
  }

  /**
   * Stop a session (disconnect without logout)
   * POST /api/sessions/:id/stop
   * Requirements: 3.4
   */
  async stop(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const stopped = await sessionService.stop(userId, sessionId);

      if (!stopped) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found or not owned by user'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Session stopped successfully'
        }
      });
    } catch (error) {
      console.error('Error stopping session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to stop session'
        }
      });
    }
  }

  /**
   * Delete a session (logout and remove all data)
   * DELETE /api/sessions/:id
   * Requirements: 3.5
   */
  async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const deleted = await sessionService.delete(userId, sessionId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found or not owned by user'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Session deleted successfully'
        }
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete session'
        }
      });
    }
  }

  /**
   * Get QR code for a session
   * GET /api/sessions/:id/qr
   * Requirements: 3.2
   */
  getQR(req: AuthenticatedRequest, res: Response): void {
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

      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const qrData = sessionService.getQR(userId, sessionId);

      if (!qrData) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found or QR code not available'
          }
        });
        return;
      }

      if (!qrData.qrBase64 && !qrData.qr) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'QR code not available. Session may already be connected.'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          qr: qrData.qr,
          qrBase64: qrData.qrBase64
        }
      });
    } catch (error) {
      console.error('Error getting QR code:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get QR code'
        }
      });
    }
  }

  /**
   * Restart a session (reconnect with existing credentials)
   * POST /api/sessions/:id/restart
   * Requirements: 3.6
   */
  async restart(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const sessionId = req.params.id;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Session ID is required'
          }
        });
        return;
      }

      const session = await sessionService.restart(userId, sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found or not owned by user'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          session
        }
      });
    } catch (error) {
      console.error('Error restarting session:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to restart session'
        }
      });
    }
  }
}

// Export singleton instance
export const sessionController = new SessionController();
