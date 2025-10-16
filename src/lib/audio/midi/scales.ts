/**
 * Musical Scales - DAWG AI
 * Scale definitions and pitch snapping utilities
 * @module audio/midi/scales
 */

import type { MIDINoteNumber } from '../../types/core';

/**
 * Scale intervals (semitones from root)
 */
export const SCALES = {
	chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
	major: [0, 2, 4, 5, 7, 9, 11],
	minor: [0, 2, 3, 5, 7, 8, 10],
	'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
	'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
	dorian: [0, 2, 3, 5, 7, 9, 10],
	phrygian: [0, 1, 3, 5, 7, 8, 10],
	lydian: [0, 2, 4, 6, 7, 9, 11],
	mixolydian: [0, 2, 4, 5, 7, 9, 10],
	locrian: [0, 1, 3, 5, 6, 8, 10],
	'pentatonic-major': [0, 2, 4, 7, 9],
	'pentatonic-minor': [0, 3, 5, 7, 10],
	blues: [0, 3, 5, 6, 7, 10],
	'whole-tone': [0, 2, 4, 6, 8, 10],
	'diminished': [0, 2, 3, 5, 6, 8, 9, 11],
	'augmented': [0, 3, 4, 7, 8, 11]
} as const;

export type ScaleName = keyof typeof SCALES;

/**
 * Note names
 */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get note name from MIDI number
 */
export function getNoteNameFromMIDI(pitch: MIDINoteNumber): string {
	const octave = Math.floor(pitch / 12) - 1;
	const note = NOTE_NAMES[pitch % 12];
	return `${note}${octave}`;
}

/**
 * Get MIDI number from note name
 */
export function getMIDIFromNoteName(name: string): MIDINoteNumber {
	const match = name.match(/^([A-G]#?)(-?\d+)$/);
	if (!match) return 60; // Default to C4

	const [, note, octave] = match;
	const noteIndex = NOTE_NAMES.indexOf(note);
	if (noteIndex === -1) return 60;

	return (parseInt(octave) + 1) * 12 + noteIndex;
}

/**
 * Snap pitch to nearest note in scale
 */
export function snapToScale(
	pitch: MIDINoteNumber,
	root: MIDINoteNumber,
	scaleName: ScaleName
): MIDINoteNumber {
	const scale = SCALES[scaleName];
	if (scaleName === 'chromatic') return pitch; // No snapping needed

	// Calculate relative pitch (within octave)
	const relativePitch = ((pitch - root) % 12 + 12) % 12;

	// Find closest scale degree
	let closestNote = scale[0];
	let minDistance = Math.abs(relativePitch - closestNote);

	for (const interval of scale) {
		const distance = Math.abs(relativePitch - interval);
		if (distance < minDistance) {
			minDistance = distance;
			closestNote = interval;
		}
	}

	// Calculate snapped pitch
	const octaveOffset = Math.floor((pitch - root) / 12);
	return root + octaveOffset * 12 + closestNote;
}

/**
 * Check if pitch is in scale
 */
export function isPitchInScale(
	pitch: MIDINoteNumber,
	root: MIDINoteNumber,
	scaleName: ScaleName
): boolean {
	const scale = SCALES[scaleName];
	const relativePitch = ((pitch - root) % 12 + 12) % 12;
	return scale.includes(relativePitch);
}

/**
 * Get all pitches in scale within MIDI range
 */
export function getScalePitches(
	root: MIDINoteNumber,
	scaleName: ScaleName,
	minPitch: MIDINoteNumber = 0,
	maxPitch: MIDINoteNumber = 127
): MIDINoteNumber[] {
	const scale = SCALES[scaleName];
	const pitches: MIDINoteNumber[] = [];

	// Start from lowest octave that includes minPitch
	const startOctave = Math.floor((minPitch - root) / 12);
	const endOctave = Math.floor((maxPitch - root) / 12) + 1;

	for (let octave = startOctave; octave <= endOctave; octave++) {
		for (const interval of scale) {
			const pitch = root + octave * 12 + interval;
			if (pitch >= minPitch && pitch <= maxPitch) {
				pitches.push(pitch);
			}
		}
	}

	return pitches.sort((a, b) => a - b);
}

/**
 * Get scale degree name (for display)
 */
export function getScaleDegreeName(
	pitch: MIDINoteNumber,
	root: MIDINoteNumber,
	scaleName: ScaleName
): string {
	const scale = SCALES[scaleName];
	const relativePitch = ((pitch - root) % 12 + 12) % 12;
	const degree = scale.indexOf(relativePitch);

	if (degree === -1) return '';

	const degreeNames = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
	return degree < degreeNames.length ? degreeNames[degree] : '';
}

/**
 * Parse key signature (e.g., "Cmaj", "Amin", "F#min")
 */
export function parseKeySignature(key: string): { root: MIDINoteNumber; scale: ScaleName } {
	const match = key.match(/^([A-G]#?)([a-z]+)?$/i);
	if (!match) return { root: 60, scale: 'major' }; // Default to C major

	const [, note, mode] = match;
	const root = getMIDIFromNoteName(`${note}4`); // Use octave 4 as reference

	// Determine scale from mode
	let scale: ScaleName = 'major';
	const modeStr = (mode || '').toLowerCase();

	if (modeStr.includes('min')) scale = 'minor';
	else if (modeStr.includes('maj')) scale = 'major';
	else if (modeStr.includes('dor')) scale = 'dorian';
	else if (modeStr.includes('phr')) scale = 'phrygian';
	else if (modeStr.includes('lyd')) scale = 'lydian';
	else if (modeStr.includes('mix')) scale = 'mixolydian';
	else if (modeStr.includes('loc')) scale = 'locrian';

	return { root, scale };
}

/**
 * Transpose scale to new root
 */
export function transposeScale(
	currentRoot: MIDINoteNumber,
	newRoot: MIDINoteNumber,
	pitch: MIDINoteNumber
): MIDINoteNumber {
	const interval = newRoot - currentRoot;
	return pitch + interval;
}
