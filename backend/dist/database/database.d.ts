import Database from 'better-sqlite3';
/**
 * Initialize and return the database instance
 */
export declare function initDatabase(dbPath?: string): Database.Database;
/**
 * Get the current database instance
 * Throws if database is not initialized
 */
export declare function getDatabase(): Database.Database;
/**
 * Close the database connection
 */
export declare function closeDatabase(): void;
/**
 * Reset the database singleton (useful for testing)
 */
export declare function resetDatabase(): void;
declare const _default: {
    initDatabase: typeof initDatabase;
    getDatabase: typeof getDatabase;
    closeDatabase: typeof closeDatabase;
    resetDatabase: typeof resetDatabase;
};
export default _default;
//# sourceMappingURL=database.d.ts.map