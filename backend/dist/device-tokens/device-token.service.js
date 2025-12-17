"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenService = exports.DeviceTokenService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const DeviceTokenRepository_1 = require("../database/repositories/DeviceTokenRepository");
/**
 * Service for device token operations
 * Requirements: 2.1, 2.2, 2.3
 */
class DeviceTokenService {
    repository;
    tokenLength;
    constructor() {
        this.repository = new DeviceTokenRepository_1.DeviceTokenRepository();
        this.tokenLength = 32; // 32 bytes = 64 hex characters
    }
    /**
     * Generate a unique token using crypto.randomBytes
     */
    generateToken() {
        return crypto_1.default.randomBytes(this.tokenLength).toString('hex');
    }
    /**
     * Create a new device token for a user
     * Requirements: 2.1
     */
    create(userId, name) {
        const token = this.generateToken();
        return this.repository.create({
            user_id: userId,
            token,
            name
        });
    }
    /**
     * List all device tokens for a user with metadata
     * Returns tokens without the actual token value for security
     * Requirements: 2.2
     */
    list(userId) {
        const tokens = this.repository.list(userId, false);
        return this.repository.toPublicList(tokens);
    }
    /**
     * Revoke a device token
     * Requirements: 2.3
     */
    revoke(userId, tokenId) {
        return this.repository.revoke(userId, tokenId);
    }
    /**
     * Validate a device token
     * Returns validation result with user ID if valid
     * Requirements: 2.4, 2.5
     */
    validate(token) {
        return this.repository.validate(token);
    }
    /**
     * Update the last_used_at timestamp for a token
     */
    updateLastUsed(tokenId) {
        return this.repository.updateLastUsed(tokenId);
    }
    /**
     * Get a device token by ID (for the owner only)
     */
    getById(userId, tokenId) {
        const token = this.repository.findById(tokenId);
        if (!token || token.user_id !== userId) {
            return null;
        }
        return token;
    }
}
exports.DeviceTokenService = DeviceTokenService;
// Export singleton instance
exports.deviceTokenService = new DeviceTokenService();
//# sourceMappingURL=device-token.service.js.map