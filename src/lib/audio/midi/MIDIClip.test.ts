/**
 * MIDIClip Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MIDIClip } from './MIDIClip';
import type { MIDINote } from './types';

describe('MIDIClip', () => {
	let clip: MIDIClip;
	const trackId = 'test-track-1';

	beforeEach(() => {
		clip = new MIDIClip({
			trackId,
			name: 'Test Clip',
			startTime: 0,
			duration: 4.0
		});
	});

	describe('Note Management', () => {
		it('should add notes to the clip', () => {
			const note: MIDINote = {
				id: 'note-1',
				pitch: 60,
				velocity: 100,
				time: 0,
				duration: 0.5
			};

			clip.addNote(note);
			expect(clip.getNotes().length).toBe(1);
			expect(clip.getNotes()[0].pitch).toBe(60);
		});

		it('should throw error for notes outside clip bounds', () => {
			const note: MIDINote = {
				id: 'note-1',
				pitch: 60,
				velocity: 100,
				time: 5.0, // Beyond clip duration
				duration: 0.5
			};

			expect(() => clip.addNote(note)).toThrow();
		});

		it('should remove notes by ID', () => {
			const note: MIDINote = {
				id: 'note-1',
				pitch: 60,
				velocity: 100,
				time: 0,
				duration: 0.5
			};

			clip.addNote(note);
			expect(clip.getNotes().length).toBe(1);

			clip.removeNote('note-1');
			expect(clip.getNotes().length).toBe(0);
		});

		it('should update note properties', () => {
			const note: MIDINote = {
				id: 'note-1',
				pitch: 60,
				velocity: 100,
				time: 0,
				duration: 0.5
			};

			clip.addNote(note);
			clip.updateNote('note-1', { velocity: 80 });

			const updated = clip.getNote('note-1');
			expect(updated?.velocity).toBe(80);
		});

		it('should get notes in time range', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
			clip.addNote({ id: 'n3', pitch: 64, velocity: 100, time: 2.0, duration: 0.5 });

			const inRange = clip.getNotesInRange(0.5, 1.5);
			expect(inRange.length).toBe(1);
			expect(inRange[0].pitch).toBe(62);
		});
	});

	describe('Selection', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
			clip.addNote({ id: 'n3', pitch: 64, velocity: 100, time: 2.0, duration: 0.5 });
		});

		it('should select notes', () => {
			clip.selectNotes(['n1', 'n2']);
			expect(clip.getSelectedNotes().length).toBe(2);
		});

		it('should deselect notes', () => {
			clip.selectNotes(['n1', 'n2']);
			clip.deselectNotes(['n1']);
			expect(clip.getSelectedNotes().length).toBe(1);
			expect(clip.isNoteSelected('n2')).toBe(true);
		});

		it('should clear selection', () => {
			clip.selectNotes(['n1', 'n2']);
			clip.clearSelection();
			expect(clip.getSelectedNotes().length).toBe(0);
		});
	});

	describe('Editing Operations', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
		});

		it('should transpose selected notes', () => {
			clip.selectNotes(['n1', 'n2']);
			clip.transposeSelected(2); // Up 2 semitones

			expect(clip.getNote('n1')?.pitch).toBe(62);
			expect(clip.getNote('n2')?.pitch).toBe(64);
		});

		it('should clamp transposed notes to MIDI range', () => {
			clip.selectNotes(['n1']);
			clip.updateNote('n1', { pitch: 127 });
			clip.transposeSelected(2);

			expect(clip.getNote('n1')?.pitch).toBe(127); // Should not exceed 127
		});

		it('should duplicate selected notes', () => {
			clip.selectNotes(['n1']);
			const duplicated = clip.duplicateSelected(0.5);

			expect(duplicated.length).toBe(1);
			expect(clip.getNotes().length).toBe(3);
			expect(duplicated[0].time).toBe(0.5);
		});

		it('should delete selected notes', () => {
			clip.selectNotes(['n1']);
			const deleted = clip.deleteSelected();

			expect(deleted).toBe(1);
			expect(clip.getNotes().length).toBe(1);
			expect(clip.getNote('n1')).toBeUndefined();
		});

		it('should scale velocity', () => {
			clip.selectNotes(['n1']);
			clip.scaleVelocity(0.5);

			expect(clip.getNote('n1')?.velocity).toBe(50);
		});
	});

	describe('Quantization', () => {
		beforeEach(() => {
			// Add slightly off-grid notes
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0.02, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 0.52, duration: 0.5 });
		});

		it('should quantize notes to grid', () => {
			clip.quantize(
				{
					grid: '1/4',
					strength: 1.0,
					quantizeNoteStarts: true,
					quantizeNoteEnds: false
				},
				120
			);

			const notes = clip.getNotes();
			expect(notes[0].time).toBeCloseTo(0, 2);
			expect(notes[1].time).toBeCloseTo(0.5, 2);
		});

		it('should apply partial quantization', () => {
			const originalTime = clip.getNote('n1')!.time;

			clip.quantize(
				{
					grid: '1/4',
					strength: 0.5,
					quantizeNoteStarts: true,
					quantizeNoteEnds: false
				},
				120
			);

			const newTime = clip.getNote('n1')!.time;
			expect(newTime).toBeGreaterThan(0);
			expect(newTime).toBeLessThan(originalTime);
		});
	});

	describe('Clip Operations', () => {
		it('should move clip to new start time', () => {
			clip.moveTo(2.0);
			expect(clip.startTime).toBe(2.0);
		});

		it('should not allow negative start time', () => {
			expect(() => clip.moveTo(-1)).toThrow();
		});

		it('should split clip at time', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 2.0, duration: 0.5 });

			const secondHalf = clip.split(1.5);

			expect(clip.duration).toBe(1.5);
			expect(clip.getNotes().length).toBe(1);

			expect(secondHalf).not.toBeNull();
			expect(secondHalf!.duration).toBe(2.5);
			expect(secondHalf!.getNotes().length).toBe(1);
		});

		it('should clone clip', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });

			const clone = clip.clone();

			expect(clone.id).not.toBe(clip.id);
			expect(clone.getNotes().length).toBe(1);
			expect(clone.getNotes()[0].id).not.toBe('n1'); // Should have new ID
		});

		it('should check if clip contains time', () => {
			expect(clip.contains(2.0)).toBe(true);
			expect(clip.contains(5.0)).toBe(false);
		});

		it('should check overlap with another clip', () => {
			const other = new MIDIClip({
				trackId,
				startTime: 2.0,
				duration: 2.0
			});

			expect(clip.overlaps(other)).toBe(true);

			const noOverlap = new MIDIClip({
				trackId,
				startTime: 5.0,
				duration: 2.0
			});

			expect(clip.overlaps(noOverlap)).toBe(false);
		});
	});

	describe('Serialization', () => {
		it('should serialize to JSON', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });

			const json = clip.toJSON();

			expect(json.id).toBe(clip.id);
			expect(json.trackId).toBe(trackId);
			expect(json.notes.length).toBe(1);
		});

		it('should create from JSON', () => {
			const data = {
				id: 'clip-1',
				trackId,
				name: 'Test',
				startTime: 0,
				duration: 4.0,
				notes: [{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 }],
				controlChanges: [],
				pitchBends: [],
				programChanges: []
			};

			const restoredClip = MIDIClip.fromJSON(data);

			expect(restoredClip.id).toBe('clip-1');
			expect(restoredClip.getNotes().length).toBe(1);
		});
	});
});
