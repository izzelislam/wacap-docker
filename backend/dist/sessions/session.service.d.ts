/**
 * Extended session info with user association
 */
export interface SessionInfoExtended {
    id: number;
    userId: number;
    sessionId: string;
    name: string | null;
    createdAt: string;
    status: 'disconnected' | 'connecting' | 'qr' | 'connected' | 'error';
    phoneNumber?: string;
    userName?: string;
    qrCode?: string;
    qrBase64?: string;
    error?: string;
}
/**
 * Service for WhatsApp session operations
 * Requirements: 3.1, 3.4, 3.5
 */
export declare class SessionService {
    private repository;
    constructor();
    /**
     * Create a new WhatsApp session for a user
     * Requirements: 3.1
     */
    create(userId: number, sessionId: string, name?: string): Promise<SessionInfoExtended>;
    /**
     * List all sessions for a user
     * Requirements: 3.1
     */
    list(userId: number): SessionInfoExtended[];
    /**
     * Get a specific session for a user
     */
    get(userId: number, sessionId: string): SessionInfoExtended | null;
    /**
     * Stop a session (disconnect without logout, preserves credentials)
     * Requirements: 3.4
     */
    stop(userId: number, sessionId: string): Promise<boolean>;
    /**
     * Delete a session (logout from WhatsApp and remove all data)
     * Requirements: 3.5
     */
    delete(userId: number, sessionId: string): Promise<boolean>;
    /**
     * Get QR code for a session
     * Requirements: 3.2
     */
    getQR(userId: number, sessionId: string): {
        qr?: string;
        qrBase64?: string;
    } | null;
    /**
     * Restart a session (reconnect with existing credentials)
     * Requirements: 3.6
     */
    restart(userId: number, sessionId: string): Promise<SessionInfoExtended | null>;
    /**
     * Update session name
     */
    updateName(userId: number, sessionId: string, name: string | null): boolean;
    /**
     * Check if a session belongs to a user
     */
    belongsToUser(userId: number, sessionId: string): boolean;
    /**
     * Get session owner user ID
     */
    getOwner(sessionId: string): number | null;
}
export declare const sessionService: SessionService;
//# sourceMappingURL=session.service.d.ts.map