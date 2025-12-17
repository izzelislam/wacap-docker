import { getDatabase } from '../database';
import { DeviceToken, DeviceTokenPublic, CreateDeviceTokenInput } from '../types';

/**
 * Repository for device token data access operations
 */
export class DeviceTokenRepository {
  /**
   * Create a new device token
   */
  create(input: CreateDeviceTokenInput): DeviceToken {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO device_tokens (user_id, token, name)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(input.user_id, input.token, input.name);
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find a device token by ID
   */
  findById(id: number): DeviceToken | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, token, name, created_at, last_used_at, revoked_at
      FROM device_tokens
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as DeviceToken | undefined;
    
    return row || null;
  }

  /**
   * Find a device token by token string
   */
  findByToken(token: string): DeviceToken | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, token, name, created_at, last_used_at, revoked_at
      FROM device_tokens
      WHERE token = ?
    `);
    
    const row = stmt.get(token) as DeviceToken | undefined;
    
    return row || null;
  }

  /**
   * List all device tokens for a user (non-revoked by default)
   */
  list(userId: number, includeRevoked: boolean = false): DeviceToken[] {
    const db = getDatabase();
    
    let query = `
      SELECT id, user_id, token, name, created_at, last_used_at, revoked_at
      FROM device_tokens
      WHERE user_id = ?
    `;
    
    if (!includeRevoked) {
      query += ' AND revoked_at IS NULL';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(query);
    
    return stmt.all(userId) as DeviceToken[];
  }

  /**
   * Revoke a device token
   */
  revoke(userId: number, tokenId: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE device_tokens
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND revoked_at IS NULL
    `);
    
    const result = stmt.run(tokenId, userId);
    
    return result.changes > 0;
  }

  /**
   * Validate a device token
   * Returns validation result with user ID if valid
   */
  validate(token: string): { valid: boolean; userId?: number; tokenId?: number } {
    const deviceToken = this.findByToken(token);
    
    if (!deviceToken) {
      return { valid: false };
    }
    
    if (deviceToken.revoked_at !== null) {
      return { valid: false };
    }
    
    return {
      valid: true,
      userId: deviceToken.user_id,
      tokenId: deviceToken.id
    };
  }

  /**
   * Update the last_used_at timestamp for a token
   */
  updateLastUsed(tokenId: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE device_tokens
      SET last_used_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(tokenId);
    
    return result.changes > 0;
  }

  /**
   * Delete a device token permanently
   */
  delete(userId: number, tokenId: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM device_tokens
      WHERE id = ? AND user_id = ?
    `);
    
    const result = stmt.run(tokenId, userId);
    
    return result.changes > 0;
  }

  /**
   * Get token without sensitive token value (for listing)
   */
  toPublic(token: DeviceToken): DeviceTokenPublic {
    return {
      id: token.id,
      user_id: token.user_id,
      name: token.name,
      created_at: token.created_at,
      last_used_at: token.last_used_at,
      revoked_at: token.revoked_at
    };
  }

  /**
   * Convert list of tokens to public format
   */
  toPublicList(tokens: DeviceToken[]): DeviceTokenPublic[] {
    return tokens.map(token => this.toPublic(token));
  }
}
