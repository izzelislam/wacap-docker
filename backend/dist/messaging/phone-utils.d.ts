/**
 * Phone number formatting utilities for WhatsApp JID conversion
 * Supports: phone numbers, groups (@g.us), linked IDs (@lid), broadcast (@broadcast)
 * Requirements: 4.1
 */
/**
 * Check if a string is already a valid WhatsApp JID
 */
export declare function isValidJID(input: string): boolean;
/**
 * Check if a string is a group JID
 */
export declare function isGroupJID(input: string): boolean;
/**
 * Check if a string is a linked ID (LID)
 */
export declare function isLidJID(input: string): boolean;
/**
 * Check if a string is a broadcast JID
 */
export declare function isBroadcastJID(input: string): boolean;
/**
 * Format phone number to WhatsApp JID format
 *
 * Supports multiple input formats:
 *
 * PHONE NUMBERS:
 * - 08xxx (Indonesian local) -> 628xxx@s.whatsapp.net
 * - 62xxx (Indonesian international) -> 62xxx@s.whatsapp.net
 * - +62xxx (with plus) -> 62xxx@s.whatsapp.net
 * - 08xx-xxxx-xxxx (with dashes) -> 628xxxxxxxxx@s.whatsapp.net
 *
 * GROUPS:
 * - 120363xxx@g.us -> returns as-is
 * - 120363xxx (group ID without suffix) -> 120363xxx@g.us
 *
 * LINKED IDs (LID):
 * - 188630735790116@lid -> returns as-is
 * - Useful for business accounts and linked devices
 *
 * BROADCAST:
 * - status@broadcast -> returns as-is
 *
 * Requirements: 4.1
 */
export declare function formatPhoneNumber(input: string): string;
/**
 * Extract phone number from JID
 */
export declare function extractPhoneFromJID(jid: string): string | null;
/**
 * Get JID type
 */
export declare function getJIDType(jid: string): 'user' | 'group' | 'lid' | 'broadcast' | 'unknown';
/**
 * Format phone number for display (add dashes/spaces)
 */
export declare function formatForDisplay(phone: string): string;
declare const _default: {
    formatPhoneNumber: typeof formatPhoneNumber;
    isValidJID: typeof isValidJID;
    isGroupJID: typeof isGroupJID;
    isLidJID: typeof isLidJID;
    isBroadcastJID: typeof isBroadcastJID;
    getJIDType: typeof getJIDType;
    extractPhoneFromJID: typeof extractPhoneFromJID;
    formatForDisplay: typeof formatForDisplay;
};
export default _default;
//# sourceMappingURL=phone-utils.d.ts.map