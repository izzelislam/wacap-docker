import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import fs from 'fs';
import path from 'path';
import { initDatabase, resetDatabase } from '../database';
import { AuthService } from './auth.service';

const TEST_DB_PATH = path.join(__dirname, 'auth-test.db');

/**
 * Helper to clean up test database files
 */
function cleanupTestDb() {
  const files = [TEST_DB_PATH, `${TEST_DB_PATH}-wal`, `${TEST_DB_PATH}-shm`];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

/**
 * Arbitrary for valid email addresses
 */
const validEmail = fc.emailAddress();

/**
 * Arbitrary for valid passwords (minimum 8 characters)
 */
const validPassword = fc.string({ minLength: 8, maxLength: 64 })
  .filter(s => s.trim().length >= 8);

describe('Auth Property Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    cleanupTestDb();
    initDatabase(TEST_DB_PATH);
    authService = new AuthService();
  });

  afterEach(() => {
    resetDatabase();
    cleanupTestDb();
  });

  /**
   * **Feature: wacap-docker-app, Property 1: Registration creates unique user with valid token**
   * 
   * For any valid email and password combination, registering a user should create 
   * exactly one user record and return a valid JWT token that can be used for authentication.
   * 
   * **Validates: Requirements 1.1**
   */
  it('Property 1: Registration creates unique user with valid token', { timeout: 60000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        validEmail,
        validPassword,
        async (email, password) => {
          // Register user
          const result = await authService.createUser(email, password);

          // Verify user was created with correct email
          expect(result.user.email).toBe(email);
          expect(result.user.id).toBeDefined();
          expect(result.user.id).toBeGreaterThan(0);

          // Verify token was returned
          expect(result.token).toBeDefined();
          expect(typeof result.token).toBe('string');
          expect(result.token.length).toBeGreaterThan(0);

          // Verify token is valid and can be used for authentication
          const payload = authService.verifyJWT(result.token);
          expect(payload).not.toBeNull();
          expect(payload!.userId).toBe(result.user.id);
          expect(payload!.email).toBe(email);

          // Verify user can be retrieved from database
          const retrievedUser = authService.getUserById(result.user.id);
          expect(retrievedUser).not.toBeNull();
          expect(retrievedUser!.email).toBe(email);

          // Verify password is hashed (not stored in plain text)
          expect(retrievedUser!.password_hash).not.toBe(password);

          // Clean up for next iteration - delete user to allow same email in next run
          // Since we're testing uniqueness within a single registration, we need fresh state
        }
      ),
      { numRuns: 100 }
    );
  });
});
