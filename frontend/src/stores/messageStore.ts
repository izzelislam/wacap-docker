import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '../lib/api';

/**
 * Message Store - Manages incoming messages with WebSocket integration
 * Requirements: 5.1
 */

export interface MessageData {
  id: string;
  sessionId: string;
  from: string;
  to?: string;
  body: string;
  messageType: string;
  timestamp: number;
  isFromMe: boolean;
}

export interface SendTextRequest {
  sessionId: string;
  to: string;
  message: string;
  mentions?: string[];
}

export interface SendMediaRequest {
  sessionId: string;
  to: string;
  url?: string;
  base64?: string;
  mimetype: string;
  caption?: string;
  fileName?: string;
}

export interface SendLocationRequest {
  sessionId: string;
  to: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface SendContactRequest {
  sessionId: string;
  to: string;
  contact: {
    fullName: string;
    phoneNumber: string;
    organization?: string;
  };
}


interface MessageState {
  messages: MessageData[];
  isLoading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
}

interface MessageActions {
  // API actions
  sendText: (request: SendTextRequest) => Promise<boolean>;
  sendMedia: (request: SendMediaRequest) => Promise<boolean>;
  sendLocation: (request: SendLocationRequest) => Promise<boolean>;
  sendContact: (request: SendContactRequest) => Promise<boolean>;
  
  // State actions
  clearMessages: () => void;
  clearError: () => void;
  getMessagesBySession: (sessionId: string) => MessageData[];
  
  // WebSocket actions
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  subscribeToSession: (sessionId: string) => void;
  unsubscribeFromSession: (sessionId: string) => void;
}

type MessageStore = MessageState & MessageActions;

const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin;
const MAX_MESSAGES = 500; // Limit stored messages to prevent memory issues

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  socket: null,
  isConnected: false,

  sendText: async (request: SendTextRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/send/text', request);
      
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false, error: response.data.error?.message || 'Failed to send message' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  sendMedia: async (request: SendMediaRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/send/media', request);
      
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false, error: response.data.error?.message || 'Failed to send media' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  sendLocation: async (request: SendLocationRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/send/location', request);
      
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false, error: response.data.error?.message || 'Failed to send location' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  sendContact: async (request: SendContactRequest): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/send/contact', request);
      
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false, error: response.data.error?.message || 'Failed to send contact' });
      return false;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },

  getMessagesBySession: (sessionId: string): MessageData[] => {
    return get().messages.filter((m) => m.sessionId === sessionId);
  },

  connectWebSocket: () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.warn('[MessageStore] No auth token, cannot connect WebSocket');
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
      console.log('[MessageStore] WebSocket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', (reason) => {
      console.log('[MessageStore] WebSocket disconnected:', reason);
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('[MessageStore] WebSocket connection error:', error);
      set({ isConnected: false });
    });

    // Handle incoming messages
    socket.on('message:received', (data: { sessionId: string; message: Omit<MessageData, 'sessionId'> }) => {
      const newMessage: MessageData = {
        ...data.message,
        sessionId: data.sessionId,
      };

      set((state) => {
        // Add new message and limit total messages
        const updatedMessages = [...state.messages, newMessage];
        if (updatedMessages.length > MAX_MESSAGES) {
          return { messages: updatedMessages.slice(-MAX_MESSAGES) };
        }
        return { messages: updatedMessages };
      });
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
      console.log('[MessageStore] Subscribed to session:', sessionId);
    }
  },

  unsubscribeFromSession: (sessionId: string) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit('session:unsubscribe', sessionId);
      console.log('[MessageStore] Unsubscribed from session:', sessionId);
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

export default useMessageStore;
