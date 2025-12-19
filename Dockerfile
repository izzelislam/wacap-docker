# =============================================================================
# Wacap Docker App - Production Dockerfile
# Multi-stage build for optimized image size
# =============================================================================

# -----------------------------------------------------------------------------
# Base stage - Common Node.js setup
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install build dependencies for native modules (better-sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++ wget

# -----------------------------------------------------------------------------
# Backend dependencies stage
# -----------------------------------------------------------------------------
FROM base AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# -----------------------------------------------------------------------------
# Backend build stage
# -----------------------------------------------------------------------------
FROM base AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Frontend build stage
# -----------------------------------------------------------------------------
FROM base AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S wacap && \
    adduser -S wacap -u 1001 -G wacap

WORKDIR /app

# Copy production dependencies from deps stage
COPY --from=backend-deps /app/backend/node_modules ./node_modules

# Copy built backend files
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/package.json ./

# Copy built frontend files to serve as static
COPY --from=frontend-build /app/frontend/dist ./public

# Create data directory for SQLite and sessions with proper permissions
RUN mkdir -p /app/data/sessions && \
    chown -R wacap:wacap /app

# Environment variables with sensible defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV SESSIONS_PATH=/app/data/sessions
ENV DB_PATH=/app/data/wacap.db
# JWT_SECRET should be provided at runtime
ENV JWT_SECRET=

# Expose the application port
EXPOSE 3000

# Health check configuration
# Checks if the API health endpoint responds successfully
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER wacap

# Start the application
CMD ["node", "dist/index.js"]
