"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
exports.verifyJWT = verifyJWT;
exports.verifyDeviceToken = verifyDeviceToken;
exports.verifyAuth = verifyAuth;
const auth_service_1 = require("./auth.service");
const DeviceTokenRepository_1 = require("../database/repositories/DeviceTokenRepository");
const deviceTokenRepository = new DeviceTokenRepository_1.DeviceTokenRepository();
/**
 * Extract JWT token from Authorization header
 */
function extractBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
/**
 * Extract device token from X-Device-Token header
 */
function extractDeviceToken(req) {
    const deviceToken = req.headers['x-device-token'];
    if (!deviceToken || typeof deviceToken !== 'string') {
        return null;
    }
    return deviceToken;
}
/**
 * Middleware to verify JWT token
 * Requirements: 1.4, 1.5
 */
function verifyJWT(req, res, next) {
    const token = extractBearerToken(req);
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'No authentication token provided'
            }
        });
        return;
    }
    const payload = auth_service_1.authService.verifyJWT(token);
    if (!payload) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Invalid or expired token'
            }
        });
        return;
    }
    req.user = {
        userId: payload.userId,
        email: payload.email
    };
    req.authMethod = 'jwt';
    next();
}
/**
 * Middleware to verify device token
 * Requirements: 2.4, 2.5
 */
function verifyDeviceToken(req, res, next) {
    const token = extractDeviceToken(req);
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'No device token provided'
            }
        });
        return;
    }
    const validation = deviceTokenRepository.validate(token);
    if (!validation.valid || !validation.userId) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'Invalid or revoked device token'
            }
        });
        return;
    }
    // Update last used timestamp
    if (validation.tokenId) {
        deviceTokenRepository.updateLastUsed(validation.tokenId);
    }
    // Get user info
    const user = auth_service_1.authService.getUserById(validation.userId);
    if (!user) {
        res.status(401).json({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message: 'User not found'
            }
        });
        return;
    }
    req.user = {
        userId: user.id,
        email: user.email
    };
    req.authMethod = 'device_token';
    next();
}
/**
 * Middleware that accepts either JWT or device token
 * Tries JWT first, then falls back to device token
 * Requirements: 1.5, 2.4
 */
function verifyAuth(req, res, next) {
    // Try JWT first
    const jwtToken = extractBearerToken(req);
    if (jwtToken) {
        const payload = auth_service_1.authService.verifyJWT(jwtToken);
        if (payload) {
            req.user = {
                userId: payload.userId,
                email: payload.email
            };
            req.authMethod = 'jwt';
            next();
            return;
        }
    }
    // Try device token
    const deviceToken = extractDeviceToken(req);
    if (deviceToken) {
        const validation = deviceTokenRepository.validate(deviceToken);
        if (validation.valid && validation.userId) {
            // Update last used timestamp
            if (validation.tokenId) {
                deviceTokenRepository.updateLastUsed(validation.tokenId);
            }
            const user = auth_service_1.authService.getUserById(validation.userId);
            if (user) {
                req.user = {
                    userId: user.id,
                    email: user.email
                };
                req.authMethod = 'device_token';
                next();
                return;
            }
        }
    }
    // No valid authentication found
    res.status(401).json({
        success: false,
        error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication required. Provide a valid JWT token or device token.'
        }
    });
}
/**
 * Middleware factory for auth - allows specifying which methods to accept
 */
exports.authMiddleware = {
    jwt: verifyJWT,
    deviceToken: verifyDeviceToken,
    any: verifyAuth
};
//# sourceMappingURL=auth.middleware.js.map