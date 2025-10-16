# Module 3: Track Manager

Complete track management system for DAWG AI with drag-and-drop reordering, color coding, track grouping, and full integration with the audio engine.

## Features

### Track Types
- **Audio Tracks** - Record and playback audio
- **MIDI Tracks** - Create and edit MIDI patterns
- **Aux Tracks** - Effects sends and returns
- **Folder Tracks** - Group and organize tracks

### Track Operations
- ✅ Create/delete tracks
- ✅ Duplicate tracks (with settings)
- ✅ Rename tracks (double-click)
- ✅ Reorder tracks (drag-and-drop)
- ✅ Color code tracks (8 preset colors)
- ✅ Adjust track height (collapsed/small/medium/large)
- 🚧 Group tracks into folders (structure ready)
- 🚧 Freeze tracks (render to audio)

### Track Properties
- Name, color, icon
- Volume, pan, mute, solo
- Record arm, monitor
- Track height
- Input/output routing

## Usage

### Create Tracks

```typescript
import { trackManager } from '$lib/tracks/trackManagerStore';

// Create an audio track
const audioTrack = trackManager.createTrack('audio', 'Vocals');

// Create a MIDI track
const midiTrack = trackManager.createTrack('midi', 'Bass');

// Create an aux track
const auxTrack = trackManager.createTrack('aux', 'Reverb');
```

### Update Track Settings

```typescript
// Update volume
trackManager.updateTrackSettings(trackId, { volume: -6 });

// Mute a track
trackManager.updateTrackSettings(trackId, { mute: true });

// Solo a track
trackManager.updateTrackSettings(trackId, { solo: true });

// Record arm
trackManager.updateTrackSettings(trackId, { recordArm: true });
```

### Track Selection

```typescript
// Select a track
trackManager.selectTrack(trackId);

// Get selected track
const selected = trackManager.getSelectedTrack();
```

### Track Organization

```typescript
// Rename track
trackManager.renameTrack(trackId, 'New Name');

// Change color
trackManager.setTrackColor(trackId, '#a855f7');

// Set height
trackManager.setTrackHeight(trackId, 'large');

// Reorder tracks
trackManager.reorderTrack(trackId, newIndex);

// Duplicate track
const newTrack = trackManager.duplicateTrack(trackId);
```

### Use in Svelte Components

```svelte
<script lang="ts">
  import { TrackList } from '$lib/tracks/components';
  import {
    trackManager,
    orderedTracks,
    selectedTrack,
    trackCount
  } from '$lib/tracks/trackManagerStore';
</script>

<!-- Display track list -->
<TrackList />

<!-- Show track count -->
<p>Total tracks: {$trackCount}</p>

<!-- Show selected track info -->
{#if $selectedTrack}
  <p>Selected: {$selectedTrack.name}</p>
{/if}

<!-- Create tracks -->
<button onclick={() => trackManager.createTrack('audio')}>
  Add Audio Track
</button>
```

## Component Structure

```
src/lib/tracks/
├── TrackManager.ts           # Core track management class
├── trackManagerStore.ts      # Svelte store wrapper
├── types.ts                  # TypeScript type definitions
├── components/
│   ├── TrackList.svelte      # Main track list with add menu
│   ├── TrackRow.svelte       # Individual track row
│   └── index.ts              # Component exports
├── index.ts                  # Module exports
└── README.md                 # This file
```

## API Reference

### TrackManager Class

#### Methods

##### `createTrack(type, name?): TrackData`
Create a new track of the specified type.

##### `deleteTrack(id): void`
Delete a track by ID.

##### `duplicateTrack(id): TrackData | null`
Duplicate a track with its settings.

##### `renameTrack(id, name): void`
Rename a track.

##### `reorderTrack(trackId, newIndex): void`
Reorder tracks via drag-and-drop.

##### `groupTracks(trackIds, folderName): UUID`
Group multiple tracks into a folder.

##### `ungroupTracks(folderId): void`
Ungroup tracks from a folder.

##### `updateTrackSettings(id, settings): void`
Update track settings (volume, pan, mute, etc.).

##### `setTrackColor(id, color): void`
Change track color.

##### `setTrackHeight(id, height): void`
Change track height (collapsed/small/medium/large).

##### `selectTrack(id): void`
Select a track.

##### `getSelectedTrack(): TrackData | null`
Get the currently selected track.

##### `getTrack(id): TrackData | undefined`
Get a track by ID.

##### `getAllTracks(): TrackData[]`
Get all tracks.

##### `getOrderedTracks(): TrackData[]`
Get tracks in display order.

### Svelte Stores

#### `tracks: Writable<Map<UUID, TrackData>>`
Map of all tracks by ID.

#### `trackOrder: Writable<UUID[]>`
Array of track IDs in display order.

#### `selectedTrackId: Writable<UUID | null>`
Currently selected track ID.

#### `selectedClipIds: Writable<Set<UUID>>`
Set of selected clip IDs.

#### `orderedTracks: Readable<TrackData[]>` (derived)
Tracks in display order.

#### `selectedTrack: Readable<TrackData | null>` (derived)
Currently selected track data.

#### `hasSelectedTrack: Readable<boolean>` (derived)
Whether a track is selected.

#### `trackCount: Readable<number>` (derived)
Total number of tracks.

## Events

The Track Manager emits the following events:

- `track:created` - When a track is created
- `track:deleted` - When a track is deleted
- `track:updated` - When track properties change
- `track:selected` - When a track is selected
- `track:reordered` - When tracks are reordered

Listen to events:

```typescript
window.addEventListener('track:created', (e) => {
  console.log('Track created:', e.detail);
});
```

## Integration with Audio Engine

The Track Manager automatically integrates with the Audio Engine:

- Creating a track creates corresponding audio engine track
- Deleting a track removes it from audio engine
- Volume/pan/mute/solo changes sync with audio engine
- Audio clips are managed through the audio engine

## Demo

Visit `/tracks` to see the Track Manager in action:

```bash
npm run dev
# Navigate to http://localhost:5173/tracks
```

## Future Enhancements

- [ ] Track freezing (render to audio)
- [ ] Automation lanes
- [ ] Track grouping UI
- [ ] Clip editing in timeline view
- [ ] Track templates
- [ ] Track presets
- [ ] Undo/redo support
- [ ] Copy/paste tracks
- [ ] Import/export tracks

## Architecture

The Track Manager follows the API contracts defined in `API_CONTRACTS.md`:

- Implements `TrackManager` class per specification
- Provides Svelte stores for reactive UI
- Integrates with Module 2 (Audio Engine)
- Emits events for Module 6 (Voice Interface) and other modules
- Type-safe TypeScript implementation

## Status

**Module 3: Track Manager** ✅ COMPLETE

- [x] Core TrackManager class
- [x] Track creation/deletion
- [x] Track duplication
- [x] Track renaming
- [x] Track reordering (drag-and-drop)
- [x] Track selection
- [x] Track settings (volume, pan, mute, solo, etc.)
- [x] Track color coding
- [x] Track height adjustment
- [x] Svelte stores integration
- [x] UI components (TrackList, TrackRow)
- [x] Demo page
- [x] TypeScript types
- [x] Event system integration
- [x] Audio engine integration

**Date**: 2025-10-15
**Module**: 3 of 11
