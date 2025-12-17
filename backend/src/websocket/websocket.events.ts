import { Server } from 'socket.io';
import { WacapWrapper, WacapEventType, WacapEventData } from '@pakor/wacap-wrapper';
import { sendToSession, broadcast } from './websocket.service';
import { webhookService } from '../webhooks/webhook.service';

/**
 * WebSocket Event Types for frontend
 * Requirements: 5.1, 5.4
 */
export type WSEventType = 
  | 'session:qr'
  | 'session:status'
  | 'session:connected'
  | 'session:disconnected'
  | 'session:error'
  | 'message:received';

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

const sessionStatusMap: Map<string, SessionStatus> = new Map();

/**
 * Setup Wacap event handlers that forward events to WebSocket clients
 * Requirements: 5.1, 5.4
 */
export function setupWacapEventHandlers(wacap: WacapWrapper, io: Server): void {
  // QR Code event - when QR is generated for authentication
  wacap.onGlobal(WacapEventType.QR_CODE, (data: WacapEventData) => {
    const { sessionId } = data;
    const qr = (data as any).qr;
    const qrBase64 = (data as any).qrBase64;
    
    console.log(`[WS Event] QR Code generated for session ${sessionId}`);
    
    // Update session status
    sessionStatusMap.set(sessionId, {
      ...sessionStatusMap.get(sessionId),
      status: 'qr',
      qrCode: qr,
      qrBase64: qrBase64,
    });

    // Emit to session subscribers and broadcast
    const event: QREvent = { sessionId, qr, qrBase64 };
    sendToSession(io, sessionId, 'session:qr', event);
    broadcast(io, 'session:qr', event);

    // Trigger webhook
    webhookService.trigger('session.qr', sessionId, { qr, qrBase64 });
  });

  // Connection update event
  wacap.onGlobal(WacapEventType.CONNECTION_UPDATE, (data: WacapEventData) => {
    const { sessionId } = data;
    const state = (data as any).state;
    
    console.log(`[WS Event] Connection update for session ${sessionId}:`, state?.connection);

    let status: SessionStatus['status'] = 'disconnected';
    
    if (state?.connection === 'open') {
      status = 'connected';
    } else if (state?.connection === 'connecting') {
      status = 'connecting';
    } else if (state?.connection === 'close') {
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
    const event: StatusEvent = { sessionId, status, error: errorMsg };
    sendToSession(io, sessionId, 'session:status', event);
    broadcast(io, 'session:status', event);
  });

  // Connection open event
  wacap.onGlobal(WacapEventType.CONNECTION_OPEN, (data: WacapEventData) => {
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
    const event: ConnectedEvent = {
      sessionId,
      phoneNumber: info?.phoneNumber,
      userName: info?.userName,
    };
    sendToSession(io, sessionId, 'session:connected', event);
    broadcast(io, 'session:connected', event);

    // Trigger webhook
    webhookService.trigger('session.connected', sessionId, {
      phoneNumber: info?.phoneNumber,
      userName: info?.userName,
    });
  });

  // Connection close event
  wacap.onGlobal(WacapEventType.CONNECTION_CLOSE, (data: WacapEventData) => {
    const { sessionId } = data;
    const error = (data as any).error;
    
    console.log(`[WS Event] Session ${sessionId} disconnected`);

    sessionStatusMap.set(sessionId, {
      ...sessionStatusMap.get(sessionId),
      status: 'disconnected',
      error: error?.message,
    });

    // Emit to session subscribers and broadcast
    const event: DisconnectedEvent = {
      sessionId,
      error: error?.message,
    };
    sendToSession(io, sessionId, 'session:disconnected', event);
    broadcast(io, 'session:disconnected', event);

    // Trigger webhook
    webhookService.trigger('session.disconnected', sessionId, {
      error: error?.message,
    });
  });

  // Message received event
  wacap.onGlobal(WacapEventType.MESSAGE_RECEIVED, (data: WacapEventData) => {
    const { sessionId } = data;
    const message = (data as any).message;
    const body = (data as any).body;
    const from = (data as any).from;
    const messageType = (data as any).messageType;
    const isFromMe = (data as any).isFromMe;
    
    console.log(`[WS Event] Message received on session ${sessionId} from ${from}`);

    // Forward all messages (including from self for confirmation)
    const event: MessageEvent = {
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
    
    sendToSession(io, sessionId, 'message:received', event);
    broadcast(io, 'message:received', event);

    // Trigger webhook
    webhookService.trigger('message.received', sessionId, {
      id: message?.key?.id || '',
      from,
      body: body || '',
      messageType: messageType || 'unknown',
      timestamp: message?.messageTimestamp || Date.now(),
      isFromMe: isFromMe || false,
    });
  });

  // Session error event
  wacap.onGlobal(WacapEventType.SESSION_ERROR, (data: WacapEventData) => {
    const { sessionId } = data;
    const error = (data as any).error;
    
    console.error(`[WS Event] Session ${sessionId} error:`, error);

    sessionStatusMap.set(sessionId, {
      ...sessionStatusMap.get(sessionId),
      status: 'error',
      error: error?.message || 'Unknown error',
    });

    // Emit to session subscribers and broadcast
    const event: ErrorEvent = {
      sessionId,
      error: error?.message || 'Unknown error',
    };
    sendToSession(io, sessionId, 'session:error', event);
    broadcast(io, 'session:error', event);
  });
}

/**
 * Get session status from tracking map
 */
export function getSessionStatus(sessionId: string): SessionStatus | undefined {
  return sessionStatusMap.get(sessionId);
}

/**
 * Update session status in tracking map
 */
export function updateSessionStatus(sessionId: string, status: Partial<SessionStatus>): void {
  const current = sessionStatusMap.get(sessionId) || { status: 'disconnected' };
  sessionStatusMap.set(sessionId, { ...current, ...status });
}

/**
 * Remove session from tracking map
 */
export function removeSessionStatus(sessionId: string): void {
  sessionStatusMap.delete(sessionId);
}

/**
 * Get all session statuses
 */
export function getAllSessionStatuses(): Map<string, SessionStatus> {
  return new Map(sessionStatusMap);
}

/**
 * Sync session statuses from WacapWrapper on startup
 * This ensures status map is populated with existing sessions
 */
export async function syncSessionStatuses(wacap: WacapWrapper): Promise<void> {
  try {
    // Get all active sessions from wacap
    const activeSessions = wacap.sessions.list();
    
    console.log(`[WS Events] Syncing ${activeSessions.length} session statuses`);
    
    for (const sessionId of activeSessions) {
      const info = wacap.getSessionInfo(sessionId);
      
      if (info) {
        // Map wacap status to our status type
        const infoStatus = String(info.status || '');
        let status: SessionStatus['status'] = 'disconnected';
        
        if (infoStatus === 'open' || infoStatus === 'connected') {
          status = 'connected';
        } else if (infoStatus === 'connecting') {
          status = 'connecting';
        } else if (infoStatus === 'qr') {
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
  } catch (error) {
    console.error('[WS Events] Error syncing session statuses:', error);
  }
}

export const websocketEvents = {
  setupWacapEventHandlers,
  getSessionStatus,
  updateSessionStatus,
  removeSessionStatus,
  getAllSessionStatuses,
  syncSessionStatuses
};
