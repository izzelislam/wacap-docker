# Wacap - WhatsApp API Wrapper

Self-hosted WhatsApp API with web dashboard for managing multiple sessions.

## Features

- 🔐 **Multi-user Authentication** - JWT-based auth with device tokens for API access
- 📱 **Multi-session Support** - Manage multiple WhatsApp accounts
- 💬 **Send Messages** - Text, media, location, and contact cards
- 🔔 **Webhooks** - Real-time event notifications per session
- 📊 **Web Dashboard** - Beautiful UI for session management
- 🔄 **Auto-restart** - Sessions auto-reconnect on server restart
- 📚 **API Documentation** - Built-in Swagger docs

## Quick Start

### 1. Create docker-compose.yml

```yaml
services:
  wacap:
    image: bangfkr/wacap:latest
    container_name: wacap-app
    ports:
      - "3000:3000"
    volumes:
      - wacap-data:/app/data
    environment:
      - JWT_SECRET=your-secure-secret-key-here
    restart: unless-stopped

volumes:
  wacap-data:
```

### 2. Run

```bash
docker-compose up -d
```

### 3. Access

- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ Yes | - | Secret key for JWT tokens |
| `HOST_PORT` | No | 3000 | Host port to expose |
| `NODE_ENV` | No | production | Environment mode |
| `FRONTEND_URL` | No | - | CORS allowed origin |
| `SESSION_MAX_AGE_MS` | No | 2592000000 | Max session age (30 days) |
| `SESSION_MAX_INACTIVE_MS` | No | 604800000 | Max inactive time (7 days) |

## API Usage

### Authentication

Generate a Device Token from the dashboard, then use it in API requests:

```bash
curl -X POST "http://localhost:3000/api/send/text" \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: YOUR_DEVICE_TOKEN" \
  -d '{
    "sessionId": "my-session",
    "to": "628123456789",
    "text": "Hello from API!"
  }'
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/send/text` | Send text message |
| POST | `/api/send/media` | Send image/video/document |
| POST | `/api/send/location` | Send location |
| POST | `/api/send/contact` | Send contact card |
| GET | `/api/sessions` | List sessions |
| POST | `/api/sessions` | Create session |
| DELETE | `/api/sessions/:id` | Delete session |

## Webhooks

Configure webhooks per session to receive real-time events:

- `message.received` - Incoming messages
- `message.sent` - Outgoing messages
- `session.connected` - Session connected
- `session.disconnected` - Session disconnected
- `session.qr` - QR code generated
- `typing.start` / `typing.stop` - Typing indicators
- `presence.update` - Online/offline status

## Data Persistence

All data is stored in `/app/data`:
- `wacap.db` - SQLite database (users, sessions, tokens)
- `sessions/` - WhatsApp session credentials

Mount a volume to persist data across container restarts.

## Support

- GitHub: [Repository URL]
- Issues: [Issues URL]

## License

MIT
