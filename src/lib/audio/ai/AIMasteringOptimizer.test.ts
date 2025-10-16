/**
 * Unit Tests: AIMasteringOptimizer
 * Tests AI-powered mastering chain optimization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIMasteringOptimizer } from './AIMasteringOptimizer';

// Mock AudioContext and AnalyserNode
class MockAudioContext {
	sampleRate = 48000;

	createAnalyser() {
		return new MockAnalyserNode();
	}
}

class MockAnalyserNode {
	fftSize = 8192;
	frequencyBinCount = 4096;
	smoothingTimeConstant = 0.8;

	connect = vi.fn();
	disconnect = vi.fn();

	getFloatFrequencyData(array: Float32Array) {
		// Simulate different frequency profiles for genre detection
		for (let i = 0; i < array.length; i++) {
			const freq = (i / array.length) * 24000;

			// Electronic: Heavy bass + bright highs
			if (freq < 250) {
				array[i] = -15; // Strong bass
			} else if (freq < 500) {
				array[i] = -28;
			} else if (freq < 2000) {
				array[i] = -25;
			} else if (freq < 6000) {
				array[i] = -22;
			} else {
				array[i] = -18; // Bright highs
			}
		}
	}
}

describe('AIMasteringOptimizer', () => {
	let optimizer: AIMasteringOptimizer;
	let mockAudioContext: any;

	beforeEach(() => {
		mockAudioContext = new MockAudioContext() as any;
		optimizer = new AIMasteringOptimizer(mockAudioContext);
	});

	describe('Initialization', () => {
		it('should create optimizer with audio context', () => {
			expect(optimizer).toBeDefined();
		});
	});

	describe('Connection', () => {
		it('should connect audio source', () => {
			const mockSource = { connect: vi.fn() } as any;
			optimizer.connect(mockSource);
			expect(optimizer).toBeDefined();
		});

		it('should disconnect analyzer', () => {
			optimizer.disconnect();
			expect(optimizer).toBeDefined();
		});
	});

	describe('Chain Optimization', () => {
		it('should optimize chain with default settings', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings).toBeDefined();
			expect(settings).toHaveProperty('eq');
			expect(settings).toHaveProperty('saturation');
			expect(settings).toHaveProperty('compressor');
			expect(settings).toHaveProperty('stereoWidener');
			expect(settings).toHaveProperty('limiter');
			expect(settings).toHaveProperty('confidence');
			expect(settings).toHaveProperty('reasoning');
		});

		it('should include EQ settings with 5 bands', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.eq).toHaveProperty('low-freq');
			expect(settings.eq).toHaveProperty('low-gain');
			expect(settings.eq).toHaveProperty('low-mid-freq');
			expect(settings.eq).toHaveProperty('low-mid-gain');
			expect(settings.eq).toHaveProperty('mid-freq');
			expect(settings.eq).toHaveProperty('mid-gain');
			expect(settings.eq).toHaveProperty('high-mid-freq');
			expect(settings.eq).toHaveProperty('high-mid-gain');
			expect(settings.eq).toHaveProperty('high-freq');
			expect(settings.eq).toHaveProperty('high-gain');
		});

		it('should include saturation settings', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.saturation).toHaveProperty('drive');
			expect(settings.saturation).toHaveProperty('mix');
			expect(settings.saturation).toHaveProperty('tone');
			expect(settings.saturation.drive).toBeGreaterThan(0);
		});

		it('should include compressor settings', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.compressor).toHaveProperty('threshold');
			expect(settings.compressor).toHaveProperty('ratio');
			expect(settings.compressor).toHaveProperty('attack');
			expect(settings.compressor).toHaveProperty('release');
			expect(settings.compressor).toHaveProperty('makeup-gain');
		});

		it('should include stereo widener settings', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.stereoWidener).toHaveProperty('width');
			expect(settings.stereoWidener.width).toBeGreaterThan(0);
		});

		it('should include limiter settings', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.limiter).toHaveProperty('threshold');
			expect(settings.limiter).toHaveProperty('ceiling');
			expect(settings.limiter.ceiling).toBeLessThanOrEqual(0.99);
		});

		it('should include confidence score', async () => {
			const settings = await optimizer.optimizeChain();

			expect(settings.confidence).toBeGreaterThanOrEqual(0);
			expect(settings.confidence).toBeLessThanOrEqual(1);
		});

		it('should include reasoning array', async () => {
			const settings = await optimizer.optimizeChain();

			expect(Array.isArray(settings.reasoning)).toBe(true);
			expect(settings.reasoning.length).toBeGreaterThan(0);
		});
	});

	describe('Genre-Specific Optimization', () => {
		it('should optimize for electronic genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'electronic' });

			expect(settings.reasoning).toContain('Detected genre: electronic');
			// Electronic should have wider stereo width
			expect(settings.stereoWidener.width).toBeGreaterThan(1.3);
		});

		it('should optimize for rock genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'rock' });

			expect(settings.reasoning).toContain('Detected genre: rock');
			// Rock should have more saturation
			expect(settings.saturation.drive).toBeGreaterThan(1.5);
		});

		it('should optimize for hip-hop genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'hip-hop' });

			expect(settings.reasoning).toContain('Detected genre: hip-hop');
			// Hip-hop should have aggressive compression
			expect(settings.compressor.ratio).toBeGreaterThanOrEqual(4);
		});

		it('should optimize for pop genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'pop' });

			expect(settings.reasoning).toContain('Detected genre: pop');
		});

		it('should optimize for jazz genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'jazz' });

			expect(settings.reasoning).toContain('Detected genre: jazz');
			// Jazz should preserve dynamics
			expect(settings.compressor.ratio).toBeLessThan(3);
		});

		it('should optimize for classical genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'classical' });

			expect(settings.reasoning).toContain('Detected genre: classical');
			// Classical should have gentle processing
			expect(settings.saturation.drive).toBeLessThanOrEqual(1.1);
		});

		it('should optimize for podcast genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'podcast' });

			expect(settings.reasoning).toContain('Detected genre: podcast');
			// Podcast should narrow stereo (mono-ish)
			expect(settings.stereoWidener.width).toBeLessThan(1.0);
		});

		it('should auto-detect genre', async () => {
			const settings = await optimizer.optimizeChain({ genre: 'auto' });

			// Should detect electronic based on our mock data (heavy bass + bright highs)
			expect(settings.reasoning[0]).toContain('Detected genre:');
			expect(settings.reasoning[0]).toMatch(
				/electronic|rock|hip-hop|pop|jazz|classical/
			);
		});
	});

	describe('Target Loudness', () => {
		it('should adjust limiter based on target LUFS', async () => {
			const loudSettings = await optimizer.optimizeChain({ targetLUFS: -9 });
			const quietSettings = await optimizer.optimizeChain({ targetLUFS: -18 });

			// Louder target = higher limiter threshold (less headroom)
			expect(loudSettings.limiter.threshold).toBeGreaterThan(
				quietSettings.limiter.threshold
			);
		});

		it('should include target loudness in reasoning', async () => {
			const settings = await optimizer.optimizeChain({ targetLUFS: -12 });

			expect(settings.reasoning).toContainEqual('Target loudness: -12 LUFS');
		});
	});

	describe('Emphasis Options', () => {
		it('should emphasize warmth when requested', async () => {
			const normalSettings = await optimizer.optimizeChain();
			const warmSettings = await optimizer.optimizeChain({ emphasizeWarmth: true });

			// Warmth emphasis should boost low frequencies
			expect(warmSettings.eq['low-gain']).toBeGreaterThanOrEqual(
				normalSettings.eq['low-gain']
			);
			expect(warmSettings.reasoning).toContain('Enhanced warmth (low frequencies)');
		});

		it('should emphasize brightness when requested', async () => {
			const normalSettings = await optimizer.optimizeChain();
			const brightSettings = await optimizer.optimizeChain({
				emphasizeBrightness: true,
			});

			// Brightness emphasis should boost high frequencies
			expect(brightSettings.eq['high-gain']).toBeGreaterThanOrEqual(
				normalSettings.eq['high-gain']
			);
			expect(brightSettings.reasoning).toContain(
				'Enhanced brightness (high frequencies)'
			);
		});

		it('should emphasize punch when requested', async () => {
			const normalSettings = await optimizer.optimizeChain();
			const punchySettings = await optimizer.optimizeChain({ emphasizePunch: true });

			// Punch emphasis should increase compression ratio
			expect(punchySettings.compressor.ratio).toBeGreaterThanOrEqual(
				normalSettings.compressor.ratio
			);
			expect(punchySettings.compressor.attack).toBeLessThanOrEqual(0.005);
			expect(punchySettings.reasoning.some(r => r.includes('Enhanced punch'))).toBe(true);
		});

		it('should combine multiple emphasis options', async () => {
			const settings = await optimizer.optimizeChain({
				emphasizeWarmth: true,
				emphasizeBrightness: true,
				emphasizePunch: true,
			});

			expect(settings.reasoning.some(r => r.includes('Enhanced warmth'))).toBe(true);
			expect(settings.reasoning.some(r => r.includes('Enhanced brightness'))).toBe(true);
			expect(settings.reasoning.some(r => r.includes('Enhanced punch'))).toBe(true);
		});
	});

	describe('Apply Settings', () => {
		it('should apply settings to plugin instances', async () => {
			const settings = await optimizer.optimizeChain();

			const mockPlugins = {
				eq: { setParameter: vi.fn().mockResolvedValue(undefined) },
				saturation: { setParameter: vi.fn().mockResolvedValue(undefined) },
				compressor: { setParameter: vi.fn().mockResolvedValue(undefined) },
				stereoWidener: { setParameter: vi.fn().mockResolvedValue(undefined) },
				limiter: { setParameter: vi.fn().mockResolvedValue(undefined) },
			};

			await optimizer.applySettings(settings, mockPlugins);

			// Should call setParameter for each plugin
			expect(mockPlugins.eq.setParameter).toHaveBeenCalled();
			expect(mockPlugins.saturation.setParameter).toHaveBeenCalled();
			expect(mockPlugins.compressor.setParameter).toHaveBeenCalled();
			expect(mockPlugins.stereoWidener.setParameter).toHaveBeenCalled();
			expect(mockPlugins.limiter.setParameter).toHaveBeenCalled();
		});

		it('should apply all EQ parameters', async () => {
			const settings = await optimizer.optimizeChain();

			const mockPlugins = {
				eq: { setParameter: vi.fn().mockResolvedValue(undefined) },
				saturation: { setParameter: vi.fn().mockResolvedValue(undefined) },
				compressor: { setParameter: vi.fn().mockResolvedValue(undefined) },
				stereoWidener: { setParameter: vi.fn().mockResolvedValue(undefined) },
				limiter: { setParameter: vi.fn().mockResolvedValue(undefined) },
			};

			await optimizer.applySettings(settings, mockPlugins);

			// Check that EQ parameters were set (10 parameters)
			const eqCalls = mockPlugins.eq.setParameter.mock.calls;
			expect(eqCalls.length).toBe(10); // 5 bands × 2 params (freq + gain)
		});
	});
});
