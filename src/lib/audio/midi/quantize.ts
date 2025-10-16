/**
 * Quantization Utilities - DAWG AI
 * Grid-based MIDI note quantization with swing and feel preservation
 * @module audio/midi/quantize
 */

import type { TimeInSeconds } from '../../types/core';
import type { MIDINote, QuantizeGrid, QuantizeOptions } from './types';

/**
 * Convert quantize grid to time in seconds
 * @param grid - Grid division (e.g., '1/4', '1/8')
 * @param bpm - Tempo in beats per minute
 * @returns Time in seconds
 */
export function gridToSeconds(grid: QuantizeGrid, bpm: number = 120): TimeInSeconds {
	const quarterNoteDuration = 60 / bpm; // One beat at given BPM

	switch (grid) {
		case '1/1':
			return quarterNoteDuration * 4;
		case '1/2':
			return quarterNoteDuration * 2;
		case '1/4':
			return quarterNoteDuration;
		case '1/8':
			return quarterNoteDuration / 2;
		case '1/16':
			return quarterNoteDuration / 4;
		case '1/32':
			return quarterNoteDuration / 8;
		case '1/64':
			return quarterNoteDuration / 16;
		case '1/4T':
			return (quarterNoteDuration * 2) / 3; // Triplet = 2/3 of parent note
		case '1/8T':
			return quarterNoteDuration / 3;
		case '1/16T':
			return quarterNoteDuration / 6;
		default:
			return quarterNoteDuration;
	}
}

/**
 * Quantize a time value to the nearest grid point
 * @param time - Time to quantize
 * @param gridSize - Grid size in seconds
 * @param strength - Quantization strength (0-1)
 * @param swing - Swing amount (0-1)
 * @returns Quantized time
 */
export function quantizeTime(
	time: TimeInSeconds,
	gridSize: TimeInSeconds,
	strength: number = 1.0,
	swing: number = 0.0
): TimeInSeconds {
	// Find nearest grid point
	const gridIndex = Math.round(time / gridSize);
	let targetTime = gridIndex * gridSize;

	// Apply swing (delay every other grid point)
	if (swing > 0 && gridIndex % 2 === 1) {
		targetTime += gridSize * swing * 0.5; // Max 50% swing
	}

	// Apply strength (interpolate between original and quantized)
	const quantizedTime = time + (targetTime - time) * strength;

	return Math.max(0, quantizedTime);
}

/**
 * Quantize note start times
 * @param notes - Notes to quantize
 * @param options - Quantization options
 * @param bpm - Tempo in BPM
 * @returns Quantized notes
 */
export function quantizeNotes(
	notes: MIDINote[],
	options: QuantizeOptions,
	bpm: number = 120
): MIDINote[] {
	const gridSize = gridToSeconds(options.grid, bpm);
	const strength = options.strength ?? 1.0;
	const swing = options.swing ?? 0.0;

	return notes.map((note) => {
		const quantizedNote = { ...note };

		// Quantize note start time
		if (options.quantizeNoteStarts !== false) {
			const originalStart = note.time;
			const quantizedStart = quantizeTime(originalStart, gridSize, strength, swing);
			quantizedNote.time = quantizedStart;

			// If we're quantizing ends, adjust duration; otherwise keep original end time
			if (options.quantizeNoteEnds) {
				const originalEnd = originalStart + note.duration;
				const quantizedEnd = quantizeTime(originalEnd, gridSize, strength, swing);
				quantizedNote.duration = Math.max(0.01, quantizedEnd - quantizedStart);
			} else {
				// Keep original end time, adjust duration
				const originalEnd = originalStart + note.duration;
				quantizedNote.duration = Math.max(0.01, originalEnd - quantizedStart);
			}
		} else if (options.quantizeNoteEnds) {
			// Only quantize note ends
			const originalEnd = note.time + note.duration;
			const quantizedEnd = quantizeTime(originalEnd, gridSize, strength, swing);
			quantizedNote.duration = Math.max(0.01, quantizedEnd - note.time);
		}

		return quantizedNote;
	});
}

/**
 * Humanize notes by adding subtle timing and velocity variations
 * @param notes - Notes to humanize
 * @param amount - Humanization amount (0-1)
 * @returns Humanized notes
 */
export function humanizeNotes(notes: MIDINote[], amount: number = 0.5): MIDINote[] {
	return notes.map((note) => {
		// Random timing offset (±5ms per 0.1 amount)
		const timingOffset = (Math.random() - 0.5) * 0.01 * amount;

		// Random velocity variation (±10 per full amount)
		const velocityOffset = Math.round((Math.random() - 0.5) * 20 * amount);

		return {
			...note,
			time: Math.max(0, note.time + timingOffset),
			velocity: Math.max(1, Math.min(127, note.velocity + velocityOffset))
		};
	});
}

/**
 * Apply groove/swing template to notes
 * @param notes - Notes to groove
 * @param template - Groove template (array of timing offsets per 16th note)
 * @param gridSize - Base grid size (typically 1/16)
 * @param bpm - Tempo in BPM
 * @returns Grooved notes
 */
export function applyGroove(
	notes: MIDINote[],
	template: number[],
	gridSize: TimeInSeconds,
	bpm: number = 120
): MIDINote[] {
	if (template.length === 0) return notes;

	const baseDuration = gridToSeconds('1/16', bpm);

	return notes.map((note) => {
		// Find which groove step this note falls on
		const stepIndex = Math.round(note.time / baseDuration) % template.length;
		const grooveOffset = template[stepIndex] * baseDuration;

		return {
			...note,
			time: Math.max(0, note.time + grooveOffset)
		};
	});
}

/**
 * Legato: extend note durations to connect with next note
 * @param notes - Notes to make legato (must be sorted by time)
 * @param gap - Small gap to leave between notes (seconds)
 * @returns Legato notes
 */
export function makeNotesLegato(notes: MIDINote[], gap: TimeInSeconds = 0.001): MIDINote[] {
	const sortedNotes = [...notes].sort((a, b) => {
		if (a.time !== b.time) return a.time - b.time;
		return a.pitch - b.pitch;
	});

	return sortedNotes.map((note, index) => {
		// Find next note with same pitch
		const nextNote = sortedNotes
			.slice(index + 1)
			.find((n) => n.pitch === note.pitch && n.time > note.time);

		if (nextNote) {
			// Extend to just before next note
			const newDuration = nextNote.time - note.time - gap;
			if (newDuration > 0) {
				return { ...note, duration: newDuration };
			}
		}

		return note;
	});
}

/**
 * Staccato: shorten note durations
 * @param notes - Notes to make staccato
 * @param factor - Duration factor (0-1, where 0.5 = half duration)
 * @param minDuration - Minimum note duration
 * @returns Staccato notes
 */
export function makeNotesStaccato(
	notes: MIDINote[],
	factor: number = 0.5,
	minDuration: TimeInSeconds = 0.05
): MIDINote[] {
	return notes.map((note) => ({
		...note,
		duration: Math.max(minDuration, note.duration * factor)
	}));
}

/**
 * Preset groove templates (timing offsets per 16th note)
 */
export const GROOVE_PRESETS = {
	// No groove
	straight: [0, 0, 0, 0, 0, 0, 0, 0],

	// Classic swing (every other 16th delayed)
	swing: [0, 0.1, 0, 0.1, 0, 0.1, 0, 0.1],

	// Heavy swing
	heavySwing: [0, 0.2, 0, 0.2, 0, 0.2, 0, 0.2],

	// Triplet feel
	triplet: [0, 0.15, 0, 0, 0.15, 0, 0, 0.15],

	// Laid back (all notes slightly delayed)
	laidBack: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05],

	// Shuffle
	shuffle: [0, 0.25, 0, 0.25, 0, 0.25, 0, 0.25],

	// Half-time shuffle
	halfTimeShuffle: [0, 0, 0.2, 0, 0, 0, 0.2, 0]
};
