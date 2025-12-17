import { WacapWrapper } from '@pakor/wacap-wrapper';
import path from 'path';
import { Server } from 'socket.io';

/**
 * Global WacapWrapper instance
 * Requirements: 3.1, 3.2
 */
let wacapInstance: WacapWrapper | null = null;
let socketIoInstance: Server | null = null;

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

const sessionStatusMap: SessionStatusMap = {};

/**
 * Get the sessions path from environment or default
 */
function getSessionsPath(): string {
  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  return process.env.SESSIONS_PATH || path.join(dataDir, 'sessions');
}

/**
 * Initialize the WacapWrapper with SQLite storage and base64 QR format
 * Requirements: 3.1, 3.2
 * 
 * Note: Event handlers for WebSocket forwarding are now setup separately
 * via setupWacapEventHandlers() in websocket/websocket.events.ts
 */
export async function initWacap(io?: Server): Promise<WacapWrapper> {
  if (wacapInstance) {
    return wacapInstance;
  }

  if (io) {
    socketIoInstance = io;
  }

  const sessionsPath = getSessionsPath();

  wacapInstance = new WacapWrapper({
    sessionsPath,
    storageAdapter: 'sqlite',
    debug: process.env.NODE_ENV !== 'production',
    qrCode: {
      format: 'base64', // Use base64 for web display
      width: 300,
      margin: 2,
    },
    browser: ['Wacap Docker', 'Chrome', '1.0.0'],
    connectionTimeout: 60000,
    maxRetries: 5,
  });

  // Initialize storage
  await wacapInstance.init();

  console.log(`WacapWrapper initialized with sessions path: ${sessionsPath}`);

  return wacapInstance;
}

/**
 * Get the WacapWrapper instance
 * Throws if not initialized
 */
export function getWacap(): WacapWrapper {
  if (!wacapInstance) {
    throw new Error('WacapWrapper not initialized. Call initWacap() first.');
  }
  return wacapInstance;
}

/**
 * Check if WacapWrapper is initialized
 */
export function isWacapInitialized(): boolean {
  return wacapInstance !== null;
}

/**
 * Get session status from tracking map
 */
export function getSessionStatus(sessionId: string): SessionStatusMap[string] | null {
  return sessionStatusMap[sessionId] || null;
}

/**
 * Update session status in tracking map
 */
export function updateSessionStatus(
  sessionId: string, 
  status: Partial<SessionStatusMap[string]>
): void {
  sessionStatusMap[sessionId] = {
    ...sessionStatusMap[sessionId],
    ...status,
  } as SessionStatusMap[string];
}

/**
 * Remove session from tracking map
 */
export function removeSessionStatus(sessionId: string): void {
  delete sessionStatusMap[sessionId];
}

/**
 * Set Socket.IO instance for real-time updates
 */
export function setSocketIO(io: Server): void {
  socketIoInstance = io;
}

/**
 * Get Socket.IO instance
 */
export function getSocketIO(): Server | null {
  return socketIoInstance;
}

/**
 * Cleanup WacapWrapper instance
 */
export async function destroyWacap(): Promise<void> {
  if (wacapInstance) {
    await wacapInstance.destroy();
    wacapInstance = null;
    console.log('WacapWrapper destroyed');
  }
}

export default {
  initWacap,
  getWacap,
  isWacapInitialized,
  getSessionStatus,
  updateSessionStatus,
  removeSessionStatus,
  setSocketIO,
  getSocketIO,
  destroyWacap,
};
