import { Server } from 'socket.io';
import { WacapWrapper } from '@pakor/wacap-wrapper';
/**
 * WebSocket Event Types for frontend
 * Requirements: 5.1, 5.4
 */
export type WSEventType = 'session:qr' | 'session:status' | 'session:connected' | 'session:disconnected' | 'session:error' | 'message:received';
export interface QREvent {
    sessionId: string;
    qr: string;
    qrBase64: string;
}
export interface StatusEvent {
    sessionId: string;
    status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
    error?: string;
}
export interface ConnectedEvent {
    sessionId: string;
    phoneNumber?: string;
    userName?: string;
}
export interface DisconnectedEvent {
    sessionId: string;
    error?: string;
}
export interface ErrorEvent {
    sessionId: string;
    error: string;
}
export interface MessageEvent {
    sessionId: string;
    message: {
        id: string;
        from: string;
        to?: string;
        body: string;
        messageType: string;
        timestamp: number;
        isFromMe: boolean;
    };
}
/**
 * Session status tracking for real-time updates
 */
interface SessionStatus {
    status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
    qrCode?: string;
    qrBase64?: string;
    phoneNumber?: string;
    userName?: string;
    error?: string;
}
/**
 * Setup Wacap event handlers that forward events to WebSocket clients
 * Requirements: 5.1, 5.4
 */
export declare function setupWacapEventHandlers(wacap: WacapWrapper, io: Server): void;
/**
 * Get session status from tracking map
 */
export declare function getSessionStatus(sessionId: string): SessionStatus | undefined;
/**
 * Update session status in tracking map
 */
export declare function updateSessionStatus(sessionId: string, status: Partial<SessionStatus>): void;
/**
 * Remove session from tracking map
 */
export declare function removeSessionStatus(sessionId: string): void;
/**
 * Get all session statuses
 */
export declare function getAllSessionStatuses(): Map<string, SessionStatus>;
export declare const websocketEvents: {
    setupWacapEventHandlers: typeof setupWacapEventHandlers;
    getSessionStatus: typeof getSessionStatus;
    updateSessionStatus: typeof updateSessionStatus;
    removeSessionStatus: typeof removeSessionStatus;
    getAllSessionStatuses: typeof getAllSessionStatuses;
};
export {};
//# sourceMappingURL=websocket.events.d.ts.map