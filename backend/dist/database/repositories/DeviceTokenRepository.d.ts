import { DeviceToken, DeviceTokenPublic, CreateDeviceTokenInput } from '../types';
/**
 * Repository for device token data access operations
 */
export declare class DeviceTokenRepository {
    /**
     * Create a new device token
     */
    create(input: CreateDeviceTokenInput): DeviceToken;
    /**
     * Find a device token by ID
     */
    findById(id: number): DeviceToken | null;
    /**
     * Find a device token by token string
     */
    findByToken(token: string): DeviceToken | null;
    /**
     * List all device tokens for a user (non-revoked by default)
     */
    list(userId: number, includeRevoked?: boolean): DeviceToken[];
    /**
     * Revoke a device token
     */
    revoke(userId: number, tokenId: number): boolean;
    /**
     * Validate a device token
     * Returns validation result with user ID if valid
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
     * Delete a device token permanently
     */
    delete(userId: number, tokenId: number): boolean;
    /**
     * Get token without sensitive token value (for listing)
     */
    toPublic(token: DeviceToken): DeviceTokenPublic;
    /**
     * Convert list of tokens to public format
     */
    toPublicList(tokens: DeviceToken[]): DeviceTokenPublic[];
}
//# sourceMappingURL=DeviceTokenRepository.d.ts.map