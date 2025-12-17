import { create } from 'zustand';
import api from '../lib/api';

export type WebhookEventType =
  | 'message.received'
  | 'message.sent'
  | 'session.connected'
  | 'session.disconnected'
  | 'session.qr'
  | 'typing.start'
  | 'typing.stop'
  | 'presence.update';

export interface WebhookConfig {
  id: number;
  session_id: string;
  url: string;
  events: WebhookEventType[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookEventInfo {
  type: WebhookEventType;
  description: string;
}

interface WebhookState {
  webhooks: Map<string, WebhookConfig>; // sessionId -> webhook
  availableEvents: WebhookEventInfo[];
  isLoading: boolean;
  error: string | null;
}

interface WebhookActions {
  fetchWebhookBySession: (sessionId: string) => Promise<void>;
  fetchAllWebhooks: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  createWebhook: (sessionId: string, url: string, events: WebhookEventType[], secret?: string) => Promise<boolean>;
  updateWebhook: (id: number, data: Partial<{ url: string; events: WebhookEventType[]; secret: string; is_active: boolean }>) => Promise<boolean>;
  deleteWebhook: (id: number, sessionId: string) => Promise<boolean>;
  getWebhookBySession: (sessionId: string) => WebhookConfig | null;
  clearError: () => void;
}

type WebhookStore = WebhookState & WebhookActions;

export const useWebhookStore = create<WebhookStore>((set, get) => ({
  webhooks: new Map(),
  availableEvents: [],
  isLoading: false,
  error: null,

  fetchWebhookBySession: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/webhooks/session/${sessionId}`);
      if (response.data.success) {
        const webhook = response.data.data.webhook;
        set((state) => {
          const newWebhooks = new Map(state.webhooks);
          if (webhook) {
            newWebhooks.set(sessionId, webhook);
          } else {
            newWebhooks.delete(sessionId);
          }
          return { webhooks: newWebhooks, isLoading: false };
        });
      } else {
        set({ isLoading: false, error: 'Failed to fetch webhook' });
      }
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  fetchAllWebhooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/webhooks/list');
      if (response.data.success) {
        const webhooksList = response.data.data.webhooks as WebhookConfig[];
        const newWebhooks = new Map<string, WebhookConfig>();
        webhooksList.forEach((w) => newWebhooks.set(w.session_id, w));
        set({ webhooks: newWebhooks, isLoading: false });
      } else {
        set({ isLoading: false, error: 'Failed to fetch webhooks' });
      }
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  fetchEvents: async () => {
    try {
      const response = await api.get('/webhooks/events');
      if (response.data.success) {
        set({ availableEvents: response.data.data.events });
      }
    } catch (error) {
      console.error('Failed to fetch webhook events:', error);
    }
  },

  createWebhook: async (sessionId, url, events, secret) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/webhooks', { sessionId, url, events, secret });
      if (response.data.success) {
        const webhook = response.data.data.webhook;
        set((state) => {
          const newWebhooks = new Map(state.webhooks);
          newWebhooks.set(sessionId, webhook);
          return { webhooks: newWebhooks, isLoading: false };
        });
        return true;
      }
      set({ isLoading: false, error: response.data.error?.message || 'Failed to create webhook' });
      return false;
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return false;
    }
  },

  updateWebhook: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/webhooks/${id}`, data);
      if (response.data.success) {
        const webhook = response.data.data.webhook;
        set((state) => {
          const newWebhooks = new Map(state.webhooks);
          newWebhooks.set(webhook.session_id, webhook);
          return { webhooks: newWebhooks, isLoading: false };
        });
        return true;
      }
      set({ isLoading: false, error: response.data.error?.message || 'Failed to update webhook' });
      return false;
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return false;
    }
  },

  deleteWebhook: async (id, sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/webhooks/${id}`);
      if (response.data.success) {
        set((state) => {
          const newWebhooks = new Map(state.webhooks);
          newWebhooks.delete(sessionId);
          return { webhooks: newWebhooks, isLoading: false };
        });
        return true;
      }
      set({ isLoading: false, error: response.data.error?.message || 'Failed to delete webhook' });
      return false;
    } catch (error: unknown) {
      set({ isLoading: false, error: getErrorMessage(error) });
      return false;
    }
  },

  getWebhookBySession: (sessionId: string) => {
    return get().webhooks.get(sessionId) || null;
  },

  clearError: () => set({ error: null }),
}));

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
    return axiosError.response?.data?.error?.message || 'An error occurred';
  }
  return 'An error occurred';
}

export default useWebhookStore;
