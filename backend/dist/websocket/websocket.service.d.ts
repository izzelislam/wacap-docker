import { Server } from 'socket.io';
/**
 * Setup WebSocket server with authentication and room-based messaging
 * Requirements: 5.1
 */
export declare function setupWebSocket(io: Server): void;
/**
 * Broadcast event to all connected clients
 */
export declare function broadcast(io: Server, event: string, data: any): void;
/**
 * Send event to specific user (all their connected sockets)
 */
export declare function sendToUser(io: Server, userId: number, event: string, data: any): void;
/**
 * Send event to all subscribers of a session
 */
export declare function sendToSession(io: Server, sessionId: string, event: string, data: any): void;
/**
 * Check if user has any connected sockets
 */
export declare function isUserConnected(userId: number): boolean;
/**
 * Get count of connected sockets for a user
 */
export declare function getUserSocketCount(userId: number): number;
/**
 * Get total connected users count
 */
export declare function getConnectedUsersCount(): number;
export declare const websocketService: {
    setupWebSocket: typeof setupWebSocket;
    broadcast: typeof broadcast;
    sendToUser: typeof sendToUser;
    sendToSession: typeof sendToSession;
    isUserConnected: typeof isUserConnected;
    getUserSocketCount: typeof getUserSocketCount;
    getConnectedUsersCount: typeof getConnectedUsersCount;
};
//# sourceMappingURL=websocket.service.d.ts.map