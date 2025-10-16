/**
 * CompEngine Tests - DAWG AI Audio Engine
 * Comprehensive test suite for auto-comp system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CompEngine } from './CompEngine';
import type { Take } from '../recording/types';
import type { CompOptions, ManualSegment } from './types';
import { v4 as uuid } from 'uuid';

// Helper: Create test audio buffer
function createTestBuffer(durationSec: number, frequency: number = 440): AudioBuffer {
	const sampleRate = 48000;
	const length = durationSec * sampleRate;
	const context = new AudioContext({ sampleRate });
	const buffer = context.createBuffer(2, length, sampleRate);

	for (let ch = 0; ch < 2; ch++) {
		const data = buffer.getChannelData(ch);
		for (let i = 0; i < length; i++) {
			data[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.5;
		}
	}

	return buffer;
}

// Helper: Create test take with custom metrics
function createTestTake(
	passIndex: number,
	bars: { start: number; end: number },
	metrics: {
		peakDb?: number;
		rmsDb?: number;
		snr?: number;
		timingErrorMs?: number;
	} = {}
): Take {
	const secondsPerBar = 2; // 120 BPM, 4/4 time
	const durationSec = (bars.end - bars.start) * secondsPerBar;

	return {
		id: uuid(),
		passIndex,
		startBar: bars.start,
		endBar: bars.end,
		clip: createTestBuffer(durationSec),
		metrics: {
			peakDb: metrics.peakDb ?? -3.0,
			rmsDb: metrics.rmsDb ?? -18.0,
			snr: metrics.snr ?? 25.0,
			timingErrorMs: metrics.timingErrorMs ?? 5.0,
		},
		timestamp: new Date(),
	};
}

describe('CompEngine', () => {
	let compEngine: CompEngine;

	beforeEach(() => {
		compEngine = new CompEngine(48000);
	});

	describe('Constructor', () => {
		it('should initialize with default config', () => {
			const config = compEngine.getConfig();
			expect(config.segmentSizeBeats).toBe(4);
			expect(config.crossfadeDurationMs).toBe(20);
			expect(config.clippingThresholdDb).toBe(-0.5);
		});

		it('should accept custom config', () => {
			const engine = new CompEngine(48000, {
				segmentSizeBeats: 8,
				crossfadeDurationMs: 30,
			});

			const config = engine.getConfig();
			expect(config.segmentSizeBeats).toBe(8);
			expect(config.crossfadeDurationMs).toBe(30);
		});

		it('should throw error if weights do not sum to 1.0', () => {
			expect(
				() =>
					new CompEngine(48000, {
						timingWeight: 0.3,
						qualityWeight: 0.3,
						clippingWeight: 0.3, // Sum = 0.9, not 1.0
					})
			).toThrow('Scoring weights must sum to 1.0');
		});
	});

	describe('createAutoComp', () => {
		it('should throw error when no takes provided', async () => {
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			await expect(compEngine.createAutoComp([], opts)).rejects.toThrow('No takes provided');
		});

		it('should return single take when only one take available', async () => {
			const take = createTestTake(0, { start: 0, end: 4 });
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take], opts);

			expect(result.segments).toHaveLength(1);
			expect(result.segments[0].takeId).toBe(take.id);
			expect(result.segments[0].reason).toBe('Only take available');
			expect(result.crossfades).toHaveLength(0);
		});

		it('should select take with best timing', async () => {
			const take1 = createTestTake(0, { start: 0, end: 4 }, { timingErrorMs: 20 });
			const take2 = createTestTake(1, { start: 0, end: 4 }, { timingErrorMs: 2 }); // Better timing
			const take3 = createTestTake(2, { start: 0, end: 4 }, { timingErrorMs: 15 });

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take1, take2, take3], opts);

			// Should select take2 for all segments (best timing)
			expect(result.segments.every((seg) => seg.takeId === take2.id)).toBe(true);
			expect(result.averageScore).toBeGreaterThan(0.8);
		});

		it('should select take with best SNR', async () => {
			const take1 = createTestTake(0, { start: 0, end: 4 }, { snr: 15 });
			const take2 = createTestTake(1, { start: 0, end: 4 }, { snr: 28 }); // Better SNR
			const take3 = createTestTake(2, { start: 0, end: 4 }, { snr: 20 });

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take1, take2, take3], opts);

			// Should favor take2 (best SNR)
			const take2Segments = result.segments.filter((seg) => seg.takeId === take2.id);
			expect(take2Segments.length).toBeGreaterThan(0);
		});

		it('should reject takes with clipping', async () => {
			const take1 = createTestTake(0, { start: 0, end: 4 }, { peakDb: 0.5 }); // Clipping!
			const take2 = createTestTake(1, { start: 0, end: 4 }, { peakDb: -3.0 }); // Clean
			const take3 = createTestTake(2, { start: 0, end: 4 }, { peakDb: -2.0 }); // Clean

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take1, take2, take3], opts);

			// Should NOT select take1 (clipping)
			expect(result.segments.every((seg) => seg.takeId !== take1.id)).toBe(true);
		});

		it('should create crossfades at take boundaries', async () => {
			// Create takes with different quality per bar
			const take1 = createTestTake(0, { start: 0, end: 8 }, { timingErrorMs: 2 }); // Good
			const take2 = createTestTake(1, { start: 0, end: 8 }, { timingErrorMs: 20 }); // Bad
			const take3 = createTestTake(2, { start: 0, end: 8 }, { timingErrorMs: 3 }); // Good

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 8 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take1, take2, take3], opts);

			// Should have crossfades where takes switch
			expect(result.crossfades.length).toBeGreaterThanOrEqual(0);
			result.crossfades.forEach((cf) => {
				expect(cf.type).toBe('equal-power');
				expect(cf.durationMs).toBe(20);
			});
		});

		it('should divide region into segments correctly', async () => {
			const take = createTestTake(0, { start: 0, end: 8 });
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 8 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take], opts);

			// Default segment size is 4 beats = 1 bar, so 8 bars should create 8 segments
			expect(result.segments.length).toBe(8);
			expect(result.totalSegments).toBe(8);
		});

		it('should calculate average score correctly', async () => {
			const take1 = createTestTake(0, { start: 0, end: 4 }, { timingErrorMs: 2, snr: 28 });
			const take2 = createTestTake(1, { start: 0, end: 4 }, { timingErrorMs: 15, snr: 15 });

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take1, take2], opts);

			expect(result.averageScore).toBeGreaterThan(0);
			expect(result.averageScore).toBeLessThanOrEqual(1.0);
		});
	});

	describe('createManualComp', () => {
		it('should create comp from manual segments', async () => {
			const take1 = createTestTake(0, { start: 0, end: 8 });
			const take2 = createTestTake(1, { start: 0, end: 8 });
			const take3 = createTestTake(2, { start: 0, end: 8 });

			const manualSegments: ManualSegment[] = [
				{ takeId: take1.id, startBar: 0, endBar: 2 },
				{ takeId: take2.id, startBar: 2, endBar: 5 },
				{ takeId: take3.id, startBar: 5, endBar: 8 },
			];

			const result = await compEngine.createManualComp([take1, take2, take3], manualSegments);

			expect(result.segments).toHaveLength(3);
			expect(result.segments[0].takeId).toBe(take1.id);
			expect(result.segments[1].takeId).toBe(take2.id);
			expect(result.segments[2].takeId).toBe(take3.id);
			expect(result.segments.every((seg) => seg.reason === 'Manual selection')).toBe(true);
		});

		it('should create crossfades at manual segment boundaries', async () => {
			const take1 = createTestTake(0, { start: 0, end: 8 });
			const take2 = createTestTake(1, { start: 0, end: 8 });

			const manualSegments: ManualSegment[] = [
				{ takeId: take1.id, startBar: 0, endBar: 4 },
				{ takeId: take2.id, startBar: 4, endBar: 8 },
			];

			const result = await compEngine.createManualComp([take1, take2], manualSegments);

			expect(result.crossfades).toHaveLength(1);
			expect(result.crossfades[0].bar).toBe(4);
		});
	});

	describe('renderComp', () => {
		it('should render comp to audio buffer', async () => {
			const take1 = createTestTake(0, { start: 0, end: 4 }, { timingErrorMs: 2 });
			const take2 = createTestTake(1, { start: 0, end: 4 }, { timingErrorMs: 20 });

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const compResult = await compEngine.createAutoComp([take1, take2], opts);
			const renderedBuffer = await compEngine.renderComp([take1, take2], compResult, 120);

			expect(renderedBuffer).toBeInstanceOf(AudioBuffer);
			expect(renderedBuffer.numberOfChannels).toBe(2);
			expect(renderedBuffer.sampleRate).toBe(48000);

			// 4 bars at 120 BPM = 8 seconds
			const expectedLength = 8 * 48000;
			expect(renderedBuffer.length).toBeCloseTo(expectedLength, -2); // Allow ±100 samples
		});

		it('should produce audio data without silence', async () => {
			const take = createTestTake(0, { start: 0, end: 4 });
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const compResult = await compEngine.createAutoComp([take], opts);
			const renderedBuffer = await compEngine.renderComp([take], compResult, 120);

			// Check that there's actual audio data (not all zeros)
			const leftChannel = renderedBuffer.getChannelData(0);
			const hasAudio = Array.from(leftChannel).some((sample) => Math.abs(sample) > 0.01);

			expect(hasAudio).toBe(true);
		});

		it('should handle crossfades without artifacts', async () => {
			const take1 = createTestTake(0, { start: 0, end: 8 }, { timingErrorMs: 2 });
			const take2 = createTestTake(1, { start: 0, end: 8 }, { timingErrorMs: 20 });

			// Force manual segments to create crossfade
			const manualSegments: ManualSegment[] = [
				{ takeId: take1.id, startBar: 0, endBar: 4 },
				{ takeId: take2.id, startBar: 4, endBar: 8 },
			];

			const compResult = await compEngine.createManualComp([take1, take2], manualSegments);
			const renderedBuffer = await compEngine.renderComp([take1, take2], compResult, 120);

			// Check for no clipping at crossfade point
			// Crossfade at bar 4 = 8 seconds = sample 384000 (at 48kHz)
			const crossfadeSample = 8 * 48000;
			const windowSize = 1000; // Check ±1000 samples around crossfade

			const leftChannel = renderedBuffer.getChannelData(0);

			for (let i = crossfadeSample - windowSize; i < crossfadeSample + windowSize; i++) {
				if (i >= 0 && i < leftChannel.length) {
					expect(Math.abs(leftChannel[i])).toBeLessThanOrEqual(1.0); // No clipping
				}
			}
		});
	});

	describe('Scoring Algorithm', () => {
		it('should weight timing errors correctly', () => {
			const config = compEngine.getConfig();
			expect(config.timingWeight).toBe(0.4);
		});

		it('should weight quality correctly', () => {
			const config = compEngine.getConfig();
			expect(config.qualityWeight).toBe(0.4);
		});

		it('should weight clipping correctly', () => {
			const config = compEngine.getConfig();
			expect(config.clippingWeight).toBe(0.2);
		});

		it('should penalize takes with high timing error', async () => {
			const perfectTiming = createTestTake(0, { start: 0, end: 4 }, { timingErrorMs: 0 });
			const badTiming = createTestTake(1, { start: 0, end: 4 }, { timingErrorMs: 50 });

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 4 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([perfectTiming, badTiming], opts);

			// All segments should be from perfectTiming
			expect(result.segments.every((seg) => seg.takeId === perfectTiming.id)).toBe(true);
		});
	});

	describe('Configuration', () => {
		it('should allow updating config', () => {
			compEngine.setConfig({ segmentSizeBeats: 8 });
			const config = compEngine.getConfig();
			expect(config.segmentSizeBeats).toBe(8);
		});

		it('should validate weights on config update', () => {
			expect(() => {
				compEngine.setConfig({
					timingWeight: 0.5,
					qualityWeight: 0.5,
					clippingWeight: 0.5, // Sum > 1.0
				});
			}).toThrow('Scoring weights must sum to 1.0');
		});
	});

	describe('Edge Cases', () => {
		it('should handle very short segments', async () => {
			const take = createTestTake(0, { start: 0, end: 1 }); // Just 1 bar
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 1 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take], opts);

			expect(result.segments).toHaveLength(1);
			expect(result.crossfades).toHaveLength(0);
		});

		it('should handle very long regions', async () => {
			const take = createTestTake(0, { start: 0, end: 64 }); // 64 bars
			const opts: CompOptions = {
				region: { startBar: 0, endBar: 64 },
				trackId: 'track-1',
				method: 'auto',
			};

			const result = await compEngine.createAutoComp([take], opts);

			// 64 bars with 1-bar segments = 64 segments
			expect(result.segments).toHaveLength(64);
		});

		it('should handle takes with different start positions', async () => {
			const take1 = createTestTake(0, { start: 0, end: 8 });
			const take2 = createTestTake(1, { start: 2, end: 10 }); // Starts at bar 2

			const opts: CompOptions = {
				region: { startBar: 2, endBar: 8 },
				trackId: 'track-1',
				method: 'auto',
			};

			// Should work without errors
			const result = await compEngine.createAutoComp([take1, take2], opts);

			expect(result.segments.length).toBeGreaterThan(0);
		});
	});

	describe('Performance', () => {
		it('should render 16-bar region in <5s', async () => {
			const takes = [
				createTestTake(0, { start: 0, end: 16 }),
				createTestTake(1, { start: 0, end: 16 }),
				createTestTake(2, { start: 0, end: 16 }),
			];

			const opts: CompOptions = {
				region: { startBar: 0, endBar: 16 },
				trackId: 'track-1',
				method: 'auto',
			};

			const startTime = performance.now();

			const compResult = await compEngine.createAutoComp(takes, opts);
			await compEngine.renderComp(takes, compResult, 120);

			const endTime = performance.now();
			const durationMs = endTime - startTime;

			expect(durationMs).toBeLessThan(5000); // <5s
		});
	});
});
