"use strict";
/**
 * Phone number formatting utilities for WhatsApp JID conversion
 * Supports: phone numbers, groups (@g.us), linked IDs (@lid), broadcast (@broadcast)
 * Requirements: 4.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidJID = isValidJID;
exports.isGroupJID = isGroupJID;
exports.isLidJID = isLidJID;
exports.isBroadcastJID = isBroadcastJID;
exports.formatPhoneNumber = formatPhoneNumber;
exports.extractPhoneFromJID = extractPhoneFromJID;
exports.getJIDType = getJIDType;
exports.formatForDisplay = formatForDisplay;
/**
 * WhatsApp JID suffixes
 */
const WHATSAPP_USER_SUFFIX = '@s.whatsapp.net';
const WHATSAPP_GROUP_SUFFIX = '@g.us';
const WHATSAPP_LID_SUFFIX = '@lid';
const WHATSAPP_BROADCAST_SUFFIX = '@broadcast';
/**
 * Check if a string is already a valid WhatsApp JID
 */
function isValidJID(input) {
    return (input.endsWith(WHATSAPP_USER_SUFFIX) ||
        input.endsWith(WHATSAPP_GROUP_SUFFIX) ||
        input.endsWith(WHATSAPP_LID_SUFFIX) ||
        input.endsWith(WHATSAPP_BROADCAST_SUFFIX));
}
/**
 * Check if a string is a group JID
 */
function isGroupJID(input) {
    return input.endsWith(WHATSAPP_GROUP_SUFFIX);
}
/**
 * Check if a string is a linked ID (LID)
 */
function isLidJID(input) {
    return input.endsWith(WHATSAPP_LID_SUFFIX);
}
/**
 * Check if a string is a broadcast JID
 */
function isBroadcastJID(input) {
    return input.endsWith(WHATSAPP_BROADCAST_SUFFIX);
}
/**
 * Clean phone number by removing non-digit characters
 */
function cleanPhoneNumber(phone) {
    return phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
}
/**
 * Format Indonesian phone number to international format
 */
function formatIndonesianNumber(phone) {
    const cleaned = cleanPhoneNumber(phone);
    if (cleaned.startsWith('0')) {
        return '62' + cleaned.substring(1);
    }
    if (cleaned.startsWith('62')) {
        return cleaned;
    }
    if (cleaned.startsWith('8') && cleaned.length >= 9 && cleaned.length <= 13) {
        return '62' + cleaned;
    }
    return cleaned;
}
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
function formatPhoneNumber(input) {
    if (!input || typeof input !== 'string') {
        throw new Error('Phone number is required');
    }
    const trimmed = input.trim();
    // === PRIORITY 1: Already has WhatsApp suffix - return as-is ===
    // Check for @lid suffix (linked ID) - MUST CHECK FIRST
    // LID format: 188630735790116@lid
    if (trimmed.endsWith('@lid')) {
        return trimmed;
    }
    // Check for @g.us suffix (group)
    if (trimmed.endsWith('@g.us')) {
        return trimmed;
    }
    // Check for @broadcast suffix
    if (trimmed.endsWith('@broadcast')) {
        return trimmed;
    }
    // Check for @s.whatsapp.net suffix
    if (trimmed.endsWith('@s.whatsapp.net')) {
        return trimmed;
    }
    // === PRIORITY 2: Detect format by pattern ===
    // Check if it looks like a LID (15+ digit number without country code pattern)
    // LIDs are typically 15-18 digits and don't start with common country codes
    const looksLikeLid = /^\d{15,18}$/.test(trimmed) && !trimmed.startsWith('62') && !trimmed.startsWith('1');
    if (looksLikeLid) {
        // Could be LID or group, but if exactly 15-18 digits without hyphen, likely LID
        // For safety, we'll add @lid suffix
        return trimmed + WHATSAPP_LID_SUFFIX;
    }
    // Check for group ID format (long numeric string 18+ digits, possibly with hyphen)
    // Group IDs look like: 120363123456789012 or 120363123456789012-1234567890
    const cleanedForGroup = trimmed.replace(/[^\d-]/g, '');
    const groupIdPattern = /^\d{18,}(-\d+)?$/;
    if (groupIdPattern.test(cleanedForGroup)) {
        return cleanedForGroup + WHATSAPP_GROUP_SUFFIX;
    }
    // === PRIORITY 3: Format as phone number ===
    const formatted = formatIndonesianNumber(trimmed);
    // Validate the result has only digits
    if (!/^\d+$/.test(formatted)) {
        throw new Error('Invalid phone number format');
    }
    // Validate minimum length (country code + number)
    if (formatted.length < 10) {
        throw new Error('Phone number too short');
    }
    // Validate maximum length (phone numbers are max 15 digits per E.164)
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
    if (jid.endsWith(WHATSAPP_LID_SUFFIX)) {
        return jid.replace(WHATSAPP_LID_SUFFIX, '');
    }
    if (jid.endsWith(WHATSAPP_BROADCAST_SUFFIX)) {
        return jid.replace(WHATSAPP_BROADCAST_SUFFIX, '');
    }
    return jid;
}
/**
 * Get JID type
 */
function getJIDType(jid) {
    if (jid.endsWith(WHATSAPP_USER_SUFFIX))
        return 'user';
    if (jid.endsWith(WHATSAPP_GROUP_SUFFIX))
        return 'group';
    if (jid.endsWith(WHATSAPP_LID_SUFFIX))
        return 'lid';
    if (jid.endsWith(WHATSAPP_BROADCAST_SUFFIX))
        return 'broadcast';
    return 'unknown';
}
/**
 * Format phone number for display (add dashes/spaces)
 */
function formatForDisplay(phone) {
    const cleaned = cleanPhoneNumber(phone);
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
    return `+${cleaned}`;
}
exports.default = {
    formatPhoneNumber,
    isValidJID,
    isGroupJID,
    isLidJID,
    isBroadcastJID,
    getJIDType,
    extractPhoneFromJID,
    formatForDisplay,
};
//# sourceMappingURL=phone-utils.js.map