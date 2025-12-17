# Wacap Docker App - Docker Deployment Guide

## Overview

This Docker image contains a complete WhatsApp API application with:
- React frontend with Tailwind CSS
- Express.js backend with TypeScript
- SQLite database for data persistence
- WebSocket support for real-time updates

## Quick Start

### 1. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your JWT secret
# IMPORTANT: Use a secure random string in production
```

### 2. Generate a Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Start the Application

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 4. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | **Yes** | - | Secret key for JWT token signing |
| `HOST_PORT` | No | `3000` | Host port to expose the application |
| `NODE_ENV` | No | `production` | Node environment |
| `FRONTEND_URL` | No | - | Frontend URL for CORS (empty allows all) |

## Data Persistence

All application data is stored in a Docker volume named `wacap-data`:

- **SQLite Database**: `/app/data/wacap.db`
- **WhatsApp Sessions**: `/app/data/sessions/`

### Backup Data

```bash
# Create a backup of the data volume
docker run --rm -v wacap-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/wacap-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data

```bash
# Restore from backup
docker run --rm -v wacap-data:/data -v $(pwd):/backup alpine \
  tar xzf /backup/wacap-backup-YYYYMMDD.tar.gz -C /data
```

## Health Check

The application includes a health check endpoint:

```bash
# Check health status
curl http://localhost:3000/api/health
```

Docker automatically monitors this endpoint and will restart the container if it becomes unhealthy.

## Building the Image

### Build Locally

```bash
# Build the image
docker build -t wacap-app:latest .

# Build with no cache (clean build)
docker build --no-cache -t wacap-app:latest .
```

### Build with Docker Compose

```bash
# Build and start
docker-compose up --build -d
```

## Production Deployment

### Recommended Settings

1. **Use a strong JWT secret** - Generate a cryptographically secure random string
2. **Enable resource limits** - Uncomment the `deploy` section in docker-compose.yml
3. **Use a reverse proxy** - Put nginx or Traefik in front for SSL termination
4. **Regular backups** - Schedule automated backups of the data volume

### Example with Nginx Reverse Proxy

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  wacap:
    image: wacap-app:latest
    expose:
      - "3000"
    volumes:
      - wacap-data:/app/data
    environment:
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - wacap
    restart: unless-stopped

volumes:
  wacap-data:
```

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker-compose logs wacap

# Check if port is already in use
lsof -i :3000
```

### Database issues

```bash
# Access the container shell
docker-compose exec wacap sh

# Check database file
ls -la /app/data/
```

### WhatsApp session issues

```bash
# Clear sessions and re-authenticate
docker-compose exec wacap rm -rf /app/data/sessions/*
docker-compose restart wacap
```

### Reset everything

```bash
# Stop and remove containers, volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build -d
```

## API Documentation

Once the application is running, access the Swagger API documentation at:

```
http://localhost:3000/api/docs
```

## Security Considerations

1. **JWT Secret**: Always use a strong, unique secret in production
2. **Network**: Consider using Docker networks to isolate the application
3. **Updates**: Regularly update the base image and dependencies
4. **Backups**: Implement regular backup procedures for the data volume
5. **Monitoring**: Set up monitoring and alerting for the health endpoint
