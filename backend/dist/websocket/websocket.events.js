"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketEvents = void 0;
exports.setupWacapEventHandlers = setupWacapEventHandlers;
exports.getSessionStatus = getSessionStatus;
exports.updateSessionStatus = updateSessionStatus;
exports.removeSessionStatus = removeSessionStatus;
exports.getAllSessionStatuses = getAllSessionStatuses;
exports.syncSessionStatuses = syncSessionStatuses;
const wacap_wrapper_1 = require("@pakor/wacap-wrapper");
const websocket_service_1 = require("./websocket.service");
const webhook_service_1 = require("../webhooks/webhook.service");
const sessionStatusMap = new Map();
/**
 * Setup Wacap event handlers that forward events to WebSocket clients
 * Requirements: 5.1, 5.4
 */
function setupWacapEventHandlers(wacap, io) {
    // QR Code event - when QR is generated for authentication
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.QR_CODE, (data) => {
        const { sessionId } = data;
        const qr = data.qr;
        const qrBase64 = data.qrBase64;
        console.log(`[WS Event] QR Code generated for session ${sessionId}`);
        // Update session status
        sessionStatusMap.set(sessionId, {
            ...sessionStatusMap.get(sessionId),
            status: 'qr',
            qrCode: qr,
            qrBase64: qrBase64,
        });
        // Emit to session subscribers and broadcast
        const event = { sessionId, qr, qrBase64 };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'session:qr', event);
        (0, websocket_service_1.broadcast)(io, 'session:qr', event);
        // Trigger webhook
        webhook_service_1.webhookService.trigger('session.qr', sessionId, { qr, qrBase64 });
    });
    // Connection update event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.CONNECTION_UPDATE, (data) => {
        const { sessionId } = data;
        const state = data.state;
        console.log(`[WS Event] Connection update for session ${sessionId}:`, state?.connection);
        let status = 'disconnected';
        if (state?.connection === 'open') {
            status = 'connected';
        }
        else if (state?.connection === 'connecting') {
            status = 'connecting';
        }
        else if (state?.connection === 'close') {
            status = 'disconnected';
        }
        const errorMsg = state?.lastDisconnect?.error?.message;
        // Update session status
        sessionStatusMap.set(sessionId, {
            ...sessionStatusMap.get(sessionId),
            status,
            error: errorMsg,
        });
        // Emit to session subscribers and broadcast
        const event = { sessionId, status, error: errorMsg };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'session:status', event);
        (0, websocket_service_1.broadcast)(io, 'session:status', event);
    });
    // Connection open event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.CONNECTION_OPEN, (data) => {
        const { sessionId } = data;
        console.log(`[WS Event] Session ${sessionId} connected successfully`);
        // Get session info for phone number and name
        const info = wacap.getSessionInfo(sessionId);
        sessionStatusMap.set(sessionId, {
            ...sessionStatusMap.get(sessionId),
            status: 'connected',
            qrCode: undefined,
            qrBase64: undefined,
            phoneNumber: info?.phoneNumber,
            userName: info?.userName,
        });
        // Emit to session subscribers and broadcast
        const event = {
            sessionId,
            phoneNumber: info?.phoneNumber,
            userName: info?.userName,
        };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'session:connected', event);
        (0, websocket_service_1.broadcast)(io, 'session:connected', event);
        // Trigger webhook
        webhook_service_1.webhookService.trigger('session.connected', sessionId, {
            phoneNumber: info?.phoneNumber,
            userName: info?.userName,
        });
    });
    // Connection close event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.CONNECTION_CLOSE, (data) => {
        const { sessionId } = data;
        const error = data.error;
        console.log(`[WS Event] Session ${sessionId} disconnected`);
        sessionStatusMap.set(sessionId, {
            ...sessionStatusMap.get(sessionId),
            status: 'disconnected',
            error: error?.message,
        });
        // Emit to session subscribers and broadcast
        const event = {
            sessionId,
            error: error?.message,
        };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'session:disconnected', event);
        (0, websocket_service_1.broadcast)(io, 'session:disconnected', event);
        // Trigger webhook
        webhook_service_1.webhookService.trigger('session.disconnected', sessionId, {
            error: error?.message,
        });
    });
    // Message received event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.MESSAGE_RECEIVED, (data) => {
        const { sessionId } = data;
        const message = data.message;
        const body = data.body;
        const from = data.from;
        const messageType = data.messageType;
        const isFromMe = data.isFromMe;
        // New fields from wacap-wrapper 1.0.5
        const replyTo = data.replyTo || from;
        const phoneNumber = data.phoneNumber || null;
        const isLid = data.isLid || from?.endsWith('@lid') || false;
        const participant = data.participant || null;
        console.log(`[WS Event] Message received on session ${sessionId} from ${from}, replyTo: ${replyTo}`);
        // Extract detailed message info (WAHA-style)
        const key = message?.key || {};
        const messageContent = message?.message || {};
        const pushName = message?.pushName || '';
        // Determine chat type
        const isGroup = from?.endsWith('@g.us') || false;
        const isStatus = from?.endsWith('@broadcast') || false;
        // Extract media info if present
        const mediaMessage = messageContent?.imageMessage ||
            messageContent?.videoMessage ||
            messageContent?.audioMessage ||
            messageContent?.documentMessage ||
            messageContent?.stickerMessage || null;
        const hasMedia = !!mediaMessage;
        const mediaInfo = hasMedia ? {
            mimetype: mediaMessage?.mimetype || null,
            fileLength: mediaMessage?.fileLength || null,
            fileName: mediaMessage?.fileName || null,
            caption: mediaMessage?.caption || null,
            url: mediaMessage?.url || null,
        } : null;
        // Build comprehensive webhook payload (WAHA-style)
        // replyTo and phoneNumber now come from wacap-wrapper which handles LID conversion
        const webhookPayload = {
            id: key?.id || '',
            from: from || '',
            to: key?.remoteJid || '',
            // replyTo: The JID to use when replying to this message (from wrapper, handles LID)
            replyTo,
            // phoneNumber: Extracted phone number if available (from wrapper)
            phoneNumber,
            body: body || '',
            hasMedia,
            mediaInfo,
            timestamp: Number(message?.messageTimestamp) || Date.now(),
            isFromMe: isFromMe || false,
            isGroup,
            isStatus,
            isLid,
            participant: isGroup ? participant : null,
            pushName,
            messageType: messageType || 'unknown',
            // Raw message for advanced usage
            _data: {
                key,
                message: messageContent,
                messageTimestamp: message?.messageTimestamp,
                status: message?.status,
            },
        };
        // Forward all messages (including from self for confirmation)
        const event = {
            sessionId,
            message: {
                id: key?.id || '',
                from,
                body: body || '',
                messageType: messageType || 'unknown',
                timestamp: Number(message?.messageTimestamp) || Date.now(),
                isFromMe: isFromMe || false,
            },
        };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'message:received', event);
        (0, websocket_service_1.broadcast)(io, 'message:received', event);
        // Trigger webhook with comprehensive data
        webhook_service_1.webhookService.trigger('message.received', sessionId, webhookPayload);
    });
    // Session error event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.SESSION_ERROR, (data) => {
        const { sessionId } = data;
        const error = data.error;
        console.error(`[WS Event] Session ${sessionId} error:`, error);
        sessionStatusMap.set(sessionId, {
            ...sessionStatusMap.get(sessionId),
            status: 'error',
            error: error?.message || 'Unknown error',
        });
        // Emit to session subscribers and broadcast
        const event = {
            sessionId,
            error: error?.message || 'Unknown error',
        };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'session:error', event);
        (0, websocket_service_1.broadcast)(io, 'session:error', event);
    });
}
/**
 * Get session status from tracking map
 */
function getSessionStatus(sessionId) {
    return sessionStatusMap.get(sessionId);
}
/**
 * Update session status in tracking map
 */
function updateSessionStatus(sessionId, status) {
    const current = sessionStatusMap.get(sessionId) || { status: 'disconnected' };
    sessionStatusMap.set(sessionId, { ...current, ...status });
}
/**
 * Remove session from tracking map
 */
function removeSessionStatus(sessionId) {
    sessionStatusMap.delete(sessionId);
}
/**
 * Get all session statuses
 */
function getAllSessionStatuses() {
    return new Map(sessionStatusMap);
}
/**
 * Sync session statuses from WacapWrapper on startup
 * This ensures status map is populated with existing sessions
 */
async function syncSessionStatuses(wacap) {
    try {
        // Get all active sessions from wacap
        const activeSessions = wacap.sessions.list();
        console.log(`[WS Events] Syncing ${activeSessions.length} session statuses`);
        for (const sessionId of activeSessions) {
            const info = wacap.getSessionInfo(sessionId);
            if (info) {
                // Map wacap status to our status type
                const infoStatus = String(info.status || '');
                let status = 'disconnected';
                if (infoStatus === 'open' || infoStatus === 'connected') {
                    status = 'connected';
                }
                else if (infoStatus === 'connecting') {
                    status = 'connecting';
                }
                else if (infoStatus === 'qr') {
                    status = 'qr';
                }
                sessionStatusMap.set(sessionId, {
                    status,
                    phoneNumber: info.phoneNumber,
                    userName: info.userName,
                });
                console.log(`[WS Events] Synced session ${sessionId}: ${status}`);
            }
        }
    }
    catch (error) {
        console.error('[WS Events] Error syncing session statuses:', error);
    }
}
exports.websocketEvents = {
    setupWacapEventHandlers,
    getSessionStatus,
    updateSessionStatus,
    removeSessionStatus,
    getAllSessionStatuses,
    syncSessionStatuses
};
//# sourceMappingURL=websocket.events.js.map