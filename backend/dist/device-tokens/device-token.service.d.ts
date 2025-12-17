import { DeviceToken, DeviceTokenPublic } from '../database/types';
/**
 * Service for device token operations
 * Requirements: 2.1, 2.2, 2.3
 */
export declare class DeviceTokenService {
    private repository;
    private tokenLength;
    constructor();
    /**
     * Generate a unique token using crypto.randomBytes
     */
    private generateToken;
    /**
     * Create a new device token for a user
     * Requirements: 2.1
     */
    create(userId: number, name: string): DeviceToken;
    /**
     * List all device tokens for a user with metadata
     * Returns tokens without the actual token value for security
     * Requirements: 2.2
     */
    list(userId: number): DeviceTokenPublic[];
    /**
     * Revoke a device token
     * Requirements: 2.3
     */
    revoke(userId: number, tokenId: number): boolean;
    /**
     * Validate a device token
     * Returns validation result with user ID if valid
     * Requirements: 2.4, 2.5
     */
    validate(token: string): {
        valid: boolean;
        userId?: number;
        tokenId?: number;
    };
    /**
     * Update the last_used_at timestamp for a token
     */
    updateLastUsed(tokenId: number): boolean;
    /**
     * Get a device token by ID (for the owner only)
     */
    getById(userId: number, tokenId: number): DeviceToken | null;
}
export declare const deviceTokenService: DeviceTokenService;
//# sourceMappingURL=device-token.service.d.ts.map