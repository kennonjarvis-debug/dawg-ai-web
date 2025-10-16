/**
 * Quantization Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
	gridToSeconds,
	quantizeTime,
	quantizeNotes,
	humanizeNotes,
	makeNotesLegato,
	makeNotesStaccato,
	GROOVE_PRESETS
} from './quantize';
import type { MIDINote } from './types';

describe('Quantization Utilities', () => {
	describe('gridToSeconds', () => {
		it('should convert grid divisions to seconds at 120 BPM', () => {
			expect(gridToSeconds('1/4', 120)).toBe(0.5); // Quarter note
			expect(gridToSeconds('1/8', 120)).toBe(0.25); // Eighth note
			expect(gridToSeconds('1/16', 120)).toBe(0.125); // Sixteenth note
		});

		it('should handle different tempos', () => {
			expect(gridToSeconds('1/4', 60)).toBe(1.0); // Slower tempo
			expect(gridToSeconds('1/4', 240)).toBe(0.25); // Faster tempo
		});

		it('should handle triplets', () => {
			const tripletDuration = gridToSeconds('1/8T', 120);
			expect(tripletDuration).toBeCloseTo(0.166, 2); // ~1/6 second
		});
	});

	describe('quantizeTime', () => {
		it('should quantize time to nearest grid point', () => {
			const gridSize = 0.5; // Quarter note at 120 BPM
			expect(quantizeTime(0.02, gridSize, 1.0, 0)).toBeCloseTo(0, 2);
			expect(quantizeTime(0.48, gridSize, 1.0, 0)).toBeCloseTo(0.5, 2);
			expect(quantizeTime(0.27, gridSize, 1.0, 0)).toBeCloseTo(0.5, 2);
		});

		it('should apply partial strength', () => {
			const gridSize = 0.5;
			const time = 0.1;

			// Half strength should move halfway toward grid
			const quantized = quantizeTime(time, gridSize, 0.5, 0);
			expect(quantized).toBeGreaterThan(0);
			expect(quantized).toBeLessThan(time);
		});

		it('should apply swing', () => {
			const gridSize = 0.5;

			// Even grid index (0) should not be affected by swing
			const evenPoint = quantizeTime(0.0, gridSize, 1.0, 0.5);
			expect(evenPoint).toBeCloseTo(0.0, 2);

			// Odd grid index (1) should be delayed
			const oddPoint = quantizeTime(0.5, gridSize, 1.0, 0.5);
			expect(oddPoint).toBeGreaterThan(0.5);
			expect(oddPoint).toBeLessThan(0.75); // Max 50% swing
		});
	});

	describe('quantizeNotes', () => {
		it('should quantize note start times', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0.02, duration: 0.5 },
				{ id: 'n2', pitch: 62, velocity: 100, time: 0.52, duration: 0.5 }
			];

			const quantized = quantizeNotes(
				notes,
				{
					grid: '1/4',
					strength: 1.0,
					quantizeNoteStarts: true,
					quantizeNoteEnds: false
				},
				120
			);

			expect(quantized[0].time).toBeCloseTo(0, 2);
			expect(quantized[1].time).toBeCloseTo(0.5, 2);
		});

		it('should quantize both starts and ends', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0.02, duration: 0.48 }
			];

			const quantized = quantizeNotes(
				notes,
				{
					grid: '1/4',
					strength: 1.0,
					quantizeNoteStarts: true,
					quantizeNoteEnds: true
				},
				120
			);

			expect(quantized[0].time).toBeCloseTo(0, 2);
			expect(quantized[0].duration).toBeCloseTo(0.5, 2);
		});

		it('should not quantize if disabled', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0.02, duration: 0.5 }
			];

			const quantized = quantizeNotes(
				notes,
				{
					grid: '1/4',
					quantizeNoteStarts: false,
					quantizeNoteEnds: false
				},
				120
			);

			expect(quantized[0].time).toBe(0.02); // Unchanged
		});
	});

	describe('humanizeNotes', () => {
		it('should add timing variation', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 },
				{ id: 'n2', pitch: 62, velocity: 100, time: 0.5, duration: 0.5 }
			];

			const humanized = humanizeNotes(notes, 1.0);

			// Timing should be within expected range (may be close to original)
			expect(Math.abs(humanized[0].time)).toBeLessThan(0.01); // Max ±5ms * amount
			// At least one note should have some variation (check both notes)
			const hasVariation =
				Math.abs(humanized[0].time) > 0.0001 ||
				Math.abs(humanized[1].time - 0.5) > 0.0001 ||
				humanized[0].velocity !== 100 ||
				humanized[1].velocity !== 100;
			expect(hasVariation).toBe(true);
		});

		it('should add velocity variation', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 }
			];

			const humanized = humanizeNotes(notes, 1.0);

			expect(humanized[0].velocity).not.toBe(100);
			expect(humanized[0].velocity).toBeGreaterThanOrEqual(1);
			expect(humanized[0].velocity).toBeLessThanOrEqual(127);
		});

		it('should respect amount parameter', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.5 }
			];

			const minimal = humanizeNotes(notes, 0.1);
			expect(Math.abs(minimal[0].time)).toBeLessThan(0.002);
		});
	});

	describe('makeNotesLegato', () => {
		it('should extend notes to connect', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.4 },
				{ id: 'n2', pitch: 60, velocity: 100, time: 0.5, duration: 0.4 }
			];

			const legato = makeNotesLegato(notes, 0.001);

			// First note should extend to just before second
			expect(legato[0].duration).toBeCloseTo(0.499, 3);
		});

		it('should only affect notes with same pitch', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.4 },
				{ id: 'n2', pitch: 62, velocity: 100, time: 0.5, duration: 0.4 }
			];

			const legato = makeNotesLegato(notes);

			// Different pitch, should not extend
			expect(legato[0].duration).toBe(0.4);
		});
	});

	describe('makeNotesStaccato', () => {
		it('should shorten note durations', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 1.0 }
			];

			const staccato = makeNotesStaccato(notes, 0.5);

			expect(staccato[0].duration).toBe(0.5);
		});

		it('should respect minimum duration', () => {
			const notes: MIDINote[] = [
				{ id: 'n1', pitch: 60, velocity: 100, time: 0, duration: 0.1 }
			];

			const staccato = makeNotesStaccato(notes, 0.1, 0.05);

			expect(staccato[0].duration).toBeGreaterThanOrEqual(0.05);
		});
	});

	describe('GROOVE_PRESETS', () => {
		it('should have standard groove presets', () => {
			expect(GROOVE_PRESETS.straight).toBeDefined();
			expect(GROOVE_PRESETS.swing).toBeDefined();
			expect(GROOVE_PRESETS.shuffle).toBeDefined();
		});

		it('should have correct array lengths', () => {
			expect(GROOVE_PRESETS.straight.length).toBe(8);
			expect(GROOVE_PRESETS.swing.length).toBe(8);
		});
	});
});
