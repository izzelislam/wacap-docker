"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserRepository_1 = require("../database/repositories/UserRepository");
/**
 * Service for authentication operations
 */
class AuthService {
    userRepository;
    jwtSecret;
    jwtExpiresIn; // in seconds
    saltRounds;
    constructor() {
        this.userRepository = new UserRepository_1.UserRepository();
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
        this.jwtExpiresIn = parseInt(process.env.JWT_EXPIRES_IN || '86400', 10); // 24 hours default
        this.saltRounds = 10;
    }
    /**
     * Create a new user with hashed password
     * Requirements: 1.1
     */
    async createUser(email, password) {
        // Check if email already exists
        if (this.userRepository.emailExists(email)) {
            throw new Error('Email already registered');
        }
        // Hash password with bcrypt
        const passwordHash = await bcrypt_1.default.hash(password, this.saltRounds);
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
    async validateUser(email, password) {
        const user = this.userRepository.findByEmail(email);
        if (!user) {
            return null;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    /**
     * Login user with credentials
     * Requirements: 1.2, 1.3
     */
    async login(email, password) {
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
    generateJWT(user) {
        const payload = {
            userId: user.id,
            email: user.email
        };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn
        });
    }
    /**
     * Verify JWT token and return payload
     * Requirements: 1.4, 1.5
     */
    verifyJWT(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch {
            return null;
        }
    }
    /**
     * Get user by ID
     */
    getUserById(id) {
        return this.userRepository.findById(id);
    }
    /**
     * Get user by email
     */
    getUserByEmail(email) {
        return this.userRepository.findByEmail(email);
    }
    /**
     * Convert user to public format (without password)
     */
    toPublic(user) {
        return this.userRepository.toPublic(user);
    }
}
exports.AuthService = AuthService;
// Export singleton instance
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map