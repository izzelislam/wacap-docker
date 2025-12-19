"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const database_1 = require("./database");
const auth_1 = require("./auth");
const device_tokens_1 = require("./device-tokens");
const sessions_1 = require("./sessions");
const session_manager_1 = require("./sessions/session-manager");
const messaging_1 = require("./messaging");
const websocket_1 = require("./websocket");
const health_1 = require("./health");
const docs_1 = require("./docs");
const webhooks_1 = require("./webhooks");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
exports.io = io;
// Initialize database
(0, database_1.initDatabase)();
// Setup WebSocket with authentication
(0, websocket_1.setupWebSocket)(io);
// Initialize WacapWrapper and setup event handlers
(0, sessions_1.initWacap)(io).then(async (wacap) => {
    console.log('WacapWrapper initialized successfully');
    // Setup Wacap event handlers for WebSocket forwarding
    (0, websocket_1.setupWacapEventHandlers)(wacap, io);
    // Sync existing session statuses from wacap
    try {
        const { syncSessionStatuses } = require('./websocket/websocket.events');
        await syncSessionStatuses(wacap);
        console.log('Session statuses synced successfully');
    }
    catch (error) {
        console.error('Failed to sync session statuses:', error);
    }
    // Initialize session manager for auto-start and cleanup
    try {
        await session_manager_1.sessionManager.initialize();
        console.log('Session manager initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize session manager:', error);
    }
}).catch((error) => {
    console.error('Failed to initialize WacapWrapper:', error);
});
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Setup Swagger documentation
(0, docs_1.setupSwagger)(app);
// Health check routes
app.use('/api/health', health_1.healthRouter);
// Auth routes
app.use('/api/auth', auth_1.authRouter);
// Device token routes
app.use('/api/tokens', device_tokens_1.deviceTokenRouter);
// Session routes
app.use('/api/sessions', sessions_1.sessionRouter);
// Messaging routes
app.use('/api/send', messaging_1.messagingRouter);
// Webhook routes
app.use('/api/webhooks', webhooks_1.webhookRouter);
// Serve static files in production
// Frontend build is copied to ./public in Docker image
if (process.env.NODE_ENV === 'production') {
    const publicPath = path_1.default.join(__dirname, '..', 'public');
    app.use(express_1.default.static(publicPath));
    // Handle SPA routing - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
            return next();
        }
        res.sendFile(path_1.default.join(publicPath, 'index.html'));
    });
}
// WebSocket connection handling is now managed by websocket.service.ts
// with authentication and room-based messaging
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map