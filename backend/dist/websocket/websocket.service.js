"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = void 0;
exports.setupWebSocket = setupWebSocket;
exports.broadcast = broadcast;
exports.sendToUser = sendToUser;
exports.sendToSession = sendToSession;
exports.isUserConnected = isUserConnected;
exports.getUserSocketCount = getUserSocketCount;
exports.getConnectedUsersCount = getConnectedUsersCount;
const auth_service_1 = require("../auth/auth.service");
const DeviceTokenRepository_1 = require("../database/repositories/DeviceTokenRepository");
const deviceTokenRepository = new DeviceTokenRepository_1.DeviceTokenRepository();
// Track user rooms for targeted messaging
const userRooms = new Map();
/**
 * Authenticate socket connection using JWT or device token
 */
function authenticateSocket(socket) {
    const { token, deviceToken } = socket.handshake.auth;
    // Try JWT token first
    if (token) {
        const payload = auth_service_1.authService.verifyJWT(token);
        if (payload) {
            return {
                userId: payload.userId,
                email: payload.email,
                authMethod: 'jwt'
            };
        }
    }
    // Try device token
    if (deviceToken) {
        const validation = deviceTokenRepository.validate(deviceToken);
        if (validation.valid && validation.userId) {
            const user = auth_service_1.authService.getUserById(validation.userId);
            if (user) {
                return {
                    userId: user.id,
                    email: user.email,
                    authMethod: 'device_token'
                };
            }
        }
    }
    return null;
}
/**
 * Setup WebSocket server with authentication and room-based messaging
 * Requirements: 5.1
 */
function setupWebSocket(io) {
    // Authentication middleware
    io.use((socket, next) => {
        const auth = authenticateSocket(socket);
        if (!auth) {
            return next(new Error('Authentication required'));
        }
        socket.userId = auth.userId;
        socket.email = auth.email;
        socket.authMethod = auth.authMethod;
        next();
    });
    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        const email = socket.email;
        console.log(`[WebSocket] User ${email} connected (socket: ${socket.id})`);
        // Join user-specific room
        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        // Track socket in user rooms
        if (!userRooms.has(userId)) {
            userRooms.set(userId, { sockets: new Set() });
        }
        userRooms.get(userId).sockets.add(socket.id);
        // Send connection confirmation
        socket.emit('connected', {
            userId,
            email,
            authMethod: socket.authMethod
        });
        // Handle session subscription
        socket.on('session:subscribe', (sessionId) => {
            const sessionRoom = `session:${sessionId}`;
            socket.join(sessionRoom);
            console.log(`[WebSocket] User ${email} subscribed to session ${sessionId}`);
        });
        // Handle session unsubscription
        socket.on('session:unsubscribe', (sessionId) => {
            const sessionRoom = `session:${sessionId}`;
            socket.leave(sessionRoom);
            console.log(`[WebSocket] User ${email} unsubscribed from session ${sessionId}`);
        });
        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`[WebSocket] User ${email} disconnected (reason: ${reason})`);
            // Remove socket from user rooms tracking
            const room = userRooms.get(userId);
            if (room) {
                room.sockets.delete(socket.id);
                if (room.sockets.size === 0) {
                    userRooms.delete(userId);
                }
            }
        });
        // Handle errors
        socket.on('error', (error) => {
            console.error(`[WebSocket] Socket error for user ${email}:`, error);
        });
    });
}
/**
 * Broadcast event to all connected clients
 */
function broadcast(io, event, data) {
    io.emit(event, data);
}
/**
 * Send event to specific user (all their connected sockets)
 */
function sendToUser(io, userId, event, data) {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit(event, data);
}
/**
 * Send event to all subscribers of a session
 */
function sendToSession(io, sessionId, event, data) {
    const sessionRoom = `session:${sessionId}`;
    io.to(sessionRoom).emit(event, data);
}
/**
 * Check if user has any connected sockets
 */
function isUserConnected(userId) {
    const room = userRooms.get(userId);
    return room !== undefined && room.sockets.size > 0;
}
/**
 * Get count of connected sockets for a user
 */
function getUserSocketCount(userId) {
    const room = userRooms.get(userId);
    return room ? room.sockets.size : 0;
}
/**
 * Get total connected users count
 */
function getConnectedUsersCount() {
    return userRooms.size;
}
exports.websocketService = {
    setupWebSocket,
    broadcast,
    sendToUser,
    sendToSession,
    isUserConnected,
    getUserSocketCount,
    getConnectedUsersCount
};
//# sourceMappingURL=websocket.service.js.map