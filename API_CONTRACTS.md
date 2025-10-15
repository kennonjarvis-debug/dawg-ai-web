# API Contracts - DAWG AI Module Coordination

**Version**: 1.0.0
**Last Updated**: 2025-10-15
**Purpose**: Define all interfaces between modules for parallel development coordination

---

## Table of Contents
1. [Core Type Definitions](#core-type-definitions)
2. [Module 2: Audio Engine](#module-2-audio-engine-api)
3. [Module 3: Track Manager](#module-3-track-manager-api)
4. [Module 4: MIDI Editor](#module-4-midi-editor-api)
5. [Module 5: Effects Processor](#module-5-effects-processor-api)
6. [Module 6: Voice Interface](#module-6-voice-interface-api)
7. [Module 7: AI Beat Generator](#module-7-ai-beat-generator-api)
8. [Module 8: AI Vocal Coach](#module-8-ai-vocal-coach-api)
9. [Module 9: AI Mixing & Mastering](#module-9-ai-mixing--mastering-api)
10. [Module 10: Cloud Storage & Backend](#module-10-cloud-storage--backend-api)
11. [Event System](#event-system)
12. [State Management](#state-management)

---

## Core Type Definitions

**Location**: `src/lib/types/core.ts`

```typescript
// Universal ID type
export type UUID = string;

// Time representation (in seconds)
export type TimeInSeconds = number;

// Audio sample rate
export type SampleRate = 44100 | 48000 | 96000;

// Decibels
export type Decibels = number;

// MIDI note number (0-127)
export type MIDINoteNumber = number;

// MIDI velocity (0-127)
export type MIDIVelocity = number;

// Color representation
export type Color = string; // Hex format: #RRGGBB

// Track types
export type TrackType = 'audio' | 'midi' | 'aux' | 'folder';

// Effect types
export type EffectType = 'eq' | 'compressor' | 'reverb' | 'delay' | 'limiter' | 'gate' | 'distortion' | 'chorus' | 'phaser' | 'filter';
```

---

## Module 2: Audio Engine API

**Provider**: Module 2 (Audio Engine Core)
**Consumers**: All other modules
**Location**: `src/lib/audio/AudioEngine.ts`

### Public Interface

```typescript
export interface AudioEngineConfig {
  sampleRate: SampleRate;
  latencyHint: 'interactive' | 'balanced' | 'playback';
  lookAhead: number;
}

export interface TrackConfig {
  id: UUID;
  name: string;
  type: 'audio' | 'midi' | 'aux';
  color: Color;
}

export class AudioEngine {
  // Singleton access
  static getInstance(config?: AudioEngineConfig): AudioEngine;

  // Initialization
  initialize(): Promise<void>;

  // Track management
  addTrack(config: TrackConfig): Track;
  removeTrack(id: UUID): void;
  getTrack(id: UUID): Track | undefined;
  getAllTracks(): Track[];

  // Transport control
  play(): void;
  stop(): void;
  pause(): void;

  // Recording
  startRecording(trackId: UUID): void;
  stopRecording(trackId: UUID): Promise<AudioBuffer>;

  // Tempo & timing
  setTempo(bpm: number): void;
  getTempo(): number;
  setTimeSignature(numerator: number, denominator: number): void;
  setLoop(start: TimeInSeconds, end: TimeInSeconds, enabled: boolean): void;

  // Routing
  connectEffect(trackId: UUID, effect: Effect): void;
  routeToSend(trackId: UUID, sendId: UUID, amount: number): void;

  // Export
  exportMix(format?: 'wav' | 'mp3'): Promise<Blob>;

  // Metrics
  getLatency(): number;
  getCPULoad(): number;

  // Context access
  readonly context: AudioContext;
  readonly transport: Tone.Transport;

  // Cleanup
  dispose(): void;
}
```

### Track Interface

```typescript
export interface Track {
  // Properties
  readonly id: UUID;
  name: string;
  type: 'audio' | 'midi' | 'aux';
  color: Color;

  // Audio nodes
  readonly input: Tone.Gain;
  readonly output: Tone.Gain;
  readonly channel: Tone.Channel;

  // Audio management
  loadAudio(url: string): Promise<void>;
  addClip(clip: Clip): void;

  // Recording
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioBuffer>;

  // Effects
  addEffect(effect: Effect): void;
  removeEffect(effectId: UUID): void;
  getEffects(): Effect[];

  // Sends
  sendTo(target: Track, amount: number): void;

  // Mixer controls
  setVolume(db: Decibels): void;
  getVolume(): Decibels;
  setPan(value: number): void; // -1 to 1
  getPan(): number;
  setMute(mute: boolean): void;
  isMuted(): boolean;
  setSolo(solo: boolean): void;
  isSoloed(): boolean;

  // Connection
  connect(destination: any): void;
  disconnect(): void;

  // Cleanup
  dispose(): void;
}
```

### Clip Interface

```typescript
export interface Clip {
  id: UUID;
  trackId: UUID;
  buffer: AudioBuffer;
  startTime: TimeInSeconds;
  duration: TimeInSeconds;
  offset: TimeInSeconds;
  gain: number;
  fadeIn: TimeInSeconds;
  fadeOut: TimeInSeconds;
}
```

---

## Module 3: Track Manager API

**Provider**: Module 3 (Track Manager)
**Consumers**: Modules 4, 5, 6, 7, 9, UI
**Location**: `src/lib/tracks/TrackManager.ts`

### Public Interface

```typescript
export interface TrackData {
  id: UUID;
  name: string;
  type: TrackType;
  color: Color;
  icon?: string;
  order: number;
  height: 'collapsed' | 'small' | 'medium' | 'large';
  parentId?: UUID; // For folder grouping
  settings: TrackSettings;
}

export interface TrackSettings {
  volume: Decibels;
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  recordArm: boolean;
  monitor: boolean;
  frozen: boolean;
  input: string;
  output: string;
}

export class TrackManager {
  constructor(audioEngine: AudioEngine);

  // Track creation/deletion
  createTrack(type: TrackType, name?: string): TrackData;
  deleteTrack(id: UUID): void;
  duplicateTrack(id: UUID): TrackData | null;

  // Track reordering
  reorderTrack(trackId: UUID, newIndex: number): void;

  // Track grouping
  groupTracks(trackIds: UUID[], folderName: string): UUID;
  ungroupTracks(folderId: UUID): void;

  // Track settings
  updateTrackSettings(id: UUID, settings: Partial<TrackSettings>): void;
  getTrackSettings(id: UUID): TrackSettings | undefined;

  // Track freezing
  freezeTrack(id: UUID): Promise<void>;
  unfreezeTrack(id: UUID): void;

  // Selection
  selectTrack(id: UUID): void;
  getSelectedTrack(): TrackData | null;

  // Stores (Svelte)
  readonly tracks: Writable<Map<UUID, TrackData>>;
  readonly trackOrder: Writable<UUID[]>;
  readonly selectedTrackId: Writable<UUID | null>;
}
```

---

## Module 4: MIDI Editor API

**Provider**: Module 4 (MIDI Editor)
**Consumers**: Module 3 (Track Manager), Module 7 (Beat Generator)
**Location**: `src/lib/midi/MIDIEditor.ts`

### Public Interface

```typescript
export interface MIDINote {
  id: UUID;
  pitch: MIDINoteNumber; // 0-127
  velocity: MIDIVelocity; // 0-127
  time: TimeInSeconds;
  duration: TimeInSeconds;
}

export interface PianoRollConfig {
  width: number;
  height: number;
  pixelsPerBeat: number;
  lowestNote: MIDINoteNumber;
  highestNote: MIDINoteNumber;
}

export type Tool = 'select' | 'draw' | 'erase';
export type GridDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/64' | '1/4T' | '1/8T' | '1/16T';

export class MIDIEditor {
  constructor(canvas: HTMLCanvasElement, config: PianoRollConfig);

  // Note operations
  addNote(pitch: MIDINoteNumber, time: TimeInSeconds, duration: TimeInSeconds, velocity?: MIDIVelocity): MIDINote;
  removeNote(id: UUID): void;
  updateNote(id: UUID, updates: Partial<MIDINote>): void;

  // Selection
  selectNote(id: UUID, addToSelection?: boolean): void;
  selectNotesInRect(x1: number, y1: number, x2: number, y2: number): void;
  getSelectedNotes(): UUID[];
  clearSelection(): void;

  // Quantization
  quantizeTime(time: TimeInSeconds): TimeInSeconds;
  quantizePitchToScale(pitch: MIDINoteNumber): MIDINoteNumber;
  quantizeSelectedNotes(): void;

  // Tools & settings
  setTool(tool: Tool): void;
  setGridDivision(division: GridDivision): void;
  setSnapToGrid(enabled: boolean): void;
  setSnapToScale(enabled: boolean): void;
  setScale(scale: number[], rootNote: MIDINoteNumber): void;

  // Data access
  getNotes(): MIDINote[];
  setNotes(notes: MIDINote[]): void;

  // Rendering
  render(): void;

  // Coordinate conversion
  timeToPixel(time: TimeInSeconds): number;
  pixelToTime(pixel: number): TimeInSeconds;
  pitchToPixel(pitch: MIDINoteNumber): number;
  pixelToPitch(pixel: number): MIDINoteNumber;
}
```

### MIDI Pattern Interface (for AI generators)

```typescript
export interface MIDIPattern {
  notes: MIDINote[];
  duration: TimeInSeconds;
  bpm: number;
  timeSignature: [number, number];
}
```

---

## Module 5: Effects Processor API

**Provider**: Module 5 (Effects Processor)
**Consumers**: Module 2 (Audio Engine), Module 3 (Track Manager), Module 9 (Mixing)
**Location**: `src/lib/effects/Effect.ts`

### Base Effect Interface

```typescript
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
  id: UUID;
  name: string;
  type: EffectType;
  enabled: boolean;
  parameters: Record<string, EffectParameter>;
}

export abstract class Effect {
  readonly id: UUID;
  name: string;
  readonly type: EffectType;
  enabled: boolean;
  readonly parameters: Map<string, EffectParameter>;

  readonly input: Tone.Gain;
  readonly output: Tone.Gain;

  // Parameter control
  setParameter(name: string, value: number): void;
  getParameter(name: string): number | undefined;

  // Enable/disable
  toggle(): void;

  // Serialization
  toJSON(): EffectConfig;

  // Cleanup
  dispose(): void;
}
```

### Specific Effect Interfaces

```typescript
// EQ
export class EQ extends Effect {
  setLowGain(db: Decibels): void;
  setMidGain(db: Decibels): void;
  setHighGain(db: Decibels): void;
  setLowFrequency(hz: number): void;
  setHighFrequency(hz: number): void;
}

// Compressor
export class Compressor extends Effect {
  setThreshold(db: Decibels): void;
  setRatio(ratio: number): void;
  setAttack(seconds: number): void;
  setRelease(seconds: number): void;
  setKnee(db: Decibels): void;
  getGainReduction(): Decibels;
}

// Reverb
export class Reverb extends Effect {
  setDecay(seconds: number): void;
  setPreDelay(seconds: number): void;
  setWetMix(amount: number): void; // 0-1
}
```

### Effects Rack Interface

```typescript
export class EffectsRack {
  constructor();

  // Effect management
  addEffect(effect: Effect, index?: number): void;
  removeEffect(id: UUID): void;
  reorderEffect(fromIndex: number, toIndex: number): void;

  // Chain access
  getEffects(): Effect[];

  // Connection
  connect(destination: any): void;
  getInput(): Tone.Gain;
  getOutput(): Tone.Gain;

  // Stores
  readonly effects: Writable<Effect[]>;
}
```

---

## Module 6: Voice Interface API

**Provider**: Module 6 (Voice Interface)
**Consumers**: All modules (via actions), UI
**Location**: `src/lib/voice/VoiceInterface.ts`

### Public Interface

```typescript
export interface VoiceCommand {
  transcript: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
}

export class VoiceInterface {
  constructor();

  // Lifecycle
  startListening(): Promise<void>;
  stopListening(): void;

  // Command processing
  processCommand(transcript: string): Promise<void>;

  // Event emitters (via CustomEvent)
  // Events: 'voice:transcript', 'voice:interim-transcript',
  //         'voice:speaking', 'voice:speaking-done',
  //         'voice:action-executed'

  // Cleanup
  dispose(): void;
}
```

### Action Registration Interface

All modules can register actions with the voice interface:

```typescript
// Example: Track Manager registers actions
export interface VoiceAction {
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required: boolean;
    };
  };
}

// Modules should expose actions as:
export const VOICE_ACTIONS: VoiceAction[] = [
  {
    name: 'add_track',
    description: 'Add a new track to the project',
    handler: async (params) => { /* implementation */ },
    parameters: {
      type: { type: 'string', description: 'Track type', required: true }
    }
  }
];
```

---

## Module 7: AI Beat Generator API

**Provider**: Module 7 (AI Beat Generator)
**Consumers**: Module 4 (MIDI Editor), Module 6 (Voice Interface), UI
**Location**: `src/lib/ai/BeatGeneratorClient.ts`

### Public Interface

```typescript
export interface BeatGenerationRequest {
  prompt: string;
  bpm?: number;
  bars?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  variations?: number;
  humanize?: boolean;
}

export interface BeatGenerationResponse {
  midiData: MIDIPattern;
  audioUrl: string;
  patternId: UUID;
  metadata: {
    bpm: number;
    genre: string;
    complexity: string;
    bars: number;
  };
}

export class BeatGeneratorClient {
  constructor(baseUrl?: string);

  // Generation
  generateBeat(request: BeatGenerationRequest): Promise<BeatGenerationResponse[]>;

  // Variations
  regenerateWithVariations(patternId: UUID, count: number): Promise<BeatGenerationResponse[]>;
}
```

### Backend API Contract

```typescript
// Backend endpoint: POST /generate-beat
interface BackendBeatRequest {
  prompt: string;
  bpm?: number;
  bars: number;
  complexity: string;
  variations: number;
  humanize: boolean;
}

interface BackendBeatResponse {
  midi_data: any;
  audio_url: string;
  pattern_id: string;
  metadata: {
    bpm: number;
    genre: string;
    complexity: string;
    bars: number;
  };
}
```

---

## Module 8: AI Vocal Coach API

**Provider**: Module 8 (AI Vocal Coach)
**Consumers**: Module 2 (Audio Engine), UI
**Location**: `src/lib/ai/VocalCoach.ts`

### Public Interface

```typescript
export interface VocalMetrics {
  pitchAccuracy: number; // 0-100
  breathControl: number; // 0-100
  vibratoConsistency: number; // 0-100
  toneQuality: number; // 0-100
  dynamicRange: Decibels;
}

export interface CoachingFeedback {
  message: string;
  type: 'suggestion' | 'praise' | 'warning';
  metric: keyof VocalMetrics;
}

export class VocalCoach {
  constructor(audioContext: AudioContext);

  // Initialization
  initialize(): Promise<void>;

  // Analysis
  analyzeLive(audioData: Float32Array): Promise<CoachingFeedback[]>;

  // Progress tracking
  getProgress(): Record<keyof VocalMetrics, number[]>;

  // Configuration
  setTargetPitches(pitches: number[]): void;
}
```

### Pitch Detector Interface

```typescript
export interface PitchDetectionResult {
  pitch: number; // Frequency in Hz
  confidence: number; // 0-1
  timestamp: number;
}

export class PitchDetector {
  initialize(): Promise<void>;
  detectPitch(audioBuffer: Float32Array): Promise<PitchDetectionResult>;
  dispose(): void;
}
```

---

## Module 9: AI Mixing & Mastering API

**Provider**: Module 9 (AI Mixing & Mastering)
**Consumers**: Module 2 (Audio Engine), Module 3 (Track Manager), UI
**Location**: `src/lib/ai/AutoMixer.ts`

### AutoMixer Interface

```typescript
export interface MixAnalysis {
  trackAnalysis: Map<UUID, TrackAnalysis>;
  frequencyBalance: FrequencyBalance;
  dynamicRange: DynamicRangeAnalysis;
  stereoImage: StereoAnalysis;
  suggestions: MixingSuggestion[];
}

export interface TrackAnalysis {
  trackId: UUID;
  rmsLevel: Decibels;
  peakLevel: Decibels;
  frequencySpectrum: Float32Array;
  dynamicRange: Decibels;
  stereoWidth: number; // 0-1
  hasClipping: boolean;
}

export interface MixingSuggestion {
  trackId?: UUID;
  type: 'gain' | 'eq' | 'compression' | 'panning' | 'reverb';
  message: string;
  autoFixAvailable: boolean;
  severity: 'low' | 'medium' | 'high';
}

export class AutoMixer {
  constructor(audioEngine: AudioEngine);

  // Analysis
  analyzeMix(tracks: Track[]): Promise<MixAnalysis>;

  // Automated mixing
  autoMix(tracks: Track[]): Promise<void>;
}
```

### AutoMaster Interface

```typescript
export interface MasteringSettings {
  targetLUFS: number; // -14 for streaming, -9 for club
  truePeakLimit: Decibels; // -0.3 dB
  stereoWidth: number; // 0-100%
  referenceTrack?: AudioBuffer;
}

export class AutoMaster {
  constructor();

  // Mastering
  master(audioBuffer: AudioBuffer, settings: MasteringSettings): Promise<AudioBuffer>;

  // Reference matching
  matchReference(audioBuffer: AudioBuffer, reference: AudioBuffer): Promise<AudioBuffer>;
}
```

---

## Module 10: Cloud Storage & Backend API

**Provider**: Module 10 (Cloud Storage & Backend)
**Consumers**: All modules (for persistence), UI
**Location**: `src/lib/api/ProjectAPI.ts`

### Project API Interface

```typescript
export interface Project {
  id: UUID;
  user_id: UUID;
  name: string;
  data: ProjectData;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  share_token?: string;
}

export interface ProjectData {
  tracks: TrackData[];
  tempo: number;
  timeSignature: [number, number];
  effects: EffectConfig[];
  automation: AutomationData[];
  clips: Clip[];
}

export class ProjectAPI {
  // Project management
  saveProject(name: string, data: ProjectData): Promise<Project>;
  loadProject(id: UUID): Promise<Project>;
  listProjects(): Promise<Project[]>;
  updateProject(id: UUID, name: string, data: ProjectData): Promise<Project>;
  deleteProject(id: UUID): Promise<void>;

  // File management
  uploadFile(file: File): Promise<string>;

  // Sharing
  shareProject(id: UUID): Promise<string>; // Returns share token
  getSharedProject(token: string): Promise<Project>;
}
```

### Authentication API Interface

```typescript
export class AuthAPI {
  // Authentication
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;

  // Session
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session>;

  // User
  getCurrentUser(): Promise<User | null>;
  updateUser(updates: Partial<User>): Promise<User>;
}
```

---

## Event System

**Location**: `src/lib/events/eventBus.ts`

All modules communicate via a centralized event bus using CustomEvents.

### Event Types

```typescript
export type EventType =
  // Playback events
  | 'playback:play'
  | 'playback:stop'
  | 'playback:pause'
  | 'playback:record-start'
  | 'playback:record-stop'
  | 'playback:time-update'

  // Track events
  | 'track:created'
  | 'track:deleted'
  | 'track:updated'
  | 'track:selected'
  | 'track:reordered'

  // MIDI events
  | 'midi:note-added'
  | 'midi:note-removed'
  | 'midi:note-updated'
  | 'midi:pattern-changed'

  // Effect events
  | 'effect:added'
  | 'effect:removed'
  | 'effect:parameter-changed'

  // Voice events
  | 'voice:transcript'
  | 'voice:interim-transcript'
  | 'voice:speaking'
  | 'voice:speaking-done'
  | 'voice:action-executed'

  // AI events
  | 'ai:beat-generated'
  | 'ai:mix-analyzed'
  | 'ai:master-complete'

  // Project events
  | 'project:saved'
  | 'project:loaded'
  | 'project:updated'

  // Error events
  | 'error:audio-context'
  | 'error:network'
  | 'error:api';

export interface EventData {
  type: EventType;
  payload: any;
  timestamp: number;
}
```

### Event Bus Interface

```typescript
export class EventBus {
  // Singleton
  static getInstance(): EventBus;

  // Emit events
  emit(type: EventType, payload?: any): void;

  // Subscribe to events
  on(type: EventType, handler: (data: EventData) => void): () => void;

  // Unsubscribe
  off(type: EventType, handler: (data: EventData) => void): void;

  // Clear all listeners
  clear(): void;
}
```

### Usage Example

```typescript
// Emitting an event
EventBus.getInstance().emit('track:created', { trackId: 'track-123' });

// Listening to an event
const unsubscribe = EventBus.getInstance().on('playback:play', (data) => {
  console.log('Playback started', data);
});

// Cleanup
unsubscribe();
```

---

## State Management

**Location**: `src/lib/stores/appStore.ts`

Centralized state management using Svelte stores.

### Application State

```typescript
export interface AppState {
  // Audio engine
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  isRecording: boolean;
  currentTime: TimeInSeconds;
  tempo: number;
  timeSignature: [number, number];

  // Project
  projectId: UUID | null;
  projectName: string;
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;

  // Selection
  selectedTrackId: UUID | null;
  selectedClipIds: UUID[];
  selectedNoteIds: UUID[];

  // UI state
  currentView: 'arrangement' | 'mixer' | 'midi' | 'effects';
  zoom: number;
  scrollPosition: number;

  // Voice
  isVoiceActive: boolean;
  lastVoiceCommand: string | null;

  // User
  user: User | null;
  isAuthenticated: boolean;
}
```

### Store Exports

```typescript
// Main store
export const appState = writable<AppState>({...});

// Derived stores
export const isPlaying = derived(appState, $state => $state.isPlaying);
export const currentTime = derived(appState, $state => $state.currentTime);
export const tempo = derived(appState, $state => $state.tempo);
export const selectedTrackId = derived(appState, $state => $state.selectedTrackId);
export const hasUnsavedChanges = derived(appState, $state => $state.hasUnsavedChanges);

// Actions
export const appActions = {
  setPlaying(playing: boolean) {
    appState.update(s => ({ ...s, isPlaying: playing }));
  },

  setTempo(tempo: number) {
    appState.update(s => ({ ...s, tempo, hasUnsavedChanges: true }));
  },

  selectTrack(trackId: UUID | null) {
    appState.update(s => ({ ...s, selectedTrackId: trackId }));
  },

  markSaved() {
    appState.update(s => ({
      ...s,
      hasUnsavedChanges: false,
      lastSaved: new Date()
    }));
  }
};
```

---

## Module Dependencies Graph

```
┌─────────────────────────────────────────────────────────────┐
│                     Module Dependencies                      │
└─────────────────────────────────────────────────────────────┘

Module 1: Design System
  ↓ (provides UI components to all modules)

Module 2: Audio Engine Core
  ↓ (provides Track, AudioBuffer management)
  ├─→ Module 3: Track Manager
  ├─→ Module 5: Effects Processor
  ├─→ Module 8: AI Vocal Coach
  └─→ Module 9: AI Mixing & Mastering

Module 3: Track Manager
  ↓ (provides TrackData, selection state)
  ├─→ Module 4: MIDI Editor
  ├─→ Module 5: Effects Processor
  ├─→ Module 6: Voice Interface
  └─→ Module 9: AI Mixing & Mastering

Module 4: MIDI Editor
  ↓ (provides MIDINote interface)
  └─→ Module 7: AI Beat Generator

Module 5: Effects Processor
  ↓ (provides Effect classes)
  └─→ Module 9: AI Mixing & Mastering

Module 6: Voice Interface
  ↓ (consumes all module actions)
  └─→ All modules (via action registration)

Module 7: AI Beat Generator
  ↓ (generates MIDI patterns)
  └─→ Module 4: MIDI Editor

Module 8: AI Vocal Coach
  ↓ (analyzes audio)
  └─→ Module 2: Audio Engine

Module 9: AI Mixing & Mastering
  ↓ (processes audio)
  └─→ Module 2: Audio Engine

Module 10: Cloud Storage
  ↓ (persists all module data)
  └─→ All modules (for save/load)

Module 11: Integration
  └─→ All modules (tests and integrates)
```

---

## Implementation Checklist

### For Each Module Developer:

- [ ] Export all public interfaces in module's main file
- [ ] Use exact type definitions from this contract
- [ ] Emit events for all significant state changes
- [ ] Register voice actions if applicable
- [ ] Support serialization to/from JSON for persistence
- [ ] Include comprehensive TypeScript types
- [ ] Document any deviations from contract
- [ ] Provide unit tests for public API
- [ ] Follow error handling conventions
- [ ] Use EventBus for cross-module communication

---

## Error Handling Conventions

All modules should follow these error handling patterns:

```typescript
// Custom error types
export class AudioEngineError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AudioEngineError';
  }
}

// Error codes
export enum ErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  TRACK_NOT_FOUND = 'TRACK_NOT_FOUND',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

// Usage
if (!this.isInitialized) {
  throw new AudioEngineError('Audio engine not initialized', ErrorCode.NOT_INITIALIZED);
}
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-15 | Initial API contracts | Module Coordination |

---

## Questions & Updates

If you need to:
- **Add a new interface**: Update this document and notify all dependent modules
- **Change an existing interface**: Create a new version, maintain backward compatibility
- **Report a conflict**: Document in Issues section below

### Issues / Conflicts

None currently. Report conflicts here as they arise.

---

**END OF API CONTRACTS**

*Last updated: 2025-10-15*
*For questions, contact the integration team (Module 11)*
