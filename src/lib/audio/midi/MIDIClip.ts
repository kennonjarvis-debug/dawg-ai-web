/**
 * MIDIClip - DAWG AI
 * Represents a MIDI clip with notes and events
 * @module audio/midi/MIDIClip
 */

import type { UUID, TimeInSeconds } from '../../types/core';
import type {
	MIDINote,
	MIDIControlChange,
	MIDIPitchBend,
	MIDIProgramChange,
	MIDIClipData,
	QuantizeOptions
} from './types';
import { AudioEngineError, ErrorCode } from '../errors';
import { quantizeNotes, humanizeNotes, makeNotesLegato, makeNotesStaccato } from './quantize';

/**
 * MIDIClip configuration
 */
export interface MIDIClipConfig {
	id?: UUID;
	trackId: UUID;
	name?: string;
	startTime: TimeInSeconds;
	duration?: TimeInSeconds;
	notes?: MIDINote[];
	controlChanges?: MIDIControlChange[];
	pitchBends?: MIDIPitchBend[];
	programChanges?: MIDIProgramChange[];
}

/**
 * MIDIClip - Contains MIDI notes and events
 */
export class MIDIClip {
	public readonly id: UUID;
	public trackId: UUID;
	public name: string;
	public startTime: TimeInSeconds;
	public duration: TimeInSeconds;

	private notes: MIDINote[] = [];
	private controlChanges: MIDIControlChange[] = [];
	private pitchBends: MIDIPitchBend[] = [];
	private programChanges: MIDIProgramChange[] = [];

	// Selection state (for editing)
	private selectedNoteIds: Set<UUID> = new Set();

	constructor(config: MIDIClipConfig) {
		this.id = config.id || this.generateId();
		this.trackId = config.trackId;
		this.name = config.name || `MIDI Clip ${this.id.slice(0, 8)}`;
		this.startTime = config.startTime;

		// Set duration based on notes or provided duration
		if (config.duration) {
			this.duration = config.duration;
		} else if (config.notes && config.notes.length > 0) {
			this.duration = this.calculateDuration(config.notes);
		} else {
			this.duration = 4.0; // Default 4 bars at 120 BPM
		}

		// Add notes and events
		if (config.notes) {
			config.notes.forEach((note) => this.addNote(note));
		}
		if (config.controlChanges) {
			this.controlChanges = [...config.controlChanges];
		}
		if (config.pitchBends) {
			this.pitchBends = [...config.pitchBends];
		}
		if (config.programChanges) {
			this.programChanges = [...config.programChanges];
		}
	}

	/**
	 * Get end time of clip
	 */
	get endTime(): TimeInSeconds {
		return this.startTime + this.duration;
	}

	// ===== Note Management =====

	/**
	 * Add a note to the clip
	 */
	addNote(note: MIDINote): void {
		// Validate note is within clip bounds
		if (note.time < 0 || note.time + note.duration > this.duration) {
			throw new AudioEngineError('Note is outside clip bounds', ErrorCode.INVALID_PARAMETER);
		}

		this.notes.push(note);
		this.sortNotes();
	}

	/**
	 * Remove a note from the clip
	 */
	removeNote(noteId: UUID): boolean {
		const index = this.notes.findIndex((n) => n.id === noteId);
		if (index !== -1) {
			this.notes.splice(index, 1);
			this.selectedNoteIds.delete(noteId);
			return true;
		}
		return false;
	}

	/**
	 * Update a note's properties
	 */
	updateNote(noteId: UUID, updates: Partial<Omit<MIDINote, 'id'>>): boolean {
		const note = this.notes.find((n) => n.id === noteId);
		if (!note) return false;

		Object.assign(note, updates);
		this.sortNotes();
		return true;
	}

	/**
	 * Get all notes
	 */
	getNotes(): MIDINote[] {
		return [...this.notes];
	}

	/**
	 * Get notes in time range
	 */
	getNotesInRange(startTime: TimeInSeconds, endTime: TimeInSeconds): MIDINote[] {
		return this.notes.filter((note) => {
			const noteStart = note.time;
			const noteEnd = note.time + note.duration;
			return noteStart < endTime && noteEnd > startTime;
		});
	}

	/**
	 * Get note by ID
	 */
	getNote(noteId: UUID): MIDINote | undefined {
		return this.notes.find((n) => n.id === noteId);
	}

	// ===== Selection =====

	/**
	 * Select notes
	 */
	selectNotes(noteIds: UUID[], add: boolean = false): void {
		if (!add) {
			this.selectedNoteIds.clear();
		}
		noteIds.forEach((id) => this.selectedNoteIds.add(id));
	}

	/**
	 * Deselect notes
	 */
	deselectNotes(noteIds: UUID[]): void {
		noteIds.forEach((id) => this.selectedNoteIds.delete(id));
	}

	/**
	 * Clear selection
	 */
	clearSelection(): void {
		this.selectedNoteIds.clear();
	}

	/**
	 * Get selected notes
	 */
	getSelectedNotes(): MIDINote[] {
		return this.notes.filter((note) => this.selectedNoteIds.has(note.id));
	}

	/**
	 * Check if note is selected
	 */
	isNoteSelected(noteId: UUID): boolean {
		return this.selectedNoteIds.has(noteId);
	}

	// ===== Editing Operations =====

	/**
	 * Transpose selected notes
	 */
	transposeSelected(semitones: number): void {
		this.getSelectedNotes().forEach((note) => {
			const newPitch = Math.max(0, Math.min(127, note.pitch + semitones));
			note.pitch = newPitch;
		});
	}

	/**
	 * Duplicate selected notes
	 */
	duplicateSelected(offset: TimeInSeconds = 1.0): MIDINote[] {
		const newNotes: MIDINote[] = [];

		this.getSelectedNotes().forEach((note) => {
			const newNote: MIDINote = {
				...note,
				id: this.generateId(),
				time: note.time + offset
			};

			// Only add if within clip bounds
			if (newNote.time + newNote.duration <= this.duration) {
				this.addNote(newNote);
				newNotes.push(newNote);
			}
		});

		return newNotes;
	}

	/**
	 * Delete selected notes
	 */
	deleteSelected(): number {
		const selectedIds = Array.from(this.selectedNoteIds);
		let deleted = 0;

		selectedIds.forEach((id) => {
			if (this.removeNote(id)) {
				deleted++;
			}
		});

		this.selectedNoteIds.clear();
		return deleted;
	}

	/**
	 * Scale velocity of selected notes
	 */
	scaleVelocity(factor: number): void {
		this.getSelectedNotes().forEach((note) => {
			note.velocity = Math.max(1, Math.min(127, Math.round(note.velocity * factor)));
		});
	}

	// ===== Quantization =====

	/**
	 * Quantize notes (selected or all)
	 * @param options - Quantization options
	 * @param bpm - Tempo in BPM
	 * @param selectedOnly - Only quantize selected notes
	 */
	quantize(options: QuantizeOptions, bpm: number = 120, selectedOnly: boolean = false): void {
		const notesToQuantize = selectedOnly ? this.getSelectedNotes() : this.notes;

		if (notesToQuantize.length === 0) return;

		const quantizedNotes = quantizeNotes(notesToQuantize, options, bpm);

		// Apply quantized values back to original notes
		quantizedNotes.forEach((quantized, index) => {
			const original = notesToQuantize[index];
			original.time = quantized.time;
			original.duration = quantized.duration;
		});

		this.sortNotes();
	}

	/**
	 * Humanize notes (add subtle timing and velocity variations)
	 * @param amount - Humanization amount (0-1)
	 * @param selectedOnly - Only humanize selected notes
	 */
	humanize(amount: number = 0.5, selectedOnly: boolean = false): void {
		const notesToHumanize = selectedOnly ? this.getSelectedNotes() : this.notes;

		if (notesToHumanize.length === 0) return;

		const humanizedNotes = humanizeNotes(notesToHumanize, amount);

		// Apply humanized values back to original notes
		humanizedNotes.forEach((humanized, index) => {
			const original = notesToHumanize[index];
			original.time = humanized.time;
			original.velocity = humanized.velocity;
		});

		this.sortNotes();
	}

	/**
	 * Make notes legato (extend to connect with next note)
	 * @param gap - Small gap between notes (seconds)
	 * @param selectedOnly - Only apply to selected notes
	 */
	makeLegato(gap: TimeInSeconds = 0.001, selectedOnly: boolean = false): void {
		const notesToProcess = selectedOnly ? this.getSelectedNotes() : this.notes;

		if (notesToProcess.length === 0) return;

		const legatoNotes = makeNotesLegato(notesToProcess, gap);

		// Apply legato durations back to original notes
		legatoNotes.forEach((legato, index) => {
			const original = notesToProcess[index];
			original.duration = legato.duration;
		});
	}

	/**
	 * Make notes staccato (shorten duration)
	 * @param factor - Duration factor (0-1)
	 * @param selectedOnly - Only apply to selected notes
	 */
	makeStaccato(factor: number = 0.5, selectedOnly: boolean = false): void {
		const notesToProcess = selectedOnly ? this.getSelectedNotes() : this.notes;

		if (notesToProcess.length === 0) return;

		const staccatoNotes = makeNotesStaccato(notesToProcess, factor);

		// Apply staccato durations back to original notes
		staccatoNotes.forEach((staccato, index) => {
			const original = notesToProcess[index];
			original.duration = staccato.duration;
		});
	}

	// ===== Control Changes =====

	/**
	 * Add control change event
	 */
	addControlChange(cc: MIDIControlChange): void {
		this.controlChanges.push(cc);
		this.controlChanges.sort((a, b) => a.time - b.time);
	}

	/**
	 * Get control changes
	 */
	getControlChanges(): MIDIControlChange[] {
		return [...this.controlChanges];
	}

	/**
	 * Get control changes in time range
	 */
	getControlChangesInRange(startTime: TimeInSeconds, endTime: TimeInSeconds): MIDIControlChange[] {
		return this.controlChanges.filter((cc) => cc.time >= startTime && cc.time <= endTime);
	}

	// ===== Pitch Bends =====

	/**
	 * Add pitch bend event
	 */
	addPitchBend(pb: MIDIPitchBend): void {
		this.pitchBends.push(pb);
		this.pitchBends.sort((a, b) => a.time - b.time);
	}

	/**
	 * Get pitch bends
	 */
	getPitchBends(): MIDIPitchBend[] {
		return [...this.pitchBends];
	}

	// ===== Clip Operations =====

	/**
	 * Move clip to new start time
	 */
	moveTo(time: TimeInSeconds): void {
		if (time < 0) {
			throw new AudioEngineError('Start time cannot be negative', ErrorCode.INVALID_PARAMETER);
		}
		this.startTime = time;
	}

	/**
	 * Split clip at time (relative to clip start)
	 */
	split(time: TimeInSeconds): MIDIClip | null {
		if (time <= 0 || time >= this.duration) {
			return null;
		}

		// Save original duration before modifying
		const originalDuration = this.duration;

		// Notes for second half
		const secondHalfNotes = this.notes.filter((note) => note.time >= time);
		const firstHalfNotes = this.notes.filter((note) => note.time < time);

		// Trim notes that cross the split point
		firstHalfNotes.forEach((note) => {
			if (note.time + note.duration > time) {
				note.duration = time - note.time;
			}
		});

		// Adjust time for second half
		const adjustedNotes = secondHalfNotes.map((note) => ({
			...note,
			id: this.generateId(),
			time: note.time - time
		}));

		// Update this clip
		this.notes = firstHalfNotes;
		this.duration = time;

		// Create second clip
		const secondClip = new MIDIClip({
			trackId: this.trackId,
			name: `${this.name} (split)`,
			startTime: this.startTime + time,
			duration: originalDuration - time,
			notes: adjustedNotes
		});

		return secondClip;
	}

	/**
	 * Clone the clip
	 */
	clone(): MIDIClip {
		return new MIDIClip({
			trackId: this.trackId,
			name: `${this.name} (copy)`,
			startTime: this.startTime,
			duration: this.duration,
			notes: this.notes.map((n) => ({ ...n, id: this.generateId() })),
			controlChanges: this.controlChanges.map((cc) => ({ ...cc, id: this.generateId() })),
			pitchBends: this.pitchBends.map((pb) => ({ ...pb, id: this.generateId() })),
			programChanges: this.programChanges.map((pc) => ({ ...pc, id: this.generateId() }))
		});
	}

	/**
	 * Check if clip contains a time point
	 */
	contains(time: TimeInSeconds): boolean {
		return time >= this.startTime && time < this.endTime;
	}

	/**
	 * Check if clip overlaps with another
	 */
	overlaps(other: MIDIClip): boolean {
		return this.startTime < other.endTime && this.endTime > other.startTime;
	}

	// ===== Utility Methods =====

	/**
	 * Calculate duration based on notes
	 */
	private calculateDuration(notes: MIDINote[]): TimeInSeconds {
		if (notes.length === 0) return 4.0;

		const latestNoteEnd = Math.max(...notes.map((n) => n.time + n.duration));
		// Round up to nearest beat (assuming 120 BPM)
		const beatDuration = 0.5; // 120 BPM = 0.5s per beat
		return Math.ceil(latestNoteEnd / beatDuration) * beatDuration;
	}

	/**
	 * Sort notes by time
	 */
	private sortNotes(): void {
		this.notes.sort((a, b) => {
			if (a.time !== b.time) return a.time - b.time;
			return a.pitch - b.pitch;
		});
	}

	/**
	 * Generate unique ID
	 */
	private generateId(): UUID {
		return `midi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): MIDIClipData {
		return {
			id: this.id,
			trackId: this.trackId,
			name: this.name,
			startTime: this.startTime,
			duration: this.duration,
			notes: this.getNotes(),
			controlChanges: this.getControlChanges(),
			pitchBends: this.getPitchBends(),
			programChanges: [...this.programChanges]
		};
	}

	/**
	 * Create from JSON data
	 */
	static fromJSON(data: MIDIClipData): MIDIClip {
		return new MIDIClip(data);
	}
}
