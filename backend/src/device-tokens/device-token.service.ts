import crypto from 'crypto';
import { DeviceTokenRepository } from '../database/repositories/DeviceTokenRepository';
import { DeviceToken, DeviceTokenPublic } from '../database/types';

/**
 * Service for device token operations
 * Requirements: 2.1, 2.2, 2.3
 */
export class DeviceTokenService {
  private repository: DeviceTokenRepository;
  private tokenLength: number;

  constructor() {
    this.repository = new DeviceTokenRepository();
    this.tokenLength = 32; // 32 bytes = 64 hex characters
  }

  /**
   * Generate a unique token using crypto.randomBytes
   */
  private generateToken(): string {
    return crypto.randomBytes(this.tokenLength).toString('hex');
  }

  /**
   * Create a new device token for a user
   * Requirements: 2.1
   */
  create(userId: number, name: string): DeviceToken {
    const token = this.generateToken();
    
    return this.repository.create({
      user_id: userId,
      token,
      name
    });
  }

  /**
   * List all device tokens for a user with metadata
   * Returns tokens without the actual token value for security
   * Requirements: 2.2
   */
  list(userId: number): DeviceTokenPublic[] {
    const tokens = this.repository.list(userId, false);
    return this.repository.toPublicList(tokens);
  }

  /**
   * Revoke a device token
   * Requirements: 2.3
   */
  revoke(userId: number, tokenId: number): boolean {
    return this.repository.revoke(userId, tokenId);
  }

  /**
   * Validate a device token
   * Returns validation result with user ID if valid
   * Requirements: 2.4, 2.5
   */
  validate(token: string): { valid: boolean; userId?: number; tokenId?: number } {
    return this.repository.validate(token);
  }

  /**
   * Update the last_used_at timestamp for a token
   */
  updateLastUsed(tokenId: number): boolean {
    return this.repository.updateLastUsed(tokenId);
  }

  /**
   * Get a device token by ID (for the owner only)
   */
  getById(userId: number, tokenId: number): DeviceToken | null {
    const token = this.repository.findById(tokenId);
    
    if (!token || token.user_id !== userId) {
      return null;
    }
    
    return token;
  }
}

// Export singleton instance
export const deviceTokenService = new DeviceTokenService();
