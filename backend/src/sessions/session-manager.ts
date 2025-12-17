import { UserSessionRepository } from '../database/repositories/UserSessionRepository';
import { getWacap, updateSessionStatus } from './wacap';

/**
 * Session Manager - Handles auto-start and cleanup of sessions
 */
export class SessionManager {
  private repository: UserSessionRepository;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.repository = new UserSessionRepository();
  }

  /**
   * Initialize session manager - auto-start all sessions on backend restart
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    console.log('[SessionManager] Initializing...');

    // Wait a bit for wacap to be fully ready
    await this.delay(2000);

    // Auto-start all sessions
    await this.autoStartSessions();

    // Start cleanup interval (check every hour)
    const cleanupIntervalMs = parseInt(process.env.SESSION_CLEANUP_INTERVAL || '3600000', 10);
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, cleanupIntervalMs);

    console.log('[SessionManager] Initialized successfully');
  }

  /**
   * Auto-start all sessions from database
   */
  async autoStartSessions(): Promise<void> {
    try {
      const wacap = getWacap();
      const allSessions = this.repository.listAll();

      console.log(`[SessionManager] Found ${allSessions.length} sessions to auto-start`);

      for (const session of allSessions) {
        try {
          // Check if session is already running
          const info = wacap.sessions.info(session.session_id);
          if (info?.status === 'connected') {
            console.log(`[SessionManager] Session ${session.session_id} already connected, skipping`);
            continue;
          }

          console.log(`[SessionManager] Starting session: ${session.session_id}`);
          
          // Update status to connecting
          updateSessionStatus(session.session_id, {
            status: 'connecting',
          });

          // Start the session
          await wacap.sessions.start(session.session_id);
          
          // Small delay between session starts to avoid overwhelming
          await this.delay(1000);
        } catch (error) {
          console.error(`[SessionManager] Failed to start session ${session.session_id}:`, error);
          updateSessionStatus(session.session_id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to start session',
          });
        }
      }

      console.log('[SessionManager] Auto-start complete');
    } catch (error) {
      console.error('[SessionManager] Auto-start failed:', error);
    }
  }

  /**
   * Cleanup expired sessions based on configuration
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Get max session age from env (default: 30 days in milliseconds)
      const maxAgeMs = parseInt(process.env.SESSION_MAX_AGE_MS || '2592000000', 10);
      
      if (maxAgeMs <= 0) {
        // Cleanup disabled
        return;
      }

      const wacap = getWacap();
      const allSessions = this.repository.listAll();
      const now = Date.now();

      console.log(`[SessionManager] Checking ${allSessions.length} sessions for expiration`);

      for (const session of allSessions) {
        const createdAt = new Date(session.created_at).getTime();
        const age = now - createdAt;

        if (age > maxAgeMs) {
          console.log(`[SessionManager] Session ${session.session_id} expired (age: ${Math.floor(age / 86400000)} days)`);
          
          try {
            // Delete from WhatsApp
            await wacap.deleteSession(session.session_id);
            
            // Delete from database
            this.repository.delete(session.user_id, session.session_id);
            
            console.log(`[SessionManager] Deleted expired session: ${session.session_id}`);
          } catch (error) {
            console.error(`[SessionManager] Failed to delete expired session ${session.session_id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('[SessionManager] Cleanup failed:', error);
    }
  }

  /**
   * Cleanup disconnected sessions that have been inactive for too long
   */
  async cleanupInactiveSessions(): Promise<void> {
    try {
      // Get max inactive time from env (default: 7 days in milliseconds)
      const maxInactiveMs = parseInt(process.env.SESSION_MAX_INACTIVE_MS || '604800000', 10);
      
      if (maxInactiveMs <= 0) {
        return;
      }

      const wacap = getWacap();
      const allSessions = this.repository.listAll();

      for (const session of allSessions) {
        const info = wacap.sessions.info(session.session_id);
        
        // Only cleanup disconnected/error sessions
        if (info?.status === 'disconnected' || info?.status === 'error') {
          const lastActivity = new Date(session.created_at).getTime();
          const inactiveTime = Date.now() - lastActivity;

          if (inactiveTime > maxInactiveMs) {
            console.log(`[SessionManager] Session ${session.session_id} inactive for ${Math.floor(inactiveTime / 86400000)} days, deleting`);
            
            try {
              await wacap.deleteSession(session.session_id);
              this.repository.delete(session.user_id, session.session_id);
            } catch (error) {
              console.error(`[SessionManager] Failed to delete inactive session ${session.session_id}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[SessionManager] Inactive cleanup failed:', error);
    }
  }

  /**
   * Stop the session manager
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isInitialized = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
