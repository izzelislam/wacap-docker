"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.resetDatabase = resetDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Database instance singleton
let db = null;
/**
 * Get the database file path from environment or default
 */
function getDatabasePath() {
    const dataDir = process.env.DATA_DIR || path_1.default.join(process.cwd(), 'data');
    // Ensure data directory exists
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    return path_1.default.join(dataDir, 'wacap.db');
}
/**
 * Initialize the database schema
 */
function initializeSchema(database) {
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
function initDatabase(dbPath) {
    if (db) {
        return db;
    }
    const databasePath = dbPath || getDatabasePath();
    db = new better_sqlite3_1.default(databasePath);
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
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}
/**
 * Close the database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        console.log('Database connection closed');
    }
}
/**
 * Reset the database singleton (useful for testing)
 */
function resetDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}
exports.default = {
    initDatabase,
    getDatabase,
    closeDatabase,
    resetDatabase
};
//# sourceMappingURL=database.js.map