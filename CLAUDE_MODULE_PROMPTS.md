# DAWG AI - Claude Code Module Prompts
## Comprehensive Implementation Guide for Parallel Development

---

## Table of Contents
1. [Module 1: Design System](#module-1-design-system)
2. [Module 2: Audio Engine Core](#module-2-audio-engine-core)
3. [Module 3: Track Manager](#module-3-track-manager)
4. [Module 4: MIDI Editor](#module-4-midi-editor)
5. [Module 5: Effects Processor](#module-5-effects-processor)
6. [Module 6: Voice Interface](#module-6-voice-interface)
7. [Module 7: AI Beat Generator](#module-7-ai-beat-generator)
8. [Module 8: AI Vocal Coach](#module-8-ai-vocal-coach)
9. [Module 9: AI Mixing & Mastering](#module-9-ai-mixing--mastering)
10. [Module 10: Cloud Storage & Backend](#module-10-cloud-storage--backend)
11. [Module 11: Integration & Testing](#module-11-integration--testing)

---

## Module 1: Design System

**Timeline**: Week 1 | **Priority**: Critical | **Dependencies**: None

### Prompt

```
Create a comprehensive design system for DAWG AI, a browser-based music production application.

REQUIREMENTS:
- Dark mode primary (producer-friendly), light mode optional
- Atomic design methodology (atoms → molecules → organisms)
- Music production aesthetic (waveforms, knobs, faders)
- WCAG 2.1 AA accessibility compliance

COMPONENTS TO CREATE:

1. ATOMS:
   - Button (primary, secondary, ghost, danger)
   - Knob (rotary control with drag interaction)
   - Fader (vertical slider with value display)
   - Toggle (on/off switch)
   - Input (text, number with validation)
   - Label (various sizes and weights)
   - Icon (SVG sprite system)
   - Meter (VU meter, level indicator)

2. MOLECULES:
   - FaderChannel (fader + label + meter + mute/solo)
   - TrackHeader (name, icon, color, controls)
   - TransportControls (play, stop, record, loop)
   - EffectSlot (effect selector + on/off + preset)
   - WaveformDisplay (canvas-based audio visualization)
   - PianoKey (white/black keys with velocity)

3. ORGANISMS:
   - Mixer (multi-channel with master)
   - Timeline (horizontal scrollable track view)
   - PianoRoll (MIDI note editor with grid)
   - EffectsRack (chain of effects)
   - BrowserPanel (sample/preset browser)
   - InspectorPanel (track/effect properties)

TECHNICAL SPECS:
- Svelte 5 components with TypeScript
- Tailwind CSS for utility-first styling
- Theme provider with CSS variables
- Storybook for component documentation
- Responsive (desktop-first, tablet support)

STYLING GUIDELINES:
Colors:
- Background: #0a0a0a (deep black)
- Surface: #1a1a1a (dark gray)
- Surface elevated: #2a2a2a
- Border: #333333
- Accent primary: #00d9ff (cyan)
- Accent secondary: #ff006e (pink)
- Success: #00ff88
- Warning: #ffaa00
- Danger: #ff3366
- Waveform gradient: linear-gradient(90deg, #00d9ff, #ff006e)

Typography:
- Primary: Inter (body, UI)
- Monospace: JetBrains Mono (values, code)
- Size scale: 11px, 12px, 14px, 16px, 18px, 24px
- Weight: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

Spacing:
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

Border radius:
- Controls: 4px
- Panels: 8px
- Modals: 12px

Shadows:
- Small: 0 2px 4px rgba(0,0,0,0.5)
- Medium: 0 4px 12px rgba(0,0,0,0.6)
- Large: 0 8px 24px rgba(0,0,0,0.7)

INTERACTION PATTERNS:
- Knobs: Click + drag vertical (pixel-to-value mapping)
- Faders: Click + drag, click on track to jump
- Transport: Keyboard shortcuts (space = play/pause, R = record)
- Tooltips: Show on hover after 500ms delay
- Context menus: Right-click for advanced options

ACCESSIBILITY:
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Arrow keys, Enter)
- Focus indicators (2px cyan outline)
- Screen reader announcements
- High contrast mode support
- Reduced motion support

FILE STRUCTURE:
```
src/lib/design-system/
├── atoms/
│   ├── Button.svelte
│   ├── Knob.svelte
│   ├── Fader.svelte
│   ├── Toggle.svelte
│   ├── Input.svelte
│   ├── Label.svelte
│   ├── Icon.svelte
│   └── Meter.svelte
├── molecules/
│   ├── FaderChannel.svelte
│   ├── TrackHeader.svelte
│   ├── TransportControls.svelte
│   ├── EffectSlot.svelte
│   ├── WaveformDisplay.svelte
│   └── PianoKey.svelte
├── organisms/
│   ├── Mixer.svelte
│   ├── Timeline.svelte
│   ├── PianoRoll.svelte
│   ├── EffectsRack.svelte
│   ├── BrowserPanel.svelte
│   └── InspectorPanel.svelte
├── theme/
│   ├── theme.css
│   ├── variables.css
│   └── ThemeProvider.svelte
├── utils/
│   ├── knobDrag.ts
│   ├── faderDrag.ts
│   └── canvasUtils.ts
└── types/
    └── design.ts
```

CODE EXAMPLES:

Knob Component:
```typescript
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let value: number = 0;
  export let min: number = 0;
  export let max: number = 127;
  export let label: string = '';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  const dispatch = createEventDispatcher();
  let isDragging = false;
  let startY = 0;
  let startValue = value;

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    startY = e.clientY;
    startValue = value;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    const range = max - min;
    const newValue = Math.max(min, Math.min(max, startValue + (deltaY / 100) * range));
    value = newValue;
    dispatch('change', value);
  }

  $: rotation = ((value - min) / (max - min)) * 270 - 135;
</script>

<div class="knob {size}" role="slider" aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}>
  <svg viewBox="0 0 100 100" on:mousedown={handleMouseDown}>
    <circle cx="50" cy="50" r="45" class="knob-track"/>
    <circle cx="50" cy="50" r="45" class="knob-fill" style="stroke-dasharray: {(value-min)/(max-min)*282} 282"/>
    <g transform="rotate({rotation} 50 50)">
      <line x1="50" y1="15" x2="50" y2="30" class="knob-indicator"/>
    </g>
  </svg>
  {#if label}
    <span class="knob-label">{label}</span>
  {/if}
  <span class="knob-value">{Math.round(value)}</span>
</div>

<style>
  .knob {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: ns-resize;
  }
  .knob.sm { width: 40px; }
  .knob.md { width: 60px; }
  .knob.lg { width: 80px; }

  .knob-track {
    fill: none;
    stroke: var(--color-border);
    stroke-width: 4;
  }
  .knob-fill {
    fill: none;
    stroke: var(--color-accent-primary);
    stroke-width: 4;
    stroke-linecap: round;
    transform: rotate(-135deg);
    transform-origin: center;
  }
  .knob-indicator {
    stroke: var(--color-accent-primary);
    stroke-width: 3;
    stroke-linecap: round;
  }
</style>
```

STORYBOOK CONFIGURATION:
```typescript
// .storybook/main.ts
export default {
  stories: ['../src/lib/design-system/**/*.stories.ts'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
  framework: '@storybook/sveltekit',
};

// Example story
import Knob from './Knob.svelte';

export default {
  title: 'Atoms/Knob',
  component: Knob,
};

export const Default = {
  args: {
    value: 64,
    min: 0,
    max: 127,
    label: 'Cutoff',
    size: 'md',
  },
};
```

OUTPUT DELIVERABLES:
1. All component .svelte files with TypeScript
2. theme.css and variables.css
3. ThemeProvider.svelte for app-wide theming
4. Storybook configuration with all components documented
5. README.md with:
   - Component usage examples
   - Design principles
   - Accessibility guidelines
   - Contribution guide
6. types/design.ts with TypeScript interfaces
7. Utility functions for interactions (knobDrag.ts, etc.)

QUALITY REQUIREMENTS:
- All components must be accessible (test with screen reader)
- Performance: 60 FPS interactions on mid-range devices
- Bundle size: <50KB for entire design system
- Test coverage: >80% for interaction logic
- Reusable, well-documented, production-ready code

Create a design system that's beautiful, accessible, and optimized for real-time audio applications.
```

---

## Module 2: Audio Engine Core

**Timeline**: Week 1-2 | **Priority**: Critical | **Dependencies**: None

### Prompt

```
Create the core audio engine for DAWG AI using Web Audio API and Tone.js.

PURPOSE:
Central audio processing system handling multi-track playback, recording, effects routing, and synchronization.

ARCHITECTURE:
- Singleton AudioEngine class
- Track-based architecture (unlimited tracks)
- Master bus with output limiter
- Send/return effects buses
- Precise timing with Tone.Transport

CORE FEATURES:

1. Multi-track audio playback with sample-accurate sync
2. Recording with multiple inputs (microphone, line-in)
3. Effects chain routing (series and parallel)
4. Mixer with volume, pan, solo, mute per track
5. Master output with metering and limiting
6. Export/bounce functionality
7. Loop recording with take management
8. Automation recording and playback
9. Time stretching and pitch shifting
10. Latency compensation

TECHNICAL REQUIREMENTS:
- Tone.js v15+ for high-level audio
- AudioWorklet for custom processing
- Web Audio API for low-level control
- Memory-efficient buffer management
- Latency optimization (target <10ms)
- Sample rates: 44.1kHz, 48kHz, 96kHz
- Bit depth: 16-bit, 24-bit, 32-bit float

IMPLEMENTATION:

AudioEngine Class:
```typescript
// src/lib/audio/AudioEngine.ts
import * as Tone from 'tone';

export interface AudioEngineConfig {
  sampleRate: number;
  latencyHint: 'interactive' | 'balanced' | 'playback';
  lookAhead: number;
}

export interface TrackConfig {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'aux';
  color: string;
}

export class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext;
  private tracks: Map<string, Track>;
  private masterBus: MasterBus;
  private transport: typeof Tone.Transport;
  private isInitialized: boolean = false;

  private constructor(config?: AudioEngineConfig) {
    const defaultConfig = {
      sampleRate: 48000,
      latencyHint: 'interactive' as const,
      lookAhead: 0.1
    };

    const finalConfig = { ...defaultConfig, ...config };

    this.context = new AudioContext({
      latencyHint: finalConfig.latencyHint,
      sampleRate: finalConfig.sampleRate
    });

    Tone.setContext(this.context);
    this.transport = Tone.Transport;
    this.transport.lookAhead = finalConfig.lookAhead;

    this.tracks = new Map();
    this.masterBus = new MasterBus();
  }

  static getInstance(config?: AudioEngineConfig): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine(config);
    }
    return AudioEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.context.resume();
    await Tone.start();

    this.isInitialized = true;
    console.log('AudioEngine initialized', {
      sampleRate: this.context.sampleRate,
      latency: this.context.baseLatency,
      state: this.context.state
    });
  }

  // Track management
  addTrack(config: TrackConfig): Track {
    const track = new Track(config);
    track.connect(this.masterBus);
    this.tracks.set(config.id, track);
    return track;
  }

  removeTrack(id: string): void {
    const track = this.tracks.get(id);
    if (track) {
      track.dispose();
      this.tracks.delete(id);
    }
  }

  getTrack(id: string): Track | undefined {
    return this.tracks.get(id);
  }

  // Playback control
  play(): void {
    this.transport.start();
  }

  stop(): void {
    this.transport.stop();
  }

  pause(): void {
    this.transport.pause();
  }

  record(trackId: string): void {
    const track = this.getTrack(trackId);
    if (track) {
      track.startRecording();
    }
  }

  stopRecording(trackId: string): void {
    const track = this.getTrack(trackId);
    if (track) {
      track.stopRecording();
    }
  }

  // Transport
  setTempo(bpm: number): void {
    this.transport.bpm.value = bpm;
  }

  getTempo(): number {
    return this.transport.bpm.value;
  }

  setTimeSignature(numerator: number, denominator: number = 4): void {
    this.transport.timeSignature = [numerator, denominator];
  }

  setLoop(start: string, end: string, enabled: boolean = true): void {
    this.transport.loop = enabled;
    this.transport.loopStart = start;
    this.transport.loopEnd = end;
  }

  // Routing
  connectEffect(trackId: string, effect: Effect): void {
    const track = this.getTrack(trackId);
    if (track) {
      track.addEffect(effect);
    }
  }

  routeToSend(trackId: string, sendId: string, amount: number): void {
    const track = this.getTrack(trackId);
    const sendTrack = this.getTrack(sendId);
    if (track && sendTrack) {
      track.sendTo(sendTrack, amount);
    }
  }

  // Export
  async exportMix(format: 'wav' | 'mp3' = 'wav'): Promise<Blob> {
    const recorder = new Tone.Recorder();
    this.masterBus.connect(recorder);

    recorder.start();
    this.play();

    // Wait for transport to finish
    await new Promise(resolve => {
      this.transport.schedule(() => {
        resolve(null);
      }, this.transport.loopEnd);
    });

    const recording = await recorder.stop();
    return recording;
  }

  // Metrics
  getLatency(): number {
    return this.context.baseLatency + this.context.outputLatency;
  }

  getCPULoad(): number {
    // Estimate based on active nodes
    return (this.context.currentTime / this.context.sampleRate) * 100;
  }

  dispose(): void {
    this.tracks.forEach(track => track.dispose());
    this.tracks.clear();
    this.masterBus.dispose();
    this.context.close();
  }
}
```

Track Class:
```typescript
// src/lib/audio/Track.ts
import * as Tone from 'tone';

export class Track {
  public id: string;
  public name: string;
  public type: 'audio' | 'midi' | 'aux';
  public color: string;

  private player: Tone.Player | null = null;
  private recorder: Tone.Recorder | null = null;
  private channel: Tone.Channel;
  private effects: Effect[] = [];
  private clips: Clip[] = [];
  private sends: Map<string, Tone.Send> = new Map();

  constructor(config: TrackConfig) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type;
    this.color = config.color;

    this.channel = new Tone.Channel({
      volume: 0,
      pan: 0,
      mute: false,
      solo: false
    });
  }

  // Audio management
  async loadAudio(url: string): Promise<void> {
    if (this.player) {
      this.player.dispose();
    }
    this.player = new Tone.Player(url).connect(this.channel);
    await this.player.load(url);
  }

  addClip(clip: Clip): void {
    this.clips.push(clip);
    // Schedule clip in transport
  }

  // Recording
  async startRecording(): Promise<void> {
    if (this.type !== 'audio') return;

    this.recorder = new Tone.Recorder();
    const mic = new Tone.UserMedia();
    await mic.open();
    mic.connect(this.recorder);
    this.recorder.start();
  }

  async stopRecording(): Promise<AudioBuffer> {
    if (!this.recorder) throw new Error('Not recording');

    const blob = await this.recorder.stop();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);

    // Create clip from recording
    const clip = new Clip({
      buffer: audioBuffer,
      start: Tone.Transport.seconds,
      duration: audioBuffer.duration
    });
    this.addClip(clip);

    return audioBuffer;
  }

  // Effects
  addEffect(effect: Effect): void {
    this.effects.push(effect);
    this.reconnectEffects();
  }

  removeEffect(effectId: string): void {
    this.effects = this.effects.filter(e => e.id !== effectId);
    this.reconnectEffects();
  }

  private reconnectEffects(): void {
    // Disconnect all
    if (this.player) {
      this.player.disconnect();
    }

    // Reconnect in series
    let prev: any = this.player;
    for (const effect of this.effects) {
      if (prev) {
        prev.connect(effect.input);
        prev = effect.output;
      }
    }

    // Connect to channel
    if (prev) {
      prev.connect(this.channel);
    }
  }

  // Sends
  sendTo(target: Track, amount: number): void {
    const send = new Tone.Send(amount);
    this.channel.connect(send);
    send.connect(target.channel);
    this.sends.set(target.id, send);
  }

  // Mixer controls
  setVolume(db: number): void {
    this.channel.volume.rampTo(db, 0.1);
  }

  setPan(value: number): void {
    this.channel.pan.value = value;
  }

  setMute(mute: boolean): void {
    this.channel.mute = mute;
  }

  setSolo(solo: boolean): void {
    this.channel.solo = solo;
  }

  // Connect to output
  connect(destination: any): void {
    this.channel.connect(destination);
  }

  dispose(): void {
    this.player?.dispose();
    this.recorder?.dispose();
    this.channel.dispose();
    this.effects.forEach(e => e.dispose());
    this.sends.forEach(s => s.dispose());
  }
}
```

MasterBus Class:
```typescript
// src/lib/audio/MasterBus.ts
import * as Tone from 'tone';

export class MasterBus {
  private channel: Tone.Channel;
  private limiter: Tone.Limiter;
  private meter: Tone.Meter;

  constructor() {
    this.channel = new Tone.Channel({ volume: 0 });
    this.limiter = new Tone.Limiter(-0.5);
    this.meter = new Tone.Meter({ channels: 2 });

    this.channel.chain(this.limiter, this.meter, Tone.Destination);
  }

  setVolume(db: number): void {
    this.channel.volume.rampTo(db, 0.1);
  }

  getLevel(): number[] {
    return this.meter.getValue() as number[];
  }

  connect(destination: any): void {
    this.limiter.connect(destination);
  }

  dispose(): void {
    this.channel.dispose();
    this.limiter.dispose();
    this.meter.dispose();
  }
}
```

PERFORMANCE OPTIMIZATION:

1. Buffer Management:
```typescript
class BufferPool {
  private pool: AudioBuffer[] = [];
  private maxSize: number = 100;

  acquire(length: number, channels: number = 2): AudioBuffer {
    const buffer = this.pool.find(b =>
      b.length >= length && b.numberOfChannels === channels
    );

    if (buffer) {
      this.pool = this.pool.filter(b => b !== buffer);
      return buffer;
    }

    return new AudioBuffer({
      length,
      numberOfChannels: channels,
      sampleRate: Tone.context.sampleRate
    });
  }

  release(buffer: AudioBuffer): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(buffer);
    }
  }
}
```

2. AudioWorklet for Pitch Detection:
```typescript
// audio-worklets/pitch-detector.worklet.ts
class PitchDetectorProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array;
  private bufferIndex: number = 0;

  constructor() {
    super();
    this.buffer = new Float32Array(2048);
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const input = inputs[0][0];

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.bufferIndex] = input[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.buffer.length;
    }

    // Run YIN algorithm
    const pitch = this.detectPitch(this.buffer);

    this.port.postMessage({ pitch });

    return true;
  }

  private detectPitch(buffer: Float32Array): number {
    // YIN algorithm implementation
    // Returns frequency in Hz
    return 440.0;
  }
}

registerProcessor('pitch-detector', PitchDetectorProcessor);
```

FILE STRUCTURE:
```
src/lib/audio/
├── AudioEngine.ts
├── Track.ts
├── Clip.ts
├── MasterBus.ts
├── BufferPool.ts
├── effects/
│   ├── Effect.ts
│   ├── EQ.ts
│   ├── Compressor.ts
│   └── Reverb.ts
├── worklets/
│   ├── pitch-detector.worklet.ts
│   └── time-stretcher.worklet.ts
├── utils/
│   ├── audioUtils.ts
│   └── meterUtils.ts
└── types/
    └── audio.ts
```

TESTING:
```typescript
// tests/AudioEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioEngine } from '../AudioEngine';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(async () => {
    engine = AudioEngine.getInstance();
    await engine.initialize();
  });

  it('should initialize with correct sample rate', () => {
    expect(engine.context.sampleRate).toBe(48000);
  });

  it('should add and remove tracks', () => {
    const track = engine.addTrack({ id: '1', name: 'Track 1', type: 'audio' });
    expect(engine.getTrack('1')).toBe(track);

    engine.removeTrack('1');
    expect(engine.getTrack('1')).toBeUndefined();
  });

  it('should control transport', () => {
    engine.setTempo(120);
    expect(engine.getTempo()).toBe(120);
  });
});
```

OUTPUT DELIVERABLES:
1. AudioEngine.ts with complete implementation
2. Track.ts with recording and playback
3. MasterBus.ts with metering
4. Effect classes (EQ, Compressor, Reverb, Delay)
5. AudioWorklet processors (pitch detection, time stretching)
6. BufferPool for memory management
7. Comprehensive tests (>80% coverage)
8. README.md with architecture docs and examples
9. Performance benchmarks

QUALITY REQUIREMENTS:
- Latency <10ms in interactive mode
- No audio dropouts or glitches
- Clean dispose() methods (no memory leaks)
- Sample-accurate synchronization
- CPU usage <30% for 16 tracks

Create production-ready, well-documented code with error handling and edge case coverage.
```

---

## Module 3: Track Manager

**Timeline**: Week 2 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine)

### Prompt

```
Create a comprehensive track management system for DAWG AI that handles track creation, organization, and visual representation.

PURPOSE:
Provide intuitive track management with drag-and-drop reordering, color coding, track grouping, and integration with the audio engine.

CORE FEATURES:

1. Track Types:
   - Audio tracks (waveform display)
   - MIDI tracks (note display)
   - Aux/Return tracks (effects sends)
   - Folder tracks (grouping)
   - Master track (always visible)

2. Track Operations:
   - Create/delete tracks
   - Duplicate tracks (with settings)
   - Rename tracks
   - Reorder tracks (drag-and-drop)
   - Group tracks into folders
   - Color code tracks
   - Freeze tracks (render to audio)

3. Track Properties:
   - Name, color, icon
   - Input/output routing
   - Volume, pan, mute, solo
   - Record arm, monitor
   - Track height (collapsed, small, medium, large)
   - Track width (timeline view)

4. Visual Features:
   - Waveform/MIDI visualization
   - Volume automation curves
   - Clip arrangement
   - Track meters
   - Track headers with controls

TECHNICAL IMPLEMENTATION:

TrackManager Class:
```typescript
// src/lib/tracks/TrackManager.ts
import { writable, derived, type Writable } from 'svelte/store';
import { AudioEngine } from '../audio/AudioEngine';
import type { Track } from '../audio/Track';

export interface TrackData {
  id: string;
  name: string;
  type: 'audio' | 'midi' | 'aux' | 'folder';
  color: string;
  icon?: string;
  order: number;
  height: 'collapsed' | 'small' | 'medium' | 'large';
  parentId?: string; // For folder grouping
  settings: TrackSettings;
}

export interface TrackSettings {
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  recordArm: boolean;
  monitor: boolean;
  frozen: boolean;
  input: string;
  output: string;
}

export class TrackManager {
  private audioEngine: AudioEngine;
  public tracks: Writable<Map<string, TrackData>>;
  public trackOrder: Writable<string[]>;
  public selectedTrackId: Writable<string | null>;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
    this.tracks = writable(new Map());
    this.trackOrder = writable([]);
    this.selectedTrackId = writable(null);
  }

  // Track creation
  createTrack(type: TrackData['type'], name?: string): TrackData {
    const id = this.generateId();
    const trackData: TrackData = {
      id,
      name: name || `${type} ${id}`,
      type,
      color: this.getRandomColor(),
      order: this.getNextOrder(),
      height: 'medium',
      settings: {
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        recordArm: false,
        monitor: false,
        frozen: false,
        input: 'default',
        output: 'master'
      }
    };

    // Create audio engine track
    this.audioEngine.addTrack({
      id,
      name: trackData.name,
      type: type === 'midi' ? 'midi' : 'audio',
      color: trackData.color
    });

    // Add to stores
    this.tracks.update(tracks => {
      tracks.set(id, trackData);
      return tracks;
    });

    this.trackOrder.update(order => [...order, id]);

    return trackData;
  }

  // Track deletion
  deleteTrack(id: string): void {
    this.audioEngine.removeTrack(id);

    this.tracks.update(tracks => {
      tracks.delete(id);
      return tracks;
    });

    this.trackOrder.update(order => order.filter(tid => tid !== id));

    // If selected track was deleted, clear selection
    this.selectedTrackId.update(selected =>
      selected === id ? null : selected
    );
  }

  // Track duplication
  duplicateTrack(id: string): TrackData | null {
    let originalTrack: TrackData | undefined;
    this.tracks.subscribe(tracks => {
      originalTrack = tracks.get(id);
    })();

    if (!originalTrack) return null;

    const newTrack = this.createTrack(originalTrack.type, `${originalTrack.name} (Copy)`);

    // Copy settings
    this.updateTrackSettings(newTrack.id, originalTrack.settings);

    return newTrack;
  }

  // Track reordering
  reorderTrack(trackId: string, newIndex: number): void {
    this.trackOrder.update(order => {
      const currentIndex = order.indexOf(trackId);
      if (currentIndex === -1) return order;

      const newOrder = [...order];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, trackId);

      return newOrder;
    });
  }

  // Track grouping
  groupTracks(trackIds: string[], folderName: string): string {
    const folderId = this.createTrack('folder', folderName).id;

    trackIds.forEach(trackId => {
      this.tracks.update(tracks => {
        const track = tracks.get(trackId);
        if (track) {
          track.parentId = folderId;
        }
        return tracks;
      });
    });

    return folderId;
  }

  ungroupTracks(folderId: string): void {
    this.tracks.update(tracks => {
      tracks.forEach(track => {
        if (track.parentId === folderId) {
          track.parentId = undefined;
        }
      });
      return tracks;
    });

    this.deleteTrack(folderId);
  }

  // Track settings
  updateTrackSettings(id: string, settings: Partial<TrackSettings>): void {
    this.tracks.update(tracks => {
      const track = tracks.get(id);
      if (track) {
        track.settings = { ...track.settings, ...settings };

        // Sync with audio engine
        const audioTrack = this.audioEngine.getTrack(id);
        if (audioTrack) {
          if (settings.volume !== undefined) {
            audioTrack.setVolume(settings.volume);
          }
          if (settings.pan !== undefined) {
            audioTrack.setPan(settings.pan);
          }
          if (settings.mute !== undefined) {
            audioTrack.setMute(settings.mute);
          }
          if (settings.solo !== undefined) {
            audioTrack.setSolo(settings.solo);
          }
        }
      }
      return tracks;
    });
  }

  // Track freezing (render to audio for CPU savings)
  async freezeTrack(id: string): Promise<void> {
    const audioTrack = this.audioEngine.getTrack(id);
    if (!audioTrack) return;

    // Render track to audio buffer
    const audioBuffer = await this.renderTrack(id);

    // Replace track with frozen audio
    // ... implementation

    this.updateTrackSettings(id, { frozen: true });
  }

  unfreezeTrack(id: string): void {
    // Restore original track
    this.updateTrackSettings(id, { frozen: false });
  }

  // Selection
  selectTrack(id: string): void {
    this.selectedTrackId.set(id);
  }

  // Utilities
  private generateId(): string {
    return `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextOrder(): number {
    let maxOrder = -1;
    this.trackOrder.subscribe(order => {
      maxOrder = order.length;
    })();
    return maxOrder;
  }

  private getRandomColor(): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#98d8c8', '#f7dc6f', '#bb8fce'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private async renderTrack(id: string): Promise<AudioBuffer> {
    // Implementation for rendering track to audio
    throw new Error('Not implemented');
  }
}
```

SVELTE COMPONENTS:

TrackList Component:
```svelte
<!-- src/lib/tracks/TrackList.svelte -->
<script lang="ts">
  import { trackManager } from './trackManagerStore';
  import TrackHeader from './TrackHeader.svelte';
  import TrackLanes from './TrackLanes.svelte';
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';

  $: tracks = $trackManager.tracks;
  $: trackOrder = $trackManager.trackOrder;
  $: orderedTracks = trackOrder.map(id => tracks.get(id)).filter(Boolean);

  let dragDisabled = true;

  function handleDndConsider(e: CustomEvent) {
    trackOrder = e.detail.items;
    dragDisabled = false;
  }

  function handleDndFinalize(e: CustomEvent) {
    trackOrder = e.detail.items;
    dragDisabled = true;
  }

  function handleAddTrack(type: 'audio' | 'midi') {
    trackManager.createTrack(type);
  }
</script>

<div class="track-list">
  <div class="track-list-header">
    <button on:click={() => handleAddTrack('audio')}>+ Audio Track</button>
    <button on:click={() => handleAddTrack('midi')}>+ MIDI Track</button>
  </div>

  <div
    class="tracks"
    use:dndzone={{items: orderedTracks, dragDisabled, flipDurationMs: 200}}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each orderedTracks as track (track.id)}
      <div class="track-row" animate:flip={{duration: 200}}>
        <TrackHeader {track} />
        <TrackLanes {track} />
      </div>
    {/each}
  </div>
</div>

<style>
  .track-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-surface);
  }

  .track-list-header {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid var(--color-border);
  }

  .tracks {
    flex: 1;
    overflow-y: auto;
  }

  .track-row {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }
</style>
```

TrackHeader Component:
```svelte
<!-- src/lib/tracks/TrackHeader.svelte -->
<script lang="ts">
  import type { TrackData } from './TrackManager';
  import { trackManager } from './trackManagerStore';
  import Fader from '../design-system/atoms/Fader.svelte';
  import Toggle from '../design-system/atoms/Toggle.svelte';

  export let track: TrackData;

  $: isSelected = $trackManager.selectedTrackId === track.id;

  function handleSelect() {
    trackManager.selectTrack(track.id);
  }

  function handleDelete() {
    if (confirm(`Delete track "${track.name}"?`)) {
      trackManager.deleteTrack(track.id);
    }
  }

  function handleDuplicate() {
    trackManager.duplicateTrack(track.id);
  }

  function handleVolumeChange(e: CustomEvent<number>) {
    trackManager.updateTrackSettings(track.id, { volume: e.detail });
  }

  function handleMuteToggle() {
    trackManager.updateTrackSettings(track.id, { mute: !track.settings.mute });
  }

  function handleSoloToggle() {
    trackManager.updateTrackSettings(track.id, { solo: !track.settings.solo });
  }

  function handleRecordToggle() {
    trackManager.updateTrackSettings(track.id, { recordArm: !track.settings.recordArm });
  }
</script>

<div
  class="track-header"
  class:selected={isSelected}
  style="border-left: 3px solid {track.color}"
  on:click={handleSelect}
>
  <div class="track-info">
    <input
      type="text"
      value={track.name}
      class="track-name"
      on:click|stopPropagation
    />
    <span class="track-type">{track.type}</span>
  </div>

  <div class="track-controls">
    <Toggle
      value={track.settings.recordArm}
      on:change={handleRecordToggle}
      label="R"
      color="danger"
    />
    <Toggle
      value={track.settings.mute}
      on:change={handleMuteToggle}
      label="M"
    />
    <Toggle
      value={track.settings.solo}
      on:change={handleSoloToggle}
      label="S"
    />
  </div>

  <Fader
    value={track.settings.volume}
    min={-60}
    max={6}
    on:change={handleVolumeChange}
  />

  <div class="track-actions">
    <button on:click|stopPropagation={handleDuplicate} title="Duplicate">⧉</button>
    <button on:click|stopPropagation={handleDelete} title="Delete">×</button>
  </div>
</div>

<style>
  .track-header {
    width: 200px;
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: var(--color-surface);
    cursor: pointer;
    transition: background 0.2s;
  }

  .track-header:hover {
    background: var(--color-surface-elevated);
  }

  .track-header.selected {
    background: var(--color-surface-elevated);
  }

  .track-info {
    margin-bottom: 8px;
  }

  .track-name {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--color-text);
    font-size: 14px;
    font-weight: 600;
  }

  .track-type {
    font-size: 11px;
    color: var(--color-text-secondary);
    text-transform: uppercase;
  }

  .track-controls {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
  }

  .track-actions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
  }

  .track-actions button {
    flex: 1;
    padding: 4px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    cursor: pointer;
  }
</style>
```

FILE STRUCTURE:
```
src/lib/tracks/
├── TrackManager.ts
├── trackManagerStore.ts
├── TrackList.svelte
├── TrackHeader.svelte
├── TrackLanes.svelte
├── TrackMeter.svelte
├── FolderTrack.svelte
├── utils/
│   ├── trackColors.ts
│   └── trackIcons.ts
└── types/
    └── track.ts
```

INTEGRATION WITH AUDIO ENGINE:
```typescript
// src/lib/tracks/trackManagerStore.ts
import { AudioEngine } from '../audio/AudioEngine';
import { TrackManager } from './TrackManager';

const audioEngine = AudioEngine.getInstance();
export const trackManager = new TrackManager(audioEngine);
```

OUTPUT DELIVERABLES:
1. TrackManager.ts with full track management logic
2. TrackList.svelte with drag-and-drop reordering
3. TrackHeader.svelte with all controls
4. TrackLanes.svelte for clip visualization
5. Track grouping/folder functionality
6. Track freezing system
7. Undo/redo support for track operations
8. Tests for TrackManager
9. README.md with usage examples

QUALITY REQUIREMENTS:
- Smooth drag-and-drop (<16ms frame time)
- Support 100+ tracks without performance degradation
- Real-time meter updates (60 FPS)
- Keyboard shortcuts (Ctrl+D duplicate, Delete to remove)
- Accessible controls

Create an intuitive, professional track management system.
```

---

## Module 4: MIDI Editor

**Timeline**: Week 3 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine), Module 3 (Track Manager)

### Prompt

```
Create a professional piano roll MIDI editor for DAWG AI inspired by FL Studio's industry-leading design.

PURPOSE:
Enable users to create and edit MIDI notes with an intuitive piano roll interface, velocity editing, quantization, and scale snapping.

CORE FEATURES:

1. Piano Roll Interface:
   - Vertical piano keyboard (C-2 to G8)
   - Horizontal time grid (bars and beats)
   - Note drawing with click-and-drag
   - Note selection (single and multi-select)
   - Note editing (resize, move, delete)
   - Ghost notes (show notes from other tracks)
   - Zoom (horizontal and vertical)
   - Scroll (pan around canvas)

2. Note Operations:
   - Draw notes (pencil tool)
   - Select notes (selection tool)
   - Delete notes (eraser tool or Delete key)
   - Copy/paste notes
   - Duplicate notes (Ctrl+D)
   - Transpose notes
   - Stretch/compress timing
   - Randomize velocity/timing (humanize)

3. Quantization:
   - Grid snap (1/4, 1/8, 1/16, 1/32, triplets)
   - Quantize to grid
   - Quantize strength (0-100%)
   - Swing amount
   - Scale snapping (C major, A minor, etc.)

4. Velocity Editor:
   - Velocity lane below piano roll
   - Visual velocity bars
   - Edit velocity with mouse drag
   - Velocity ramp (gradual increase/decrease)
   - Random velocity

5. Advanced Features:
   - Chord detection and highlighting
   - Arpeggiator
   - Strum humanization
   - MIDI CC automation lanes
   - Polyphonic expression (MPE)

TECHNICAL IMPLEMENTATION:

MIDIEditor Class:
```typescript
// src/lib/midi/MIDIEditor.ts
import * as Tone from 'tone';

export interface MIDINote {
  id: string;
  pitch: number; // MIDI note number (0-127)
  velocity: number; // 0-127
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
}

export interface PianoRollConfig {
  width: number;
  height: number;
  pixelsPerBeat: number;
  lowestNote: number; // MIDI note number
  highestNote: number;
}

export type Tool = 'select' | 'draw' | 'erase';
export type GridDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/64' | '1/4T' | '1/8T' | '1/16T';

export class MIDIEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: PianoRollConfig;
  private notes: MIDINote[] = [];
  private selectedNotes: Set<string> = new Set();
  private tool: Tool = 'draw';
  private gridDivision: GridDivision = '1/16';
  private snapToGrid: boolean = true;
  private snapToScale: boolean = false;
  private scale: number[] = [0, 2, 4, 5, 7, 9, 11]; // C major scale degrees
  private rootNote: number = 60; // C4

  constructor(canvas: HTMLCanvasElement, config: PianoRollConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;

    this.setupEventListeners();
    this.render();
  }

  // Note operations
  addNote(pitch: number, time: number, duration: number, velocity: number = 100): MIDINote {
    if (this.snapToScale) {
      pitch = this.quantizePitchToScale(pitch);
    }

    if (this.snapToGrid) {
      time = this.quantizeTime(time);
      duration = this.quantizeTime(duration);
    }

    const note: MIDINote = {
      id: this.generateId(),
      pitch,
      velocity,
      time,
      duration
    };

    this.notes.push(note);
    this.render();
    this.emitChange();

    return note;
  }

  removeNote(id: string): void {
    this.notes = this.notes.filter(n => n.id !== id);
    this.selectedNotes.delete(id);
    this.render();
    this.emitChange();
  }

  updateNote(id: string, updates: Partial<MIDINote>): void {
    const note = this.notes.find(n => n.id === id);
    if (note) {
      Object.assign(note, updates);
      this.render();
      this.emitChange();
    }
  }

  // Selection
  selectNote(id: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.selectedNotes.clear();
    }
    this.selectedNotes.add(id);
    this.render();
  }

  selectNotesInRect(x1: number, y1: number, x2: number, y2: number): void {
    this.selectedNotes.clear();

    const time1 = this.pixelToTime(Math.min(x1, x2));
    const time2 = this.pixelToTime(Math.max(x1, x2));
    const pitch1 = this.pixelToPitch(Math.max(y1, y2));
    const pitch2 = this.pixelToPitch(Math.min(y1, y2));

    this.notes.forEach(note => {
      if (
        note.time >= time1 &&
        note.time + note.duration <= time2 &&
        note.pitch >= pitch1 &&
        note.pitch <= pitch2
      ) {
        this.selectedNotes.add(note.id);
      }
    });

    this.render();
  }

  // Quantization
  quantizeTime(time: number): number {
    const beatDuration = 60 / Tone.Transport.bpm.value;
    const division = this.getDivisionValue();
    const snapInterval = beatDuration / division;

    return Math.round(time / snapInterval) * snapInterval;
  }

  quantizePitchToScale(pitch: number): number {
    const octave = Math.floor(pitch / 12);
    const pitchClass = pitch % 12;
    const rootPitchClass = this.rootNote % 12;

    // Find closest scale degree
    let closestDegree = this.scale[0];
    let minDistance = Math.abs(pitchClass - (rootPitchClass + this.scale[0]) % 12);

    for (const degree of this.scale) {
      const scalePitch = (rootPitchClass + degree) % 12;
      const distance = Math.abs(pitchClass - scalePitch);

      if (distance < minDistance) {
        minDistance = distance;
        closestDegree = degree;
      }
    }

    return octave * 12 + (rootPitchClass + closestDegree) % 12;
  }

  quantizeSelectedNotes(): void {
    this.selectedNotes.forEach(id => {
      const note = this.notes.find(n => n.id === id);
      if (note) {
        note.time = this.quantizeTime(note.time);
        note.duration = this.quantizeTime(note.duration);
        if (this.snapToScale) {
          note.pitch = this.quantizePitchToScale(note.pitch);
        }
      }
    });

    this.render();
    this.emitChange();
  }

  // Coordinate conversion
  timeToPixel(time: number): number {
    const beatDuration = 60 / Tone.Transport.bpm.value;
    const beats = time / beatDuration;
    return beats * this.config.pixelsPerBeat;
  }

  pixelToTime(pixel: number): number {
    const beatDuration = 60 / Tone.Transport.bpm.value;
    const beats = pixel / this.config.pixelsPerBeat;
    return beats * beatDuration;
  }

  pitchToPixel(pitch: number): number {
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;
    return (this.config.highestNote - pitch) * noteHeight;
  }

  pixelToPitch(pixel: number): number {
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;
    return Math.floor(this.config.highestNote - pixel / noteHeight);
  }

  // Rendering
  render(): void {
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);

    this.drawGrid();
    this.drawPianoRoll();
    this.drawNotes();
    this.drawSelection();
  }

  private drawGrid(): void {
    const beatDuration = 60 / Tone.Transport.bpm.value;
    const division = this.getDivisionValue();
    const snapInterval = beatDuration / division;

    // Vertical lines (time grid)
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;

    for (let time = 0; time < this.pixelToTime(this.config.width); time += snapInterval) {
      const x = this.timeToPixel(time);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.config.height);
      this.ctx.stroke();
    }

    // Horizontal lines (piano roll)
    const noteRange = this.config.highestNote - this.config.lowestNote;
    const noteHeight = this.config.height / noteRange;

    for (let pitch = this.config.lowestNote; pitch <= this.config.highestNote; pitch++) {
      const y = this.pitchToPixel(pitch);
      const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12);

      this.ctx.fillStyle = isBlackKey ? '#1a1a1a' : '#0a0a0a';
      this.ctx.fillRect(0, y, this.config.width, noteHeight);

      this.ctx.strokeStyle = '#222';
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.config.width, y);
      this.ctx.stroke();
    }
  }

  private drawPianoRoll(): void {
    // Draw piano keyboard on the left (handled by separate component)
  }

  private drawNotes(): void {
    this.notes.forEach(note => {
      const x = this.timeToPixel(note.time);
      const y = this.pitchToPixel(note.pitch);
      const width = this.timeToPixel(note.duration);
      const height = this.config.height / (this.config.highestNote - this.config.lowestNote);

      const isSelected = this.selectedNotes.has(note.id);

      // Note rectangle
      this.ctx.fillStyle = isSelected ? '#00d9ff' : '#ff006e';
      this.ctx.globalAlpha = note.velocity / 127 * 0.8 + 0.2;
      this.ctx.fillRect(x, y, width, height);

      // Note border
      this.ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.globalAlpha = 1;
      this.ctx.strokeRect(x, y, width, height);
    });
  }

  private drawSelection(): void {
    // Draw selection rectangle if in selection mode
  }

  // Event handling
  private setupEventListeners(): void {
    let isDrawing = false;
    let dragStartX = 0;
    let dragStartY = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (this.tool === 'draw') {
        const pitch = this.pixelToPitch(y);
        const time = this.pixelToTime(x);
        this.addNote(pitch, time, this.pixelToTime(this.config.pixelsPerBeat / 4), 100);
      } else if (this.tool === 'select') {
        dragStartX = x;
        dragStartY = y;
        isDrawing = true;
      }
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (isDrawing && this.tool === 'select') {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.selectNotesInRect(dragStartX, dragStartY, x, y);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        this.selectedNotes.forEach(id => this.removeNote(id));
      } else if (e.key === 'q' && (e.ctrlKey || e.metaKey)) {
        this.quantizeSelectedNotes();
      }
    });
  }

  // Utilities
  private getDivisionValue(): number {
    const divisions: Record<GridDivision, number> = {
      '1/4': 1,
      '1/8': 2,
      '1/16': 4,
      '1/32': 8,
      '1/64': 16,
      '1/4T': 3/4,
      '1/8T': 3/2,
      '1/16T': 3
    };
    return divisions[this.gridDivision];
  }

  private generateId(): string {
    return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitChange(): void {
    // Emit event for external listeners
    this.canvas.dispatchEvent(new CustomEvent('notesChange', {
      detail: { notes: this.notes }
    }));
  }

  // Public API
  setTool(tool: Tool): void {
    this.tool = tool;
  }

  setGridDivision(division: GridDivision): void {
    this.gridDivision = division;
    this.render();
  }

  setSnapToGrid(enabled: boolean): void {
    this.snapToGrid = enabled;
  }

  setSnapToScale(enabled: boolean): void {
    this.snapToScale = enabled;
  }

  setScale(scale: number[], rootNote: number): void {
    this.scale = scale;
    this.rootNote = rootNote;
  }

  getNotes(): MIDINote[] {
    return [...this.notes];
  }

  setNotes(notes: MIDINote[]): void {
    this.notes = notes;
    this.render();
  }
}
```

SVELTE COMPONENT:

```svelte
<!-- src/lib/midi/PianoRoll.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { MIDIEditor, type Tool, type GridDivision } from './MIDIEditor';

  export let trackId: string;

  let canvas: HTMLCanvasElement;
  let editor: MIDIEditor;
  let tool: Tool = 'draw';
  let gridDivision: GridDivision = '1/16';
  let snapToGrid = true;
  let snapToScale = false;

  onMount(() => {
    editor = new MIDIEditor(canvas, {
      width: 2000,
      height: 600,
      pixelsPerBeat: 100,
      lowestNote: 24, // C1
      highestNote: 96  // C7
    });

    canvas.addEventListener('notesChange', handleNotesChange);

    return () => {
      canvas.removeEventListener('notesChange', handleNotesChange);
    };
  });

  function handleNotesChange(e: CustomEvent) {
    // Sync with audio engine
    console.log('Notes changed:', e.detail.notes);
  }

  function handleToolChange(newTool: Tool) {
    tool = newTool;
    editor.setTool(newTool);
  }

  function handleGridChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    gridDivision = select.value as GridDivision;
    editor.setGridDivision(gridDivision);
  }
</script>

<div class="piano-roll">
  <div class="toolbar">
    <div class="tool-group">
      <button
        class:active={tool === 'select'}
        on:click={() => handleToolChange('select')}
      >
        Select
      </button>
      <button
        class:active={tool === 'draw'}
        on:click={() => handleToolChange('draw')}
      >
        Draw
      </button>
      <button
        class:active={tool === 'erase'}
        on:click={() => handleToolChange('erase')}
      >
        Erase
      </button>
    </div>

    <div class="grid-controls">
      <label>
        Grid:
        <select value={gridDivision} on:change={handleGridChange}>
          <option value="1/4">1/4</option>
          <option value="1/8">1/8</option>
          <option value="1/16">1/16</option>
          <option value="1/32">1/32</option>
          <option value="1/4T">1/4T</option>
          <option value="1/8T">1/8T</option>
        </select>
      </label>

      <label>
        <input type="checkbox" bind:checked={snapToGrid} />
        Snap to Grid
      </label>

      <label>
        <input type="checkbox" bind:checked={snapToScale} />
        Snap to Scale
      </label>
    </div>
  </div>

  <div class="editor-container">
    <canvas bind:this={canvas} width="2000" height="600"></canvas>
  </div>
</div>

<style>
  .piano-roll {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--color-background);
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .tool-group {
    display: flex;
    gap: 8px;
  }

  .tool-group button {
    padding: 6px 12px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text);
    cursor: pointer;
  }

  .tool-group button.active {
    background: var(--color-accent-primary);
    color: var(--color-background);
  }

  .grid-controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .editor-container {
    flex: 1;
    overflow: auto;
    background: var(--color-background);
  }

  canvas {
    display: block;
    cursor: crosshair;
  }
</style>
```

FILE STRUCTURE:
```
src/lib/midi/
├── MIDIEditor.ts
├── PianoRoll.svelte
├── VelocityEditor.svelte
├── PianoKeyboard.svelte
├── StepSequencer.svelte
├── utils/
│   ├── scales.ts
│   ├── chords.ts
│   └── quantization.ts
└── types/
    └── midi.ts
```

OUTPUT DELIVERABLES:
1. MIDIEditor.ts with complete piano roll logic
2. PianoRoll.svelte component
3. VelocityEditor.svelte for velocity editing
4. PianoKeyboard.svelte (side keyboard)
5. Scale/chord utilities
6. Quantization algorithms
7. Tests for MIDI operations
8. README.md with usage guide

QUALITY REQUIREMENTS:
- 60 FPS rendering (even with 1000+ notes)
- Smooth dragging and resizing
- Keyboard shortcuts (industry standard)
- Undo/redo support
- MIDI file import/export

Create a professional, FL Studio-inspired MIDI editor.
```

---

## Module 5: Effects Processor

**Timeline**: Week 3 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine)

### Prompt

```
Create a comprehensive effects processing system for DAWG AI with professional-grade audio effects.

PURPOSE:
Provide essential mixing and mastering effects with intuitive interfaces and high-quality DSP.

CORE EFFECTS TO IMPLEMENT:

1. **Parametric EQ** (3-band minimum, 8-band ideal)
2. **Compressor** (standard and sidechain)
3. **Reverb** (room, hall, plate algorithms)
4. **Delay** (standard, ping-pong, tape emulation)
5. **Limiter** (loudness control, anti-clipping)
6. **Gate** (noise removal, threshold-based)
7. **Distortion/Saturation** (tube, tape, digital)
8. **Chorus** (stereo widening)
9. **Phaser** (stereo modulation)
10. **Filter** (low-pass, high-pass, band-pass)

TECHNICAL IMPLEMENTATION:

Base Effect Class:
```typescript
// src/lib/effects/Effect.ts
import * as Tone from 'tone';

export interface EffectParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  default: number;
  unit: string;
  step: number;
}

export interface EffectConfig {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, EffectParameter>;
}

export abstract class Effect {
  public id: string;
  public name: string;
  public type: string;
  public enabled: boolean;
  public parameters: Map<string, EffectParameter>;
  public input: Tone.Gain;
  public output: Tone.Gain;
  protected node: any;

  constructor(config: Partial<EffectConfig>) {
    this.id = config.id || this.generateId();
    this.name = config.name || this.type;
    this.type = config.type || 'effect';
    this.enabled = config.enabled !== undefined ? config.enabled : true;
    this.parameters = new Map();

    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(1);

    this.initializeParameters();
    this.createNode();
    this.connect();
  }

  protected abstract initializeParameters(): void;
  protected abstract createNode(): void;

  protected connect(): void {
    if (this.enabled) {
      this.input.connect(this.node);
      this.node.connect(this.output);
    } else {
      this.input.connect(this.output);
    }
  }

  setParameter(name: string, value: number): void {
    const param = this.parameters.get(name);
    if (!param) {
      throw new Error(`Parameter ${name} not found`);
    }

    param.value = Math.max(param.min, Math.min(param.max, value));
    this.updateNode(name, param.value);
  }

  getParameter(name: string): number | undefined {
    return this.parameters.get(name)?.value;
  }

  protected abstract updateNode(parameterName: string, value: number): void;

  toggle(): void {
    this.enabled = !this.enabled;
    this.reconnect();
  }

  private reconnect(): void {
    this.input.disconnect();
    this.node.disconnect();
    this.connect();
  }

  dispose(): void {
    this.input.dispose();
    this.output.dispose();
    if (this.node.dispose) {
      this.node.dispose();
    }
  }

  private generateId(): string {
    return `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON(): EffectConfig {
    const parameters: Record<string, EffectParameter> = {};
    this.parameters.forEach((param, name) => {
      parameters[name] = { ...param };
    });

    return {
      id: this.id,
      name: this.name,
      type: this.type,
      enabled: this.enabled,
      parameters
    };
  }
}
```

Parametric EQ Implementation:
```typescript
// src/lib/effects/EQ.ts
import * as Tone from 'tone';
import { Effect, type EffectParameter } from './Effect';

export class EQ extends Effect {
  protected node: Tone.EQ3;

  protected initializeParameters(): void {
    this.parameters.set('low', {
      name: 'Low',
      value: 0,
      min: -24,
      max: 24,
      default: 0,
      unit: 'dB',
      step: 0.1
    });

    this.parameters.set('mid', {
      name: 'Mid',
      value: 0,
      min: -24,
      max: 24,
      default: 0,
      unit: 'dB',
      step: 0.1
    });

    this.parameters.set('high', {
      name: 'High',
      value: 0,
      min: -24,
      max: 24,
      default: 0,
      unit: 'dB',
      step: 0.1
    });

    this.parameters.set('lowFrequency', {
      name: 'Low Freq',
      value: 400,
      min: 20,
      max: 1000,
      default: 400,
      unit: 'Hz',
      step: 1
    });

    this.parameters.set('highFrequency', {
      name: 'High Freq',
      value: 2500,
      min: 1000,
      max: 20000,
      default: 2500,
      unit: 'Hz',
      step: 1
    });
  }

  protected createNode(): void {
    this.node = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 400,
      highFrequency: 2500
    });

    this.type = 'eq';
    this.name = 'Parametric EQ';
  }

  protected updateNode(parameterName: string, value: number): void {
    switch (parameterName) {
      case 'low':
        this.node.low.value = value;
        break;
      case 'mid':
        this.node.mid.value = value;
        break;
      case 'high':
        this.node.high.value = value;
        break;
      case 'lowFrequency':
        this.node.lowFrequency.value = value;
        break;
      case 'highFrequency':
        this.node.highFrequency.value = value;
        break;
    }
  }
}
```

Compressor Implementation:
```typescript
// src/lib/effects/Compressor.ts
import * as Tone from 'tone';
import { Effect } from './Effect';

export class Compressor extends Effect {
  protected node: Tone.Compressor;

  protected initializeParameters(): void {
    this.parameters.set('threshold', {
      name: 'Threshold',
      value: -24,
      min: -60,
      max: 0,
      default: -24,
      unit: 'dB',
      step: 0.1
    });

    this.parameters.set('ratio', {
      name: 'Ratio',
      value: 4,
      min: 1,
      max: 20,
      default: 4,
      unit: ':1',
      step: 0.1
    });

    this.parameters.set('attack', {
      name: 'Attack',
      value: 0.003,
      min: 0.001,
      max: 1,
      default: 0.003,
      unit: 's',
      step: 0.001
    });

    this.parameters.set('release', {
      name: 'Release',
      value: 0.25,
      min: 0.01,
      max: 2,
      default: 0.25,
      unit: 's',
      step: 0.01
    });

    this.parameters.set('knee', {
      name: 'Knee',
      value: 6,
      min: 0,
      max: 40,
      default: 6,
      unit: 'dB',
      step: 1
    });
  }

  protected createNode(): void {
    this.node = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 6
    });

    this.type = 'compressor';
    this.name = 'Compressor';
  }

  protected updateNode(parameterName: string, value: number): void {
    switch (parameterName) {
      case 'threshold':
        this.node.threshold.value = value;
        break;
      case 'ratio':
        this.node.ratio.value = value;
        break;
      case 'attack':
        this.node.attack.value = value;
        break;
      case 'release':
        this.node.release.value = value;
        break;
      case 'knee':
        this.node.knee.value = value;
        break;
    }
  }

  getGainReduction(): number {
    // Return current gain reduction in dB
    return 0; // Implement meter reading
  }
}
```

Reverb Implementation:
```typescript
// src/lib/effects/Reverb.ts
import * as Tone from 'tone';
import { Effect } from './Effect';

export class Reverb extends Effect {
  protected node: Tone.Reverb;
  private wetDry: Tone.CrossFade;

  protected initializeParameters(): void {
    this.parameters.set('decay', {
      name: 'Decay',
      value: 1.5,
      min: 0.1,
      max: 10,
      default: 1.5,
      unit: 's',
      step: 0.1
    });

    this.parameters.set('preDelay', {
      name: 'Pre-Delay',
      value: 0.01,
      min: 0,
      max: 0.1,
      default: 0.01,
      unit: 's',
      step: 0.001
    });

    this.parameters.set('wet', {
      name: 'Mix',
      value: 0.3,
      min: 0,
      max: 1,
      default: 0.3,
      unit: '',
      step: 0.01
    });
  }

  protected createNode(): void {
    this.node = new Tone.Reverb({
      decay: 1.5,
      preDelay: 0.01
    });

    this.wetDry = new Tone.CrossFade(0.3);

    this.type = 'reverb';
    this.name = 'Reverb';
  }

  protected connect(): void {
    if (this.enabled) {
      // Parallel routing for wet/dry mix
      this.input.connect(this.wetDry.a); // Dry
      this.input.connect(this.node);
      this.node.connect(this.wetDry.b); // Wet
      this.wetDry.connect(this.output);
    } else {
      this.input.connect(this.output);
    }
  }

  protected updateNode(parameterName: string, value: number): void {
    switch (parameterName) {
      case 'decay':
        this.node.decay = value;
        break;
      case 'preDelay':
        this.node.preDelay = value;
        break;
      case 'wet':
        this.wetDry.fade.value = value;
        break;
    }
  }
}
```

EffectsRack Manager:
```typescript
// src/lib/effects/EffectsRack.ts
import { writable, type Writable } from 'svelte/store';
import { Effect } from './Effect';

export class EffectsRack {
  public effects: Writable<Effect[]>;
  private input: Tone.Gain;
  private output: Tone.Gain;

  constructor() {
    this.effects = writable([]);
    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(1);
  }

  addEffect(effect: Effect, index?: number): void {
    this.effects.update(effects => {
      if (index !== undefined) {
        effects.splice(index, 0, effect);
      } else {
        effects.push(effect);
      }
      this.reconnect();
      return effects;
    });
  }

  removeEffect(id: string): void {
    this.effects.update(effects => {
      const index = effects.findIndex(e => e.id === id);
      if (index !== -1) {
        const effect = effects[index];
        effect.dispose();
        effects.splice(index, 1);
        this.reconnect();
      }
      return effects;
    });
  }

  reorderEffect(fromIndex: number, toIndex: number): void {
    this.effects.update(effects => {
      const effect = effects[fromIndex];
      effects.splice(fromIndex, 1);
      effects.splice(toIndex, 0, effect);
      this.reconnect();
      return effects;
    });
  }

  private reconnect(): void {
    let prev: any = this.input;

    let currentEffects: Effect[] = [];
    this.effects.subscribe(e => currentEffects = e)();

    for (const effect of currentEffects) {
      prev.connect(effect.input);
      prev = effect.output;
    }

    prev.connect(this.output);
  }

  connect(destination: any): void {
    this.output.connect(destination);
  }

  getInput(): Tone.Gain {
    return this.input;
  }

  getOutput(): Tone.Gain {
    return this.output;
  }
}
```

SVELTE COMPONENTS:

EffectsRack UI:
```svelte
<!-- src/lib/effects/EffectsRackUI.svelte -->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import type { Effect } from './Effect';
  import EffectSlot from './EffectSlot.svelte';
  import { EQ } from './EQ';
  import { Compressor } from './Compressor';
  import { Reverb } from './Reverb';

  export let rack: EffectsRack;

  $: effects = $rack.effects;

  let showEffectBrowser = false;

  const availableEffects = [
    { type: 'eq', name: 'Parametric EQ', class: EQ },
    { type: 'compressor', name: 'Compressor', class: Compressor },
    { type: 'reverb', name: 'Reverb', class: Reverb },
    // ... more effects
  ];

  function handleAddEffect(effectClass: any) {
    const effect = new effectClass({});
    rack.addEffect(effect);
    showEffectBrowser = false;
  }

  function handleDndConsider(e: CustomEvent) {
    effects = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent) {
    effects = e.detail.items;
  }
</script>

<div class="effects-rack">
  <div class="rack-header">
    <h3>Effects</h3>
    <button on:click={() => showEffectBrowser = !showEffectBrowser}>
      + Add Effect
    </button>
  </div>

  {#if showEffectBrowser}
    <div class="effect-browser">
      {#each availableEffects as effect}
        <button
          class="effect-option"
          on:click={() => handleAddEffect(effect.class)}
        >
          {effect.name}
        </button>
      {/each}
    </div>
  {/if}

  <div
    class="effects-list"
    use:dndzone={{items: effects, flipDurationMs: 200}}
    on:consider={handleDndConsider}
    on:finalize={handleDndFinalize}
  >
    {#each effects as effect (effect.id)}
      <div animate:flip={{duration: 200}}>
        <EffectSlot {effect} {rack} />
      </div>
    {/each}
  </div>
</div>

<style>
  .effects-rack {
    background: var(--color-surface);
    border-radius: 8px;
    padding: 16px;
  }

  .rack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .effect-browser {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--color-background);
    border-radius: 4px;
  }

  .effect-option {
    padding: 12px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
  }

  .effects-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
```

FILE STRUCTURE:
```
src/lib/effects/
├── Effect.ts (base class)
├── EffectsRack.ts
├── EffectsRackUI.svelte
├── EffectSlot.svelte
├── effects/
│   ├── EQ.ts
│   ├── Compressor.ts
│   ├── Reverb.ts
│   ├── Delay.ts
│   ├── Limiter.ts
│   ├── Gate.ts
│   ├── Distortion.ts
│   ├── Chorus.ts
│   ├── Phaser.ts
│   └── Filter.ts
├── ui/
│   ├── KnobRow.svelte
│   ├── SpectrumAnalyzer.svelte
│   └── GainReductionMeter.svelte
└── types/
    └── effects.ts
```

OUTPUT DELIVERABLES:
1. Base Effect class with parameter system
2. 10 professional effects implementations
3. EffectsRack for chain management
4. Drag-and-drop effect reordering
5. Effect presets system
6. Visual feedback (spectrum analyzer, meters)
7. Tests for each effect
8. README.md with effect documentation

QUALITY REQUIREMENTS:
- Professional-grade DSP quality
- Low CPU usage (<5% per effect)
- Real-time parameter changes (no clicks/pops)
- Preset management
- A/B comparison

Create studio-quality effects with intuitive interfaces.
```

---

## Module 6: Voice Interface

**Timeline**: Week 4 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine), Module 3 (Track Manager)

### Prompt

```
Create a voice-controlled interface for DAWG AI that allows producers to control the DAW through natural conversation.

PURPOSE:
Enable hands-free DAW control via voice commands like "add a kick drum on every beat" or "make the vocals louder".

ARCHITECTURE:
```
Microphone → Deepgram STT → Claude LLM → Command Parser → DAW Actions
                ↓                           ↓
          Transcript Display          Visual Feedback
                                           ↓
                                   ElevenLabs TTS → Audio Response
```

FEATURES:
1. Continuous speech recognition with wake word ("Hey DAWG")
2. Natural language command parsing
3. Context-aware conversation (remembers previous commands)
4. Visual feedback (show recognized text, executing action)
5. Text-to-speech confirmations
6. Multimodal (voice + visual controls work together)

IMPLEMENTATION REQUIREMENTS:
- Deepgram Nova-3 for real-time STT
- Claude 3.5 Sonnet API for NLU
- ElevenLabs v3 for TTS responses
- WebSocket for streaming audio
- LangChain-style conversation memory

COMMAND CATEGORIES:
1. **Playback**: play, stop, record, pause, rewind
2. **Track Management**: add/remove tracks, solo, mute, rename
3. **Parameter Control**: volume, pan, effects parameters
4. **Creative**: generate beats, add instruments, create melodies
5. **Mixing**: balance, EQ, compression adjustments
6. **Project**: save, load, export, undo, redo

TECHNICAL IMPLEMENTATION:

VoiceInterface Class:
```typescript
// src/lib/voice/VoiceInterface.ts
import { createClient, type LiveTranscriptionEvents } from '@deepgram/sdk';
import Anthropic from '@anthropic-ai/sdk';

export interface VoiceCommand {
  transcript: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

export class VoiceInterface {
  private deepgram: ReturnType<typeof createClient>;
  private anthropic: Anthropic;
  private isListening: boolean = false;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private audioContext: AudioContext;
  private mediaStream: MediaStream | null = null;
  private wakeLock: WakeLockSentinel | null = null;

  constructor() {
    this.deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY);
    this.anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.audioContext = new AudioContext({ sampleRate: 16000 });
  }

  async startListening(): Promise<void> {
    if (this.isListening) return;

    // Request microphone access
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Keep screen awake during voice control
    if ('wakeLock' in navigator) {
      this.wakeLock = await navigator.wakeLock.request('screen');
    }

    // Setup Deepgram live transcription
    const connection = this.deepgram.listen.live({
      model: 'nova-3',
      language: 'en',
      smart_format: true,
      interim_results: true,
      endpointing: 300,
      utterance_end_ms: 1000
    });

    connection.on('open', () => {
      console.log('Deepgram connection opened');

      // Stream microphone audio to Deepgram
      const mediaRecorder = new MediaRecorder(this.mediaStream!, {
        mimeType: 'audio/webm'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          connection.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
    });

    connection.on('Results', this.handleTranscript.bind(this));

    connection.on('error', (error) => {
      console.error('Deepgram error:', error);
    });

    this.isListening = true;
  }

  stopListening(): void {
    if (!this.isListening) return;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.wakeLock) {
      this.wakeLock.release();
      this.wakeLock = null;
    }

    this.isListening = false;
  }

  private async handleTranscript(data: LiveTranscriptionEvents): Promise<void> {
    const transcript = data.channel.alternatives[0].transcript;

    if (!transcript || transcript.trim() === '') return;

    const isFinal = data.is_final;

    if (isFinal) {
      console.log('Final transcript:', transcript);
      await this.processCommand(transcript);
    } else {
      // Show interim results
      this.emitEvent('interim-transcript', { transcript });
    }
  }

  async processCommand(transcript: string): Promise<void> {
    this.emitEvent('transcript', { transcript });

    // Check for wake word
    if (this.conversationHistory.length === 0 &&
        !transcript.toLowerCase().includes('hey dawg')) {
      return;
    }

    try {
      // Parse intent with Claude
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: this.getSystemPrompt(),
        messages: [
          ...this.conversationHistory,
          { role: 'user', content: transcript }
        ],
        tools: this.getDAWTools()
      });

      // Add to conversation history
      this.conversationHistory.push(
        { role: 'user', content: transcript },
        {
          role: 'assistant',
          content: response.content[0].type === 'text'
            ? response.content[0].text
            : ''
        }
      );

      // Keep conversation history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      // Execute tool calls
      if (response.stop_reason === 'tool_use') {
        for (const block of response.content) {
          if (block.type === 'tool_use') {
            const result = await this.executeAction(block.name, block.input);
            this.emitEvent('action-executed', { action: block.name, result });
          }
        }
      }

      // Speak response
      const responseText = response.content.find(b => b.type === 'text');
      if (responseText && responseText.type === 'text') {
        await this.speak(responseText.text);
      }

    } catch (error) {
      console.error('Error processing command:', error);
      await this.speak("Sorry, I didn't understand that. Could you try again?");
    }
  }

  private getSystemPrompt(): string {
    return `You are DAWG AI, an expert music production assistant integrated into a digital audio workstation.

Your role is to help bedroom producers create music through natural conversation. You can control the DAW, provide creative suggestions, and explain audio concepts.

CAPABILITIES:
- Control playback (play, stop, record, pause)
- Manage tracks (add, delete, solo, mute, rename)
- Adjust parameters (volume, pan, effects)
- Generate musical content (beats, chords, melodies)
- Apply mixing/mastering techniques
- Provide production advice

GUIDELINES:
- Be concise (1-2 sentences maximum)
- Confirm destructive actions before executing
- Use music production terminology appropriately
- Be encouraging and supportive
- Execute simple commands immediately without asking for confirmation
- For ambiguous commands, ask for clarification

CURRENT PROJECT CONTEXT:
- Tempo: 120 BPM
- Key: C major
- Tracks: [Will be provided dynamically]
- Selected track: [Will be provided dynamically]

When you need to perform an action, use the available tools. Always provide brief verbal confirmation of actions.`;
  }

  private getDAWTools(): any[] {
    return [
      {
        name: 'control_playback',
        description: 'Control DAW playback (play, stop, pause, record)',
        input_schema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['play', 'stop', 'pause', 'record'],
              description: 'The playback action to perform'
            }
          },
          required: ['action']
        }
      },
      {
        name: 'adjust_track_volume',
        description: 'Adjust the volume of a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: {
              type: 'string',
              description: 'ID of the track (or "selected" for current track)'
            },
            volume_db: {
              type: 'number',
              description: 'Volume in dB (-60 to +6)'
            },
            relative: {
              type: 'boolean',
              description: 'If true, adjust relative to current volume'
            }
          },
          required: ['track_id', 'volume_db']
        }
      },
      {
        name: 'add_track',
        description: 'Add a new track to the project',
        input_schema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['audio', 'midi', 'aux'],
              description: 'Type of track to add'
            },
            name: {
              type: 'string',
              description: 'Name for the new track'
            }
          },
          required: ['type']
        }
      },
      {
        name: 'toggle_track_mute',
        description: 'Mute or unmute a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: {
              type: 'string',
              description: 'ID of the track'
            },
            mute: {
              type: 'boolean',
              description: 'True to mute, false to unmute'
            }
          },
          required: ['track_id', 'mute']
        }
      },
      {
        name: 'generate_beat',
        description: 'Generate a drum beat/pattern',
        input_schema: {
          type: 'object',
          properties: {
            style: {
              type: 'string',
              description: 'Beat style (e.g., "trap", "lo-fi", "house")'
            },
            bpm: {
              type: 'number',
              description: 'Tempo in BPM'
            },
            bars: {
              type: 'number',
              description: 'Number of bars'
            }
          },
          required: ['style']
        }
      },
      {
        name: 'add_effect',
        description: 'Add an effect to a track',
        input_schema: {
          type: 'object',
          properties: {
            track_id: {
              type: 'string',
              description: 'ID of the track'
            },
            effect_type: {
              type: 'string',
              enum: ['eq', 'compressor', 'reverb', 'delay', 'distortion'],
              description: 'Type of effect to add'
            }
          },
          required: ['track_id', 'effect_type']
        }
      }
      // Add more tools as needed
    ];
  }

  private async executeAction(actionName: string, parameters: any): Promise<any> {
    console.log(`Executing action: ${actionName}`, parameters);

    // Dispatch to appropriate handler
    switch (actionName) {
      case 'control_playback':
        return await this.handlePlayback(parameters);
      case 'adjust_track_volume':
        return await this.handleVolumeAdjust(parameters);
      case 'add_track':
        return await this.handleAddTrack(parameters);
      case 'toggle_track_mute':
        return await this.handleToggleMute(parameters);
      case 'generate_beat':
        return await this.handleGenerateBeat(parameters);
      case 'add_effect':
        return await this.handleAddEffect(parameters);
      default:
        throw new Error(`Unknown action: ${actionName}`);
    }
  }

  private async handlePlayback(params: { action: string }): Promise<void> {
    const audioEngine = (await import('../audio/AudioEngine')).AudioEngine.getInstance();

    switch (params.action) {
      case 'play':
        audioEngine.play();
        break;
      case 'stop':
        audioEngine.stop();
        break;
      case 'pause':
        audioEngine.pause();
        break;
      case 'record':
        // Handle recording
        break;
    }
  }

  private async handleVolumeAdjust(params: {
    track_id: string;
    volume_db: number;
    relative?: boolean;
  }): Promise<void> {
    const { trackManager } = await import('../tracks/trackManagerStore');

    let trackId = params.track_id;
    if (trackId === 'selected') {
      // Get selected track ID
      trackManager.selectedTrackId.subscribe(id => trackId = id || '')();
    }

    if (params.relative) {
      // Get current volume and adjust
      let currentVolume = 0;
      trackManager.tracks.subscribe(tracks => {
        const track = tracks.get(trackId);
        if (track) {
          currentVolume = track.settings.volume;
        }
      })();

      trackManager.updateTrackSettings(trackId, {
        volume: currentVolume + params.volume_db
      });
    } else {
      trackManager.updateTrackSettings(trackId, {
        volume: params.volume_db
      });
    }
  }

  private async handleAddTrack(params: {
    type: 'audio' | 'midi' | 'aux';
    name?: string;
  }): Promise<void> {
    const { trackManager } = await import('../tracks/trackManagerStore');
    trackManager.createTrack(params.type, params.name);
  }

  private async handleToggleMute(params: {
    track_id: string;
    mute: boolean;
  }): Promise<void> {
    const { trackManager } = await import('../tracks/trackManagerStore');
    trackManager.updateTrackSettings(params.track_id, { mute: params.mute });
  }

  private async handleGenerateBeat(params: {
    style: string;
    bpm?: number;
    bars?: number;
  }): Promise<void> {
    // Integrate with AI beat generator (Module 7)
    this.emitEvent('generate-beat', params);
  }

  private async handleAddEffect(params: {
    track_id: string;
    effect_type: string;
  }): Promise<void> {
    // Integrate with effects processor (Module 5)
    this.emitEvent('add-effect', params);
  }

  private async speak(text: string): Promise<void> {
    this.emitEvent('speaking', { text });

    // Use ElevenLabs for TTS
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      await audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.emitEvent('speaking-done', {});
      };

    } catch (error) {
      console.error('TTS error:', error);
    }
  }

  private emitEvent(eventName: string, data: any): void {
    window.dispatchEvent(new CustomEvent(`voice:${eventName}`, { detail: data }));
  }

  dispose(): void {
    this.stopListening();
    this.conversationHistory = [];
  }
}
```

SVELTE COMPONENTS:

VoiceControl UI:
```svelte
<!-- src/lib/voice/VoiceControl.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { VoiceInterface } from './VoiceInterface';

  let voiceInterface: VoiceInterface;
  let isListening = false;
  let transcript = '';
  let interimTranscript = '';
  let isSpeaking = false;
  let currentAction = '';

  onMount(() => {
    voiceInterface = new VoiceInterface();

    // Event listeners
    window.addEventListener('voice:transcript', handleTranscript as any);
    window.addEventListener('voice:interim-transcript', handleInterimTranscript as any);
    window.addEventListener('voice:speaking', handleSpeaking as any);
    window.addEventListener('voice:speaking-done', handleSpeakingDone as any);
    window.addEventListener('voice:action-executed', handleActionExecuted as any);
  });

  onDestroy(() => {
    voiceInterface?.dispose();
    window.removeEventListener('voice:transcript', handleTranscript as any);
    window.removeEventListener('voice:interim-transcript', handleInterimTranscript as any);
    window.removeEventListener('voice:speaking', handleSpeaking as any);
    window.removeEventListener('voice:speaking-done', handleSpeakingDone as any);
    window.removeEventListener('voice:action-executed', handleActionExecuted as any);
  });

  async function toggleListening() {
    if (isListening) {
      voiceInterface.stopListening();
      isListening = false;
    } else {
      await voiceInterface.startListening();
      isListening = true;
    }
  }

  function handleTranscript(e: CustomEvent) {
    transcript = e.detail.transcript;
    interimTranscript = '';
  }

  function handleInterimTranscript(e: CustomEvent) {
    interimTranscript = e.detail.transcript;
  }

  function handleSpeaking(e: CustomEvent) {
    isSpeaking = true;
  }

  function handleSpeakingDone(e: CustomEvent) {
    isSpeaking = false;
  }

  function handleActionExecuted(e: CustomEvent) {
    currentAction = `Executed: ${e.detail.action}`;
    setTimeout(() => currentAction = '', 3000);
  }
</script>

<div class="voice-control">
  <button
    class="voice-button"
    class:listening={isListening}
    class:speaking={isSpeaking}
    on:click={toggleListening}
  >
    {#if isListening}
      <span class="icon">🎤</span>
      <span class="pulse"></span>
    {:else}
      <span class="icon">🎤</span>
    {/if}
  </button>

  {#if isListening || transcript}
    <div class="transcript-display">
      {#if interimTranscript}
        <p class="interim">{interimTranscript}</p>
      {/if}
      {#if transcript}
        <p class="final">{transcript}</p>
      {/if}
      {#if isSpeaking}
        <p class="response">🔊 DAWG AI is speaking...</p>
      {/if}
      {#if currentAction}
        <p class="action">✓ {currentAction}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .voice-control {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
  }

  .voice-button {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--color-accent-primary);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
  }

  .voice-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 217, 255, 0.5);
  }

  .voice-button.listening {
    background: #ff006e;
    box-shadow: 0 4px 12px rgba(255, 0, 110, 0.3);
  }

  .voice-button.speaking {
    animation: pulse 1s infinite;
  }

  .icon {
    font-size: 32px;
  }

  .pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: inherit;
    opacity: 0.5;
    animation: pulse-ring 1.5s infinite;
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .transcript-display {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 400px;
    max-height: 300px;
    overflow-y: auto;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
  }

  .interim {
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 0 0 8px 0;
  }

  .final {
    color: var(--color-text);
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  .response {
    color: var(--color-accent-primary);
    margin: 8px 0;
  }

  .action {
    color: var(--color-success);
    margin: 8px 0;
  }
</style>
```

FILE STRUCTURE:
```
src/lib/voice/
├── VoiceInterface.ts
├── VoiceControl.svelte
├── TranscriptHistory.svelte
├── WakeWordDetector.ts
├── CommandHistory.svelte
└── types/
    └── voice.ts
```

OUTPUT DELIVERABLES:
1. VoiceInterface.ts with STT, LLM, and TTS integration
2. VoiceControl.svelte UI component
3. Command history and transcript display
4. Integration with all DAW modules
5. Conversation memory management
6. Error handling and fallbacks
7. Tests for voice commands
8. README.md with voice command reference

QUALITY REQUIREMENTS:
- STT latency <300ms
- End-to-end command latency <2s
- 95%+ command recognition accuracy
- Natural, conversational responses
- Graceful fallback to manual control

Create a natural, producer-friendly voice interface.
```

---

## Module 7: AI Beat Generator

**Timeline**: Week 5 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine), Module 4 (MIDI Editor)

### Prompt

```
Create an AI-powered beat generation system for DAWG AI that converts text prompts into drum patterns and full beats.

PURPOSE:
Allow producers to say "give me a trap beat at 140 BPM" and receive a professionally crafted drum pattern instantly.

FEATURES:
1. Text-to-beat generation
2. Genre-specific patterns (trap, hip-hop, house, lo-fi, rock, jazz)
3. Customizable parameters (BPM, complexity, swing, groove)
4. Variation generation (create 4-8 variations from one prompt)
5. MIDI export (editable in piano roll)
6. Audio preview with quality samples
7. Real-time pattern editing
8. Humanization (timing and velocity variations)

TECHNICAL STACK:
- **Backend**: Python FastAPI service
- **Models**:
  - Google Magenta GrooVAE for pattern generation
  - Custom Transformer for style-specific patterns
  - Fine-tuned GPT for prompt parsing
- **Samples**: 500+ professional drum samples
- **Output**: MIDI patterns + rendered audio

BACKEND API:

Python FastAPI Service:
```python
# backend/beat_generator/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import magenta.music as mm
from magenta.models.music_vae import TrainedModel
import anthropic
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MusicVAE model
music_vae = TrainedModel(
    config=mm.configs.CONFIG_MAP['groovae_4bar'],
    batch_size=4,
    checkpoint_dir_or_path='models/groovae_4bar.ckpt'
)

class BeatRequest(BaseModel):
    prompt: str
    bpm: Optional[int] = None
    bars: int = 4
    complexity: str = 'medium'  # simple, medium, complex
    variations: int = 1
    humanize: bool = True

class BeatResponse(BaseModel):
    midi_data: dict
    audio_url: str
    pattern_id: str
    metadata: dict

@app.post("/generate-beat", response_model=List[BeatResponse])
async def generate_beat(request: BeatRequest):
    try:
        # 1. Parse prompt with Claude
        params = await parse_prompt(request.prompt, request.bpm)

        # 2. Generate drum patterns with MusicVAE
        patterns = generate_patterns(
            genre=params['genre'],
            bpm=params['bpm'],
            bars=request.bars,
            complexity=request.complexity,
            variations=request.variations
        )

        # 3. Humanize if requested
        if request.humanize:
            patterns = [humanize_pattern(p) for p in patterns]

        # 4. Render to audio
        responses = []
        for i, pattern in enumerate(patterns):
            # Convert to MIDI
            midi_data = pattern_to_midi(pattern)

            # Render audio
            audio_path = render_pattern_to_audio(pattern, params['bpm'])

            responses.append(BeatResponse(
                midi_data=midi_data,
                audio_url=f"/audio/{audio_path}",
                pattern_id=f"pattern_{i}_{hash(str(pattern))}",
                metadata={
                    'bpm': params['bpm'],
                    'genre': params['genre'],
                    'complexity': request.complexity,
                    'bars': request.bars
                }
            ))

        return responses

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def parse_prompt(prompt: str, bpm_override: Optional[int]) -> dict:
    """Parse natural language prompt to extract beat parameters."""
    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    message = client.messages.create(
        model='claude-3-5-sonnet-20241022',
        max_tokens=1024,
        messages=[{
            'role': 'user',
            'content': f"""Extract beat parameters from this prompt: "{prompt}"

Return JSON with these fields:
{{
  "genre": "trap" | "hip-hop" | "house" | "lo-fi" | "rock" | "jazz",
  "bpm": number (80-180),
  "energy": "low" | "medium" | "high",
  "swing": number (0-100, where 0 is straight, 50 is medium swing, 100 is heavy swing),
  "characteristics": ["hard-hitting", "minimal", "groovy", etc.]
}}"""
        }]
    )

    params = json.loads(message.content[0].text)

    # Override BPM if specified
    if bpm_override:
        params['bpm'] = bpm_override

    return params


def generate_patterns(
    genre: str,
    bpm: int,
    bars: int,
    complexity: str,
    variations: int
) -> List[np.ndarray]:
    """Generate drum patterns using MusicVAE."""

    # Genre-specific conditioning
    genre_templates = {
        'trap': {
            'kick_pattern': [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            'snare_pattern': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            'hihat_pattern': [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
        },
        'hip-hop': {
            'kick_pattern': [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            'snare_pattern': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            'hihat_pattern': [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        },
        # ... more genres
    }

    # Get template
    template = genre_templates.get(genre, genre_templates['hip-hop'])

    # Generate with MusicVAE
    temperature = {
        'simple': 0.3,
        'medium': 0.5,
        'complex': 0.8
    }[complexity]

    patterns = music_vae.sample(
        n=variations,
        length=bars * 16,  # 16th notes per bar
        temperature=temperature
    )

    # Apply genre template influence
    patterns = apply_genre_influence(patterns, template)

    return patterns


def humanize_pattern(pattern: np.ndarray) -> np.ndarray:
    """Add human-like timing and velocity variations."""
    humanized = pattern.copy()

    # Add timing jitter (±10ms)
    timing_jitter = np.random.normal(0, 0.01, pattern.shape)
    humanized['timing'] += timing_jitter

    # Add velocity variation (±10 MIDI units)
    velocity_variation = np.random.normal(0, 10, pattern.shape)
    humanized['velocity'] = np.clip(
        humanized['velocity'] + velocity_variation,
        1, 127
    )

    # Reduce velocity for ghost notes (every other hihat)
    # ... implementation

    return humanized


def render_pattern_to_audio(pattern: np.ndarray, bpm: int) -> str:
    """Render drum pattern to audio file using high-quality samples."""
    import pretty_midi
    from pydub import AudioSegment

    # Load drum samples
    samples = load_drum_samples()

    # Calculate timing
    beat_duration = 60.0 / bpm
    sixteenth_duration = beat_duration / 4

    # Create audio
    audio = AudioSegment.silent(duration=len(pattern) * sixteenth_duration * 1000)

    for i, note in enumerate(pattern):
        if note['velocity'] > 0:
            sample = samples[note['pitch']]

            # Apply velocity
            sample = sample + (20 * np.log10(note['velocity'] / 127))

            # Place in timeline
            position = i * sixteenth_duration * 1000
            audio = audio.overlay(sample, position=int(position))

    # Export
    filename = f"beat_{hash(str(pattern))}.wav"
    audio.export(f"static/audio/{filename}", format='wav')

    return filename


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

FRONTEND INTEGRATION:

TypeScript API Client:
```typescript
// src/lib/ai/BeatGeneratorClient.ts

export interface BeatGenerationRequest {
  prompt: string;
  bpm?: number;
  bars?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  variations?: number;
  humanize?: boolean;
}

export interface BeatGenerationResponse {
  midiData: any;
  audioUrl: string;
  patternId: string;
  metadata: {
    bpm: number;
    genre: string;
    complexity: string;
    bars: number;
  };
}

export class BeatGeneratorClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async generateBeat(request: BeatGenerationRequest): Promise<BeatGenerationResponse[]> {
    const response = await fetch(`${this.baseUrl}/generate-beat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Beat generation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async regenerateWithVariations(patternId: string, count: number): Promise<BeatGenerationResponse[]> {
    const response = await fetch(`${this.baseUrl}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patternId, count })
    });

    return await response.json();
  }
}
```

Svelte Component:
```svelte
<!-- src/lib/ai/BeatGenerator.svelte -->
<script lang="ts">
  import { BeatGeneratorClient, type BeatGenerationResponse } from './BeatGeneratorClient';
  import { trackManager } from '../tracks/trackManagerStore';
  import { AudioEngine } from '../audio/AudioEngine';

  const client = new BeatGeneratorClient();

  let prompt = '';
  let bpm = 120;
  let bars = 4;
  let complexity: 'simple' | 'medium' | 'complex' = 'medium';
  let variations = 4;
  let isGenerating = false;
  let generatedBeats: BeatGenerationResponse[] = [];
  let selectedBeat: BeatGenerationResponse | null = null;

  async function handleGenerate() {
    if (!prompt.trim()) return;

    isGenerating = true;
    try {
      generatedBeats = await client.generateBeat({
        prompt,
        bpm,
        bars,
        complexity,
        variations,
        humanize: true
      });

      // Auto-select first beat
      if (generatedBeats.length > 0) {
        selectedBeat = generatedBeats[0];
      }
    } catch (error) {
      console.error('Beat generation failed:', error);
      alert('Failed to generate beat. Please try again.');
    } finally {
      isGenerating = false;
    }
  }

  async function handleAddToProject() {
    if (!selectedBeat) return;

    // Create new MIDI track
    const track = trackManager.createTrack('midi', 'Generated Beat');

    // Load MIDI data into track
    // ... implementation

    alert('Beat added to project!');
  }

  async function previewBeat(beat: BeatGenerationResponse) {
    const audio = new Audio(beat.audioUrl);
    await audio.play();
  }
</script>

<div class="beat-generator">
  <h2>AI Beat Generator</h2>

  <div class="input-section">
    <input
      type="text"
      bind:value={prompt}
      placeholder="Describe your beat (e.g., 'hard trap beat with rolls')"
      on:keydown={(e) => e.key === 'Enter' && handleGenerate()}
    />

    <div class="parameters">
      <label>
        BPM:
        <input type="number" bind:value={bpm} min="60" max="200" />
      </label>

      <label>
        Bars:
        <input type="number" bind:value={bars} min="1" max="8" />
      </label>

      <label>
        Complexity:
        <select bind:value={complexity}>
          <option value="simple">Simple</option>
          <option value="medium">Medium</option>
          <option value="complex">Complex</option>
        </select>
      </label>

      <label>
        Variations:
        <input type="number" bind:value={variations} min="1" max="8" />
      </label>
    </div>

    <button
      class="generate-btn"
      on:click={handleGenerate}
      disabled={isGenerating || !prompt.trim()}
    >
      {isGenerating ? 'Generating...' : 'Generate Beat'}
    </button>
  </div>

  {#if generatedBeats.length > 0}
    <div class="results-section">
      <h3>Generated Patterns</h3>
      <div class="beat-grid">
        {#each generatedBeats as beat}
          <div
            class="beat-card"
            class:selected={selectedBeat?.patternId === beat.patternId}
            on:click={() => selectedBeat = beat}
          >
            <div class="beat-preview">
              <canvas id="preview-{beat.patternId}"></canvas>
            </div>
            <div class="beat-info">
              <p class="genre">{beat.metadata.genre}</p>
              <p class="bpm">{beat.metadata.bpm} BPM</p>
            </div>
            <button on:click={() => previewBeat(beat)}>▶ Preview</button>
          </div>
        {/each}
      </div>

      {#if selectedBeat}
        <button class="add-btn" on:click={handleAddToProject}>
          Add to Project
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .beat-generator {
    padding: 24px;
    background: var(--color-surface);
    border-radius: 12px;
  }

  .input-section input[type="text"] {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    margin-bottom: 16px;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-text);
  }

  .parameters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .generate-btn {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    font-weight: 600;
    background: var(--color-accent-primary);
    border: none;
    border-radius: 8px;
    color: var(--color-background);
    cursor: pointer;
    transition: all 0.2s;
  }

  .generate-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 217, 255, 0.4);
  }

  .generate-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .beat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin: 16px 0;
  }

  .beat-card {
    background: var(--color-surface-elevated);
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .beat-card:hover {
    border-color: var(--color-accent-primary);
  }

  .beat-card.selected {
    border-color: var(--color-accent-primary);
    background: rgba(0, 217, 255, 0.1);
  }
</style>
```

FILE STRUCTURE:
```
backend/beat_generator/
├── main.py
├── models/
│   ├── groovae_4bar.ckpt
│   └── drum_transformer.pt
├── samples/
│   ├── kicks/
│   ├── snares/
│   ├── hihats/
│   └── percussion/
└── utils/
    ├── pattern_generator.py
    ├── humanizer.py
    └── audio_renderer.py

src/lib/ai/
├── BeatGeneratorClient.ts
├── BeatGenerator.svelte
├── PatternVisualizer.svelte
└── types/
    └── beat.ts
```

OUTPUT DELIVERABLES:
1. Python FastAPI backend with MusicVAE integration
2. Beat generation API with prompt parsing
3. Frontend TypeScript client
4. Svelte UI component
5. Pattern visualization
6. Audio rendering with professional samples
7. Humanization algorithms
8. Tests for beat generation
9. README.md with API documentation

QUALITY REQUIREMENTS:
- Generation time <3s for 4 variations
- Professional-sounding patterns
- Natural humanization
- Genre-accurate results
- High-quality drum samples (24-bit, 48kHz)

Create a beat generator that rivals human-programmed patterns.
```

---

## Module 8: AI Vocal Coach

**Timeline**: Week 5 | **Priority**: Medium | **Dependencies**: Module 2 (Audio Engine)

### Prompt

```
Create an AI-powered vocal coaching system that provides real-time pitch correction, technique feedback, and style training.

PURPOSE:
Help bedroom producers improve their vocal recordings with real-time feedback and automatic corrections.

CORE FEATURES:

1. **Real-time Pitch Correction** (Auto-Tune style)
   - Automatic pitch detection and correction
   - Adjustable correction strength (0-100%)
   - Scale-aware correction
   - Natural formant preservation

2. **Vocal Technique Analysis**
   - Breath control assessment
   - Vibrato consistency tracking
   - Tone quality analysis (spectral centroid, formants)
   - Pitch accuracy scoring

3. **Live Coaching**
   - Real-time visual feedback
   - Immediate technique suggestions
   - Progress tracking over sessions

4. **Style Training**
   - Compare to reference vocals
   - Style matching suggestions
   - Vocal characteristic analysis

TECHNICAL IMPLEMENTATION:

Pitch Detection with ONNX:
```typescript
// src/lib/ai/PitchDetector.ts
import * as ort from 'onnxruntime-web';

export class PitchDetector {
  private session: ort.InferenceSession | null = null;
  private sampleRate: number = 48000;
  private hopLength: number = 512;

  async initialize(): Promise<void> {
    // Load CREPE pitch detection model (ONNX format)
    this.session = await ort.InferenceSession.create('/models/crepe-tiny.onnx', {
      executionProviders: ['webgl', 'wasm']
    });
  }

  async detectPitch(audioBuffer: Float32Array): Promise<PitchDetectionResult> {
    if (!this.session) {
      throw new Error('Pitch detector not initialized');
    }

    // Prepare input tensor
    const input = new ort.Tensor('float32', audioBuffer, [1, audioBuffer.length]);

    // Run inference
    const outputs = await this.session.run({ input });

    // Extract pitch and confidence
    const pitchData = outputs.pitch.data as Float32Array;
    const confidenceData = outputs.confidence.data as Float32Array;

    return {
      pitch: this.midiToPitch(pitchData[0]),
      confidence: confidenceData[0],
      timestamp: Date.now()
    };
  }

  private midiToPitch(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  dispose(): void {
    this.session = null;
  }
}

export interface PitchDetectionResult {
  pitch: number;  // Frequency in Hz
  confidence: number;  // 0-1
  timestamp: number;
}
```

Real-time Pitch Correction with AudioWorklet:
```typescript
// src/lib/audio/worklets/pitch-correction.worklet.ts

interface PitchCorrectionParams {
  correctionStrength: number;  // 0-1
  targetScale: number[];  // MIDI note numbers in scale
  formantPreservation: boolean;
}

class PitchCorrectionProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array;
  private bufferIndex: number = 0;
  private bufferSize: number = 2048;
  private pitchShiftRatio: number = 1.0;

  constructor() {
    super();
    this.buffer = new Float32Array(this.bufferSize);

    this.port.onmessage = (event) => {
      if (event.data.type === 'pitch-correction') {
        this.pitchShiftRatio = event.data.ratio;
      }
    };
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length === 0 || output.length === 0) {
      return true;
    }

    const inputChannel = input[0];
    const outputChannel = output[0];

    // Phase vocoder pitch shifting
    for (let i = 0; i < inputChannel.length; i++) {
      // Fill buffer
      this.buffer[this.bufferIndex] = inputChannel[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;

      // Apply pitch shift (simplified - real implementation uses STFT)
      const readIndex = Math.floor(this.bufferIndex * this.pitchShiftRatio) % this.bufferSize;
      outputChannel[i] = this.buffer[readIndex];
    }

    return true;
  }
}

registerProcessor('pitch-correction', PitchCorrectionProcessor);
```

Vocal Analysis:
```typescript
// src/lib/ai/VocalAnalyzer.ts

export interface VocalMetrics {
  pitchAccuracy: number;  // 0-100
  breathControl: number;  // 0-100
  vibratoConsistency: number;  // 0-100
  toneQuality: number;  // 0-100
  dynamicRange: number;  // dB
}

export class VocalAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private pitchDetector: PitchDetector;
  private targetPitches: number[] = [];

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.pitchDetector = new PitchDetector();
  }

  async initialize(): Promise<void> {
    await this.pitchDetector.initialize();
  }

  async analyzeFrame(audioData: Float32Array): Promise<VocalMetrics> {
    // Detect pitch
    const pitchResult = await this.pitchDetector.detectPitch(audioData);

    // Calculate metrics
    const pitchAccuracy = this.calculatePitchAccuracy(pitchResult);
    const breathControl = this.calculateBreathControl(audioData);
    const vibratoConsistency = this.calculateVibratoConsistency(pitchResult);
    const toneQuality = this.calculateToneQuality(audioData);
    const dynamicRange = this.calculateDynamicRange(audioData);

    return {
      pitchAccuracy,
      breathControl,
      vibratoConsistency,
      toneQuality,
      dynamicRange
    };
  }

  private calculatePitchAccuracy(pitchResult: PitchDetectionResult): number {
    if (this.targetPitches.length === 0) return 100;

    // Find closest target pitch
    const closestTarget = this.targetPitches.reduce((prev, curr) =>
      Math.abs(curr - pitchResult.pitch) < Math.abs(prev - pitchResult.pitch) ? curr : prev
    );

    // Calculate cents deviation
    const centsDeviation = 1200 * Math.log2(pitchResult.pitch / closestTarget);

    // Score: 100 at 0 cents, 0 at 50+ cents
    return Math.max(0, 100 - Math.abs(centsDeviation) * 2);
  }

  private calculateBreathControl(audioData: Float32Array): number {
    // Calculate energy envelope
    const windowSize = 512;
    const energies: number[] = [];

    for (let i = 0; i < audioData.length - windowSize; i += windowSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += audioData[i + j] ** 2;
      }
      energies.push(energy / windowSize);
    }

    // Calculate stability (low variance = good breath control)
    const mean = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + (e - mean) ** 2, 0) / energies.length;
    const stability = 1 / (1 + variance);

    return stability * 100;
  }

  private calculateVibratoConsistency(pitchResult: PitchDetectionResult): number {
    // Detect vibrato (4-8 Hz modulation)
    // ... implementation using FFT on pitch contour
    return 80; // Placeholder
  }

  private calculateToneQuality(audioData: Float32Array): number {
    // Calculate spectral centroid
    const fftData = this.performFFT(audioData);
    const spectralCentroid = this.calculateSpectralCentroid(fftData);

    // Good vocal tone typically has centroid around 1-3 kHz
    const idealCentroid = 2000;
    const deviation = Math.abs(spectralCentroid - idealCentroid) / idealCentroid;

    return Math.max(0, 100 - deviation * 100);
  }

  private calculateDynamicRange(audioData: Float32Array): number {
    const max = Math.max(...audioData.map(Math.abs));
    const rms = Math.sqrt(audioData.reduce((sum, x) => sum + x ** 2, 0) / audioData.length);

    return 20 * Math.log10(max / rms);
  }

  private performFFT(audioData: Float32Array): Float32Array {
    // Use Web Audio API's AnalyserNode
    const freqData = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(freqData);
    return freqData;
  }

  private calculateSpectralCentroid(fftData: Float32Array): number {
    let weightedSum = 0;
    let sum = 0;

    for (let i = 0; i < fftData.length; i++) {
      const magnitude = Math.pow(10, fftData[i] / 20);
      const frequency = (i * this.audioContext.sampleRate) / (2 * fftData.length);

      weightedSum += frequency * magnitude;
      sum += magnitude;
    }

    return weightedSum / sum;
  }

  setTargetPitches(pitches: number[]): void {
    this.targetPitches = pitches;
  }
}
```

Vocal Coach Manager:
```typescript
// src/lib/ai/VocalCoach.ts

export interface CoachingFeedback {
  message: string;
  type: 'suggestion' | 'praise' | 'warning';
  metric: keyof VocalMetrics;
}

export class VocalCoach {
  private analyzer: VocalAnalyzer;
  private history: VocalMetrics[] = [];
  private maxHistory: number = 100;

  constructor(audioContext: AudioContext) {
    this.analyzer = new VocalAnalyzer(audioContext);
  }

  async initialize(): Promise<void> {
    await this.analyzer.initialize();
  }

  async analyzeLive(audioData: Float32Array): Promise<CoachingFeedback[]> {
    const metrics = await this.analyzer.analyzeFrame(audioData);

    // Add to history
    this.history.push(metrics);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Generate feedback
    return this.generateFeedback(metrics);
  }

  private generateFeedback(metrics: VocalMetrics): CoachingFeedback[] {
    const feedback: CoachingFeedback[] = [];

    // Pitch accuracy
    if (metrics.pitchAccuracy < 70) {
      feedback.push({
        message: "You're a bit flat. Push more air and engage your diaphragm!",
        type: 'suggestion',
        metric: 'pitchAccuracy'
      });
    } else if (metrics.pitchAccuracy > 95) {
      feedback.push({
        message: "Excellent pitch! You're right on target.",
        type: 'praise',
        metric: 'pitchAccuracy'
      });
    }

    // Breath control
    if (metrics.breathControl < 60) {
      feedback.push({
        message: "Take a deeper breath before this phrase. Support from your diaphragm!",
        type: 'suggestion',
        metric: 'breathControl'
      });
    }

    // Vibrato
    if (metrics.vibratoConsistency < 70) {
      feedback.push({
        message: "Keep your vibrato more consistent. Relax your throat!",
        type: 'suggestion',
        metric: 'vibratoConsistency'
      });
    }

    // Tone quality
    if (metrics.toneQuality < 65) {
      feedback.push({
        message: "Adjust your vowel shape for a clearer tone.",
        type: 'suggestion',
        metric: 'toneQuality'
      });
    }

    return feedback;
  }

  getProgress(): Record<keyof VocalMetrics, number[]> {
    return {
      pitchAccuracy: this.history.map(m => m.pitchAccuracy),
      breathControl: this.history.map(m => m.breathControl),
      vibratoConsistency: this.history.map(m => m.vibratoConsistency),
      toneQuality: this.history.map(m => m.toneQuality),
      dynamicRange: this.history.map(m => m.dynamicRange)
    };
  }
}
```

SVELTE UI:
```svelte
<!-- src/lib/ai/VocalCoach.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { VocalCoach, type CoachingFeedback } from './VocalCoach';
  import { AudioEngine } from '../audio/AudioEngine';

  let vocalCoach: VocalCoach;
  let isActive = false;
  let feedback: CoachingFeedback[] = [];
  let pitchAccuracy = 0;
  let breathControl = 0;
  let vibratoConsistency = 0;
  let toneQuality = 0;

  let pitchCorrectionStrength = 50;
  let enableAutotune = false;

  onMount(async () => {
    const audioEngine = AudioEngine.getInstance();
    vocalCoach = new VocalCoach(audioEngine.context);
    await vocalCoach.initialize();
  });

  async function startCoaching() {
    isActive = true;

    // Start analyzing audio in real-time
    const audioEngine = AudioEngine.getInstance();
    // ... connect mic input to analyzer

    const analyzeLoop = setInterval(async () => {
      if (!isActive) {
        clearInterval(analyzeLoop);
        return;
      }

      // Get audio data
      const audioData = new Float32Array(2048); // Get from mic input

      // Analyze
      const newFeedback = await vocalCoach.analyzeLive(audioData);
      feedback = newFeedback.slice(0, 3); // Show top 3 suggestions

      // Update metrics
      // ... update UI metrics
    }, 100);
  }

  function stopCoaching() {
    isActive = false;
  }
</script>

<div class="vocal-coach">
  <h2>AI Vocal Coach</h2>

  <div class="controls">
    <button on:click={isActive ? stopCoaching : startCoaching}>
      {isActive ? 'Stop Coaching' : 'Start Coaching'}
    </button>

    <label>
      <input type="checkbox" bind:checked={enableAutotune} />
      Enable Pitch Correction
    </label>

    {#if enableAutotune}
      <label>
        Correction Strength: {pitchCorrectionStrength}%
        <input
          type="range"
          bind:value={pitchCorrectionStrength}
          min="0"
          max="100"
        />
      </label>
    {/if}
  </div>

  {#if isActive}
    <div class="metrics">
      <div class="metric">
        <span>Pitch Accuracy</span>
        <div class="meter">
          <div class="fill" style="width: {pitchAccuracy}%"></div>
        </div>
        <span>{pitchAccuracy.toFixed(0)}%</span>
      </div>

      <div class="metric">
        <span>Breath Control</span>
        <div class="meter">
          <div class="fill" style="width: {breathControl}%"></div>
        </div>
        <span>{breathControl.toFixed(0)}%</span>
      </div>

      <div class="metric">
        <span>Vibrato Consistency</span>
        <div class="meter">
          <div class="fill" style="width: {vibratoConsistency}%"></div>
        </div>
        <span>{vibratoConsistency.toFixed(0)}%</span>
      </div>

      <div class="metric">
        <span>Tone Quality</span>
        <div class="meter">
          <div class="fill" style="width: {toneQuality}%"></div>
        </div>
        <span>{toneQuality.toFixed(0)}%</span>
      </div>
    </div>

    <div class="feedback-section">
      <h3>Live Feedback</h3>
      {#each feedback as item}
        <div class="feedback-item {item.type}">
          <span class="icon">
            {item.type === 'praise' ? '✓' : item.type === 'warning' ? '⚠' : '💡'}
          </span>
          <p>{item.message}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .vocal-coach {
    padding: 24px;
    background: var(--color-surface);
    border-radius: 12px;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 24px 0;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .meter {
    height: 8px;
    background: var(--color-border);
    border-radius: 4px;
    overflow: hidden;
  }

  .meter .fill {
    height: 100%;
    background: linear-gradient(90deg, #ff006e, #00d9ff);
    transition: width 0.2s;
  }

  .feedback-section {
    margin-top: 24px;
  }

  .feedback-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin: 8px 0;
    background: var(--color-surface-elevated);
    border-left: 3px solid var(--color-accent-primary);
    border-radius: 4px;
  }

  .feedback-item.suggestion {
    border-left-color: #00d9ff;
  }

  .feedback-item.praise {
    border-left-color: #00ff88;
  }

  .feedback-item.warning {
    border-left-color: #ffaa00;
  }
</style>
```

FILE STRUCTURE:
```
src/lib/ai/
├── PitchDetector.ts
├── VocalAnalyzer.ts
├── VocalCoach.ts
├── VocalCoach.svelte
├── PitchVisualizer.svelte
└── worklets/
    └── pitch-correction.worklet.ts

models/
└── crepe-tiny.onnx
```

OUTPUT DELIVERABLES:
1. Real-time pitch detection with ONNX
2. Pitch correction AudioWorklet
3. Vocal analysis system
4. Coaching feedback generator
5. Visual progress tracking
6. Svelte UI component
7. Tests for vocal analysis
8. README.md with usage guide

QUALITY REQUIREMENTS:
- Pitch detection latency <10ms
- Accurate pitch detection (>95%)
- Natural-sounding pitch correction
- Helpful, encouraging feedback
- Real-time visualization (60 FPS)

Create a vocal coach that genuinely helps producers improve.
```

---

## Module 9: AI Mixing & Mastering

**Timeline**: Week 6 | **Priority**: High | **Dependencies**: Module 2 (Audio Engine), Module 5 (Effects)

### Prompt

```
Create an AI-powered automated mixing and mastering system for DAWG AI.

PURPOSE:
Enable bedroom producers to achieve professional-sounding mixes and masters without deep technical knowledge.

CORE FEATURES:

1. **Automated Mixing**:
   - Intelligent gain staging (-18dB RMS target per track)
   - Frequency balance optimization (remove masking)
   - Dynamic range control (compression per track)
   - Stereo imaging (panning recommendations)
   - Reverb/space allocation

2. **Automated Mastering**:
   - LUFS normalization (streaming-ready loudness)
   - Multi-band compression
   - Stereo widening
   - Limiting (-0.3dB true peak)
   - Reference matching (match target song)

3. **Analysis & Recommendations**:
   - Spectral analysis (identify frequency conflicts)
   - Loudness metering (LUFS, RMS, True Peak)
   - Dynamic range analysis
   - Stereo correlation
   - AI-powered mixing suggestions

TECHNICAL IMPLEMENTATION:

AutoMixer Class:
```typescript
// src/lib/ai/AutoMixer.ts
import { AudioEngine } from '../audio/AudioEngine';
import type { Track } from '../audio/Track';

export interface MixAnalysis {
  trackAnalysis: Map<string, TrackAnalysis>;
  frequencyBalance: FrequencyBalance;
  dynamicRange: DynamicRangeAnalysis;
  stereoImage: StereoAnalysis;
  suggestions: MixingSuggestion[];
}

export interface TrackAnalysis {
  trackId: string;
  rmsLevel: number;  // dB
  peakLevel: number;  // dB
  frequencySpectrum: Float32Array;
  dynamicRange: number;  // dB
  stereoWidth: number;  // 0-1
  hasClipping: boolean;
}

export interface MixingSuggestion {
  trackId?: string;
  type: 'gain' | 'eq' | 'compression' | 'panning' | 'reverb';
  message: string;
  autoFixAvailable: boolean;
  severity: 'low' | 'medium' | 'high';
}

export class AutoMixer {
  private audioEngine: AudioEngine;
  private analyser: AnalyserNode;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
    this.analyser = audioEngine.context.createAnalyser();
    this.analyser.fftSize = 8192;
  }

  async analyzeMix(tracks: Track[]): Promise<MixAnalysis> {
    const trackAnalysis = new Map<string, TrackAnalysis>();

    // Analyze each track
    for (const track of tracks) {
      const analysis = await this.analyzeTrack(track);
      trackAnalysis.set(track.id, analysis);
    }

    // Analyze overall mix
    const frequencyBalance = this.analyzeFrequencyBalance(trackAnalysis);
    const dynamicRange = this.analyzeDynamicRange(trackAnalysis);
    const stereoImage = this.analyzeStereoImage(trackAnalysis);

    // Generate suggestions
    const suggestions = this.generateSuggestions(trackAnalysis, frequencyBalance, dynamicRange);

    return {
      trackAnalysis,
      frequencyBalance,
      dynamicRange,
      stereoImage,
      suggestions
    };
  }

  private async analyzeTrack(track: Track): Promise<TrackAnalysis> {
    // Get track audio buffer
    const audioBuffer = await this.getTrackBuffer(track);

    // Calculate RMS level
    const rmsLevel = this.calculateRMS(audioBuffer);

    // Calculate peak level
    const peakLevel = this.calculatePeak(audioBuffer);

    // Calculate frequency spectrum
    const frequencySpectrum = this.calculateSpectrum(audioBuffer);

    // Calculate dynamic range
    const dynamicRange = peakLevel - rmsLevel;

    // Calculate stereo width
    const stereoWidth = this.calculateStereoWidth(audioBuffer);

    // Check for clipping
    const hasClipping = peakLevel > -0.3;

    return {
      trackId: track.id,
      rmsLevel,
      peakLevel,
      frequencySpectrum,
      dynamicRange,
      stereoWidth,
      hasClipping
    };
  }

  private calculateRMS(audioBuffer: AudioBuffer): number {
    const channelData = audioBuffer.getChannelData(0);
    let sum = 0;

    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] ** 2;
    }

    const rms = Math.sqrt(sum / channelData.length);
    return 20 * Math.log10(rms);
  }

  private calculatePeak(audioBuffer: AudioBuffer): number {
    let peak = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const channelPeak = Math.max(...channelData.map(Math.abs));
      peak = Math.max(peak, channelPeak);
    }

    return 20 * Math.log10(peak);
  }

  private calculateSpectrum(audioBuffer: AudioBuffer): Float32Array {
    // Use AnalyserNode to get frequency spectrum
    const spectrum = new Float32Array(this.analyser.frequencyBinCount);
    // ... FFT implementation
    return spectrum;
  }

  private calculateStereoWidth(audioBuffer: AudioBuffer): number {
    if (audioBuffer.numberOfChannels < 2) return 0;

    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);

    // Calculate correlation between left and right
    let correlation = 0;
    for (let i = 0; i < left.length; i++) {
      correlation += left[i] * right[i];
    }

    correlation /= left.length;

    // Return stereo width (0 = mono, 1 = wide stereo)
    return 1 - Math.abs(correlation);
  }

  private analyzeFrequencyBalance(trackAnalysis: Map<string, TrackAnalysis>): FrequencyBalance {
    // Identify frequency masking issues
    // ... implementation
    return {
      lowEnd: 'balanced',
      midRange: 'crowded',
      highEnd: 'balanced',
      conflicts: []
    };
  }

  private generateSuggestions(
    trackAnalysis: Map<string, TrackAnalysis>,
    frequencyBalance: FrequencyBalance,
    dynamicRange: DynamicRangeAnalysis
  ): MixingSuggestion[] {
    const suggestions: MixingSuggestion[] = [];

    // Check for clipping
    trackAnalysis.forEach((analysis, trackId) => {
      if (analysis.hasClipping) {
        suggestions.push({
          trackId,
          type: 'gain',
          message: `Track is clipping. Reduce gain by ${Math.abs(analysis.peakLevel).toFixed(1)} dB`,
          autoFixAvailable: true,
          severity: 'high'
        });
      }

      // Check RMS level
      if (analysis.rmsLevel > -12) {
        suggestions.push({
          trackId,
          type: 'gain',
          message: `Track is too loud. Target RMS: -18 dB, Current: ${analysis.rmsLevel.toFixed(1)} dB`,
          autoFixAvailable: true,
          severity: 'medium'
        });
      }

      // Check dynamic range
      if (analysis.dynamicRange < 6) {
        suggestions.push({
          trackId,
          type: 'compression',
          message: 'Track is over-compressed. Consider reducing compression ratio.',
          autoFixAvailable: true,
          severity: 'medium'
        });
      }
    });

    return suggestions;
  }

  async autoMix(tracks: Track[]): Promise<void> {
    const analysis = await this.analyzeMix(tracks);

    // Apply automated mixing
    for (const [trackId, trackAnalysis] of analysis.trackAnalysis) {
      const track = tracks.find(t => t.id === trackId);
      if (!track) continue;

      // 1. Gain staging (target -18 dB RMS)
      const gainAdjustment = -18 - trackAnalysis.rmsLevel;
      track.setVolume(track.channel.volume.value + gainAdjustment);

      // 2. EQ (remove frequency masking)
      // ... apply intelligent EQ

      // 3. Compression (control dynamics)
      // ... apply compression if needed

      // 4. Panning (stereo image)
      // ... adjust panning
    }
  }

  private async getTrackBuffer(track: Track): Promise<AudioBuffer> {
    // Implementation to get track's audio buffer
    throw new Error('Not implemented');
  }
}
```

AutoMaster Class:
```typescript
// src/lib/ai/AutoMaster.ts
import * as Tone from 'tone';

export interface MasteringSettings {
  targetLUFS: number;  // -14 for streaming, -9 for club
  truePeakLimit: number;  // -0.3 dB
  stereoWidth: number;  // 0-100%
  referenceTrack?: AudioBuffer;
}

export class AutoMaster {
  private limiter: Tone.Limiter;
  private multiband: MultibandCompressor;
  private stereoWidener: StereoWidener;
  private lufsTarget: number = -14;

  constructor() {
    this.limiter = new Tone.Limiter(-0.3);
    this.multiband = new MultibandCompressor();
    this.stereoWidener = new StereoWidener();
  }

  async master(audioBuffer: AudioBuffer, settings: MasteringSettings): Promise<AudioBuffer> {
    let processed = audioBuffer;

    // 1. Analyze loudness
    const currentLUFS = this.calculateLUFS(processed);

    // 2. Apply multiband compression
    processed = await this.multiband.process(processed);

    // 3. Apply stereo widening
    processed = await this.stereoWidener.process(processed, settings.stereoWidth / 100);

    // 4. Normalize to target LUFS
    const gainAdjustment = settings.targetLUFS - currentLUFS;
    processed = this.applyGain(processed, gainAdjustment);

    // 5. Apply limiting (brick wall at true peak)
    processed = await this.limitPeaks(processed, settings.truePeakLimit);

    return processed;
  }

  private calculateLUFS(audioBuffer: AudioBuffer): number {
    // ITU-R BS.1770-4 loudness calculation
    // K-weighting filter + gating
    // ... implementation

    // Simplified version:
    const rms = this.calculateRMS(audioBuffer);
    return rms - 0.691;  // Approximate LUFS from RMS
  }

  private calculateRMS(audioBuffer: AudioBuffer): number {
    let sum = 0;
    let samples = 0;

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const data = audioBuffer.getChannelData(channel);
      for (let i = 0; i < data.length; i++) {
        sum += data[i] ** 2;
      }
      samples += data.length;
    }

    return 20 * Math.log10(Math.sqrt(sum / samples));
  }

  private applyGain(audioBuffer: AudioBuffer, gainDB: number): AudioBuffer {
    const gain = Math.pow(10, gainDB / 20);
    const output = new AudioBuffer({
      length: audioBuffer.length,
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate
    });

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const input = audioBuffer.getChannelData(channel);
      const outputData = output.getChannelData(channel);

      for (let i = 0; i < input.length; i++) {
        outputData[i] = input[i] * gain;
      }
    }

    return output;
  }

  private async limitPeaks(audioBuffer: AudioBuffer, ceiling: number): Promise<AudioBuffer> {
    // True peak limiting
    // ... implementation
    return audioBuffer;
  }

  async matchReference(audioBuffer: AudioBuffer, reference: AudioBuffer): Promise<AudioBuffer> {
    // Analyze reference track
    const refLUFS = this.calculateLUFS(reference);
    const refSpectrum = this.analyzeSpectrum(reference);

    // Match loudness
    let matched = audioBuffer;
    const currentLUFS = this.calculateLUFS(matched);
    matched = this.applyGain(matched, refLUFS - currentLUFS);

    // Match spectral balance (intelligent EQ)
    // ... implementation

    return matched;
  }

  private analyzeSpectrum(audioBuffer: AudioBuffer): Float32Array {
    // FFT analysis
    // ... implementation
    return new Float32Array(1024);
  }
}
```

SVELTE UI:
```svelte
<!-- src/lib/ai/AutoMixMaster.svelte -->
<script lang="ts">
  import { AutoMixer } from './AutoMixer';
  import { AutoMaster } from './AutoMaster';
  import { AudioEngine } from '../audio/AudioEngine';
  import { trackManager } from '../tracks/trackManagerStore';

  let isAnalyzing = false;
  let mixAnalysis: MixAnalysis | null = null;
  let targetLUFS = -14;
  let stereoWidth = 50;

  async function analyzeMix() {
    isAnalyzing = true;
    const audioEngine = AudioEngine.getInstance();
    const autoMixer = new AutoMixer(audioEngine);

    const tracks = Array.from($trackManager.tracks.values()).map(t =>
      audioEngine.getTrack(t.id)
    ).filter(Boolean);

    mixAnalysis = await autoMixer.analyzeMix(tracks);
    isAnalyzing = false;
  }

  async function autoMix() {
    const audioEngine = AudioEngine.getInstance();
    const autoMixer = new AutoMixer(audioEngine);

    const tracks = Array.from($trackManager.tracks.values()).map(t =>
      audioEngine.getTrack(t.id)
    ).filter(Boolean);

    await autoMixer.autoMix(tracks);
    alert('Auto-mix complete!');
  }

  async function autoMaster() {
    const audioEngine = AudioEngine.getInstance();
    const autoMaster = new AutoMaster();

    // Get mix bounce
    const mixBuffer = await audioEngine.exportMix();
    const arrayBuffer = await mixBuffer.arrayBuffer();
    const audioBuffer = await audioEngine.context.decodeAudioData(arrayBuffer);

    // Master it
    const mastered = await autoMaster.master(audioBuffer, {
      targetLUFS,
      truePeakLimit: -0.3,
      stereoWidth
    });

    alert('Auto-master complete!');
  }
</script>

<div class="auto-mix-master">
  <h2>AI Mixing & Mastering</h2>

  <div class="section">
    <h3>Automated Mixing</h3>
    <button on:click={analyzeMix} disabled={isAnalyzing}>
      {isAnalyzing ? 'Analyzing...' : 'Analyze Mix'}
    </button>

    {#if mixAnalysis}
      <div class="suggestions">
        <h4>Suggestions</h4>
        {#each mixAnalysis.suggestions as suggestion}
          <div class="suggestion {suggestion.severity}">
            <p>{suggestion.message}</p>
            {#if suggestion.autoFixAvailable}
              <button>Auto-fix</button>
            {/if}
          </div>
        {/each}
      </div>

      <button on:click={autoMix}>Apply Auto-Mix</button>
    {/if}
  </div>

  <div class="section">
    <h3>Automated Mastering</h3>

    <label>
      Target Loudness (LUFS):
      <select bind:value={targetLUFS}>
        <option value={-14}>-14 LUFS (Streaming)</option>
        <option value={-11}>-11 LUFS (YouTube)</option>
        <option value={-9}>-9 LUFS (Club)</option>
      </select>
    </label>

    <label>
      Stereo Width: {stereoWidth}%
      <input type="range" bind:value={stereoWidth} min="0" max="100" />
    </label>

    <button on:click={autoMaster}>Master Track</button>
  </div>
</div>
```

FILE STRUCTURE:
```
src/lib/ai/
├── AutoMixer.ts
├── AutoMaster.ts
├── AutoMixMaster.svelte
├── LoudnessMeter.svelte
├── SpectrumAnalyzer.svelte
└── types/
    └── mixing.ts
```

OUTPUT DELIVERABLES:
1. AutoMixer with intelligent gain staging and EQ
2. AutoMaster with LUFS normalization
3. Mix analysis and suggestions system
4. Reference track matching
5. Loudness metering (LUFS, RMS, True Peak)
6. Spectral analysis visualizations
7. Svelte UI components
8. Tests for mixing/mastering
9. README.md with usage guide

QUALITY REQUIREMENTS:
- Accurate LUFS measurement (±0.5 LUFS)
- Transparent processing (no artifacts)
- Streaming-ready output (-14 LUFS, -1dB true peak)
- Professional results comparable to human engineers

Create automated mixing/mastering that sounds professional.
```

---

## Module 10: Cloud Storage & Backend

**Timeline**: Week 6 | **Priority**: High | **Dependencies**: All other modules

### Prompt

```
Create a cloud storage and backend API system for DAWG AI.

PURPOSE:
Enable users to save projects, collaborate, and access their work from anywhere.

CORE FEATURES:

1. **Project Management**:
   - Save/load projects (tracks, effects, automation)
   - Project versioning (undo history in cloud)
   - Project templates
   - Project sharing (public links)

2. **File Storage**:
   - Audio file uploads (optimized streaming)
   - Sample library management
   - Preset storage
   - Render exports

3. **User Authentication**:
   - Email/password signup
   - OAuth (Google, GitHub)
   - JWT-based sessions
   - Rate limiting

4. **Collaboration**:
   - Real-time collaboration (WebRTC)
   - Project permissions (owner, editor, viewer)
   - Comment system
   - Version control

TECHNICAL STACK:

Backend: Node.js + Express + TypeScript
Database: PostgreSQL (structured) + Redis (cache)
Storage: Supabase (MVP) → AWS S3 (scale)
Real-time: WebSocket + WebRTC
Authentication: Supabase Auth

BACKEND API:

```typescript
// backend/src/server.ts
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Authentication middleware
async function authenticate(req: any, res: any, next: any) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
}

// Project endpoints
app.post('/api/projects', authenticate, async (req, res) => {
  const { name, data } = req.body;

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: req.user.id,
      name,
      data,
      created_at: new Date(),
      updated_at: new Date()
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(project);
});

app.get('/api/projects', authenticate, async (req, res) => {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', req.user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(projects);
});

app.get('/api/projects/:id', authenticate, async (req, res) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json(project);
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const { name, data } = req.body;

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      name,
      data,
      updated_at: new Date()
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(project);
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Project deleted' });
});

// File upload endpoint
app.post('/api/files/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname}`;

  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('audio-files')
    .getPublicUrl(fileName);

  res.json({ url: publicUrl, path: fileName });
});

// Get file URL
app.get('/api/files/:path', authenticate, async (req, res) => {
  const { data } = supabase.storage
    .from('audio-files')
    .getPublicUrl(req.params.path);

  res.json({ url: data.publicUrl });
});

// Export endpoint
app.post('/api/projects/:id/export', authenticate, async (req, res) => {
  // Render project to audio file
  // ... implementation

  res.json({ exportUrl: 'https://...' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

DATABASE SCHEMA:

```sql
-- Users table (managed by Supabase Auth)

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);

-- Project versions (for undo/redo)
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_project_versions_project_id ON project_versions(project_id);

-- File uploads
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_project_id ON files(project_id);

-- Project collaborators
CREATE TABLE collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_collaborators_project_id ON collaborators(project_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);
```

FRONTEND CLIENT:

```typescript
// src/lib/api/ProjectAPI.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Project {
  id: string;
  user_id: string;
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export class ProjectAPI {
  async saveProject(name: string, data: any): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ name, data })
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  async loadProject(id: string): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return project;
  }

  async listProjects(): Promise<Project[]> {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return projects;
  }

  async updateProject(id: string, name: string, data: any): Promise<Project> {
    const { data: project, error } = await supabase
      .from('projects')
      .update({ name, data, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async uploadFile(file: File): Promise<string> {
    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    return publicUrl;
  }
}
```

SVELTE COMPONENTS:

```svelte
<!-- src/lib/components/ProjectManager.svelte -->
<script lang="ts">
  import { ProjectAPI } from '../api/ProjectAPI';
  import type { Project } from '../api/ProjectAPI';

  const api = new ProjectAPI();

  let projects: Project[] = [];
  let isLoading = false;
  let showNewProjectDialog = false;
  let newProjectName = '';

  async function loadProjects() {
    isLoading = true;
    projects = await api.listProjects();
    isLoading = false;
  }

  async function createProject() {
    if (!newProjectName.trim()) return;

    const project = await api.saveProject(newProjectName, {
      tracks: [],
      tempo: 120,
      timeSignature: [4, 4]
    });

    projects = [project, ...projects];
    showNewProjectDialog = false;
    newProjectName = '';
  }

  async function deleteProject(id: string) {
    if (!confirm('Delete this project?')) return;

    await api.deleteProject(id);
    projects = projects.filter(p => p.id !== id);
  }

  onMount(loadProjects);
</script>

<div class="project-manager">
  <h2>My Projects</h2>

  <button on:click={() => showNewProjectDialog = true}>
    + New Project
  </button>

  {#if isLoading}
    <p>Loading...</p>
  {:else}
    <div class="project-grid">
      {#each projects as project}
        <div class="project-card">
          <h3>{project.name}</h3>
          <p>Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
          <div class="actions">
            <button on:click={() => loadProject(project.id)}>Open</button>
            <button on:click={() => deleteProject(project.id)}>Delete</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if showNewProjectDialog}
    <div class="dialog">
      <h3>New Project</h3>
      <input
        type="text"
        bind:value={newProjectName}
        placeholder="Project name"
        on:keydown={(e) => e.key === 'Enter' && createProject()}
      />
      <button on:click={createProject}>Create</button>
      <button on:click={() => showNewProjectDialog = false}>Cancel</button>
    </div>
  {/if}
</div>
```

FILE STRUCTURE:
```
backend/
├── src/
│   ├── server.ts
│   ├── routes/
│   │   ├── projects.ts
│   │   ├── files.ts
│   │   └── auth.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   └── rateLimit.ts
│   └── database/
│       └── schema.sql

src/lib/api/
├── ProjectAPI.ts
├── FileAPI.ts
└── AuthAPI.ts

src/lib/components/
├── ProjectManager.svelte
├── ProjectCard.svelte
└── FileUploader.svelte
```

OUTPUT DELIVERABLES:
1. Complete backend API with authentication
2. Database schema and migrations
3. File storage integration (Supabase)
4. Frontend API clients
5. Project management UI
6. File upload system
7. Authentication flows
8. Tests for API endpoints
9. README.md with API documentation

QUALITY REQUIREMENTS:
- Secure authentication (JWT)
- Rate limiting (prevent abuse)
- File size limits (100MB per file)
- Fast response times (<500ms)
- Database indexing for performance

Create a robust, scalable backend system.
```

---

## Module 11: Integration & Testing

**Timeline**: Week 7-8 | **Priority**: Critical | **Dependencies**: All modules

### Prompt

```
Integrate all DAWG AI modules and create comprehensive testing.

PURPOSE:
Ensure all modules work together seamlessly and the application is production-ready.

CORE TASKS:

1. **Module Integration**:
   - Wire up all module dependencies
   - Resolve interface conflicts
   - Establish data flow patterns
   - Create unified state management

2. **Testing**:
   - Unit tests for all modules (>80% coverage)
   - Integration tests for cross-module functionality
   - End-to-end tests for user workflows
   - Performance benchmarks

3. **Performance Optimization**:
   - Code splitting and lazy loading
   - Bundle size optimization
   - Audio latency reduction
   - Memory leak detection

4. **Documentation**:
   - User documentation
   - Developer documentation
   - API documentation
   - Deployment guide

INTEGRATION STRATEGY:

Main Application Entry:
```typescript
// src/main.ts
import './app.css';
import App from './App.svelte';

// Initialize global services
import { AudioEngine } from './lib/audio/AudioEngine';
import { TrackManager } from './lib/tracks/TrackManager';
import { VoiceInterface } from './lib/voice/VoiceInterface';

// Initialize audio engine
const audioEngine = AudioEngine.getInstance({
  sampleRate: 48000,
  latencyHint: 'interactive'
});

// Wait for user interaction before starting audio
document.addEventListener('click', async () => {
  await audioEngine.initialize();
}, { once: true });

const app = new App({
  target: document.getElementById('app')!
});

export default app;
```

Unified State Management:
```typescript
// src/lib/stores/appStore.ts
import { writable, derived } from 'svelte/store';
import type { AudioEngine } from '../audio/AudioEngine';
import type { TrackManager } from '../tracks/TrackManager';

interface AppState {
  audioEngine: AudioEngine | null;
  trackManager: TrackManager | null;
  isPlaying: boolean;
  currentTime: number;
  tempo: number;
  projectName: string;
}

export const appState = writable<AppState>({
  audioEngine: null,
  trackManager: null,
  isPlaying: false,
  currentTime: 0,
  tempo: 120,
  projectName: 'Untitled'
});

export const isPlaying = derived(appState, $state => $state.isPlaying);
export const currentTime = derived(appState, $state => $state.currentTime);
export const tempo = derived(appState, $state => $state.tempo);
```

TESTING FRAMEWORK:

```typescript
// tests/integration/full-workflow.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AudioEngine } from '../../src/lib/audio/AudioEngine';
import { TrackManager } from '../../src/lib/tracks/TrackManager';
import { BeatGeneratorClient } from '../../src/lib/ai/BeatGeneratorClient';

describe('Full Production Workflow', () => {
  let audioEngine: AudioEngine;
  let trackManager: TrackManager;

  beforeEach(async () => {
    audioEngine = AudioEngine.getInstance();
    await audioEngine.initialize();
    trackManager = new TrackManager(audioEngine);
  });

  it('should create project, add tracks, and generate beat', async () => {
    // 1. Create audio track
    const audioTrack = trackManager.createTrack('audio', 'Vocals');
    expect(audioTrack).toBeDefined();

    // 2. Create MIDI track
    const midiTrack = trackManager.createTrack('midi', 'Drums');
    expect(midiTrack).toBeDefined();

    // 3. Generate beat
    const beatClient = new BeatGeneratorClient();
    const beats = await beatClient.generateBeat({
      prompt: 'trap beat 140 bpm',
      bars: 4,
      variations: 1
    });

    expect(beats).toHaveLength(1);
    expect(beats[0].metadata.bpm).toBe(140);

    // 4. Add beat to MIDI track
    // ... implementation

    // 5. Play project
    audioEngine.play();
    expect(audioEngine.transport.state).toBe('started');

    // 6. Stop playback
    audioEngine.stop();
    expect(audioEngine.transport.state).toBe('stopped');
  });

  it('should apply effects and mix', async () => {
    // ... test effects and mixing workflow
  });

  it('should save and load project', async () => {
    // ... test project persistence
  });
});
```

Performance Tests:
```typescript
// tests/performance/audio-latency.test.ts
import { describe, it, expect } from 'vitest';
import { AudioEngine } from '../../src/lib/audio/AudioEngine';

describe('Audio Performance', () => {
  it('should have latency under 10ms', async () => {
    const audioEngine = AudioEngine.getInstance({
      latencyHint: 'interactive'
    });

    await audioEngine.initialize();

    const latency = audioEngine.getLatency();
    expect(latency).toBeLessThan(0.010); // 10ms
  });

  it('should handle 16 tracks without dropouts', async () => {
    const audioEngine = AudioEngine.getInstance();
    await audioEngine.initialize();

    const trackManager = new TrackManager(audioEngine);

    // Create 16 tracks
    for (let i = 0; i < 16; i++) {
      trackManager.createTrack('audio', `Track ${i + 1}`);
    }

    // Play for 5 seconds
    audioEngine.play();
    await new Promise(resolve => setTimeout(resolve, 5000));

    const cpuLoad = audioEngine.getCPULoad();
    expect(cpuLoad).toBeLessThan(80); // <80% CPU
  });
});
```

Bundle Optimization:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'audio-engine': ['./src/lib/audio/AudioEngine.ts'],
          'track-manager': ['./src/lib/tracks/TrackManager.ts'],
          'midi-editor': ['./src/lib/midi/MIDIEditor.ts'],
          'effects': ['./src/lib/effects/Effect.ts'],
          'voice': ['./src/lib/voice/VoiceInterface.ts'],
          'ai': ['./src/lib/ai/BeatGeneratorClient.ts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['tone', 'svelte']
  }
});
```

DEPLOYMENT CONFIGURATION:

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  beat-generator:
    build: ./backend/beat_generator
    ports:
      - "8000:8000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

volumes:
  postgres_data:
  redis_data:
```

FILE STRUCTURE:
```
tests/
├── unit/
│   ├── audio/
│   ├── tracks/
│   ├── midi/
│   ├── effects/
│   └── ai/
├── integration/
│   ├── full-workflow.test.ts
│   ├── collaboration.test.ts
│   └── export.test.ts
├── performance/
│   ├── audio-latency.test.ts
│   ├── memory-usage.test.ts
│   └── bundle-size.test.ts
└── e2e/
    ├── user-signup.spec.ts
    ├── create-project.spec.ts
    └── voice-control.spec.ts

docs/
├── USER_GUIDE.md
├── DEVELOPER_GUIDE.md
├── API_REFERENCE.md
└── DEPLOYMENT.md
```

QUALITY GATES:

Before deployment, ensure:
- ✅ All tests passing (>80% coverage)
- ✅ No console errors in production build
- ✅ Bundle size <2MB (gzipped)
- ✅ Audio latency <10ms (interactive mode)
- ✅ CPU usage <30% (16 tracks)
- ✅ Memory leaks checked (24hr stress test)
- ✅ Lighthouse score >90
- ✅ Accessibility audit passing
- ✅ Cross-browser testing (Chrome, Firefox, Safari)
- ✅ Mobile responsive testing

OUTPUT DELIVERABLES:
1. Fully integrated application
2. Comprehensive test suite (unit, integration, E2E)
3. Performance benchmarks
4. Bundle optimization
5. Documentation (user + developer)
6. Deployment configuration
7. CI/CD pipeline setup
8. Production build

QUALITY REQUIREMENTS:
- Zero critical bugs
- <2s initial load time
- Professional UX/UI
- Production-ready stability

Create a polished, production-ready application.
```

---

**DEPLOYMENT INSTRUCTIONS:**

1. **Setup Git Worktrees:**
```bash
cd dawg-ai-v0
git worktree add ../dawg-module-1 module-1
git worktree add ../dawg-module-2 module-2
git worktree add ../dawg-module-3 module-3
git worktree add ../dawg-module-4 module-4
git worktree add ../dawg-module-5 module-5
git worktree add ../dawg-module-6 module-6
git worktree add ../dawg-module-7 module-7
git worktree add ../dawg-module-8 module-8
git worktree add ../dawg-module-9 module-9
git worktree add ../dawg-module-10 module-10
git worktree add ../dawg-module-11 module-11
```

2. **Launch Claude Code Instances:**
- Open each module directory in separate Claude Code instances
- Copy the relevant module prompt from this document
- Paste into Claude Code and let it work autonomously

3. **Coordination:**
- Create shared `API_CONTRACTS.md` in root defining interfaces between modules
- Each module exports/imports according to contracts
- Module 11 handles final integration

4. **Testing:**
- Each module includes its own unit tests
- Module 11 performs end-to-end integration testing

5. **Timeline:**
- **Week 1-2**: Modules 1, 2 (Foundation)
- **Week 3-4**: Modules 3, 4, 5 (Core Features)
- **Week 5**: Modules 6, 7, 8 (AI Features)
- **Week 6**: Modules 9, 10 (Advanced Features + Backend)
- **Week 7-8**: Module 11 (Integration + Testing + Polish)

---

## API Contracts Template

Create this file in your root directory for module coordination:

```markdown
# API_CONTRACTS.md

## Audio Engine ↔ Track Manager
```typescript
// Track Manager expects:
interface AudioEngineAPI {
  addTrack(config: TrackConfig): Track;
  removeTrack(id: string): void;
  getTrack(id: string): Track | undefined;
  play(): void;
  stop(): void;
}
```

## Track Manager ↔ MIDI Editor
```typescript
// MIDI Editor expects:
interface TrackManagerAPI {
  getSelectedTrack(): Track | null;
  updateTrackMIDI(trackId: string, notes: MIDINote[]): void;
}
```

## Voice Interface ↔ All Modules
```typescript
// Voice Interface exposes:
interface VoiceInterfaceAPI {
  processCommand(transcript: string): Promise<void>;
  // Modules register actions:
  registerAction(name: string, handler: Function): void;
}
```

[... define all inter-module contracts]
```

---

**Remember**: Each Claude Code instance can spawn multiple agents internally for sub-tasks. Encourage the use of agents for complex implementations within each module!

**Pro Tip**: Start with Modules 1, 2, and 10 simultaneously. Once the foundation is solid, launch all other modules in parallel.

Good luck building DAWG AI! 🎵🐕🤖

1. **Setup Git Worktrees:**
```bash
cd dawg-ai-v0
git worktree add ../dawg-module-1 module-1
git worktree add ../dawg-module-2 module-2
git worktree add ../dawg-module-3 module-3
# ... etc for all 11 modules
```

2. **Launch Claude Code Instances:**
- Open each module directory in separate Claude Code instances
- Copy the relevant module prompt from this document
- Paste into Claude Code and let it work

3. **Coordination:**
- Create shared `API_CONTRACTS.md` in root defining interfaces
- Each module exports/imports according to contracts
- Integration happens in Module 11

4. **Testing:**
- Each module includes its own tests
- Module 11 does end-to-end integration testing

---

**Remember**: Each Claude instance can deploy multiple agents internally for parallel sub-tasks. Encourage agent usage for complex implementations!

1. **Setup Git Worktrees:**
```bash
cd dawg-ai-v0
git worktree add ../dawg-module-1 module-1
git worktree add ../dawg-module-2 module-2
git worktree add ../dawg-module-3 module-3
# ... etc for all 11 modules
```

2. **Launch Claude Code Instances:**
- Open each module directory in separate Claude Code instances
- Copy the relevant module prompt from this document
- Paste into Claude Code and let it work

3. **Coordination:**
- Create shared `API_CONTRACTS.md` in root defining interfaces
- Each module exports/imports according to contracts
- Integration happens in Module 11

4. **Testing:**
- Each module includes its own tests
- Module 11 does end-to-end integration testing

---

**Remember**: Each Claude instance can deploy multiple agents internally for parallel sub-tasks. Encourage agent usage for complex implementations!
