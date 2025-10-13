# Module 4: MIDI Editor - Development Specification

**Duration**: 4-5 days
**Worktree**: `../dawg-worktrees/midi-editor`
**Branch**: `module/midi-editor`
**Package**: `apps/web/src/features/midi/`

## Overview

Create a comprehensive MIDI piano roll editor for DAWG AI, optimized for vocal melody composition and editing. The editor should provide an intuitive interface for creating, editing, and arranging MIDI notes with a focus on melody writing for vocalists.

## Dependencies

### Required Modules (Available)
- ✅ **Design System** (`@dawg-ai/design-system`) - UI components
- ✅ **Audio Engine** (`@dawg-ai/audio-engine`) - MIDI playback via MIDITrack
- ✅ **Backend API** (`apps/backend`) - MIDI data persistence

### Integration Points
- Design System PianoRoll component (base implementation)
- Audio Engine MIDITrack class
- Backend API for MIDI data storage

## Features to Implement

### 1. Piano Roll Canvas (Core)

**Visual Components**:
- [ ] 88-key piano keyboard (left side, A0-C8)
- [ ] Grid with beat subdivisions (1/4, 1/8, 1/16, 1/32)
- [ ] Time ruler with bar:beat:tick markers
- [ ] Velocity lane (bottom panel)
- [ ] Note blocks with color coding by velocity

**Interactions**:
- [ ] Click to add note
- [ ] Drag to resize note length
- [ ] Drag to move note (pitch and time)
- [ ] Click to select note
- [ ] Drag-select multiple notes
- [ ] Delete selected notes (Delete/Backspace)
- [ ] Copy/paste notes (Cmd/Ctrl+C/V)
- [ ] Duplicate notes (Cmd/Ctrl+D)

**Snap & Quantization**:
- [ ] Snap to grid (toggleable)
- [ ] Quantization options (1/4, 1/8, 1/16, 1/32, triplets)
- [ ] Humanize function (slight timing randomization)
- [ ] Quantize selected notes

### 2. MIDI Note Management

**Note Properties**:
```typescript
interface MIDINote {
  id: string;
  pitch: number;        // 0-127 (MIDI note number)
  start: number;        // Beats from start
  duration: number;     // Beats
  velocity: number;     // 0-127
  selected: boolean;
}
```

**Operations**:
- [ ] Create note
- [ ] Update note (pitch, start, duration, velocity)
- [ ] Delete note
- [ ] Select/deselect notes
- [ ] Move selected notes
- [ ] Transpose selected notes
- [ ] Change velocity of selected notes

### 3. Keyboard Integration

**Keyboard Shortcuts**:
- [ ] Space - Play/pause
- [ ] Delete/Backspace - Delete selected notes
- [ ] Cmd/Ctrl+A - Select all
- [ ] Cmd/Ctrl+C - Copy notes
- [ ] Cmd/Ctrl+V - Paste notes
- [ ] Cmd/Ctrl+D - Duplicate notes
- [ ] Cmd/Ctrl+Z - Undo
- [ ] Cmd/Ctrl+Shift+Z - Redo
- [ ] Arrow keys - Move selected notes
- [ ] Shift+Arrow - Resize selected notes

**MIDI Keyboard Input**:
- [ ] Record MIDI from USB keyboard
- [ ] Display input notes in real-time
- [ ] Quantize on input (optional)

### 4. Playback Integration

**Audio Engine Connection**:
- [ ] Connect to MIDITrack instance
- [ ] Real-time playback of notes
- [ ] Playhead visualization
- [ ] Loop region playback
- [ ] Metronome click

**Synth Selection**:
- [ ] Choose synthesizer type (saw, sine, square, triangle)
- [ ] ADSR envelope controls
- [ ] Filter controls
- [ ] Reverb/delay sends

### 5. Vocal-Specific Features

**Melody Assistant**:
- [ ] Suggest vocal range overlay (based on user profile)
- [ ] Highlight out-of-range notes
- [ ] Chord progression reference (show chord tones)
- [ ] Scale highlighting (show/hide non-scale notes)

**Lyric Integration**:
- [ ] Attach lyrics to notes
- [ ] Display lyrics above notes
- [ ] Syllable-per-note alignment
- [ ] Export lyrics with MIDI

**AI Melody Generator**:
- [ ] Generate melody from chord progression
- [ ] Generate harmony line
- [ ] Suggest melodic variations
- [ ] Fix melody rhythm

### 6. UI Components

**Top Toolbar**:
- [ ] Tool selector (select, pencil, eraser)
- [ ] Quantization dropdown
- [ ] Snap grid toggle
- [ ] Synth selector
- [ ] Undo/redo buttons

**Left Panel**:
- [ ] Piano keyboard (clickable to hear notes)
- [ ] Octave labels (C1, C2, etc.)
- [ ] Highlight C notes

**Bottom Panel**:
- [ ] Velocity editor
- [ ] CC automation lanes (optional)
- [ ] Expression/modulation

**Right Panel (Optional)**:
- [ ] Note properties inspector
- [ ] Selected note details
- [ ] Bulk edit controls

### 7. Canvas Rendering

**Performance Requirements**:
- [ ] 60 FPS rendering
- [ ] Efficient redraw (only changed regions)
- [ ] Virtual scrolling for large projects
- [ ] Zoom levels (1x to 64x)

**Visual Polish**:
- [ ] Note shadows
- [ ] Velocity color coding (darker = louder)
- [ ] Grid lines with major/minor distinction
- [ ] Smooth animations for note operations

### 8. Data Persistence

**Local State**:
- [ ] Zustand store for MIDI notes
- [ ] Undo/redo history stack
- [ ] Selection state
- [ ] View state (zoom, scroll position)

**Backend Sync**:
- [ ] Save MIDI data to backend API
- [ ] Load MIDI data from backend
- [ ] Auto-save on changes (debounced)
- [ ] Conflict resolution

**Export Formats**:
- [ ] Export as MIDI file (.mid)
- [ ] Export as JSON
- [ ] Export with audio (via audio engine)

## Technical Implementation

### Technology Stack

**Rendering**:
- Canvas API (HTML5 Canvas)
- Svelte 5 for reactive UI
- requestAnimationFrame for smooth rendering

**Audio**:
- Audio Engine MIDITrack class
- Tone.js for synthesis
- Web MIDI API for keyboard input

**State Management**:
- Zustand for global MIDI state
- Svelte stores for component state

### File Structure

```
apps/web/src/features/midi/
├── components/
│   ├── PianoRoll.svelte          # Main piano roll component
│   ├── PianoKeyboard.svelte      # Left sidebar keyboard
│   ├── TimeRuler.svelte          # Top time ruler
│   ├── VelocityEditor.svelte     # Bottom velocity lane
│   ├── NoteRenderer.svelte       # Canvas note rendering
│   └── Toolbar.svelte            # Top toolbar controls
├── stores/
│   ├── midi-store.ts             # MIDI notes state
│   ├── selection-store.ts        # Note selection
│   └── viewport-store.ts         # Zoom/scroll state
├── utils/
│   ├── note-utils.ts             # Note manipulation helpers
│   ├── quantize.ts               # Quantization logic
│   ├── midi-file.ts              # MIDI import/export
│   └── canvas-utils.ts           # Canvas rendering helpers
├── hooks/
│   ├── useMidiEditor.ts          # Main editor logic
│   ├── useMidiInput.ts           # MIDI keyboard input
│   └── useCanvas.ts              # Canvas rendering hook
└── types/
    └── midi.ts                   # TypeScript interfaces
```

### State Management

```typescript
// stores/midi-store.ts
import { create } from 'zustand';

interface MIDINoteState {
  notes: MIDINote[];
  selectedNotes: Set<string>;

  // Actions
  addNote: (note: MIDINote) => void;
  updateNote: (id: string, updates: Partial<MIDINote>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string, addToSelection?: boolean) => void;
  clearSelection: () => void;

  // Undo/redo
  history: MIDINote[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
}

export const useMidiStore = create<MIDINoteState>((set) => ({
  notes: [],
  selectedNotes: new Set(),
  history: [[]],
  historyIndex: 0,

  addNote: (note) => set((state) => ({
    notes: [...state.notes, note],
    history: [...state.history.slice(0, state.historyIndex + 1), [...state.notes, note]],
    historyIndex: state.historyIndex + 1
  })),

  // ... other actions
}));
```

### Canvas Rendering

```typescript
// hooks/useCanvas.ts
export function useCanvas(canvasRef: Ref<HTMLCanvasElement>) {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height, zoom, scrollX);

    // Draw notes
    notes.forEach(note => {
      drawNote(ctx, note, zoom, scrollX, scrollY, isSelected(note));
    });

    // Draw playhead
    drawPlayhead(ctx, playheadPosition, height);

  }, [notes, zoom, scrollX, scrollY, playheadPosition]);

  useEffect(() => {
    const animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [draw]);
}
```

### Integration with Audio Engine

```typescript
// hooks/useMidiEditor.ts
import { AudioEngine } from '@dawg-ai/audio-engine';

export function useMidiEditor(trackId: string) {
  const engine = AudioEngine.getInstance();
  const track = engine.getTrack(trackId) as MIDITrack;
  const { notes } = useMidiStore();

  // Sync notes with audio engine
  useEffect(() => {
    track.setNotes(notes.map(n => ({
      note: n.pitch,
      time: n.start,
      duration: n.duration,
      velocity: n.velocity / 127
    })));
  }, [notes, track]);

  // Playback control
  const play = () => engine.play();
  const pause = () => engine.pause();
  const stop = () => engine.stop();

  return { play, pause, stop };
}
```

## Testing

### Unit Tests
- [ ] Note manipulation functions
- [ ] Quantization logic
- [ ] MIDI file import/export
- [ ] Selection algorithms
- [ ] Undo/redo stack

### Integration Tests
- [ ] Audio engine synchronization
- [ ] Backend API save/load
- [ ] Keyboard input handling
- [ ] Canvas rendering performance

### Manual Tests
- [ ] Create and edit notes
- [ ] Play back MIDI
- [ ] Undo/redo operations
- [ ] Keyboard shortcuts
- [ ] MIDI keyboard input
- [ ] Export/import MIDI files

## Success Criteria

### Functionality
- ✅ Can create, edit, and delete MIDI notes
- ✅ Piano roll renders at 60 FPS
- ✅ Notes sync with audio engine for playback
- ✅ Undo/redo works correctly
- ✅ Keyboard shortcuts functional
- ✅ MIDI file export works

### Performance
- ✅ Smooth scrolling and zooming
- ✅ No lag with 1000+ notes
- ✅ Real-time playback with low latency

### UX
- ✅ Intuitive note creation and editing
- ✅ Clear visual feedback
- ✅ Responsive to all inputs
- ✅ Helpful for melody composition

## Deliverables

1. **Piano Roll Component** - Complete implementation
2. **MIDI Store** - State management
3. **Audio Engine Integration** - Playback sync
4. **Backend API Integration** - Data persistence
5. **Unit Tests** - >80% coverage
6. **Documentation** - Usage guide and API docs

## Resources

- [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MIDI Standard](https://www.midi.org/specifications)
- [Tone.js MIDI](https://tonejs.github.io/)

---

## Getting Started

1. **Navigate to worktree**:
   ```bash
   cd ../dawg-worktrees/midi-editor
   ```

2. **Review dependencies**:
   ```bash
   cat CLAUDE.md
   ```

3. **Start development**:
   ```bash
   pnpm dev
   ```

4. **Create feature branch** (if needed):
   ```bash
   git checkout -b feature/piano-roll
   ```

---

**Ready for development!** 🎹
