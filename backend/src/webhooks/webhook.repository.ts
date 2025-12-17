import Database from 'better-sqlite3';
import { getDatabase } from '../database';
import { WebhookConfig, CreateWebhookInput, UpdateWebhookInput, WebhookEventType } from './types';

/**
 * Repository for webhook configuration operations (per-session)
 */
export class WebhookRepository {
  private _db: Database.Database | null = null;
  private _initialized = false;

  /**
   * Get database instance with lazy initialization
   */
  private get db(): Database.Database {
    if (!this._db) {
      this._db = getDatabase();
      this.ensureTable();
    }
    return this._db;
  }

  /**
   * Ensure webhooks table exists with session_id
   */
  private ensureTable(): void {
    if (this._initialized) return;
    this._initialized = true;
    
    // Check if old table exists without session_id column
    const tableInfo = this._db!.prepare("PRAGMA table_info(webhooks)").all() as any[];
    const hasSessionId = tableInfo.some((col: any) => col.name === 'session_id');
    
    if (tableInfo.length > 0 && !hasSessionId) {
      // Old table exists, drop it and recreate with new schema
      this._db!.exec('DROP TABLE IF EXISTS webhooks');
    }
    
    this._db!.exec(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        url TEXT NOT NULL,
        secret TEXT,
        events TEXT NOT NULL DEFAULT '[]',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(session_id)
      )
    `);
  }

  /**
   * Create a new webhook configuration for a session
   */
  create(input: CreateWebhookInput): WebhookConfig {
    const stmt = this.db.prepare(`
      INSERT INTO webhooks (user_id, session_id, url, secret, events)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.user_id,
      input.session_id,
      input.url,
      input.secret || null,
      JSON.stringify(input.events)
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  /**
   * Find webhook by ID
   */
  findById(id: number): WebhookConfig | null {
    const stmt = this.db.prepare('SELECT * FROM webhooks WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRow(row) : null;
  }

  /**
   * Find webhook by session ID
   */
  findBySessionId(sessionId: string): WebhookConfig | null {
    const stmt = this.db.prepare('SELECT * FROM webhooks WHERE session_id = ?');
    const row = stmt.get(sessionId) as any;
    return row ? this.mapRow(row) : null;
  }

  /**
   * List all webhooks for a user
   */
  listByUserId(userId: number): WebhookConfig[] {
    const stmt = this.db.prepare('SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.mapRow(row));
  }

  /**
   * List all active webhooks for a session
   */
  listActiveBySessionId(sessionId: string): WebhookConfig[] {
    const stmt = this.db.prepare('SELECT * FROM webhooks WHERE session_id = ? AND is_active = 1');
    const rows = stmt.all(sessionId) as any[];
    return rows.map(row => this.mapRow(row));
  }

  /**
   * List active webhooks for specific event and session
   */
  listActiveByEventAndSession(event: WebhookEventType, sessionId: string): WebhookConfig[] {
    const webhooks = this.listActiveBySessionId(sessionId);
    return webhooks.filter(w => w.events.includes(event));
  }

  /**
   * Update webhook configuration
   */
  update(id: number, userId: number, input: UpdateWebhookInput): WebhookConfig | null {
    const webhook = this.findById(id);
    if (!webhook || webhook.user_id !== userId) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (input.url !== undefined) {
      updates.push('url = ?');
      values.push(input.url);
    }
    if (input.secret !== undefined) {
      updates.push('secret = ?');
      values.push(input.secret || null);
    }
    if (input.events !== undefined) {
      updates.push('events = ?');
      values.push(JSON.stringify(input.events));
    }
    if (input.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(input.is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return webhook;
    }

    updates.push("updated_at = datetime('now')");
    values.push(id, userId);

    const stmt = this.db.prepare(`
      UPDATE webhooks SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(...values);

    return this.findById(id);
  }

  /**
   * Delete webhook configuration
   */
  delete(id: number, userId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM webhooks WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * Delete webhook by session ID
   */
  deleteBySessionId(sessionId: string, userId: number): boolean {
    const stmt = this.db.prepare('DELETE FROM webhooks WHERE session_id = ? AND user_id = ?');
    const result = stmt.run(sessionId, userId);
    return result.changes > 0;
  }

  /**
   * Map database row to WebhookConfig
   */
  private mapRow(row: any): WebhookConfig {
    return {
      id: row.id,
      user_id: row.user_id,
      session_id: row.session_id,
      url: row.url,
      secret: row.secret,
      events: JSON.parse(row.events || '[]'),
      is_active: row.is_active === 1,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const webhookRepository = new WebhookRepository();
