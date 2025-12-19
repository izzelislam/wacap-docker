import { UserSession, CreateUserSessionInput } from '../types';
/**
 * Repository for user session (WhatsApp session ownership) data access operations
 */
export declare class UserSessionRepository {
    /**
     * Create a new user session mapping
     */
    create(input: CreateUserSessionInput): UserSession;
    /**
     * Find a user session by ID
     */
    findById(id: number): UserSession | null;
    /**
     * Find a user session by session ID
     */
    findBySessionId(sessionId: string): UserSession | null;
    /**
     * List all sessions for a user
     */
    list(userId: number): UserSession[];
    /**
     * List all sessions (for admin/system use)
     */
    listAll(): UserSession[];
    /**
     * Delete a user session by session ID
     */
    delete(userId: number, sessionId: string): boolean;
    /**
     * Delete a user session by ID
     */
    deleteById(userId: number, id: number): boolean;
    /**
     * Update session name
     */
    updateName(userId: number, sessionId: string, name: string | null): boolean;
    /**
     * Check if a session belongs to a user
     */
    belongsToUser(userId: number, sessionId: string): boolean;
    /**
     * Check if a session ID already exists
     */
    sessionExists(sessionId: string): boolean;
    /**
     * Get the user ID that owns a session
     */
    getOwner(sessionId: string): number | null;
}
//# sourceMappingURL=UserSessionRepository.d.ts.map