/**
 * MIDI Types - DAWG AI
 * Type definitions for MIDI recording, playback, and editing
 * @module audio/midi/types
 */

import type { UUID, TimeInSeconds, MIDINoteNumber, MIDIVelocity } from '../../types/core';

/**
 * MIDI note event
 */
export interface MIDINote {
	id: UUID;
	pitch: MIDINoteNumber; // 0-127
	velocity: MIDIVelocity; // 0-127 (0 = note off)
	time: TimeInSeconds; // Start time in seconds
	duration: TimeInSeconds; // Note duration
	channel?: number; // MIDI channel (0-15)
}

/**
 * MIDI Control Change event
 */
export interface MIDIControlChange {
	id: UUID;
	controller: number; // CC number (0-127)
	value: number; // CC value (0-127)
	time: TimeInSeconds;
	channel?: number;
}

/**
 * MIDI Pitch Bend event
 */
export interface MIDIPitchBend {
	id: UUID;
	value: number; // -8192 to 8191 (center = 0)
	time: TimeInSeconds;
	channel?: number;
}

/**
 * MIDI Program Change event
 */
export interface MIDIProgramChange {
	id: UUID;
	program: number; // 0-127
	time: TimeInSeconds;
	channel?: number;
}

/**
 * Generic MIDI event type
 */
export type MIDIEvent =
	| { type: 'note'; data: MIDINote }
	| { type: 'cc'; data: MIDIControlChange }
	| { type: 'pitchBend'; data: MIDIPitchBend }
	| { type: 'programChange'; data: MIDIProgramChange };

/**
 * MIDI clip data structure
 */
export interface MIDIClipData {
	id: UUID;
	trackId: UUID;
	name?: string;
	startTime: TimeInSeconds;
	duration: TimeInSeconds;
	notes: MIDINote[];
	controlChanges?: MIDIControlChange[];
	pitchBends?: MIDIPitchBend[];
	programChanges?: MIDIProgramChange[];
}

/**
 * Quantization grid divisions
 */
export type QuantizeGrid =
	| '1/1' // Whole note
	| '1/2' // Half note
	| '1/4' // Quarter note
	| '1/8' // Eighth note
	| '1/16' // Sixteenth note
	| '1/32' // Thirty-second note
	| '1/64' // Sixty-fourth note
	| '1/4T' // Quarter triplet
	| '1/8T' // Eighth triplet
	| '1/16T'; // Sixteenth triplet

/**
 * Quantization options
 */
export interface QuantizeOptions {
	grid: QuantizeGrid;
	strength?: number; // 0-1, how much to quantize (0 = no quantize, 1 = full quantize)
	swing?: number; // 0-1, swing amount
	quantizeNoteStarts?: boolean;
	quantizeNoteEnds?: boolean;
}

/**
 * MIDI recording state
 */
export interface MIDIRecordingState {
	isRecording: boolean;
	startTime: number;
	events: MIDIEvent[];
	activeNotes: Map<number, { startTime: number; velocity: number }>; // pitch -> note info
}

/**
 * WebMIDI input configuration
 */
export interface MIDIInputConfig {
	deviceId?: string;
	channel?: number; // Filter to specific channel (0-15), or undefined for all
	noteRange?: { min: MIDINoteNumber; max: MIDINoteNumber }; // Filter note range
}

/**
 * MIDI instrument type
 */
export type MIDIInstrumentType = 'synth' | 'polySynth' | 'sampler' | 'membraneSynth' | 'fmSynth';

/**
 * MIDI instrument configuration
 */
export interface MIDIInstrumentConfig {
	type: MIDIInstrumentType;
	polyphony?: number; // Max simultaneous voices
	volume?: number; // dB
	options?: any; // Instrument-specific options
}
