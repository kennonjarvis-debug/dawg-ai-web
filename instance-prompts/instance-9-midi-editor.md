## 🎹 Instance 9: MIDI Editor + Piano Roll

```markdown
# Claude Code Prompt: MIDI Editor & Piano Roll

## Mission
Build professional piano roll editor with quantization, velocity editing, and scale snapping.

## Context Files
1. Comprehensive spec: MIDI Sequencing section
2. FL Studio piano roll patterns (research)

## Deliverables

### 1. Piano Roll Core (`src/lib/midi/PianoRoll.ts`)

```typescript
interface MIDINote {
  id: string;
  time: number;        // In bars.beats
  pitch: number;       // MIDI note number (0-127)
  duration: number;    // In beats
  velocity: number;    // 0-127
}

class PianoRoll {
  private notes: MIDINote[] = [];
  private scale: string = 'chromatic';
  private snapToGrid: number = 0.25;  // 16th notes

  addNote(time: number, pitch: number, duration: number, velocity: number): void;
  removeNote(noteId: string): void;
  moveNote(noteId: string, deltaTime: number, deltaPitch: number): void;
  resizeNote(noteId: string, newDuration: number): void;

  quantize(grid: number): void;
  humanize(amount: number): void;
  snapToScale(scale: string): void;

  toJSON(): any;
  fromJSON(data: any): void;
}
```

### 2. Piano Roll UI (`src/lib/components/midi/PianoRoll.svelte`)

Canvas-based editor (performance):

```typescript
<script lang="ts">
  let canvas: HTMLCanvasElement;
  let notes: MIDINote[] = $state([]);

  // Drawing
  function drawPianoRoll(ctx: CanvasRenderingContext2D) {
    // Draw grid
    // Draw piano keys (left)
    // Draw notes (colored rectangles)
    // Draw velocity bars (bottom)
  }

  // Interaction
  function handleMouseDown(e: MouseEvent) {
    // Add note or start dragging
  }

  function handleMouseMove(e: MouseEvent) {
    // Resize or move note
  }

  function handleMouseUp(e: MouseEvent) {
    // Finish edit
  }
</script>

<canvas bind:this={canvas} onmousedown={handleMouseDown}></canvas>
```

### 3. Quantization Algorithm (`src/lib/midi/quantize.ts`)

```typescript
function quantize(notes: MIDINote[], grid: number, strength: number = 1.0): MIDINote[] {
  return notes.map(note => {
    const quantizedTime = Math.round(note.time / grid) * grid;
    const newTime = note.time + (quantizedTime - note.time) * strength;

    return { ...note, time: newTime };
  });
}

function humanize(notes: MIDINote[], amount: number): MIDINote[] {
  return notes.map(note => ({
    ...note,
    time: note.time + (Math.random() - 0.5) * amount * 0.1,
    velocity: Math.max(1, Math.min(127, note.velocity + (Math.random() - 0.5) * amount * 20))
  }));
}
```

### 4. Scale Snapping (`src/lib/midi/scales.ts`)

```typescript
const SCALES = {
  'major': [0, 2, 4, 5, 7, 9, 11],
  'minor': [0, 2, 3, 5, 7, 8, 10],
  'pentatonic-minor': [0, 3, 5, 7, 10],
  'blues': [0, 3, 5, 6, 7, 10]
};

function snapToScale(pitch: number, root: number, scale: string): number {
  const scaleNotes = SCALES[scale];
  const octave = Math.floor((pitch - root) / 12);
  const noteInOctave = (pitch - root) % 12;

  // Find closest scale degree
  const closest = scaleNotes.reduce((prev, curr) => {
    return Math.abs(curr - noteInOctave) < Math.abs(prev - noteInOctave) ? curr : prev;
  });

  return root + octave * 12 + closest;
}
```

### 5. MIDI Playback (`src/lib/midi/MIDIPlayer.ts`)

```typescript
class MIDIPlayer {
  private synth: Tone.PolySynth;
  private part: Tone.Part;

  async play(notes: MIDINote[], instrument: Tone.Instrument) {
    this.part = new Tone.Part((time, note) => {
      instrument.triggerAttackRelease(
        Tone.Frequency(note.pitch, 'midi').toNote(),
        note.duration + 's',
        time,
        note.velocity / 127
      );
    }, notes.map(n => ({
      time: n.time,
      pitch: n.pitch,
      duration: n.duration,
      velocity: n.velocity
    })));

    this.part.start(0);
    Tone.Transport.start();
  }
}
```

## Testing

### Unit Tests
- Note add/remove/move operations
- Quantization accuracy
- Scale snapping correctness
- MIDI file import/export

### Integration Tests
- Piano roll renders correctly
- Mouse interactions work
- Playback syncs with transport
- Velocity editing applies

### Manual Tests
```
[ ] Can draw notes with mouse
[ ] Notes snap to grid when enabled
[ ] Scale highlighting works
[ ] Velocity bars update on edit
[ ] Quantize maintains note relationships
[ ] Ghost notes from other tracks visible
[ ] Keyboard shortcuts work (Cmd+Z, Delete, etc.)
```

## Git Branch
`midi-editor`

## Success Criteria
- ✅ Smooth 60fps rendering with 1000+ notes
- ✅ Quantization working with adjustable strength
- ✅ Scale snapping with visual key highlights
- ✅ Velocity editing with visual feedback
- ✅ MIDI export/import (Standard MIDI File format)
- ✅ Ghost notes from other tracks
- ✅ Keyboard shortcuts for common actions
- ✅ User feedback: "This piano roll feels like FL Studio"

**Start with core data structures and rendering, then add interactions.**
```

---

