# DAWG AI - Integration Examples

This directory contains complete examples of how to integrate all DAWG AI modules.

## Integration Demo

**File**: `integration-demo.tsx`

### Overview

A complete working example that demonstrates integration of:

1. **Design System** (`@dawg-ai/design-system`)
   - TransportControls
   - Mixer
   - Knob
   - FaderChannel

2. **Audio Engine** (`@dawg-ai/audio-engine`)
   - AudioEngine singleton
   - Track management
   - Recording & playback
   - Real-time audio processing

3. **Backend API** (`apps/backend`)
   - Track CRUD operations
   - Real-time WebSocket updates
   - State synchronization

### Features Demonstrated

#### Transport Control
- Play/pause playback
- Stop
- Record toggle
- BPM adjustment
- Sync with audio engine

#### Track Management
- Create new tracks
- Volume control (knobs and faders)
- Pan control
- Mute/solo
- Real-time metering
- Backend synchronization

#### State Synchronization
- Audio engine ↔ Design system UI
- Design system UI ↔ Backend API
- Real-time updates via WebSocket

### Running the Example

#### 1. Start Backend Server

```bash
cd apps/backend
pnpm dev
```

Backend runs on `http://localhost:3002`

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Run the Integration Demo

```bash
pnpm --filter @dawg-ai/web dev
```

#### 4. Access the Demo

Open `http://localhost:3000/examples/integration-demo`

### Architecture

```
┌─────────────────────┐
│   Design System     │  Svelte 5 UI Components
│   (UI Components)   │  - TransportControls
│                     │  - Mixer, Knob, Fader
└──────────┬──────────┘
           │
           │ Events & Handlers
           ▼
┌─────────────────────┐
│   Audio Engine      │  Web Audio + Tone.js
│   (Audio Processing)│  - Multi-track playback
│                     │  - Recording
└──────────┬──────────┘  - Effects routing
           │
           │ State Sync
           ▼
┌─────────────────────┐
│   Backend API       │  Express + Socket.io
│   (State Management)│  - Track CRUD
│                     │  - WebSocket updates
└─────────────────────┘  - PostgreSQL (future)
```

### Data Flow

1. **User Interaction** → Design System Component
2. **Component Event** → Event Handler
3. **Audio Engine Update** → Process audio
4. **Backend API Call** → Persist state
5. **WebSocket Broadcast** → Real-time updates
6. **UI Update** → Design System reflects changes

### Key Patterns

#### Volume Control Example

```typescript
function handleVolumeChange(trackId: string, volume: number) {
  // 1. Update audio engine
  const track = engine.getTrack(trackId);
  track.setVolume(volume);

  // 2. Sync with backend
  await TrackAPI.updateTrack(trackId, { volume });

  // 3. UI updates automatically via Svelte reactivity
}
```

#### Track Creation Example

```typescript
async function handleAddTrack() {
  // 1. Create in backend (source of truth)
  const response = await TrackAPI.createTrack({
    type: 'audio',
    name: `Audio ${tracks.length + 1}`
  });

  // 2. Add to local state
  tracks = [...tracks, response.data];

  // 3. Create in audio engine
  engine.addTrack({
    type: 'audio',
    name: response.data.name
  });
}
```

### API Integration

The example uses a simple REST API client:

```typescript
class TrackAPI {
  static async getAllTracks() {
    const response = await fetch('http://localhost:3002/api/tracks');
    return response.json();
  }

  static async createTrack(data: { type, name, color }) {
    return fetch('http://localhost:3002/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }

  static async updateTrack(id: string, updates: any) {
    return fetch(`http://localhost:3002/api/tracks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).then(r => r.json());
  }
}
```

### WebSocket Integration (Optional)

For real-time updates across multiple clients:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002');

socket.on('connect', () => {
  socket.emit('track:subscribe');
});

socket.on('track:event', (event) => {
  // Handle track updates from other clients
  if (event.type === 'track:updated') {
    // Update local state
    tracks = tracks.map(t =>
      t.id === event.trackId ? { ...t, ...event.data } : t
    );

    // Update audio engine
    const track = engine.getTrack(event.trackId);
    if (track && event.data.volume !== undefined) {
      track.setVolume(event.data.volume);
    }
  }
});
```

### Testing the Integration

#### Manual Tests

1. **Transport Control**
   - Click play → Audio engine starts playback
   - Click stop → Playback stops
   - Adjust BPM → Tempo changes in real-time

2. **Volume Control**
   - Turn knob → Audio volume changes
   - Check backend API → Volume persisted
   - Refresh page → Volume restored from backend

3. **Track Creation**
   - Click "Add Track" → New track appears
   - Check backend API → Track created in database
   - Audio engine → New track available for recording

4. **Mute/Solo**
   - Click mute → Track silenced
   - Click solo → Only soloed tracks audible
   - Backend → State persisted

#### Automated Tests (Future)

```typescript
import { render, fireEvent } from '@testing-library/svelte';
import IntegrationDemo from './integration-demo.tsx';

test('volume control updates audio engine and backend', async () => {
  const { getByLabelText } = render(IntegrationDemo);
  const volumeKnob = getByLabelText('Volume');

  // Simulate knob turn
  await fireEvent.change(volumeKnob, { target: { value: -6 } });

  // Assert audio engine updated
  expect(engine.getTrack('track-1').getVolume()).toBe(-6);

  // Assert backend API called
  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:3002/api/tracks/track-1',
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ volume: -6 })
    })
  );
});
```

### Next Steps

1. **Add More Components**
   - Timeline for waveform display
   - PianoRoll for MIDI editing
   - EffectsRack for effect chains

2. **WebSocket Integration**
   - Real-time collaboration
   - Live meter updates
   - Multi-user sessions

3. **Database Persistence**
   - Migrate from in-memory to PostgreSQL
   - User authentication
   - Project management

4. **Advanced Features**
   - Audio file upload and import
   - Effect plugins
   - MIDI sequencing
   - Voice interface integration

---

## Additional Examples

### Piano Roll Integration

**File**: `piano-roll-example.tsx` (Coming soon)

Integration of PianoRoll component with MIDI engine.

### Effects Rack Integration

**File**: `effects-example.tsx` (Coming soon)

Integration of EffectsRack with audio engine effects chain.

### Voice Interface Integration

**File**: `voice-example.tsx` (Coming soon)

Integration of voice commands with DAW controls.

---

## Contributing

When adding new integration examples:

1. Follow the existing pattern
2. Document all data flows
3. Include error handling
4. Add manual test steps
5. Update this README

## License

MIT License - See main project LICENSE file.
