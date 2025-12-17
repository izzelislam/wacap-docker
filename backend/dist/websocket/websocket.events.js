"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketEvents = void 0;
exports.setupWacapEventHandlers = setupWacapEventHandlers;
exports.getSessionStatus = getSessionStatus;
exports.updateSessionStatus = updateSessionStatus;
exports.removeSessionStatus = removeSessionStatus;
exports.getAllSessionStatuses = getAllSessionStatuses;
const wacap_wrapper_1 = require("@pakor/wacap-wrapper");
const websocket_service_1 = require("./websocket.service");
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
    });
    // Message received event
    wacap.onGlobal(wacap_wrapper_1.WacapEventType.MESSAGE_RECEIVED, (data) => {
        const { sessionId } = data;
        const message = data.message;
        const body = data.body;
        const from = data.from;
        const messageType = data.messageType;
        const isFromMe = data.isFromMe;
        console.log(`[WS Event] Message received on session ${sessionId} from ${from}`);
        // Forward all messages (including from self for confirmation)
        const event = {
            sessionId,
            message: {
                id: message?.key?.id || '',
                from,
                body: body || '',
                messageType: messageType || 'unknown',
                timestamp: message?.messageTimestamp || Date.now(),
                isFromMe: isFromMe || false,
            },
        };
        (0, websocket_service_1.sendToSession)(io, sessionId, 'message:received', event);
        (0, websocket_service_1.broadcast)(io, 'message:received', event);
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
exports.websocketEvents = {
    setupWacapEventHandlers,
    getSessionStatus,
    updateSessionStatus,
    removeSessionStatus,
    getAllSessionStatuses
};
//# sourceMappingURL=websocket.events.js.map