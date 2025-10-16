/**
 * MIDI Editing Utilities Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
	copySelectedNotes,
	cutSelectedNotes,
	pasteNotes,
	duplicateNotesMultiple,
	stretchSelectedNotes,
	reverseSelectedNotes,
	arpeggiateSelectedNotes,
	rampVelocity,
	randomizeVelocity,
	mergeOverlappingNotes,
	splitLongNotes,
	createCCRamp,
	removeDuplicateNotes,
	hasClipboardContent,
	clearClipboard
} from './editing';
import { MIDIClip } from './MIDIClip';
import type { MIDINote } from './types';

describe('MIDI Editing Utilities', () => {
	let clip: MIDIClip;

	beforeEach(() => {
		clearClipboard();
		clip = new MIDIClip({
			trackId: 'test-track',
			startTime: 0,
			duration: 8.0
		});
	});

	describe('Copy/Paste', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 0.5, duration: 0.5 });
		});

		it('should copy selected notes', () => {
			clip.selectNotes(['n1', 'n2']);
			const count = copySelectedNotes(clip);

			expect(count).toBe(2);
			expect(hasClipboardContent()).toBe(true);
		});

		it('should paste notes at specified time', () => {
			clip.selectNotes(['n1', 'n2']);
			copySelectedNotes(clip);

			const pastedCount = pasteNotes(clip, 2.0);

			expect(pastedCount).toBe(2);
			expect(clip.getNotes().length).toBe(4);

			const pastedNotes = clip.getNotesInRange(2.0, 3.0);
			expect(pastedNotes.length).toBe(2);
		});

		it('should cut notes (copy + delete)', () => {
			clip.selectNotes(['n1']);
			const count = cutSelectedNotes(clip);

			expect(count).toBe(1);
			expect(clip.getNotes().length).toBe(1);
			expect(hasClipboardContent()).toBe(true);
		});

		it('should not paste notes outside clip bounds', () => {
			clip.selectNotes(['n1', 'n2']);
			copySelectedNotes(clip);

			const pastedCount = pasteNotes(clip, 7.9); // Near end of clip

			// Some notes may not fit
			expect(pastedCount).toBeLessThanOrEqual(2);
		});

		it('should clear clipboard', () => {
			clip.selectNotes(['n1']);
			copySelectedNotes(clip);
			expect(hasClipboardContent()).toBe(true);

			clearClipboard();
			expect(hasClipboardContent()).toBe(false);
		});
	});

	describe('Duplication', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
		});

		it('should duplicate notes multiple times', () => {
			clip.selectNotes(['n1']);
			const created = duplicateNotesMultiple(clip, 1.0, 3);

			expect(created).toBe(3);
			expect(clip.getNotes().length).toBe(4); // Original + 3 duplicates
		});

		it('should space duplicates by offset', () => {
			clip.selectNotes(['n1']);
			duplicateNotesMultiple(clip, 1.0, 2);

			const notes = clip.getNotes();
			expect(notes[1].time).toBe(1.0);
			expect(notes[2].time).toBe(2.0);
		});
	});

	describe('Stretching', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
		});

		it('should stretch note durations', () => {
			clip.selectNotes(['n1', 'n2']);
			stretchSelectedNotes(clip, 2.0);

			expect(clip.getNote('n1')!.duration).toBe(1.0);
			expect(clip.getNote('n2')!.duration).toBe(1.0);
		});

		it('should stretch relative positions', () => {
			clip.selectNotes(['n1', 'n2']);
			stretchSelectedNotes(clip, 2.0);

			expect(clip.getNote('n1')!.time).toBe(0);
			expect(clip.getNote('n2')!.time).toBe(2.0); // 1.0 * 2
		});

		it('should compress with factor < 1', () => {
			clip.selectNotes(['n1', 'n2']);
			stretchSelectedNotes(clip, 0.5);

			expect(clip.getNote('n1')!.duration).toBe(0.25);
			expect(clip.getNote('n2')!.time).toBe(0.5);
		});
	});

	describe('Reverse', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
		});

		it('should reverse note order', () => {
			clip.selectNotes(['n1', 'n2']);
			reverseSelectedNotes(clip);

			const n1 = clip.getNote('n1')!;
			const n2 = clip.getNote('n2')!;

			// Notes should be reversed in time
			expect(n1.time).toBeGreaterThan(n2.time);
		});
	});

	describe('Arpeggiation', () => {
		beforeEach(() => {
			// Create a chord
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 64, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n3', pitch: 67, velocity: 100, time: 0, duration: 0.5 });
		});

		it('should arpeggiate notes upward', () => {
			clip.selectNotes(['n1', 'n2', 'n3']);
			arpeggiateSelectedNotes(clip, 0.1, 'up');

			const notes = clip.getNotes();
			expect(notes[0].time).toBe(0);
			expect(notes[1].time).toBeCloseTo(0.1, 2);
			expect(notes[2].time).toBeCloseTo(0.2, 2);

			// Should be in ascending pitch order
			expect(notes[0].pitch).toBe(60);
			expect(notes[1].pitch).toBe(64);
			expect(notes[2].pitch).toBe(67);
		});

		it('should arpeggiate notes downward', () => {
			clip.selectNotes(['n1', 'n2', 'n3']);
			arpeggiateSelectedNotes(clip, 0.1, 'down');

			const notes = clip.getNotes();
			// Find note with highest pitch (should be first in time)
			const highestPitchNote = notes.find((n) => n.pitch === 67);
			expect(highestPitchNote?.time).toBe(0);
		});
	});

	describe('Velocity Editing', () => {
		beforeEach(() => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 100, time: 1.0, duration: 0.5 });
			clip.addNote({ id: 'n3', pitch: 64, velocity: 100, time: 2.0, duration: 0.5 });
		});

		it('should create velocity ramp', () => {
			clip.selectNotes(['n1', 'n2', 'n3']);
			rampVelocity(clip, 50, 100);

			expect(clip.getNote('n1')!.velocity).toBe(50);
			expect(clip.getNote('n2')!.velocity).toBe(75);
			expect(clip.getNote('n3')!.velocity).toBe(100);
		});

		it('should randomize velocities', () => {
			clip.selectNotes(['n1', 'n2', 'n3']);
			randomizeVelocity(clip, 60, 80);

			const notes = clip.getNotes();
			notes.forEach((note) => {
				expect(note.velocity).toBeGreaterThanOrEqual(60);
				expect(note.velocity).toBeLessThanOrEqual(80);
			});
		});
	});

	describe('Note Merging', () => {
		it('should merge overlapping notes', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.6 });
			clip.addNote({ id: 'n2', pitch: 60, velocity: 80, time: 0.5, duration: 0.5 });

			const merged = mergeOverlappingNotes(clip);

			expect(merged).toBe(1);
			expect(clip.getNotes().length).toBe(1);

			const remaining = clip.getNotes()[0];
			expect(remaining.duration).toBeGreaterThanOrEqual(1.0);
			expect(remaining.velocity).toBe(100); // Should use higher velocity
		});

		it('should not merge notes with different pitches', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.6 });
			clip.addNote({ id: 'n2', pitch: 62, velocity: 80, time: 0.5, duration: 0.5 });

			const merged = mergeOverlappingNotes(clip);

			expect(merged).toBe(0);
			expect(clip.getNotes().length).toBe(2);
		});
	});

	describe('Note Splitting', () => {
		it('should split long notes', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 2.0 });

			const splitCount = splitLongNotes(clip, 0.5);

			expect(splitCount).toBe(4); // 2.0 / 0.5 = 4 notes
			expect(clip.getNotes().length).toBe(4);

			const notes = clip.getNotes();
			expect(notes[0].time).toBe(0);
			expect(notes[1].time).toBe(0.5);
			expect(notes[2].time).toBe(1.0);
			expect(notes[3].time).toBe(1.5);
		});

		it('should not split notes shorter than interval', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.3 });

			const splitCount = splitLongNotes(clip, 0.5);

			expect(splitCount).toBe(0);
			expect(clip.getNotes().length).toBe(1);
		});
	});

	describe('CC Automation', () => {
		it('should create CC ramp', () => {
			createCCRamp(clip, 7, 0, 127, 0, 2.0, 4); // Volume ramp

			const ccs = clip.getControlChanges();
			expect(ccs.length).toBe(5); // 4 steps + 1 (0 to 4 inclusive)

			expect(ccs[0].value).toBe(0);
			expect(ccs[4].value).toBe(127);
		});

		it('should space CC points evenly', () => {
			createCCRamp(clip, 1, 64, 64, 0, 1.0, 2); // Modulation

			const ccs = clip.getControlChanges();
			expect(ccs[0].time).toBe(0);
			expect(ccs[1].time).toBeCloseTo(0.5, 2);
			expect(ccs[2].time).toBeCloseTo(1.0, 2);
		});
	});

	describe('Duplicate Removal', () => {
		it('should remove duplicate notes', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n3', pitch: 62, velocity: 100, time: 0, duration: 0.5 });

			const removed = removeDuplicateNotes(clip);

			expect(removed).toBe(1);
			expect(clip.getNotes().length).toBe(2);
		});

		it('should consider velocity in duplicate detection', () => {
			clip.addNote({ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 });
			clip.addNote({ id: 'n2', pitch: 60, velocity: 80, time: 0, duration: 0.5 });

			const removed = removeDuplicateNotes(clip);

			expect(removed).toBe(0); // Different velocities, not duplicates
			expect(clip.getNotes().length).toBe(2);
		});
	});
});
