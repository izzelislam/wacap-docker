"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../database");
/**
 * Repository for user data access operations
 */
class UserRepository {
    /**
     * Create a new user
     */
    create(input) {
        const db = (0, database_1.getDatabase)();
        const stmt = db.prepare(`
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
    `);
        const result = stmt.run(input.email, input.password_hash);
        return this.findById(result.lastInsertRowid);
    }
    /**
     * Find a user by email address
     */
    findByEmail(email) {
        const db = (0, database_1.getDatabase)();
        const stmt = db.prepare(`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = ?
    `);
        const row = stmt.get(email);
        return row || null;
    }
    /**
     * Find a user by ID
     */
    findById(id) {
        const db = (0, database_1.getDatabase)();
        const stmt = db.prepare(`
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
        const row = stmt.get(id);
        return row || null;
    }
    /**
     * Update user's updated_at timestamp
     */
    touch(id) {
        const db = (0, database_1.getDatabase)();
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
    updatePassword(id, passwordHash) {
        const db = (0, database_1.getDatabase)();
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
    delete(id) {
        const db = (0, database_1.getDatabase)();
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
    emailExists(email) {
        const db = (0, database_1.getDatabase)();
        const stmt = db.prepare(`
      SELECT 1 FROM users WHERE email = ?
    `);
        return stmt.get(email) !== undefined;
    }
    /**
     * Get user without sensitive data
     */
    toPublic(user) {
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
        };
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map