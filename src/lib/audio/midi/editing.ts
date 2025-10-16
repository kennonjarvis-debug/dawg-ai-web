/**
 * MIDI Editing Utilities - DAWG AI
 * Advanced editing operations for MIDI clips
 * @module audio/midi/editing
 */

import type { UUID, TimeInSeconds } from '../../types/core';
import type { MIDINote, MIDIControlChange, MIDIPitchBend } from './types';
import { MIDIClip } from './MIDIClip';

/**
 * Clipboard for copy/paste operations
 */
interface MIDIClipboard {
	notes: MIDINote[];
	controlChanges: MIDIControlChange[];
	pitchBends: MIDIPitchBend[];
	startTime: TimeInSeconds; // Original start time of first note
}

// Global clipboard (in a real app, this might be in a store)
let clipboard: MIDIClipboard | null = null;

/**
 * Copy selected notes to clipboard
 * @param clip - Source clip
 * @returns Number of notes copied
 */
export function copySelectedNotes(clip: MIDIClip): number {
	const selectedNotes = clip.getSelectedNotes();

	if (selectedNotes.length === 0) {
		return 0;
	}

	// Find earliest note time for relative positioning
	const earliestTime = Math.min(...selectedNotes.map((n) => n.time));

	// Deep copy notes with relative timing
	clipboard = {
		notes: selectedNotes.map((note) => ({
			...note,
			time: note.time - earliestTime // Make relative to earliest note
		})),
		controlChanges: [], // TODO: Copy relevant CCs
		pitchBends: [], // TODO: Copy relevant pitch bends
		startTime: earliestTime
	};

	return selectedNotes.length;
}

/**
 * Cut selected notes to clipboard (copy + delete)
 * @param clip - Source clip
 * @returns Number of notes cut
 */
export function cutSelectedNotes(clip: MIDIClip): number {
	const count = copySelectedNotes(clip);
	if (count > 0) {
		clip.deleteSelected();
	}
	return count;
}

/**
 * Paste notes from clipboard
 * @param clip - Target clip
 * @param time - Time to paste at
 * @param select - Whether to select pasted notes
 * @returns Number of notes pasted
 */
export function pasteNotes(
	clip: MIDIClip,
	time: TimeInSeconds,
	select: boolean = true
): number {
	if (!clipboard || clipboard.notes.length === 0) {
		return 0;
	}

	const pastedNotes: MIDINote[] = [];

	// Paste notes at specified time
	clipboard.notes.forEach((note) => {
		const newNote: MIDINote = {
			...note,
			id: generateId(),
			time: time + note.time // Add relative time to paste position
		};

		// Only add if within clip bounds
		if (newNote.time + newNote.duration <= clip.duration) {
			try {
				clip.addNote(newNote);
				pastedNotes.push(newNote);
			} catch (e) {
				// Note outside bounds, skip
			}
		}
	});

	// Select pasted notes if requested
	if (select && pastedNotes.length > 0) {
		clip.clearSelection();
		clip.selectNotes(
			pastedNotes.map((n) => n.id),
			false
		);
	}

	return pastedNotes.length;
}

/**
 * Duplicate notes at offset
 * @param clip - Clip to modify
 * @param offset - Time offset for duplicates
 * @param count - Number of duplicates
 * @returns Number of notes created
 */
export function duplicateNotesMultiple(
	clip: MIDIClip,
	offset: TimeInSeconds,
	count: number = 1
): number {
	let totalCreated = 0;

	for (let i = 0; i < count; i++) {
		const duplicated = clip.duplicateSelected((i + 1) * offset);
		totalCreated += duplicated.length;
	}

	return totalCreated;
}

/**
 * Stretch selected notes (time stretch)
 * @param clip - Clip to modify
 * @param factor - Stretch factor (2.0 = double length, 0.5 = half length)
 */
export function stretchSelectedNotes(clip: MIDIClip, factor: number): void {
	const selected = clip.getSelectedNotes();

	if (selected.length === 0) return;

	// Find earliest note as anchor point
	const anchorTime = Math.min(...selected.map((n) => n.time));

	selected.forEach((note) => {
		// Stretch duration
		note.duration *= factor;

		// Stretch relative position from anchor
		const relativeTime = note.time - anchorTime;
		note.time = anchorTime + relativeTime * factor;
	});
}

/**
 * Reverse selected notes
 * @param clip - Clip to modify
 */
export function reverseSelectedNotes(clip: MIDIClip): void {
	const selected = clip.getSelectedNotes();

	if (selected.length === 0) return;

	// Find time range
	const startTime = Math.min(...selected.map((n) => n.time));
	const endTime = Math.max(...selected.map((n) => n.time + n.duration));
	const totalDuration = endTime - startTime;

	selected.forEach((note) => {
		// Mirror note position around center
		const relativeTime = note.time - startTime;
		note.time = startTime + (totalDuration - relativeTime - note.duration);
	});
}

/**
 * Arpeggiate selected notes (spread vertically to horizontally)
 * @param clip - Clip to modify
 * @param stepTime - Time between notes
 * @param direction - 'up' | 'down' | 'updown' | 'random'
 */
export function arpeggiateSelectedNotes(
	clip: MIDIClip,
	stepTime: TimeInSeconds,
	direction: 'up' | 'down' | 'updown' | 'random' = 'up'
): void {
	const selected = clip.getSelectedNotes();

	if (selected.length === 0) return;

	// Sort notes by pitch
	const sortedNotes =
		direction === 'down'
			? [...selected].sort((a, b) => b.pitch - a.pitch)
			: [...selected].sort((a, b) => a.pitch - b.pitch);

	// Get start time (earliest note)
	const startTime = Math.min(...selected.map((n) => n.time));

	// Apply arpeggiation
	sortedNotes.forEach((note, index) => {
		if (direction === 'random') {
			note.time = startTime + Math.random() * stepTime * selected.length;
		} else if (direction === 'updown') {
			// Up on odd, down on even
			const upIndex = index % 2 === 0 ? index / 2 : selected.length - 1 - Math.floor(index / 2);
			note.time = startTime + upIndex * stepTime;
		} else {
			note.time = startTime + index * stepTime;
		}
	});
}

/**
 * Create velocity ramp across selected notes
 * @param clip - Clip to modify
 * @param startVelocity - Starting velocity (1-127)
 * @param endVelocity - Ending velocity (1-127)
 */
export function rampVelocity(
	clip: MIDIClip,
	startVelocity: number,
	endVelocity: number
): void {
	const selected = clip.getSelectedNotes();

	if (selected.length === 0) return;

	// Sort by time
	const sortedNotes = [...selected].sort((a, b) => a.time - b.time);

	sortedNotes.forEach((note, index) => {
		const ratio = selected.length > 1 ? index / (selected.length - 1) : 0;
		note.velocity = Math.round(startVelocity + (endVelocity - startVelocity) * ratio);
		note.velocity = Math.max(1, Math.min(127, note.velocity));
	});
}

/**
 * Randomize note velocities
 * @param clip - Clip to modify
 * @param min - Minimum velocity
 * @param max - Maximum velocity
 */
export function randomizeVelocity(clip: MIDIClip, min: number = 60, max: number = 100): void {
	const selected = clip.getSelectedNotes();

	selected.forEach((note) => {
		note.velocity = Math.round(min + Math.random() * (max - min));
		note.velocity = Math.max(1, Math.min(127, note.velocity));
	});
}

/**
 * Merge overlapping notes on same pitch
 * @param clip - Clip to modify
 */
export function mergeOverlappingNotes(clip: MIDIClip): number {
	const notes = clip.getNotes();
	const toRemove: UUID[] = [];

	// Group by pitch
	const pitchGroups = new Map<number, MIDINote[]>();
	notes.forEach((note) => {
		if (!pitchGroups.has(note.pitch)) {
			pitchGroups.set(note.pitch, []);
		}
		pitchGroups.get(note.pitch)!.push(note);
	});

	let mergedCount = 0;

	// Process each pitch group
	pitchGroups.forEach((group) => {
		// Sort by time
		group.sort((a, b) => a.time - b.time);

		for (let i = 0; i < group.length - 1; i++) {
			const current = group[i];
			const next = group[i + 1];

			// Check for overlap
			if (current.time + current.duration >= next.time) {
				// Merge: extend current to cover both
				const endTime = Math.max(current.time + current.duration, next.time + next.duration);
				current.duration = endTime - current.time;

				// Use higher velocity
				current.velocity = Math.max(current.velocity, next.velocity);

				// Mark next for removal
				toRemove.push(next.id);
				mergedCount++;
			}
		}
	});

	// Remove merged notes
	toRemove.forEach((id) => clip.removeNote(id));

	return mergedCount;
}

/**
 * Split long notes at interval
 * @param clip - Clip to modify
 * @param interval - Split interval in seconds
 */
export function splitLongNotes(clip: MIDIClip, interval: TimeInSeconds): number {
	const notes = clip.getNotes();
	const toAdd: MIDINote[] = [];
	const toRemove: UUID[] = [];

	notes.forEach((note) => {
		if (note.duration > interval) {
			// Mark for removal
			toRemove.push(note.id);

			// Create split notes
			let currentTime = note.time;
			const endTime = note.time + note.duration;

			while (currentTime < endTime) {
				const splitDuration = Math.min(interval, endTime - currentTime);

				toAdd.push({
					id: generateId(),
					pitch: note.pitch,
					velocity: note.velocity,
					time: currentTime,
					duration: splitDuration,
					channel: note.channel
				});

				currentTime += interval;
			}
		}
	});

	// Apply changes
	toRemove.forEach((id) => clip.removeNote(id));
	toAdd.forEach((note) => {
		try {
			clip.addNote(note);
		} catch (e) {
			// Skip if out of bounds
		}
	});

	return toAdd.length;
}

/**
 * Apply crescendo/decrescendo to CC automation
 * @param clip - Clip to modify
 * @param controller - CC number
 * @param startValue - Start value (0-127)
 * @param endValue - End value (0-127)
 * @param startTime - Start time
 * @param endTime - End time
 * @param steps - Number of automation points
 */
export function createCCRamp(
	clip: MIDIClip,
	controller: number,
	startValue: number,
	endValue: number,
	startTime: TimeInSeconds,
	endTime: TimeInSeconds,
	steps: number = 16
): void {
	const duration = endTime - startTime;
	const stepDuration = duration / steps;

	for (let i = 0; i <= steps; i++) {
		const ratio = i / steps;
		const time = startTime + i * stepDuration;
		const value = Math.round(startValue + (endValue - startValue) * ratio);

		clip.addControlChange({
			id: generateId(),
			controller,
			value: Math.max(0, Math.min(127, value)),
			time,
			channel: 0
		});
	}
}

/**
 * Remove duplicate notes (same pitch, time, velocity)
 * @param clip - Clip to modify
 * @returns Number of duplicates removed
 */
export function removeDuplicateNotes(clip: MIDIClip): number {
	const notes = clip.getNotes();
	const seen = new Set<string>();
	const toRemove: UUID[] = [];

	notes.forEach((note) => {
		const key = `${note.pitch}-${note.time}-${note.velocity}`;
		if (seen.has(key)) {
			toRemove.push(note.id);
		} else {
			seen.add(key);
		}
	});

	toRemove.forEach((id) => clip.removeNote(id));

	return toRemove.length;
}

/**
 * Generate unique ID
 */
function generateId(): UUID {
	return `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if clipboard has content
 */
export function hasClipboardContent(): boolean {
	return clipboard !== null && clipboard.notes.length > 0;
}

/**
 * Clear clipboard
 */
export function clearClipboard(): void {
	clipboard = null;
}
