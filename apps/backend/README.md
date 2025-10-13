# DAWG AI Backend - Module 3: Track Manager

Complete backend API for managing audio and MIDI tracks in the DAWG AI Digital Audio Workstation.

## Overview

This backend service provides:
- **RESTful API** for track CRUD operations
- **WebSocket support** for real-time updates
- **In-memory state management** (production: PostgreSQL)
- **Real-time audio metering** via WebSocket events
- **Track solo/mute logic** with automatic muting
- **Drag & drop reordering** support

## Architecture

```
apps/backend/
├── src/
│   ├── types/
│   │   └── track.ts          # TypeScript interfaces
│   ├── services/
│   │   ├── track-manager.ts  # Core business logic
│   │   └── websocket.ts      # Real-time WebSocket service
│   ├── routes/
│   │   └── tracks.ts         # Express API routes
│   └── server.ts             # Main server entry point
├── tests/
│   └── track-manager.test.ts # Unit tests
├── package.json
└── tsconfig.json
```

## API Endpoints

### Track CRUD

#### `GET /api/tracks`
Get all tracks in order.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "track_1697123456789_abc123",
      "type": "audio",
      "name": "Audio 1",
      "color": "#FF6B6B",
      "volume": 0,
      "pan": 0,
      "mute": false,
      "solo": false,
      "armed": false,
      "meter": 0,
      "effects": [],
      "sends": [],
      "order": 0,
      "createdAt": "2025-10-13T12:00:00.000Z",
      "updatedAt": "2025-10-13T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### `GET /api/tracks/:id`
Get a specific track by ID.

#### `POST /api/tracks`
Create a new track.

**Request:**
```json
{
  "type": "audio",
  "name": "My Track",
  "color": "#4ECDC4"
}
```

**Response:** `201 Created` with track object

#### `PUT /api/tracks/:id`
Update track properties.

**Request:**
```json
{
  "name": "Updated Name",
  "volume": -3,
  "pan": 0.5,
  "mute": true
}
```

#### `DELETE /api/tracks/:id`
Delete a track.

**Response:**
```json
{
  "success": true,
  "message": "Track deleted successfully"
}
```

### Special Operations

#### `POST /api/tracks/:id/duplicate`
Duplicate a track with all settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "originalId": "track_123",
    "newId": "track_456",
    "track": { /* track object */ }
  }
}
```

#### `POST /api/tracks/reorder`
Reorder all tracks.

**Request:**
```json
{
  "trackIds": ["track_3", "track_1", "track_2"]
}
```

#### `PUT /api/tracks/:id/meter`
Update track meter level (for real-time metering).

**Request:**
```json
{
  "level": 0.75
}
```

#### `GET /api/tracks/state`
Get complete project state.

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": { /* track objects by ID */ },
    "soloedTracks": ["track_1"],
    "selectedTrackId": "track_1"
  }
}
```

## WebSocket Events

Connect to `ws://localhost:3001`

### Client → Server

- `track:subscribe` - Subscribe to track updates
- `track:unsubscribe` - Unsubscribe from updates
- `project:get-state` - Request current project state

### Server → Client

- `project:state` - Sent on connection and on request
- `track:event` - Track change event

**Track Event Format:**
```json
{
  "type": "track:created" | "track:updated" | "track:deleted" | "track:reordered" | "track:meter",
  "trackId": "track_123",
  "data": { /* event-specific data */ },
  "timestamp": 1697123456789
}
```

## Installation

```bash
cd apps/backend
pnpm install
```

## Development

```bash
# Start dev server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## Environment Variables

Create a `.env` file:

```bash
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Testing

### Unit Tests

```bash
pnpm test
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3001/health

# Create track
curl -X POST http://localhost:3001/api/tracks \
  -H "Content-Type: application/json" \
  -d '{"type": "audio", "name": "Vocals"}'

# Get all tracks
curl http://localhost:3001/api/tracks

# Update track
curl -X PUT http://localhost:3001/api/tracks/track_123 \
  -H "Content-Type: application/json" \
  -d '{"volume": -6, "pan": -0.5}'

# Delete track
curl -X DELETE http://localhost:3001/api/tracks/track_123
```

### WebSocket Testing

Use a WebSocket client or the provided test HTML:

```html
<!DOCTYPE html>
<html>
<body>
  <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
  <script>
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected');
      socket.emit('track:subscribe');
    });

    socket.on('track:event', (event) => {
      console.log('Track event:', event);
    });

    socket.on('project:state', (data) => {
      console.log('Project state:', data);
    });
  </script>
</body>
</html>
```

## Solo/Mute Logic

The track manager implements DAW-standard solo/mute behavior:

- **Solo**: When one or more tracks are soloed, all other tracks are effectively muted
- **Multi-solo**: Multiple tracks can be soloed simultaneously
- **Un-solo**: When all tracks are un-soloed, all tracks return to their original mute state

## Track Ordering

Tracks maintain a consistent order:
- New tracks are added to the end
- Deleting a track reindexes remaining tracks
- Reordering updates the `order` property on all tracks

## Future Enhancements

### Database Integration
```typescript
// Currently in-memory, will migrate to:
- PostgreSQL for persistent storage
- Redis for caching and session management
```

### Audio Processing
```typescript
// Future: Server-side audio processing
- Track freezing (render to audio)
- Offline bouncing
- Effect presets storage
```

### Authentication
```typescript
// Future: User authentication
- JWT tokens
- User sessions
- Project ownership
```

## Technical Details

### State Management
- In-memory Map for tracks
- EventEmitter for real-time updates
- Singleton pattern for API consistency

### Validation
- Zod schemas for request validation
- Type-safe API responses
- Comprehensive error handling

### Performance
- O(1) track lookup by ID
- O(n) for reordering and filtering
- WebSocket for push-based updates (no polling)

## License

MIT

## Related Modules

- **Module 2**: Audio Engine (Tone.js integration)
- **Module 4**: MIDI Editor (Piano roll)
- **Module 5**: Effects Rack (EQ, compression, reverb)

---

**Built with:** Express, TypeScript, Socket.IO, Zod

**Part of:** DAWG AI - AI-Powered Digital Audio Workstation
