/**
 * Core Audio Engine Type Definitions
 *
 * Defines interfaces and types for the DAWG AI audio engine
 */

/**
 * Audio Engine Configuration
 */
export interface AudioEngineConfig {
  sampleRate?: number;
  latencyHint?: AudioContextLatencyCategory;
  maxTracks?: number;
}

/**
 * Track Configuration
 */
export interface TrackConfig {
  type: 'audio' | 'midi';
  name: string;
  color?: string;
  volume?: number; // in dB
  pan?: number; // -1 to 1
}

/**
 * Track State
 */
export interface TrackState {
  volume: number; // in dB
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  armed: boolean;
}

/**
 * Effect Configuration
 */
export interface EffectConfig {
  type: string;
  params: Record<string, unknown>;
}

/**
 * Track Data for Serialization
 */
export interface TrackData {
  id: string;
  type: 'audio' | 'midi';
  name: string;
  color: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: EffectConfig[];
}

/**
 * Audio Track Data (extends TrackData)
 */
export interface AudioTrackData extends TrackData {
  type: 'audio';
  audioUrl: string | null;
  audioBuffer?: AudioBuffer;
}

/**
 * MIDI Track Data (extends TrackData)
 */
export interface MIDITrackData extends TrackData {
  type: 'midi';
  midiNotes: MIDINoteData[];
  instrumentType: string;
}

/**
 * MIDI Note Data
 */
export interface MIDINoteData {
  note: string | number; // e.g., "C4" or 60
  time: number; // in seconds
  duration: number; // in seconds
  velocity: number; // 0-1
}

/**
 * Send Bus Data
 */
export interface SendBusData {
  name: string;
  effectType: string;
  params: Record<string, unknown>;
}

/**
 * Project Data for Save/Load
 */
export interface ProjectData {
  version: string;
  tempo: number;
  tracks: TrackData[];
  sends: SendBusData[];
  loopEnabled?: boolean;
  loopStart?: number;
  loopEnd?: number;
}

/**
 * Export Options
 */
export interface ExportOptions {
  format: 'wav' | 'mp3';
  start?: number; // in seconds
  duration?: number; // in seconds
  sampleRate?: number;
  bitDepth?: 16 | 24 | 32;
}

/**
 * Audio Metrics
 */
export interface AudioMetrics {
  masterLevel: number; // dB
  peakLevel: number; // dB
  rmsLevel: number; // dB
  clipCount: number;
}

/**
 * Transport State
 */
export type TransportState = 'stopped' | 'playing' | 'paused' | 'recording';

/**
 * Audio Engine Events
 */
export interface AudioEngineEvents {
  transportStateChanged: (state: TransportState) => void;
  tempoChanged: (bpm: number) => void;
  positionChanged: (seconds: number) => void;
  trackAdded: (trackId: string) => void;
  trackRemoved: (trackId: string) => void;
  metricsUpdated: (metrics: AudioMetrics) => void;
}
