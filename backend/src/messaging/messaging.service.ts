import { getWacap } from '../sessions/wacap';
import { sessionService } from '../sessions/session.service';
import { formatPhoneNumber } from './phone-utils';

/**
 * Request interfaces for messaging operations
 */
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

export interface SendPresenceRequest {
  sessionId: string;
  to?: string;
  presence: 'available' | 'unavailable' | 'composing' | 'recording' | 'paused';
}

export interface MarkAsReadRequest {
  sessionId: string;
  to: string;
  messageIds: string[];
}

/**
 * Response interface for send operations
 */
export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Messaging service for WhatsApp message operations
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export class MessagingService {
  /**
   * Send a text message
   * Requirements: 4.1
   */
  async sendText(userId: number, request: SendTextRequest): Promise<SendMessageResponse> {
    const { sessionId, to, message, mentions } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Format phone number to JID
    let jid: string;
    try {
      jid = formatPhoneNumber(to);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }

    try {
      const wacap = getWacap();
      
      // Format mentions if provided
      const formattedMentions = mentions?.map((m) => formatPhoneNumber(m));

      const result = await wacap.send.text(sessionId, jid, message, {
        mentions: formattedMentions,
      });

      return {
        success: true,
        messageId: result?.key?.id,
        timestamp: result?.messageTimestamp as number,
      };
    } catch (error) {
      console.error('Send text error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  /**
   * Send media (image, video, document)
   * Requirements: 4.2
   */
  async sendMedia(userId: number, request: SendMediaRequest): Promise<SendMessageResponse> {
    const { sessionId, to, url, base64, mimetype, caption, fileName } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Validate media source
    if (!url && !base64) {
      return {
        success: false,
        error: 'Either url or base64 must be provided',
      };
    }

    // Format phone number to JID
    let jid: string;
    try {
      jid = formatPhoneNumber(to);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }

    try {
      const wacap = getWacap();

      let result;

      if (url) {
        // Send from URL
        result = await wacap.send.media(sessionId, jid, {
          url,
          mimetype,
          caption,
          fileName,
        });
      } else if (base64) {
        // Send from base64
        // Convert base64 to buffer
        const buffer = Buffer.from(base64, 'base64');
        
        result = await wacap.send.media(sessionId, jid, {
          buffer,
          mimetype,
          caption,
          fileName,
        });
      }

      return {
        success: true,
        messageId: result?.key?.id,
        timestamp: result?.messageTimestamp as number,
      };
    } catch (error) {
      console.error('Send media error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send media',
      };
    }
  }

  /**
   * Send location message
   * Requirements: 4.4
   */
  async sendLocation(userId: number, request: SendLocationRequest): Promise<SendMessageResponse> {
    const { sessionId, to, latitude, longitude, name, address } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      return {
        success: false,
        error: 'Invalid latitude. Must be between -90 and 90',
      };
    }

    if (longitude < -180 || longitude > 180) {
      return {
        success: false,
        error: 'Invalid longitude. Must be between -180 and 180',
      };
    }

    // Format phone number to JID
    let jid: string;
    try {
      jid = formatPhoneNumber(to);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }

    try {
      const wacap = getWacap();

      const result = await wacap.send.location(sessionId, jid, latitude, longitude, {
        name,
        address,
      });

      return {
        success: true,
        messageId: result?.key?.id,
        timestamp: result?.messageTimestamp as number,
      };
    } catch (error) {
      console.error('Send location error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send location',
      };
    }
  }

  /**
   * Send contact card (vCard)
   * Requirements: 4.5
   */
  async sendContact(userId: number, request: SendContactRequest): Promise<SendMessageResponse> {
    const { sessionId, to, contact } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Validate contact info
    if (!contact.fullName || !contact.phoneNumber) {
      return {
        success: false,
        error: 'Contact fullName and phoneNumber are required',
      };
    }

    // Format phone number to JID
    let jid: string;
    try {
      jid = formatPhoneNumber(to);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }

    try {
      const wacap = getWacap();

      // Use the send.contact API with name and phone
      const result = await wacap.send.contact(sessionId, jid, {
        name: contact.fullName,
        phone: contact.phoneNumber,
      });

      return {
        success: true,
        messageId: result?.key?.id,
        timestamp: result?.messageTimestamp as number,
      };
    } catch (error) {
      console.error('Send contact error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send contact',
      };
    }
  }

  /**
   * Send presence update (typing, recording, online, offline)
   */
  async sendPresence(userId: number, request: SendPresenceRequest): Promise<SendMessageResponse> {
    const { sessionId, to, presence } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Format phone number to JID if provided
    let jid: string | null = null;
    if (to) {
      try {
        jid = formatPhoneNumber(to);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Invalid phone number',
        };
      }
    }

    try {
      const wacap = getWacap();
      await wacap.presence.update(sessionId, jid, presence);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Send presence error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send presence',
      };
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(userId: number, request: MarkAsReadRequest): Promise<SendMessageResponse> {
    const { sessionId, to, messageIds } = request;

    // Verify session ownership and get session info
    const session = sessionService.get(userId, sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session not found or access denied',
      };
    }

    // Check if session is connected
    if (session.status !== 'connected') {
      return {
        success: false,
        error: `Session is not connected. Current status: ${session.status}`,
      };
    }

    // Format phone number to JID
    let jid: string;
    try {
      jid = formatPhoneNumber(to);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid phone number',
      };
    }

    try {
      const wacap = getWacap();
      await wacap.chat.markAsRead(sessionId, jid, messageIds);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
      };
    }
  }
}

// Export singleton instance
export const messagingService = new MessagingService();
