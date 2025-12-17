"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWacap = initWacap;
exports.getWacap = getWacap;
exports.isWacapInitialized = isWacapInitialized;
exports.getSessionStatus = getSessionStatus;
exports.updateSessionStatus = updateSessionStatus;
exports.removeSessionStatus = removeSessionStatus;
exports.setSocketIO = setSocketIO;
exports.getSocketIO = getSocketIO;
exports.destroyWacap = destroyWacap;
const wacap_wrapper_1 = require("@pakor/wacap-wrapper");
const path_1 = __importDefault(require("path"));
/**
 * Global WacapWrapper instance
 * Requirements: 3.1, 3.2
 */
let wacapInstance = null;
let socketIoInstance = null;
const sessionStatusMap = {};
/**
 * Get the sessions path from environment or default
 */
function getSessionsPath() {
    const dataDir = process.env.DATA_DIR || path_1.default.join(process.cwd(), 'data');
    return process.env.SESSIONS_PATH || path_1.default.join(dataDir, 'sessions');
}
/**
 * Initialize the WacapWrapper with SQLite storage and base64 QR format
 * Requirements: 3.1, 3.2
 *
 * Note: Event handlers for WebSocket forwarding are now setup separately
 * via setupWacapEventHandlers() in websocket/websocket.events.ts
 */
async function initWacap(io) {
    if (wacapInstance) {
        return wacapInstance;
    }
    if (io) {
        socketIoInstance = io;
    }
    const sessionsPath = getSessionsPath();
    wacapInstance = new wacap_wrapper_1.WacapWrapper({
        sessionsPath,
        storageAdapter: 'sqlite',
        debug: process.env.NODE_ENV !== 'production',
        qrCode: {
            format: 'base64', // Use base64 for web display
            width: 300,
            margin: 2,
        },
        browser: ['Wacap Docker', 'Chrome', '1.0.0'],
        connectionTimeout: 60000,
        maxRetries: 5,
    });
    // Initialize storage
    await wacapInstance.init();
    console.log(`WacapWrapper initialized with sessions path: ${sessionsPath}`);
    return wacapInstance;
}
/**
 * Get the WacapWrapper instance
 * Throws if not initialized
 */
function getWacap() {
    if (!wacapInstance) {
        throw new Error('WacapWrapper not initialized. Call initWacap() first.');
    }
    return wacapInstance;
}
/**
 * Check if WacapWrapper is initialized
 */
function isWacapInitialized() {
    return wacapInstance !== null;
}
/**
 * Get session status from tracking map
 */
function getSessionStatus(sessionId) {
    return sessionStatusMap[sessionId] || null;
}
/**
 * Update session status in tracking map
 */
function updateSessionStatus(sessionId, status) {
    sessionStatusMap[sessionId] = {
        ...sessionStatusMap[sessionId],
        ...status,
    };
}
/**
 * Remove session from tracking map
 */
function removeSessionStatus(sessionId) {
    delete sessionStatusMap[sessionId];
}
/**
 * Set Socket.IO instance for real-time updates
 */
function setSocketIO(io) {
    socketIoInstance = io;
}
/**
 * Get Socket.IO instance
 */
function getSocketIO() {
    return socketIoInstance;
}
/**
 * Cleanup WacapWrapper instance
 */
async function destroyWacap() {
    if (wacapInstance) {
        await wacapInstance.destroy();
        wacapInstance = null;
        console.log('WacapWrapper destroyed');
    }
}
exports.default = {
    initWacap,
    getWacap,
    isWacapInitialized,
    getSessionStatus,
    updateSessionStatus,
    removeSessionStatus,
    setSocketIO,
    getSocketIO,
    destroyWacap,
};
//# sourceMappingURL=wacap.js.map