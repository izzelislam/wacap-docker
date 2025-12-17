import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database instance singleton
let db: Database.Database | null = null;

/**
 * Get the database file path from environment or default
 */
function getDatabasePath(): string {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  return path.join(dataDir, 'wacap.db');
}

/**
 * Initialize the database schema
 */
function initializeSchema(database: Database.Database): void {
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Device tokens table
  database.exec(`
    CREATE TABLE IF NOT EXISTS device_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_used_at DATETIME,
      revoked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User sessions mapping (which user owns which WhatsApp session)
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Message logs (optional, for history)
  database.exec(`
    CREATE TABLE IF NOT EXISTS message_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
      jid TEXT NOT NULL,
      message_type TEXT NOT NULL,
      content TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
    CREATE INDEX IF NOT EXISTS idx_message_logs_session_id ON message_logs(session_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

/**
 * Initialize and return the database instance
 */
export function initDatabase(dbPath?: string): Database.Database {
  if (db) {
    return db;
  }

  const databasePath = dbPath || getDatabasePath();
  
  db = new Database(databasePath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');
  
  // Initialize schema
  initializeSchema(db);
  
  console.log(`Database initialized at: ${databasePath}`);
  
  return db;
}

/**
 * Get the current database instance
 * Throws if database is not initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

/**
 * Reset the database singleton (useful for testing)
 */
export function resetDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export default {
  initDatabase,
  getDatabase,
  closeDatabase,
  resetDatabase
};
