/**
 * @dawg-ai/audio-engine
 *
 * Core audio processing engine using Web Audio API and Tone.js
 *
 * @module @dawg-ai/audio-engine
 */

// Main engine
export { AudioEngine } from './AudioEngine';
export { default as AudioEngineDefault } from './AudioEngine';

// Track classes
export { Track } from './Track';
export { AudioTrack } from './AudioTrack';
export { MIDITrack } from './MIDITrack';

// Buses
export { MasterBus } from './MasterBus';
export { SendBus } from './SendBus';

// Recorder
export { Recorder } from './Recorder';

// Type definitions
export type {
  AudioEngineConfig,
  TrackConfig,
  TrackState,
  TrackData,
  AudioTrackData,
  MIDITrackData,
  MIDINoteData,
  SendBusData,
  ProjectData,
  ExportOptions,
  AudioMetrics,
  TransportState,
  AudioEngineEvents,
  EffectConfig,
} from './types/audio';
