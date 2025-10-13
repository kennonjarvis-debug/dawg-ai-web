# @dawg-ai/audio-engine

Core audio processing engine for DAWG AI using Web Audio API and Tone.js.

## Features

- 🎵 **Multi-track audio playback** with sample-accurate synchronization
- 🎙️ **Recording** from microphone or line inputs
- 🎛️ **Effects chain routing** with series and parallel processing
- 🎚️ **Mixer** with volume, pan, solo, and mute per track
- 📊 **Master output** with metering and limiting
- 💾 **Export/bounce** functionality (WAV format)
- 🎹 **MIDI sequencing** with built-in synthesizers
- 🔄 **Project save/load** in JSON format
- 🎵 **Send buses** for shared effects (reverb, delay)

## Installation

```bash
pnpm add @dawg-ai/audio-engine
```

## Quick Start

```typescript
import { AudioEngine } from '@dawg-ai/audio-engine';

// Get singleton instance
const engine = AudioEngine.getInstance({
  sampleRate: 48000,
  latencyHint: 'interactive',
});

// Add an audio track
const track = engine.addTrack({
  type: 'audio',
  name: 'Vocals',
  volume: 0, // dB
  pan: 0, // -1 (left) to 1 (right)
});

// Load audio file
await track.loadAudio('/path/to/audio.mp3');

// Control playback
await engine.play();
engine.pause();
engine.stop();

// Set tempo
engine.setTempo(120);

// Export mix
const blob = await engine.exportMix({ format: 'wav' });
```

## API Documentation

### AudioEngine (Singleton)

Main engine class that manages all audio processing.

#### Instance Methods

**Track Management:**
- `addTrack(config: TrackConfig): Track` - Add a new audio or MIDI track
- `removeTrack(id: string): void` - Remove a track by ID
- `getTrack(id: string): Track | undefined` - Get track by ID
- `getAllTracks(): Track[]` - Get all tracks

**Transport Control:**
- `play(): Promise<void>` - Start playback
- `pause(): void` - Pause playback
- `stop(): void` - Stop playback
- `setPosition(time: number): void` - Seek to position (seconds)
- `getPosition(): number` - Get current position (seconds)
- `setTempo(bpm: number): void` - Set tempo in BPM
- `getTempo(): number` - Get current tempo
- `setLoop(enabled: boolean, start?: number, end?: number): void` - Configure loop

**Recording:**
- `startRecording(trackId: string, deviceId?: string): Promise<void>` - Start recording
- `stopRecording(trackId: string): Promise<AudioBuffer>` - Stop and return recording

**Send Buses:**
- `createSendBus(name: string, effect: ToneAudioNode): SendBus` - Create send bus
- `getSendBus(name: string): SendBus | undefined` - Get send bus
- `routeToSend(trackId: string, sendName: string, amount: number): void` - Route track to send

**Master:**
- `getMasterBus(): MasterBus` - Get master bus
- `setMasterVolume(db: number): void` - Set master volume
- `getMasterVolume(): number` - Get master volume

**Export:**
- `exportMix(options: ExportOptions): Promise<Blob>` - Export audio file

**Project:**
- `saveProject(): Promise<ProjectData>` - Save project state
- `loadProject(data: ProjectData): Promise<void>` - Load project state

### AudioTrack

Track for audio file playback and recording.

#### Methods

- `loadAudio(source: string | AudioBuffer): Promise<void>` - Load audio
- `play(time?: number): void` - Start playback
- `stop(time?: number): void` - Stop playback
- `seek(position: number): void` - Seek to position
- `getDuration(): number` - Get duration in seconds
- `startRecording(deviceId?: string): Promise<void>` - Start recording
- `stopRecording(): Promise<AudioBuffer>` - Stop and get recording
- `isRecording(): boolean` - Check recording state
- `getAudioBuffer(): AudioBuffer | null` - Get loaded audio buffer

### MIDITrack

Track for MIDI sequencing and synthesis.

#### Methods

- `addNote(note: MIDINoteData): void` - Add MIDI note
- `removeNote(index: number): void` - Remove note at index
- `clearNotes(): void` - Clear all notes
- `getNotes(): MIDINoteData[]` - Get all notes
- `setNotes(notes: MIDINoteData[]): void` - Set notes
- `setSynthType(type: string): void` - Change synthesizer type
- `getSynthType(): string` - Get synth type
- `triggerNote(note: string | number, duration: string, velocity: number): void` - Play note

### Track (Base Class)

Common functionality for all tracks.

#### Methods

**Volume & Pan:**
- `setVolume(db: number): void` - Set volume in dB
- `getVolume(): number` - Get volume
- `setPan(value: number): void` - Set pan (-1 to 1)
- `getPan(): number` - Get pan

**State:**
- `setMute(mute: boolean): void` - Mute/unmute
- `isMuted(): boolean` - Check mute state
- `setSolo(solo: boolean): void` - Solo/unsolo
- `isSolo(): boolean` - Check solo state
- `setArmed(armed: boolean): void` - Arm for recording
- `isArmed(): boolean` - Check armed state

**Effects:**
- `addEffect(effect: ToneAudioNode, index?: number): void` - Add effect
- `removeEffect(index: number): void` - Remove effect
- `getEffects(): ToneAudioNode[]` - Get all effects

**Sends:**
- `routeToSend(send: SendBus, amount: number): void` - Route to send
- `removeSend(send: SendBus): void` - Remove send routing
- `getSends(): Map<SendBus, number>` - Get all send routings

### MasterBus

Master output bus with metering and limiting.

#### Methods

- `getMeterLevel(): number` - Get current level in dB
- `getFrequencyData(): Uint8Array` - Get frequency spectrum data
- `getWaveformData(): Uint8Array` - Get waveform data
- `setVolume(db: number): void` - Set master volume
- `getVolume(): number` - Get master volume

### SendBus

Auxiliary effect bus for shared effects.

#### Methods

- `setWetDry(amount: number): void` - Set wet/dry mix (0-1)
- `getWetDry(): number` - Get wet/dry mix
- `setVolume(db: number): void` - Set send volume
- `getVolume(): number` - Get send volume

### Recorder

Export and bounce functionality.

#### Methods

- `startRecording(): void` - Start recording output
- `stopRecording(): Promise<Blob>` - Stop and get recording
- `export(options: ExportOptions): Promise<Blob>` - Export with options
- `isCurrentlyRecording(): boolean` - Check recording state

## Type Definitions

### TrackConfig

```typescript
interface TrackConfig {
  type: 'audio' | 'midi';
  name: string;
  color?: string;
  volume?: number; // dB
  pan?: number; // -1 to 1
}
```

### ExportOptions

```typescript
interface ExportOptions {
  format: 'wav' | 'mp3';
  start?: number; // seconds
  duration?: number; // seconds
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
}
```

### MIDINoteData

```typescript
interface MIDINoteData {
  note: string | number; // e.g., "C4" or 60
  time: number; // seconds
  duration: number; // seconds
  velocity: number; // 0-1
}
```

## Examples

### Recording Audio

```typescript
const engine = AudioEngine.getInstance();

// Add track
const track = engine.addTrack({
  type: 'audio',
  name: 'Recording',
});

// Arm for recording
track.setArmed(true);

// Start recording
await engine.startRecording(track.id);

// Record for 5 seconds...
setTimeout(async () => {
  const buffer = await engine.stopRecording(track.id);
  console.log('Recorded:', buffer.duration, 'seconds');
}, 5000);
```

### Adding Effects

```typescript
import * as Tone from 'tone';

const track = engine.getTrack(trackId);

// Add reverb
const reverb = new Tone.Reverb({
  decay: 3,
  preDelay: 0.01,
});
track.addEffect(reverb);

// Add EQ
const eq = new Tone.EQ3({
  low: 0,
  mid: 2,
  high: -3,
});
track.addEffect(eq);
```

### Using Send Buses

```typescript
// Create custom send
const send = engine.createSendBus(
  'chorus',
  new Tone.Chorus(4, 2.5, 0.5)
);

// Route track to send
engine.routeToSend(track.id, 'chorus', 0.3); // 30% send amount
```

### MIDI Sequencing

```typescript
const midiTrack = engine.addTrack({
  type: 'midi',
  name: 'Synth',
}) as MIDITrack;

// Add notes
midiTrack.addNote({ note: 'C4', time: 0, duration: 0.5, velocity: 0.8 });
midiTrack.addNote({ note: 'E4', time: 0.5, duration: 0.5, velocity: 0.8 });
midiTrack.addNote({ note: 'G4', time: 1, duration: 0.5, velocity: 0.8 });

// Change synth
midiTrack.setSynthType('fmsynth');

// Play
await engine.play();
```

### Project Management

```typescript
// Save project
const projectData = await engine.saveProject();
localStorage.setItem('project', JSON.stringify(projectData));

// Load project
const saved = JSON.parse(localStorage.getItem('project'));
await engine.loadProject(saved);
```

## Performance

- **Sample Rate:** 48kHz (professional standard)
- **Latency:** <10ms in interactive mode
- **Max Tracks:** 50+ simultaneous tracks
- **Memory:** <100MB for typical projects
- **Synchronization:** Sample-accurate playback

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14.1+
- Edge 90+

Requires Web Audio API and modern JavaScript features.

## License

MIT

## Contributing

See main DAWG AI repository for contribution guidelines.
