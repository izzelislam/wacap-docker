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
export declare class MessagingService {
    /**
     * Send a text message
     * Requirements: 4.1
     */
    sendText(userId: number, request: SendTextRequest): Promise<SendMessageResponse>;
    /**
     * Send media (image, video, document)
     * Requirements: 4.2
     */
    sendMedia(userId: number, request: SendMediaRequest): Promise<SendMessageResponse>;
    /**
     * Send location message
     * Requirements: 4.4
     */
    sendLocation(userId: number, request: SendLocationRequest): Promise<SendMessageResponse>;
    /**
     * Send contact card (vCard)
     * Requirements: 4.5
     */
    sendContact(userId: number, request: SendContactRequest): Promise<SendMessageResponse>;
}
export declare const messagingService: MessagingService;
//# sourceMappingURL=messaging.service.d.ts.map