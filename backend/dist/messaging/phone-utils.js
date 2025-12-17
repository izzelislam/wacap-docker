"use strict";
/**
 * Phone number formatting utilities for WhatsApp JID conversion
 * Requirements: 4.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJID = isValidJID;
exports.isGroupJID = isGroupJID;
exports.formatPhoneNumber = formatPhoneNumber;
exports.extractPhoneFromJID = extractPhoneFromJID;
exports.formatForDisplay = formatForDisplay;
/**
 * WhatsApp JID suffixes
 */
const WHATSAPP_USER_SUFFIX = '@s.whatsapp.net';
const WHATSAPP_GROUP_SUFFIX = '@g.us';
/**
 * Check if a string is already a valid WhatsApp JID
 */
function isValidJID(input) {
    return input.endsWith(WHATSAPP_USER_SUFFIX) || input.endsWith(WHATSAPP_GROUP_SUFFIX);
}
/**
 * Check if a string is a group JID
 */
function isGroupJID(input) {
    // Group JIDs end with @g.us or contain a hyphen followed by numbers (group ID format)
    if (input.endsWith(WHATSAPP_GROUP_SUFFIX)) {
        return true;
    }
    // Group IDs typically look like: 120363123456789012@g.us or contain timestamp-based IDs
    const groupIdPattern = /^\d{10,}(-\d+)?$/;
    return groupIdPattern.test(input.replace(WHATSAPP_GROUP_SUFFIX, ''));
}
/**
 * Clean phone number by removing non-digit characters
 */
function cleanPhoneNumber(phone) {
    // Remove all non-digit characters except leading +
    return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}
/**
 * Format Indonesian phone number to international format
 * Handles: 08xxx -> 628xxx, 62xxx -> 62xxx, +62xxx -> 62xxx
 */
function formatIndonesianNumber(phone) {
    const cleaned = cleanPhoneNumber(phone);
    // If starts with 0, replace with 62 (Indonesian country code)
    if (cleaned.startsWith('0')) {
        return '62' + cleaned.substring(1);
    }
    // If starts with 62, it's already in international format
    if (cleaned.startsWith('62')) {
        return cleaned;
    }
    // For other numbers, assume they need 62 prefix if they look like local numbers
    // Indonesian mobile numbers are typically 10-13 digits starting with 8
    if (cleaned.startsWith('8') && cleaned.length >= 9 && cleaned.length <= 13) {
        return '62' + cleaned;
    }
    // Return as-is for international numbers
    return cleaned;
}
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
function formatPhoneNumber(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Phone number is required');
    }
    const trimmed = input.trim();
    // If already a valid JID, return as-is
    if (isValidJID(trimmed)) {
        return trimmed;
    }
    // Check if it's a group ID (contains @g.us pattern or looks like a group ID)
    if (trimmed.includes('@g.us')) {
        return trimmed;
    }
    // Check for group ID format (long numeric string, possibly with hyphen)
    const groupIdPattern = /^\d{15,}(-\d+)?$/;
    if (groupIdPattern.test(trimmed.replace(/[^\d-]/g, ''))) {
        return trimmed.replace(/[^\d-]/g, '') + WHATSAPP_GROUP_SUFFIX;
    }
    // Format as phone number
    const formatted = formatIndonesianNumber(trimmed);
    // Validate the result has only digits
    if (!/^\d+$/.test(formatted)) {
        throw new Error('Invalid phone number format');
    }
    // Validate minimum length (country code + number)
    if (formatted.length < 10) {
        throw new Error('Phone number too short');
    }
    // Validate maximum length
    if (formatted.length > 15) {
        throw new Error('Phone number too long');
    }
    return formatted + WHATSAPP_USER_SUFFIX;
}
/**
 * Extract phone number from JID
 */
function extractPhoneFromJID(jid) {
    if (!jid)
        return null;
    if (jid.endsWith(WHATSAPP_USER_SUFFIX)) {
        return jid.replace(WHATSAPP_USER_SUFFIX, '');
    }
    if (jid.endsWith(WHATSAPP_GROUP_SUFFIX)) {
        return jid.replace(WHATSAPP_GROUP_SUFFIX, '');
    }
    return jid;
}
/**
 * Format phone number for display (add dashes/spaces)
 */
function formatForDisplay(phone) {
    const cleaned = cleanPhoneNumber(phone);
    // Indonesian format: +62 xxx-xxxx-xxxx
    if (cleaned.startsWith('62') && cleaned.length >= 11) {
        const countryCode = cleaned.substring(0, 2);
        const rest = cleaned.substring(2);
        if (rest.length <= 4) {
            return `+${countryCode} ${rest}`;
        }
        else if (rest.length <= 8) {
            return `+${countryCode} ${rest.substring(0, 3)}-${rest.substring(3)}`;
        }
        else {
            return `+${countryCode} ${rest.substring(0, 3)}-${rest.substring(3, 7)}-${rest.substring(7)}`;
        }
    }
    // Generic international format
    return `+${cleaned}`;
}
exports.default = {
    formatPhoneNumber,
    isValidJID,
    isGroupJID,
    extractPhoneFromJID,
    formatForDisplay,
};
//# sourceMappingURL=phone-utils.js.map