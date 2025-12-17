/**
 * Phone number formatting utilities for WhatsApp JID conversion
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
 * Format phone number to WhatsApp JID format
 *
 * Handles various input formats:
 * - 08xxx (Indonesian local) -> 628xxx@s.whatsapp.net
 * - 62xxx (Indonesian international) -> 62xxx@s.whatsapp.net
 * - +62xxx (with plus) -> 62xxx@s.whatsapp.net
 * - 08xx-xxxx-xxxx (with dashes) -> 628xxxxxxxxx@s.whatsapp.net
 * - 08xx xxxx xxxx (with spaces) -> 628xxxxxxxxx@s.whatsapp.net
 * - Already valid JID -> returns as-is
 * - Group JID -> returns as-is
 *
 * Requirements: 4.1
 */
export declare function formatPhoneNumber(input: string): string;
/**
 * Extract phone number from JID
 */
export declare function extractPhoneFromJID(jid: string): string | null;
/**
 * Format phone number for display (add dashes/spaces)
 */
export declare function formatForDisplay(phone: string): string;
declare const _default: {
    formatPhoneNumber: typeof formatPhoneNumber;
    isValidJID: typeof isValidJID;
    isGroupJID: typeof isGroupJID;
    extractPhoneFromJID: typeof extractPhoneFromJID;
    formatForDisplay: typeof formatForDisplay;
};
export default _default;
//# sourceMappingURL=phone-utils.d.ts.map