import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '../lib/api';

/**
 * Session Store - Manages WhatsApp sessions state with WebSocket integration
 * Requirements: 3.1, 5.4
 */

export interface SessionInfo {
  sessionId: string;
  name: string | null;
  status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
  phoneNumber?: string;
  userName?: string;
  qrCode?: string;
  qrBase64?: string;
  error?: string;
  createdAt: string;
}

interface SessionState {
  sessions: SessionInfo[];
  currentSession: SessionInfo | null;
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
}

interface SessionActions {
  // API actions
  fetchSessions: () => Promise<void>;
  createSession: (sessionId: string, name?: string) => Promise<boolean>;
  stopSession: (sessionId: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  restartSession: (sessionId: string) => Promise<boolean>;
  getQRCode: (sessionId: string) => Promise<{ qr: string; qrBase64: string } | null>;
  
  // State actions
  setCurrentSession: (session: SessionInfo | null) => void;
  clearError: () => void;
  
  // WebSocket actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
}

type SessionStore = SessionState & SessionActions;


const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/sessions');
      
      if (response.data.success) {
        const sessions = response.data.data.sessions;
        set({
          sessions,
          isLoading: false,
        });
        
        // Subscribe to all sessions if WebSocket is connected
        const { socket } = get();
        if (socket?.connected) {
          sessions.forEach((session: SessionInfo) => {
            socket.emit('session:subscribe', session.sessionId);
          });
        }
      } else {
        set({ isLoading: false, error: 'Failed to fetch sessions' });
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
    }
  },

  createSession: async (sessionId: string, name?: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/sessions', { sessionId, name });
      
      if (response.data.success) {
        const newSession = response.data.data.session;
        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSession: newSession,
          isLoading: false,
        }));
        
        // Subscribe to the new session for real-time updates
        get().subscribeToSession(sessionId);
        
        return true;
      }
      
      set({ isLoading: false, error: 'Failed to create session' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  stopSession: async (sessionId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/sessions/${sessionId}/stop`);
      
      if (response.data.success) {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.sessionId === sessionId ? { ...s, status: 'disconnected' as const } : s
          ),
          isLoading: false,
        }));
        return true;
      }
      
      set({ isLoading: false, error: 'Failed to stop session' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },


  deleteSession: async (sessionId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      
      if (response.data.success) {
        // Unsubscribe from the session
        get().unsubscribeFromSession(sessionId);
        
        set((state) => ({
          sessions: state.sessions.filter((s) => s.sessionId !== sessionId),
          currentSession: state.currentSession?.sessionId === sessionId ? null : state.currentSession,
          isLoading: false,
        }));
        return true;
      }
      
      set({ isLoading: false, error: 'Failed to delete session' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  restartSession: async (sessionId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/sessions/${sessionId}/restart`);
      
      if (response.data.success) {
        const updatedSession = response.data.data.session;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.sessionId === sessionId ? updatedSession : s
          ),
          currentSession: state.currentSession?.sessionId === sessionId ? updatedSession : state.currentSession,
          isLoading: false,
        }));
        return true;
      }
      
      set({ isLoading: false, error: 'Failed to restart session' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  getQRCode: async (sessionId: string): Promise<{ qr: string; qrBase64: string } | null> => {
    try {
      const response = await api.get(`/sessions/${sessionId}/qr`);
      
      if (response.data.success) {
        return {
          qr: response.data.data.qr,
          qrBase64: response.data.data.qrBase64,
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  setCurrentSession: (session: SessionInfo | null) => {
    set({ currentSession: session });
  },

  clearError: () => {
    set({ error: null });
  },


  connectWebSocket: () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.warn('[SessionStore] No auth token, cannot connect WebSocket');
      return;
    }

    // Don't reconnect if already connected
    if (get().socket?.connected) {
      return;
    }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[SessionStore] WebSocket connected');
      set({ isConnected: true });
      
      // Subscribe to all existing sessions
      get().sessions.forEach((session) => {
        socket.emit('session:subscribe', session.sessionId);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('[SessionStore] WebSocket disconnected:', reason);
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('[SessionStore] WebSocket connection error:', error);
      set({ isConnected: false });
    });

    // Handle QR code events
    socket.on('session:qr', (data: { sessionId: string; qr: string; qrBase64: string }) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: 'qr' as const, qrCode: data.qr, qrBase64: data.qrBase64 }
            : s
        ),
        currentSession: state.currentSession?.sessionId === data.sessionId
          ? { ...state.currentSession, status: 'qr' as const, qrCode: data.qr, qrBase64: data.qrBase64 }
          : state.currentSession,
      }));
    });

    // Handle status updates
    socket.on('session:status', (data: { sessionId: string; status: SessionInfo['status']; error?: string }) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: data.status, error: data.error }
            : s
        ),
        currentSession: state.currentSession?.sessionId === data.sessionId
          ? { ...state.currentSession, status: data.status, error: data.error }
          : state.currentSession,
      }));
    });

    // Handle connected events
    socket.on('session:connected', (data: { sessionId: string; phoneNumber?: string; userName?: string }) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: 'connected' as const, phoneNumber: data.phoneNumber, userName: data.userName, qrCode: undefined, qrBase64: undefined }
            : s
        ),
        currentSession: state.currentSession?.sessionId === data.sessionId
          ? { ...state.currentSession, status: 'connected' as const, phoneNumber: data.phoneNumber, userName: data.userName, qrCode: undefined, qrBase64: undefined }
          : state.currentSession,
      }));
    });

    // Handle disconnected events
    socket.on('session:disconnected', (data: { sessionId: string; error?: string }) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: 'disconnected' as const, error: data.error }
            : s
        ),
        currentSession: state.currentSession?.sessionId === data.sessionId
          ? { ...state.currentSession, status: 'disconnected' as const, error: data.error }
          : state.currentSession,
      }));
    });

    // Handle error events
    socket.on('session:error', (data: { sessionId: string; error: string }) => {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.sessionId === data.sessionId
            ? { ...s, status: 'error' as const, error: data.error }
            : s
        ),
        currentSession: state.currentSession?.sessionId === data.sessionId
          ? { ...state.currentSession, status: 'error' as const, error: data.error }
          : state.currentSession,
      }));
    });

    set({ socket });
  },

  disconnectWebSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  subscribeToSession: (sessionId: string) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('session:subscribe', sessionId);
    }
  },

  unsubscribeFromSession: (sessionId: string) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('session:unsubscribe', sessionId);
    }
  },
}));

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosError.response?.data?.error?.message || 'An error occurred';
  }
  return 'An error occurred';
}

export default useSessionStore;
