import { UserSessionRepository } from '../database/repositories/UserSessionRepository';
import { getWacap, updateSessionStatus, removeSessionStatus } from './wacap';
import { getSessionStatus as getWsSessionStatus } from '../websocket/websocket.events';

/**
 * Extended session info with user association
 */
export interface SessionInfoExtended {
  id: number;
  userId: number;
  sessionId: string;
  name: string | null;
  createdAt: string;
  status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
  phoneNumber?: string;
  userName?: string;
  qrCode?: string;
  qrBase64?: string;
  error?: string;
}

/**
 * Get combined session status from websocket events and wacap
 */
function getSessionStatus(sessionId: string): {
  status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
  phoneNumber?: string;
  userName?: string;
  qrCode?: string;
  qrBase64?: string;
  error?: string;
} | null {
  // First check websocket events status (most up-to-date)
  const wsStatus = getWsSessionStatus(sessionId);
  if (wsStatus) {
    return {
      status: wsStatus.status,
      phoneNumber: wsStatus.phoneNumber,
      userName: wsStatus.userName,
      qrCode: wsStatus.qrCode,
      qrBase64: wsStatus.qrBase64,
      error: wsStatus.error,
    };
  }
  
  // Fallback to wacap session info
  try {
    const wacap = getWacap();
    const info = wacap.sessions.info(sessionId);
    if (info) {
      return {
        status: info.status || 'disconnected',
        phoneNumber: info.phoneNumber,
        userName: info.userName,
      };
    }
  } catch {
    // Wacap not initialized or session not found
  }
  
  return null;
}

/**
 * Service for WhatsApp session operations
 * Requirements: 3.1, 3.4, 3.5
 */
export class SessionService {
  private repository: UserSessionRepository;

  constructor() {
    this.repository = new UserSessionRepository();
  }

  /**
   * Create a new WhatsApp session for a user
   * Requirements: 3.1
   */
  async create(userId: number, sessionId: string, name?: string): Promise<SessionInfoExtended> {
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
    updateSessionStatus(sessionId, {
      status: 'connecting',
    });

    // Start the WhatsApp session
    const wacap = getWacap();
    await wacap.sessions.start(sessionId);

    // Get current status
    const status = getSessionStatus(sessionId);
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
  list(userId: number): SessionInfoExtended[] {
    const userSessions = this.repository.list(userId);
    const wacap = getWacap();

    return userSessions.map((session) => {
      const status = getSessionStatus(session.session_id);
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
  get(userId: number, sessionId: string): SessionInfoExtended | null {
    const userSession = this.repository.findBySessionId(sessionId);
    
    if (!userSession || userSession.user_id !== userId) {
      return null;
    }

    const wacap = getWacap();
    const status = getSessionStatus(sessionId);
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
  async stop(userId: number, sessionId: string): Promise<boolean> {
    // Verify ownership
    if (!this.repository.belongsToUser(userId, sessionId)) {
      return false;
    }

    const wacap = getWacap();
    
    // Stop the session (preserves credentials for reconnection)
    await wacap.sessions.stop(sessionId);

    // Update status
    updateSessionStatus(sessionId, {
      status: 'disconnected',
    });

    return true;
  }

  /**
   * Delete a session (logout from WhatsApp and remove all data)
   * Requirements: 3.5
   */
  async delete(userId: number, sessionId: string): Promise<boolean> {
    // Verify ownership
    if (!this.repository.belongsToUser(userId, sessionId)) {
      return false;
    }

    const wacap = getWacap();
    
    // Delete session from WhatsApp (logout and remove credentials)
    await wacap.deleteSession(sessionId);

    // Remove from database
    this.repository.delete(userId, sessionId);

    // Remove from status tracking
    removeSessionStatus(sessionId);

    return true;
  }

  /**
   * Get QR code for a session
   * Requirements: 3.2
   */
  getQR(userId: number, sessionId: string): { qr?: string; qrBase64?: string } | null {
    // Verify ownership
    if (!this.repository.belongsToUser(userId, sessionId)) {
      return null;
    }

    const status = getSessionStatus(sessionId);
    
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
  async restart(userId: number, sessionId: string): Promise<SessionInfoExtended | null> {
    // Verify ownership
    if (!this.repository.belongsToUser(userId, sessionId)) {
      return null;
    }

    const userSession = this.repository.findBySessionId(sessionId);
    if (!userSession) {
      return null;
    }

    const wacap = getWacap();

    // Update status to connecting
    updateSessionStatus(sessionId, {
      status: 'connecting',
    });

    // Start the session (will auto-reconnect if credentials exist)
    await wacap.sessions.start(sessionId);

    // Get current status
    const status = getSessionStatus(sessionId);
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
  updateName(userId: number, sessionId: string, name: string | null): boolean {
    return this.repository.updateName(userId, sessionId, name);
  }

  /**
   * Check if a session belongs to a user
   */
  belongsToUser(userId: number, sessionId: string): boolean {
    return this.repository.belongsToUser(userId, sessionId);
  }

  /**
   * Get session owner user ID
   */
  getOwner(sessionId: string): number | null {
    return this.repository.getOwner(sessionId);
  }
}

// Export singleton instance
export const sessionService = new SessionService();
