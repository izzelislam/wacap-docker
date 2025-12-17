import { User, UserPublic, CreateUserInput } from '../types';
/**
 * Repository for user data access operations
 */
export declare class UserRepository {
    /**
     * Create a new user
     */
    create(input: CreateUserInput): User;
    /**
     * Find a user by email address
     */
    findByEmail(email: string): User | null;
    /**
     * Find a user by ID
     */
    findById(id: number): User | null;
    /**
     * Update user's updated_at timestamp
     */
    touch(id: number): boolean;
    /**
     * Update user's password hash
     */
    updatePassword(id: number, passwordHash: string): boolean;
    /**
     * Delete a user by ID
     */
    delete(id: number): boolean;
    /**
     * Check if email already exists
     */
    emailExists(email: string): boolean;
    /**
     * Get user without sensitive data
     */
    toPublic(user: User): UserPublic;
}
//# sourceMappingURL=UserRepository.d.ts.map