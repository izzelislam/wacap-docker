import crypto from 'crypto';
import { webhookRepository, WebhookRepository } from './webhook.repository';
import {
  WebhookConfig,
  WebhookConfigPublic,
  UpdateWebhookInput,
  WebhookEventType,
  WebhookPayload,
} from './types';

/**
 * Service for webhook operations (per-session)
 */
export class WebhookService {
  private repository: WebhookRepository;

  constructor() {
    this.repository = webhookRepository;
  }

  /**
   * Create a new webhook configuration for a session
   */
  create(
    userId: number,
    sessionId: string,
    url: string,
    events: WebhookEventType[],
    secret?: string
  ): WebhookConfigPublic {
    const webhook = this.repository.create({
      user_id: userId,
      session_id: sessionId,
      url,
      events,
      secret,
    });
    return this.toPublic(webhook);
  }

  /**
   * Get webhook configuration for a session
   */
  getBySessionId(sessionId: string): WebhookConfigPublic | null {
    const webhook = this.repository.findBySessionId(sessionId);
    return webhook ? this.toPublic(webhook) : null;
  }

  /**
   * List all webhooks for user
   */
  list(userId: number): WebhookConfigPublic[] {
    const webhooks = this.repository.listByUserId(userId);
    return webhooks.map((w) => this.toPublic(w));
  }

  /**
   * Update webhook configuration
   */
  update(id: number, userId: number, input: UpdateWebhookInput): WebhookConfigPublic | null {
    const webhook = this.repository.update(id, userId, input);
    return webhook ? this.toPublic(webhook) : null;
  }

  /**
   * Delete webhook configuration
   */
  delete(id: number, userId: number): boolean {
    return this.repository.delete(id, userId);
  }

  /**
   * Delete webhook by session ID
   */
  deleteBySessionId(sessionId: string, userId: number): boolean {
    return this.repository.deleteBySessionId(sessionId, userId);
  }

  /**
   * Trigger webhook for an event (per-session)
   */
  async trigger(
    event: WebhookEventType,
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const webhooks = this.repository.listActiveByEventAndSession(event, sessionId);

    if (webhooks.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      sessionId,
      data,
    };

    // Send to all matching webhooks for this session
    await Promise.allSettled(webhooks.map((webhook) => this.sendWebhook(webhook, payload)));
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(webhook: WebhookConfig, payload: WebhookPayload): Promise<void> {
    try {
      const body = JSON.stringify(payload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp.toString(),
        'X-Webhook-Session': payload.sessionId,
      };

      // Add signature if secret is configured
      if (webhook.secret) {
        const signature = this.generateSignature(body, webhook.secret);
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        console.error(`[Webhook] Failed to send to ${webhook.url}: ${response.status}`);
      } else {
        console.log(`[Webhook] Sent ${payload.event} to ${webhook.url} for session ${payload.sessionId}`);
      }
    } catch (error) {
      console.error(`[Webhook] Error sending to ${webhook.url}:`, error);
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Convert to public format (hide secret)
   */
  private toPublic(webhook: WebhookConfig): WebhookConfigPublic {
    return {
      id: webhook.id,
      session_id: webhook.session_id,
      url: webhook.url,
      events: webhook.events,
      is_active: webhook.is_active,
      created_at: webhook.created_at,
      updated_at: webhook.updated_at,
    };
  }
}

export const webhookService = new WebhookService();
