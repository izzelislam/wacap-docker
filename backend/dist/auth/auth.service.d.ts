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
export declare class AuthService {
    private userRepository;
    private jwtSecret;
    private jwtExpiresIn;
    private saltRounds;
    constructor();
    /**
     * Create a new user with hashed password
     * Requirements: 1.1
     */
    createUser(email: string, password: string): Promise<AuthResult>;
    /**
     * Validate user credentials and return user if valid
     * Requirements: 1.2, 1.3
     */
    validateUser(email: string, password: string): Promise<User | null>;
    /**
     * Login user with credentials
     * Requirements: 1.2, 1.3
     */
    login(email: string, password: string): Promise<AuthResult | null>;
    /**
     * Generate JWT token for user
     * Requirements: 1.2
     */
    generateJWT(user: User): string;
    /**
     * Verify JWT token and return payload
     * Requirements: 1.4, 1.5
     */
    verifyJWT(token: string): JWTPayload | null;
    /**
     * Get user by ID
     */
    getUserById(id: number): User | null;
    /**
     * Get user by email
     */
    getUserByEmail(email: string): User | null;
    /**
     * Convert user to public format (without password)
     */
    toPublic(user: User): UserPublic;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map