"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingService = exports.MessagingService = void 0;
const wacap_1 = require("../sessions/wacap");
const session_service_1 = require("../sessions/session.service");
const phone_utils_1 = require("./phone-utils");
/**
 * Messaging service for WhatsApp message operations
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
class MessagingService {
    /**
     * Send a text message
     * Requirements: 4.1
     */
    async sendText(userId, request) {
        const { sessionId, to, message, mentions } = request;
        // Verify session ownership
        if (!session_service_1.sessionService.belongsToUser(userId, sessionId)) {
            return {
                success: false,
                error: 'Session not found or access denied',
            };
        }
        // Format phone number to JID
        let jid;
        try {
            jid = (0, phone_utils_1.formatPhoneNumber)(to);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid phone number',
            };
        }
        try {
            const wacap = (0, wacap_1.getWacap)();
            // Format mentions if provided
            const formattedMentions = mentions?.map((m) => (0, phone_utils_1.formatPhoneNumber)(m));
            const result = await wacap.send.text(sessionId, jid, message, {
                mentions: formattedMentions,
            });
            return {
                success: true,
                messageId: result?.key?.id,
                timestamp: result?.messageTimestamp,
            };
        }
        catch (error) {
            console.error('Send text error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send message',
            };
        }
    }
    /**
     * Send media (image, video, document)
     * Requirements: 4.2
     */
    async sendMedia(userId, request) {
        const { sessionId, to, url, base64, mimetype, caption, fileName } = request;
        // Verify session ownership
        if (!session_service_1.sessionService.belongsToUser(userId, sessionId)) {
            return {
                success: false,
                error: 'Session not found or access denied',
            };
        }
        // Validate media source
        if (!url && !base64) {
            return {
                success: false,
                error: 'Either url or base64 must be provided',
            };
        }
        // Format phone number to JID
        let jid;
        try {
            jid = (0, phone_utils_1.formatPhoneNumber)(to);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid phone number',
            };
        }
        try {
            const wacap = (0, wacap_1.getWacap)();
            let result;
            if (url) {
                // Send from URL
                result = await wacap.send.media(sessionId, jid, {
                    url,
                    mimetype,
                    caption,
                    fileName,
                });
            }
            else if (base64) {
                // Send from base64
                // Convert base64 to buffer
                const buffer = Buffer.from(base64, 'base64');
                result = await wacap.send.media(sessionId, jid, {
                    buffer,
                    mimetype,
                    caption,
                    fileName,
                });
            }
            return {
                success: true,
                messageId: result?.key?.id,
                timestamp: result?.messageTimestamp,
            };
        }
        catch (error) {
            console.error('Send media error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send media',
            };
        }
    }
    /**
     * Send location message
     * Requirements: 4.4
     */
    async sendLocation(userId, request) {
        const { sessionId, to, latitude, longitude, name, address } = request;
        // Verify session ownership
        if (!session_service_1.sessionService.belongsToUser(userId, sessionId)) {
            return {
                success: false,
                error: 'Session not found or access denied',
            };
        }
        // Validate coordinates
        if (latitude < -90 || latitude > 90) {
            return {
                success: false,
                error: 'Invalid latitude. Must be between -90 and 90',
            };
        }
        if (longitude < -180 || longitude > 180) {
            return {
                success: false,
                error: 'Invalid longitude. Must be between -180 and 180',
            };
        }
        // Format phone number to JID
        let jid;
        try {
            jid = (0, phone_utils_1.formatPhoneNumber)(to);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid phone number',
            };
        }
        try {
            const wacap = (0, wacap_1.getWacap)();
            const result = await wacap.send.location(sessionId, jid, latitude, longitude, {
                name,
                address,
            });
            return {
                success: true,
                messageId: result?.key?.id,
                timestamp: result?.messageTimestamp,
            };
        }
        catch (error) {
            console.error('Send location error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send location',
            };
        }
    }
    /**
     * Send contact card (vCard)
     * Requirements: 4.5
     */
    async sendContact(userId, request) {
        const { sessionId, to, contact } = request;
        // Verify session ownership
        if (!session_service_1.sessionService.belongsToUser(userId, sessionId)) {
            return {
                success: false,
                error: 'Session not found or access denied',
            };
        }
        // Validate contact info
        if (!contact.fullName || !contact.phoneNumber) {
            return {
                success: false,
                error: 'Contact fullName and phoneNumber are required',
            };
        }
        // Format phone number to JID
        let jid;
        try {
            jid = (0, phone_utils_1.formatPhoneNumber)(to);
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Invalid phone number',
            };
        }
        try {
            const wacap = (0, wacap_1.getWacap)();
            // Use the send.contact API with name and phone
            const result = await wacap.send.contact(sessionId, jid, {
                name: contact.fullName,
                phone: contact.phoneNumber,
            });
            return {
                success: true,
                messageId: result?.key?.id,
                timestamp: result?.messageTimestamp,
            };
        }
        catch (error) {
            console.error('Send contact error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send contact',
            };
        }
    }
}
exports.MessagingService = MessagingService;
// Export singleton instance
exports.messagingService = new MessagingService();
//# sourceMappingURL=messaging.service.js.map