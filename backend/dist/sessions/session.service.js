"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
const UserSessionRepository_1 = require("../database/repositories/UserSessionRepository");
const wacap_1 = require("./wacap");
/**
 * Service for WhatsApp session operations
 * Requirements: 3.1, 3.4, 3.5
 */
class SessionService {
    repository;
    constructor() {
        this.repository = new UserSessionRepository_1.UserSessionRepository();
    }
    /**
     * Create a new WhatsApp session for a user
     * Requirements: 3.1
     */
    async create(userId, sessionId, name) {
        // Check if session ID already exists
        if (this.repository.sessionExists(sessionId)) {
            throw new Error('Session ID already exists');
        }
        // Create user session mapping in database
        const userSession = this.repository.create({
            user_id: userId,
            session_id: sessionId,
            name,
        });
        // Initialize session status
        (0, wacap_1.updateSessionStatus)(sessionId, {
            status: 'connecting',
        });
        // Start the WhatsApp session
        const wacap = (0, wacap_1.getWacap)();
        await wacap.sessions.start(sessionId);
        // Get current status
        const status = (0, wacap_1.getSessionStatus)(sessionId);
        const info = wacap.sessions.info(sessionId);
        return {
            id: userSession.id,
            userId: userSession.user_id,
            sessionId: userSession.session_id,
            name: userSession.name,
            createdAt: userSession.created_at,
            status: status?.status || info?.status || 'connecting',
            phoneNumber: status?.phoneNumber || info?.phoneNumber,
            userName: status?.userName || info?.userName,
            qrCode: status?.qrCode,
            qrBase64: status?.qrBase64,
            error: status?.error,
        };
    }
    /**
     * List all sessions for a user
     * Requirements: 3.1
     */
    list(userId) {
        const userSessions = this.repository.list(userId);
        const wacap = (0, wacap_1.getWacap)();
        return userSessions.map((session) => {
            const status = (0, wacap_1.getSessionStatus)(session.session_id);
            const info = wacap.sessions.info(session.session_id);
            return {
                id: session.id,
                userId: session.user_id,
                sessionId: session.session_id,
                name: session.name,
                createdAt: session.created_at,
                status: status?.status || info?.status || 'disconnected',
                phoneNumber: status?.phoneNumber || info?.phoneNumber,
                userName: status?.userName || info?.userName,
                error: status?.error,
            };
        });
    }
    /**
     * Get a specific session for a user
     */
    get(userId, sessionId) {
        const userSession = this.repository.findBySessionId(sessionId);
        if (!userSession || userSession.user_id !== userId) {
            return null;
        }
        const wacap = (0, wacap_1.getWacap)();
        const status = (0, wacap_1.getSessionStatus)(sessionId);
        const info = wacap.sessions.info(sessionId);
        return {
            id: userSession.id,
            userId: userSession.user_id,
            sessionId: userSession.session_id,
            name: userSession.name,
            createdAt: userSession.created_at,
            status: status?.status || info?.status || 'disconnected',
            phoneNumber: status?.phoneNumber || info?.phoneNumber,
            userName: status?.userName || info?.userName,
            qrCode: status?.qrCode,
            qrBase64: status?.qrBase64,
            error: status?.error,
        };
    }
    /**
     * Stop a session (disconnect without logout, preserves credentials)
     * Requirements: 3.4
     */
    async stop(userId, sessionId) {
        // Verify ownership
        if (!this.repository.belongsToUser(userId, sessionId)) {
            return false;
        }
        const wacap = (0, wacap_1.getWacap)();
        // Stop the session (preserves credentials for reconnection)
        await wacap.sessions.stop(sessionId);
        // Update status
        (0, wacap_1.updateSessionStatus)(sessionId, {
            status: 'disconnected',
        });
        return true;
    }
    /**
     * Delete a session (logout from WhatsApp and remove all data)
     * Requirements: 3.5
     */
    async delete(userId, sessionId) {
        // Verify ownership
        if (!this.repository.belongsToUser(userId, sessionId)) {
            return false;
        }
        const wacap = (0, wacap_1.getWacap)();
        // Delete session from WhatsApp (logout and remove credentials)
        await wacap.deleteSession(sessionId);
        // Remove from database
        this.repository.delete(userId, sessionId);
        // Remove from status tracking
        (0, wacap_1.removeSessionStatus)(sessionId);
        return true;
    }
    /**
     * Get QR code for a session
     * Requirements: 3.2
     */
    getQR(userId, sessionId) {
        // Verify ownership
        if (!this.repository.belongsToUser(userId, sessionId)) {
            return null;
        }
        const status = (0, wacap_1.getSessionStatus)(sessionId);
        if (!status) {
            return null;
        }
        return {
            qr: status.qrCode,
            qrBase64: status.qrBase64,
        };
    }
    /**
     * Restart a session (reconnect with existing credentials)
     * Requirements: 3.6
     */
    async restart(userId, sessionId) {
        // Verify ownership
        if (!this.repository.belongsToUser(userId, sessionId)) {
            return null;
        }
        const userSession = this.repository.findBySessionId(sessionId);
        if (!userSession) {
            return null;
        }
        const wacap = (0, wacap_1.getWacap)();
        // Update status to connecting
        (0, wacap_1.updateSessionStatus)(sessionId, {
            status: 'connecting',
        });
        // Start the session (will auto-reconnect if credentials exist)
        await wacap.sessions.start(sessionId);
        // Get current status
        const status = (0, wacap_1.getSessionStatus)(sessionId);
        const info = wacap.sessions.info(sessionId);
        return {
            id: userSession.id,
            userId: userSession.user_id,
            sessionId: userSession.session_id,
            name: userSession.name,
            createdAt: userSession.created_at,
            status: status?.status || info?.status || 'connecting',
            phoneNumber: status?.phoneNumber || info?.phoneNumber,
            userName: status?.userName || info?.userName,
            qrCode: status?.qrCode,
            qrBase64: status?.qrBase64,
            error: status?.error,
        };
    }
    /**
     * Update session name
     */
    updateName(userId, sessionId, name) {
        return this.repository.updateName(userId, sessionId, name);
    }
    /**
     * Check if a session belongs to a user
     */
    belongsToUser(userId, sessionId) {
        return this.repository.belongsToUser(userId, sessionId);
    }
    /**
     * Get session owner user ID
     */
    getOwner(sessionId) {
        return this.repository.getOwner(sessionId);
    }
}
exports.SessionService = SessionService;
// Export singleton instance
exports.sessionService = new SessionService();
//# sourceMappingURL=session.service.js.map