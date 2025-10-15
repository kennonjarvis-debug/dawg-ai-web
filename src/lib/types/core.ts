/**
 * Core Type Definitions - DAWG AI
 * Shared types used across all modules
 * @module types/core
 */

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
export type EffectType =
	| 'eq'
	| 'compressor'
	| 'reverb'
	| 'delay'
	| 'limiter'
	| 'gate'
	| 'distortion'
	| 'chorus'
	| 'phaser'
	| 'filter';

// Bit depth options
export type BitDepth = 16 | 24 | 32;

// Latency hints
export type LatencyHint = 'interactive' | 'balanced' | 'playback';

// Export formats
export type ExportFormat = 'wav' | 'mp3';

// Recording states
export type RecordingState = 'idle' | 'recording' | 'paused';

// Playback states
export type PlaybackState = 'stopped' | 'playing' | 'paused';

// Grid divisions for quantization
export type GridDivision = '1/4' | '1/8' | '1/16' | '1/32' | '1/64' | '1/4T' | '1/8T' | '1/16T';

// Pan position (-1 to 1, -1 = left, 0 = center, 1 = right)
export type PanPosition = number;

// Gain/volume level (0 to 1)
export type GainLevel = number;
