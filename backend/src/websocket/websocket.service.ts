import { Server, Socket } from 'socket.io';
import { authService } from '../auth/auth.service';
import { DeviceTokenRepository } from '../database/repositories/DeviceTokenRepository';

/**
 * WebSocket Service for real-time communication
 * Requirements: 5.1
 */

interface AuthenticatedSocket extends Socket {
  userId?: number;
  email?: string;
  authMethod?: 'jwt' | 'device_token';
}

interface UserRoom {
  sockets: Set<string>;
}

const deviceTokenRepository = new DeviceTokenRepository();

// Track user rooms for targeted messaging
const userRooms: Map<number, UserRoom> = new Map();

/**
 * Authenticate socket connection using JWT or device token
 */
function authenticateSocket(socket: Socket): { userId: number; email: string; authMethod: 'jwt' | 'device_token' } | null {
  const { token, deviceToken } = socket.handshake.auth;
  
  // Try JWT token first
  if (token) {
    const payload = authService.verifyJWT(token);
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
      const user = authService.getUserById(validation.userId);
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
export function setupWebSocket(io: Server): void {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
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
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const email = socket.email!;
    
    console.log(`[WebSocket] User ${email} connected (socket: ${socket.id})`);
    
    // Join user-specific room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    
    // Track socket in user rooms
    if (!userRooms.has(userId)) {
      userRooms.set(userId, { sockets: new Set() });
    }
    userRooms.get(userId)!.sockets.add(socket.id);
    
    // Send connection confirmation
    socket.emit('connected', {
      userId,
      email,
      authMethod: socket.authMethod
    });

    // Handle session subscription
    socket.on('session:subscribe', (sessionId: string) => {
      const sessionRoom = `session:${sessionId}`;
      socket.join(sessionRoom);
      console.log(`[WebSocket] User ${email} subscribed to session ${sessionId}`);
      
      // Send current session status to the subscriber
      const { getSessionStatus } = require('./websocket.events');
      const status = getSessionStatus(sessionId);
      if (status) {
        // Send current status
        socket.emit('session:status', {
          sessionId,
          status: status.status,
          error: status.error
        });
        
        // If connected, send connected event with phone info
        if (status.status === 'connected') {
          socket.emit('session:connected', {
            sessionId,
            phoneNumber: status.phoneNumber,
            userName: status.userName
          });
        }
        
        // If QR available, send QR event
        if (status.status === 'qr' && status.qrBase64) {
          socket.emit('session:qr', {
            sessionId,
            qr: status.qrCode,
            qrBase64: status.qrBase64
          });
        }
      }
    });

    // Handle session unsubscription
    socket.on('session:unsubscribe', (sessionId: string) => {
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
export function broadcast(io: Server, event: string, data: any): void {
  io.emit(event, data);
}

/**
 * Send event to specific user (all their connected sockets)
 */
export function sendToUser(io: Server, userId: number, event: string, data: any): void {
  const userRoom = `user:${userId}`;
  io.to(userRoom).emit(event, data);
}

/**
 * Send event to all subscribers of a session
 */
export function sendToSession(io: Server, sessionId: string, event: string, data: any): void {
  const sessionRoom = `session:${sessionId}`;
  io.to(sessionRoom).emit(event, data);
}

/**
 * Check if user has any connected sockets
 */
export function isUserConnected(userId: number): boolean {
  const room = userRooms.get(userId);
  return room !== undefined && room.sockets.size > 0;
}

/**
 * Get count of connected sockets for a user
 */
export function getUserSocketCount(userId: number): number {
  const room = userRooms.get(userId);
  return room ? room.sockets.size : 0;
}

/**
 * Get total connected users count
 */
export function getConnectedUsersCount(): number {
  return userRooms.size;
}

export const websocketService = {
  setupWebSocket,
  broadcast,
  sendToUser,
  sendToSession,
  isUserConnected,
  getUserSocketCount,
  getConnectedUsersCount
};
