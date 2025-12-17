import { getDatabase } from '../database';
import { User, UserPublic, CreateUserInput } from '../types';

/**
 * Repository for user data access operations
 */
export class UserRepository {
  /**
   * Create a new user
   */
  create(input: CreateUserInput): User {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(input.email, input.password_hash);
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find a user by email address
   */
  findByEmail(email: string): User | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
    `);
    
    const row = stmt.get(email) as User | undefined;
    
    return row || null;
  }

  /**
   * Find a user by ID
   */
  findById(id: number): User | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as User | undefined;
    
    return row || null;
  }

  /**
   * Update user's updated_at timestamp
   */
  touch(id: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE users
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  /**
   * Update user's password hash
   */
  updatePassword(id: number, passwordHash: string): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(passwordHash, id);
    
    return result.changes > 0;
  }

  /**
   * Delete a user by ID
   */
  delete(id: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    
    return result.changes > 0;
  }

  /**
   * Check if email already exists
   */
  emailExists(email: string): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 1 FROM users WHERE email = ?
    `);
    
    return stmt.get(email) !== undefined;
  }

  /**
   * Get user without sensitive data
   */
  toPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}
