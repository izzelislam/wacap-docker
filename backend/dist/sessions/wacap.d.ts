import { WacapWrapper } from '@pakor/wacap-wrapper';
import { Server } from 'socket.io';
/**
 * Session status tracking for real-time updates
 * Note: Primary event handling is now in websocket/websocket.events.ts
 */
interface SessionStatusMap {
    [sessionId: string]: {
        status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
        qrCode?: string;
        qrBase64?: string;
        phoneNumber?: string;
        userName?: string;
        error?: string;
    };
}
/**
 * Initialize the WacapWrapper with SQLite storage and base64 QR format
 * Requirements: 3.1, 3.2
 *
 * Note: Event handlers for WebSocket forwarding are now setup separately
 * via setupWacapEventHandlers() in websocket/websocket.events.ts
 */
export declare function initWacap(io?: Server): Promise<WacapWrapper>;
/**
 * Get the WacapWrapper instance
 * Throws if not initialized
 */
export declare function getWacap(): WacapWrapper;
/**
 * Check if WacapWrapper is initialized
 */
export declare function isWacapInitialized(): boolean;
/**
 * Get session status from tracking map
 */
export declare function getSessionStatus(sessionId: string): SessionStatusMap[string] | null;
/**
 * Update session status in tracking map
 */
export declare function updateSessionStatus(sessionId: string, status: Partial<SessionStatusMap[string]>): void;
/**
 * Remove session from tracking map
 */
export declare function removeSessionStatus(sessionId: string): void;
/**
 * Set Socket.IO instance for real-time updates
 */
export declare function setSocketIO(io: Server): void;
/**
 * Get Socket.IO instance
 */
export declare function getSocketIO(): Server | null;
/**
 * Cleanup WacapWrapper instance
 */
export declare function destroyWacap(): Promise<void>;
declare const _default: {
    initWacap: typeof initWacap;
    getWacap: typeof getWacap;
    isWacapInitialized: typeof isWacapInitialized;
    getSessionStatus: typeof getSessionStatus;
    updateSessionStatus: typeof updateSessionStatus;
    removeSessionStatus: typeof removeSessionStatus;
    setSocketIO: typeof setSocketIO;
    getSocketIO: typeof getSocketIO;
    destroyWacap: typeof destroyWacap;
};
export default _default;
//# sourceMappingURL=wacap.d.ts.map