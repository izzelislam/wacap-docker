import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  initDatabase, 
  closeDatabase, 
  resetDatabase,
  UserRepository,
  DeviceTokenRepository,
  UserSessionRepository
} from './index';

const TEST_DB_PATH = path.join(__dirname, 'test.db');

describe('Database Layer', () => {
  beforeEach(() => {
    // Clean up any existing test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (fs.existsSync(TEST_DB_PATH + '-wal')) {
      fs.unlinkSync(TEST_DB_PATH + '-wal');
    }
    if (fs.existsSync(TEST_DB_PATH + '-shm')) {
      fs.unlinkSync(TEST_DB_PATH + '-shm');
    }
    
    // Initialize fresh database
    initDatabase(TEST_DB_PATH);
  });

  afterEach(() => {
    // Close and reset database
    resetDatabase();
    
    // Clean up test database files
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    if (fs.existsSync(TEST_DB_PATH + '-wal')) {
      fs.unlinkSync(TEST_DB_PATH + '-wal');
    }
    if (fs.existsSync(TEST_DB_PATH + '-shm')) {
      fs.unlinkSync(TEST_DB_PATH + '-shm');
    }
  });

  describe('UserRepository', () => {
    it('should create a user', () => {
      const repo = new UserRepository();
      const user = repo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.password_hash).toBe('hashed_password');
    });

    it('should find user by email', () => {
      const repo = new UserRepository();
      repo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });

      const found = repo.findByEmail('test@example.com');
      expect(found).not.toBeNull();
      expect(found!.email).toBe('test@example.com');
    });

    it('should find user by id', () => {
      const repo = new UserRepository();
      const created = repo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });

      const found = repo.findById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for non-existent user', () => {
      const repo = new UserRepository();
      const found = repo.findByEmail('nonexistent@example.com');
      expect(found).toBeNull();
    });

    it('should check if email exists', () => {
      const repo = new UserRepository();
      repo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });

      expect(repo.emailExists('test@example.com')).toBe(true);
      expect(repo.emailExists('other@example.com')).toBe(false);
    });
  });

  describe('DeviceTokenRepository', () => {
    let userRepo: UserRepository;
    let userId: number;

    beforeEach(() => {
      userRepo = new UserRepository();
      const user = userRepo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });
      userId = user.id;
    });

    it('should create a device token', () => {
      const repo = new DeviceTokenRepository();
      const token = repo.create({
        user_id: userId,
        token: 'test_token_123',
        name: 'Test Device'
      });

      expect(token.id).toBeDefined();
      expect(token.user_id).toBe(userId);
      expect(token.token).toBe('test_token_123');
      expect(token.name).toBe('Test Device');
    });

    it('should list tokens for a user', () => {
      const repo = new DeviceTokenRepository();
      repo.create({ user_id: userId, token: 'token1', name: 'Device 1' });
      repo.create({ user_id: userId, token: 'token2', name: 'Device 2' });

      const tokens = repo.list(userId);
      expect(tokens).toHaveLength(2);
    });

    it('should validate a valid token', () => {
      const repo = new DeviceTokenRepository();
      repo.create({ user_id: userId, token: 'valid_token', name: 'Device' });

      const result = repo.validate('valid_token');
      expect(result.valid).toBe(true);
      expect(result.userId).toBe(userId);
    });

    it('should reject invalid token', () => {
      const repo = new DeviceTokenRepository();
      const result = repo.validate('invalid_token');
      expect(result.valid).toBe(false);
    });

    it('should revoke a token', () => {
      const repo = new DeviceTokenRepository();
      const token = repo.create({ user_id: userId, token: 'to_revoke', name: 'Device' });

      const revoked = repo.revoke(userId, token.id);
      expect(revoked).toBe(true);

      const result = repo.validate('to_revoke');
      expect(result.valid).toBe(false);
    });
  });

  describe('UserSessionRepository', () => {
    let userRepo: UserRepository;
    let userId: number;

    beforeEach(() => {
      userRepo = new UserRepository();
      const user = userRepo.create({
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });
      userId = user.id;
    });

    it('should create a user session', () => {
      const repo = new UserSessionRepository();
      const session = repo.create({
        user_id: userId,
        session_id: 'wa_session_1',
        name: 'My WhatsApp'
      });

      expect(session.id).toBeDefined();
      expect(session.user_id).toBe(userId);
      expect(session.session_id).toBe('wa_session_1');
      expect(session.name).toBe('My WhatsApp');
    });

    it('should list sessions for a user', () => {
      const repo = new UserSessionRepository();
      repo.create({ user_id: userId, session_id: 'session1', name: 'Session 1' });
      repo.create({ user_id: userId, session_id: 'session2', name: 'Session 2' });

      const sessions = repo.list(userId);
      expect(sessions).toHaveLength(2);
    });

    it('should delete a session', () => {
      const repo = new UserSessionRepository();
      repo.create({ user_id: userId, session_id: 'to_delete', name: 'Delete Me' });

      const deleted = repo.delete(userId, 'to_delete');
      expect(deleted).toBe(true);

      const sessions = repo.list(userId);
      expect(sessions).toHaveLength(0);
    });

    it('should check if session belongs to user', () => {
      const repo = new UserSessionRepository();
      repo.create({ user_id: userId, session_id: 'my_session' });

      expect(repo.belongsToUser(userId, 'my_session')).toBe(true);
      expect(repo.belongsToUser(userId, 'other_session')).toBe(false);
    });
  });
});
