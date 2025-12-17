import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase } from './database';
import { authRouter } from './auth';
import { deviceTokenRouter } from './device-tokens';
import { sessionRouter, initWacap } from './sessions';
import { sessionManager } from './sessions/session-manager';
import { messagingRouter } from './messaging';
import { setupWebSocket, setupWacapEventHandlers } from './websocket';
import { healthRouter } from './health';
import { setupSwagger } from './docs';
import { webhookRouter } from './webhooks';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize database
initDatabase();

// Setup WebSocket with authentication
setupWebSocket(io);

// Initialize WacapWrapper and setup event handlers
initWacap(io).then(async (wacap) => {
  console.log('WacapWrapper initialized successfully');
  // Setup Wacap event handlers for WebSocket forwarding
  setupWacapEventHandlers(wacap, io);
  
  // Sync existing session statuses from wacap
  try {
    const { syncSessionStatuses } = require('./websocket/websocket.events');
    await syncSessionStatuses(wacap);
    console.log('Session statuses synced successfully');
  } catch (error) {
    console.error('Failed to sync session statuses:', error);
  }

  // Initialize session manager for auto-start and cleanup
  try {
    await sessionManager.initialize();
    console.log('Session manager initialized successfully');
  } catch (error) {
    console.error('Failed to initialize session manager:', error);
  }
}).catch((error) => {
  console.error('Failed to initialize WacapWrapper:', error);
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Health check routes
app.use('/api/health', healthRouter);

// Auth routes
app.use('/api/auth', authRouter);

// Device token routes
app.use('/api/tokens', deviceTokenRouter);

// Session routes
app.use('/api/sessions', sessionRouter);

// Messaging routes
app.use('/api/send', messagingRouter);

// Webhook routes
app.use('/api/webhooks', webhookRouter);

// Serve static files in production
// Frontend build is copied to ./public in Docker image
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) {
      return next();
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// WebSocket connection handling is now managed by websocket.service.ts
// with authentication and room-based messaging

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, io };
