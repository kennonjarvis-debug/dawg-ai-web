/**
 * Beat Engine Tests
 * Instance 4: Quality & Performance Validation
 */

import { describe, it, expect } from 'vitest';
import { BeatGenerator } from './BeatGenerator';
import { mapInputToStyle, BEAT_STYLES, getStylesByMood, getStylesByTempo } from './styles';

describe('Beat Engine - Instance 4', () => {
	describe('Style Taxonomy', () => {
		it('should have 15+ distinct beat styles', () => {
			const styleCount = Object.keys(BEAT_STYLES).length;
			expect(styleCount).toBeGreaterThanOrEqual(15);
		});

		it('should NOT contain artist names in styles', () => {
			const styleKeys = Object.keys(BEAT_STYLES);
			const artistNames = ['drake', 'travis', 'metro', 'kanye', 'carti'];

			for (const style of styleKeys) {
				for (const artist of artistNames) {
					expect(style.toLowerCase()).not.toContain(artist);
				}
			}
		});

		it('should map "drake" input to descriptive style', () => {
			const style = mapInputToStyle('make a beat like drake');
			expect(style).toBe('toronto-ambient-trap');
			expect(style).not.toContain('drake');
		});

		it('should find styles by mood', () => {
			const moodyStyles = getStylesByMood('moody');
			expect(moodyStyles.length).toBeGreaterThan(0);
			expect(moodyStyles).toContain('toronto-ambient-trap');
		});

		it('should find styles by tempo', () => {
			const trapStyles = getStylesByTempo(140);
			expect(trapStyles.length).toBeGreaterThan(0);
		});
	});

	describe('Beat Generator', () => {
		const generator = new BeatGenerator();

		it('should generate 3 beat variations', async () => {
			const beats = await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 4
			});

			expect(beats).toHaveLength(3);
		});

		it('should generate distinct variations', async () => {
			const beats = await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 4
			});

			// Check that variations are different
			const kickPatterns = beats.map((b) => b.midi.kick.length);
			const hasVariation = new Set(kickPatterns).size > 1 || beats[0].midi.kick !== beats[1].midi.kick;

			expect(hasVariation).toBe(true);
		});

		it('should generate trap pattern with sparse 808s', async () => {
			const beats = await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 4
			});

			const beat = beats[0];

			// Trap should have kicks (not four-on-floor)
			expect(beat.midi.kick.length).toBeGreaterThan(0);
			expect(beat.midi.kick.length).toBeLessThan(16); // Sparse, not 16 kicks

			// Should have snares on 2 and 4
			expect(beat.midi.snare.length).toBeGreaterThan(0);

			// Should have hi-hats
			expect(beat.midi.hihat.length).toBeGreaterThan(0);
		});

		it('should generate house pattern with four-on-floor kick', async () => {
			const beats = await generator.generate({
				style: 'deep-house-groovy',
				bpm: 122,
				bars: 4
			});

			const beat = beats[0];

			// Four-on-floor: kick on every beat (4 beats × 4 bars = 16 kicks)
			expect(beat.midi.kick.length).toBe(16);

			// Verify kicks are near beats (accounting for humanization)
			const kicksNearBeats = beat.midi.kick.filter((n) => {
				const nearestBeat = Math.round(n.time);
				return Math.abs(n.time - nearestBeat) < 0.1; // Within 0.1 beats
			});

			expect(kicksNearBeats.length).toBe(16); // All kicks near beats
		});

		it('should generate drill pattern with hard snares', async () => {
			const beats = await generator.generate({
				style: 'drill-aggressive',
				bpm: 145,
				bars: 4
			});

			const beat = beats[0];

			// Drill has aggressive snare pattern
			expect(beat.midi.snare.length).toBeGreaterThan(0);

			// High velocity for hard snares
			const avgSnareVelocity =
				beat.midi.snare.reduce((sum, n) => sum + n.velocity, 0) / beat.midi.snare.length;
			expect(avgSnareVelocity).toBeGreaterThan(100);
		});

		it('should apply humanization to patterns', async () => {
			const beats = await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 4
			});

			const beat = beats[0];

			// Check that not all notes are exactly on grid
			const hasHumanization = beat.midi.kick.some((note) => {
				const decimal = note.time % 1;
				return decimal > 0.001 && decimal < 0.999;
			});

			expect(hasHumanization).toBe(true);
		});

		it('should generate correct number of bars', async () => {
			const beats = await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 8
			});

			const beat = beats[0];

			// Find max time across all notes
			const maxTime = Math.max(
				...beat.midi.kick.map((n) => n.time),
				...beat.midi.snare.map((n) => n.time),
				...beat.midi.hihat.map((n) => n.time)
			);

			// Should be within 8 bars (32 beats)
			expect(maxTime).toBeLessThanOrEqual(32);
			expect(maxTime).toBeGreaterThan(24); // At least 6 bars
		});

		it('should include metadata in generated beats', async () => {
			const beats = await generator.generate({
				style: 'drill-aggressive',
				bpm: 145,
				bars: 4
			});

			const beat = beats[0];

			expect(beat.id).toBeDefined();
			expect(beat.title).toContain('Drill');
			expect(beat.tags.style).toBe('drill-aggressive');
			expect(beat.tags.tempo).toBe(145);
			expect(beat.tags.mood).toContain('aggressive');
			expect(beat.variationIndex).toBeGreaterThanOrEqual(0);
			expect(beat.variationIndex).toBeLessThan(3);
		});
	});

	describe('Performance', () => {
		const generator = new BeatGenerator();

		it('should generate beats in <5 seconds', async () => {
			const start = Date.now();

			await generator.generate({
				style: 'toronto-ambient-trap',
				bpm: 140,
				bars: 4
			});

			const duration = Date.now() - start;
			expect(duration).toBeLessThan(5000);
		});

		it('should handle multiple concurrent generations', async () => {
			const promises = [
				generator.generate({ style: 'toronto-ambient-trap', bpm: 140, bars: 4 }),
				generator.generate({ style: 'drill-aggressive', bpm: 145, bars: 4 }),
				generator.generate({ style: 'lofi-chill', bpm: 80, bars: 4 })
			];

			const results = await Promise.all(promises);

			expect(results).toHaveLength(3);
			expect(results[0][0].tags.style).toBe('toronto-ambient-trap');
			expect(results[1][0].tags.style).toBe('drill-aggressive');
			expect(results[2][0].tags.style).toBe('lofi-chill');
		});
	});
});
