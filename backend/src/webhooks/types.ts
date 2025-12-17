/**
 * Webhook configuration types
 */

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
  user_id: number;
  session_id: string;
  url: string;
  secret: string | null;
  events: WebhookEventType[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookConfigPublic {
  id: number;
  session_id: string;
  url: string;
  events: WebhookEventType[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookInput {
  user_id: number;
  session_id: string;
  url: string;
  secret?: string;
  events: WebhookEventType[];
}

export interface UpdateWebhookInput {
  url?: string;
  secret?: string;
  events?: WebhookEventType[];
  is_active?: boolean;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: number;
  sessionId: string;
  data: Record<string, unknown>;
}
