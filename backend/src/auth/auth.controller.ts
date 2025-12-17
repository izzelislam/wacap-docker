import { Router, Request, Response } from 'express';
import { authService } from './auth.service';
import { verifyJWT, AuthenticatedRequest } from './auth.middleware';

/**
 * Request body for registration
 */
interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Request body for login
 */
interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Auth controller with route handlers
 */
export const authController = {
  /**
   * Register a new user
   * POST /api/auth/register
   * Requirements: 1.1
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as RegisterRequest;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          }
        });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format'
          }
        });
        return;
      }

      if (!isValidPassword(password)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 8 characters long'
          }
        });
        return;
      }

      const result = await authService.createUser(email, password);

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email already registered'
          }
        });
        return;
      }

      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during registration'
        }
      });
    }
  },


  /**
   * Login user
   * POST /api/auth/login
   * Requirements: 1.2, 1.3
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required'
          }
        });
        return;
      }

      const result = await authService.login(email, password);

      if (!result) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Invalid email or password'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          expiresIn: result.expiresIn
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred during login'
        }
      });
    }
  },

  /**
   * Logout user (invalidate token on client side)
   * POST /api/auth/logout
   * Note: JWT tokens are stateless, so logout is handled client-side
   */
  async logout(_req: AuthenticatedRequest, res: Response): Promise<void> {
    // JWT tokens are stateless, so we just acknowledge the logout
    // The client should remove the token from storage
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Not authenticated'
          }
        });
        return;
      }

      const user = authService.getUserById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: authService.toPublic(user)
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred'
        }
      });
    }
  }
};


/**
 * Auth router with all authentication routes
 */
export const authRouter = Router();

// Public routes
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

// Protected routes
authRouter.post('/logout', verifyJWT, authController.logout);
authRouter.get('/me', verifyJWT, authController.me);
