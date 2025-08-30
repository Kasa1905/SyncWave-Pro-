# SyncWave Pro

🎵 **Professional Real-Time Audio/Video Streaming Platform**

> ⚠️ **Development Status**: This is the basic project structure. The code is currently not working on localhost and development is still in progress.

A production-grade monorepo template for building real-time streaming applications with room-based collaboration, file uploads, HLS transcoding, and WebRTC screen sharing.

## 🚧 Current Status

- ✅ **Basic project structure** set up with Next.js + Node.js
- ✅ **UI components** implemented with shadcn/ui and Tailwind CSS
- ✅ **Frontend homepage** with beautiful gradient design
- 🔄 **Backend API** in development
- 🔄 **Database integration** pending
- 🔄 **WebRTC implementation** pending
- 🔄 **File upload/transcoding** pending

## ✨ Planned Features

- � **Room-based streaming** with instant room creation (no signup required)
- 🎵 **MP3/MP4 streaming** with drift-corrected synchronization  
- 🎬 **Video transcoding** via FFmpeg with multiple quality renditions
- 🖥️ **WebRTC screen sharing** for presentations
- 🔒 **Privacy-focused** with Brave browser optimization
- 📱 **Responsive design** with smooth animations
- 🎯 **Zero authentication** - direct access to streaming

## 🏗️ Architecture

```
apps/
├── client/          # Next.js 14 (App Router, Tailwind, shadcn/ui)
└── server/          # Fastify (WebSocket, REST, TypeScript)
packages/
└── shared/          # Shared Zod schemas and types
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Client: http://localhost:3000
# Server: http://localhost:4000
# WebSocket: ws://localhost:4001
```

## 🌐 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari |
|---------|--------|---------|--------|------|------------|
| HLS (hls.js) | ✅ | ✅ | Native | ✅ | Native |
| WebRTC Screen Share | ✅ | ✅ | ⚠️ Limited | ✅ | ❌ Fallback |
| Audio Sync | ✅ | ✅ | ✅ | ✅ | ✅ |
| Captions/Subtitles | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Server
SERVER_URL=http://localhost:4000
JWT_SECRET=your-super-secret-jwt-key
PORT=4000

# Storage
STORAGE_TYPE=local # or 's3'
STORAGE_BUCKET=syncwave-uploads
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# FFmpeg
FFMPEG_PATH=/usr/local/bin/ffmpeg
TRANSCODING_ENABLED=true

# Security
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=100MB
ALLOWED_EXTENSIONS=mp3,mp4
```

## 📦 Scripts

```bash
# Development
npm run dev              # Start all services
npm run dev:client       # Client only
npm run dev:server       # Server only

# Building
npm run build            # Build all packages
npm run build:client     # Build client
npm run build:server     # Build server

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests only

# Code Quality
npm run lint             # Lint all packages
npm run format           # Format code
npm run type-check       # TypeScript checking
```

## 🐳 Docker Development

```bash
# Start with Docker Compose
docker-compose -f docker-compose.dev.yml up

# Build production images
docker-compose -f docker-compose.prod.yml build
```

## 🚀 Deployment

### Client (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables from `.env.example`
3. Deploy automatically on push

### Server (Fly.io/Railway/Docker)
```bash
# Fly.io
fly deploy

# Railway
railway deploy

# Docker
docker build -t syncwave-server ./apps/server
docker run -p 4000:4000 syncwave-server
```

## 🧪 Testing

- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright covering key user flows
- **API Tests**: Supertest for REST endpoints
- **WebSocket Tests**: Custom WS test utilities

## 🔒 Security Features

- JWT authentication with short-lived tokens
- File type validation (magic numbers + extensions)
- Upload size limits and rate limiting
- CORS protection with allowlists
- Input sanitization and validation
- Stub antivirus scanning integration
- HTTPS/WSS in production

## ♿ Accessibility

- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Reduced motion support
- Focus management
- ARIA labels and roles

## 📱 Progressive Enhancement

- Works without JavaScript (basic functionality)
- Graceful degradation for unsupported features
- Offline-first architecture planning
- Service worker ready

## 🎨 UI/UX Philosophy

- **Minimal & Clean**: Soft shadows, rounded corners, ample whitespace
- **Smooth Animations**: 60fps micro-interactions with Framer Motion
- **Responsive**: Mobile-first design with fluid layouts
- **Accessible**: High contrast ratios, clear focus indicators
- **Professional**: Consistent design system with shadcn/ui

## 📄 API Reference

### REST Endpoints

#### Health Check
```
GET /api/health
Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00Z" }
```

#### Room Management
```
POST /api/rooms
Body: { "name": "My Room", "type": "public|private" }
Response: { "id": "room_123", "inviteToken": "jwt_token" }

GET /api/rooms/:id
Response: { "id": "room_123", "name": "My Room", "users": [...] }
```

#### File Upload
```
POST /api/upload
Content-Type: multipart/form-data
Body: FormData with files
Response: { "files": [{ "id": "file_123", "url": "/stream/file_123" }] }
```

### WebSocket Events

#### Connection
```
ws://localhost:4001
```

#### Message Types
- `join` - Join a room
- `leave` - Leave a room
- `syncPing` - Request time sync
- `syncPong` - Time sync response
- `play` - Start playback
- `pause` - Pause playback
- `seek` - Seek to position
- `queueAdd` - Add file to queue
- `screenStart` - Start screen share
- `screenStop` - Stop screen share
- `webrtcOffer` - WebRTC offer
- `webrtcAnswer` - WebRTC answer
- `iceCandidate` - ICE candidate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Fastify](https://fastify.io/) - Fast web framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://framer.com/motion/) - Smooth animations
- [Turborepo](https://turbo.build/) - Monorepo tooling

---

Built with ❤️ for the developer community
