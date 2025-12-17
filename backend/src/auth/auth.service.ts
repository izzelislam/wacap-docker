import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../database/repositories/UserRepository';
import { User, UserPublic } from '../database/types';

/**
 * JWT payload structure
 */
export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication result with user and token
 */
export interface AuthResult {
  user: UserPublic;
  token: string;
  expiresIn: number;
}

/**
 * Service for authentication operations
 */
export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private jwtExpiresIn: number; // in seconds
  private saltRounds: number;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    this.jwtExpiresIn = parseInt(process.env.JWT_EXPIRES_IN || '86400', 10); // 24 hours default
    this.saltRounds = 10;
  }

  /**
   * Create a new user with hashed password
   * Requirements: 1.1
   */
  async createUser(email: string, password: string): Promise<AuthResult> {
    // Check if email already exists
    if (this.userRepository.emailExists(email)) {
      throw new Error('Email already registered');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create user in database
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash
    });

    // Generate JWT token
    const token = this.generateJWT(user);

    return {
      user: this.userRepository.toPublic(user),
      token,
      expiresIn: this.jwtExpiresIn
    };
  }


  /**
   * Validate user credentials and return user if valid
   * Requirements: 1.2, 1.3
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = this.userRepository.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login user with credentials
   * Requirements: 1.2, 1.3
   */
  async login(email: string, password: string): Promise<AuthResult | null> {
    const user = await this.validateUser(email, password);
    
    if (!user) {
      return null;
    }

    // Update last activity
    this.userRepository.touch(user.id);

    // Generate JWT token
    const token = this.generateJWT(user);

    return {
      user: this.userRepository.toPublic(user),
      token,
      expiresIn: this.jwtExpiresIn
    };
  }

  /**
   * Generate JWT token for user
   * Requirements: 1.2
   */
  generateJWT(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * Verify JWT token and return payload
   * Requirements: 1.4, 1.5
   */
  verifyJWT(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Get user by ID
   */
  getUserById(id: number): User | null {
    return this.userRepository.findById(id);
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Convert user to public format (without password)
   */
  toPublic(user: User): UserPublic {
    return this.userRepository.toPublic(user);
  }
}

// Export singleton instance
export const authService = new AuthService();
