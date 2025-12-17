import { getDatabase } from '../database';
import { UserSession, CreateUserSessionInput } from '../types';

/**
 * Repository for user session (WhatsApp session ownership) data access operations
 */
export class UserSessionRepository {
  /**
   * Create a new user session mapping
   */
  create(input: CreateUserSessionInput): UserSession {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO user_sessions (user_id, session_id, name)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(input.user_id, input.session_id, input.name || null);
    
    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find a user session by ID
   */
  findById(id: number): UserSession | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, session_id, name, created_at
      FROM user_sessions
      WHERE id = ?
    `);
    
    const row = stmt.get(id) as UserSession | undefined;
    
    return row || null;
  }

  /**
   * Find a user session by session ID
   */
  findBySessionId(sessionId: string): UserSession | null {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, session_id, name, created_at
      FROM user_sessions
      WHERE session_id = ?
    `);
    
    const row = stmt.get(sessionId) as UserSession | undefined;
    
    return row || null;
  }

  /**
   * List all sessions for a user
   */
  list(userId: number): UserSession[] {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, session_id, name, created_at
      FROM user_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    
    return stmt.all(userId) as UserSession[];
  }

  /**
   * List all sessions (for admin/system use)
   */
  listAll(): UserSession[] {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT id, user_id, session_id, name, created_at
      FROM user_sessions
      ORDER BY created_at DESC
    `);
    
    return stmt.all() as UserSession[];
  }

  /**
   * Delete a user session by session ID
   */
  delete(userId: number, sessionId: string): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM user_sessions
      WHERE user_id = ? AND session_id = ?
    `);
    
    const result = stmt.run(userId, sessionId);
    
    return result.changes > 0;
  }

  /**
   * Delete a user session by ID
   */
  deleteById(userId: number, id: number): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM user_sessions
      WHERE user_id = ? AND id = ?
    `);
    
    const result = stmt.run(userId, id);
    
    return result.changes > 0;
  }

  /**
   * Update session name
   */
  updateName(userId: number, sessionId: string, name: string | null): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE user_sessions
      SET name = ?
      WHERE user_id = ? AND session_id = ?
    `);
    
    const result = stmt.run(name, userId, sessionId);
    
    return result.changes > 0;
  }

  /**
   * Check if a session belongs to a user
   */
  belongsToUser(userId: number, sessionId: string): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 1 FROM user_sessions
      WHERE user_id = ? AND session_id = ?
    `);
    
    return stmt.get(userId, sessionId) !== undefined;
  }

  /**
   * Check if a session ID already exists
   */
  sessionExists(sessionId: string): boolean {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 1 FROM user_sessions WHERE session_id = ?
    `);
    
    return stmt.get(sessionId) !== undefined;
  }

  /**
   * Get the user ID that owns a session
   */
  getOwner(sessionId: string): number | null {
    const session = this.findBySessionId(sessionId);
    return session ? session.user_id : null;
  }
}
