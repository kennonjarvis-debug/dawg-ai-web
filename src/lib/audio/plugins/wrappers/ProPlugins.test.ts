/**
 * Unit Tests: Professional Audio Plugins
 * Tests all 6 Web Audio-based professional plugins
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProEQPlugin } from './ProEQPlugin';
import { ProCompressorPlugin } from './ProCompressorPlugin';
import { ProReverbPlugin } from './ProReverbPlugin';
import { SaturationPlugin } from './SaturationPlugin';
import { LimiterPlugin } from './LimiterPlugin';
import { StereoWidenerPlugin } from './StereoWidenerPlugin';

// Mock AudioContext
class MockAudioContext {
	sampleRate = 48000;

	createGain() {
		return new MockGainNode();
	}

	createBiquadFilter() {
		return new MockBiquadFilterNode();
	}

	createConvolver() {
		return new MockConvolverNode();
	}

	createWaveShaper() {
		return new MockWaveShaperNode();
	}

	createDynamicsCompressor() {
		return new MockDynamicsCompressorNode();
	}

	createChannelSplitter(channels: number) {
		return new MockChannelSplitterNode();
	}

	createChannelMerger(channels: number) {
		return new MockChannelMergerNode();
	}

	createDelay() {
		return new MockDelayNode();
	}
}

class MockAudioParam {
	value: number = 0;
}

class MockGainNode {
	gain = new MockAudioParam();
	connect = () => {};
	disconnect = () => {};
}

class MockBiquadFilterNode {
	type: BiquadFilterType = 'peaking';
	frequency = new MockAudioParam();
	gain = new MockAudioParam();
	Q = new MockAudioParam();
	connect = () => {};
	disconnect = () => {};
}

class MockConvolverNode {
	buffer: AudioBuffer | null = null;
	normalize = true;
	connect = () => {};
	disconnect = () => {};
}

class MockWaveShaperNode {
	curve: Float32Array | null = null;
	oversample: OverSampleType = 'none';
	connect = () => {};
	disconnect = () => {};
}

class MockDynamicsCompressorNode {
	threshold = new MockAudioParam();
	knee = new MockAudioParam();
	ratio = new MockAudioParam();
	attack = new MockAudioParam();
	release = new MockAudioParam();
	reduction = 0;
	connect = () => {};
	disconnect = () => {};
}

class MockChannelSplitterNode {
	connect = () => {};
	disconnect = () => {};
}

class MockChannelMergerNode {
	connect = () => {};
	disconnect = () => {};
}

class MockDelayNode {
	delayTime = new MockAudioParam();
	connect = () => {};
	disconnect = () => {};
}

describe('Professional Audio Plugins', () => {
	let mockAudioContext: any;

	beforeEach(() => {
		mockAudioContext = new MockAudioContext() as any;
	});

	describe('ProEQPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = ProEQPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have 16 parameters (5 bands × 3 params + output)', () => {
			expect(ProEQPlugin.parameters.length).toBe(16);
		});

		it('should have all EQ band parameters', () => {
			const paramIds = ProEQPlugin.parameters.map(p => p.id);

			// Low shelf
			expect(paramIds).toContain('low-freq');
			expect(paramIds).toContain('low-gain');
			expect(paramIds).toContain('low-q');

			// Low-mid bell
			expect(paramIds).toContain('low-mid-freq');
			expect(paramIds).toContain('low-mid-gain');
			expect(paramIds).toContain('low-mid-q');

			// Mid bell
			expect(paramIds).toContain('mid-freq');
			expect(paramIds).toContain('mid-gain');
			expect(paramIds).toContain('mid-q');

			// High-mid bell
			expect(paramIds).toContain('high-mid-freq');
			expect(paramIds).toContain('high-mid-gain');
			expect(paramIds).toContain('high-mid-q');

			// High shelf
			expect(paramIds).toContain('high-freq');
			expect(paramIds).toContain('high-gain');
			expect(paramIds).toContain('high-q');

			// Output
			expect(paramIds).toContain('output-gain');
		});

		it('should have valid parameter ranges', () => {
			ProEQPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should create parameter nodes map', () => {
			const processor = ProEQPlugin.createProcessor(mockAudioContext);

			expect(processor.parameterNodes.size).toBeGreaterThan(0);
			expect(processor.parameterNodes.has('low-freq')).toBe(true);
			expect(processor.parameterNodes.has('mid-gain')).toBe(true);
			expect(processor.parameterNodes.has('high-freq')).toBe(true);
		});
	});

	describe('ProCompressorPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = ProCompressorPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have compression parameters', () => {
			const paramIds = ProCompressorPlugin.parameters.map(p => p.id);

			expect(paramIds).toContain('threshold');
			expect(paramIds).toContain('ratio');
			expect(paramIds).toContain('attack');
			expect(paramIds).toContain('release');
			expect(paramIds).toContain('makeup-gain');
		});

		it('should have valid parameter ranges', () => {
			ProCompressorPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should have reasonable default threshold', () => {
			const thresholdParam = ProCompressorPlugin.parameters.find(p => p.id === 'threshold');
			expect(thresholdParam).toBeDefined();
			expect(thresholdParam!.default).toBeLessThan(0); // Should be negative dB
		});
	});

	describe('ProReverbPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = ProReverbPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have reverb parameters', () => {
			const paramIds = ProReverbPlugin.parameters.map(p => p.id);

			expect(paramIds).toContain('room-size');
			expect(paramIds).toContain('decay');
			expect(paramIds).toContain('damping');
			expect(paramIds).toContain('pre-delay');
			expect(paramIds).toContain('wet');
			expect(paramIds).toContain('dry');
		});

		it('should have valid parameter ranges', () => {
			ProReverbPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should have wet/dry parameters between 0 and 1', () => {
			const wetParam = ProReverbPlugin.parameters.find(p => p.id === 'wet');
			const dryParam = ProReverbPlugin.parameters.find(p => p.id === 'dry');

			expect(wetParam).toBeDefined();
			expect(wetParam!.min).toBeGreaterThanOrEqual(0);
			expect(wetParam!.max).toBeLessThanOrEqual(1);

			expect(dryParam).toBeDefined();
			expect(dryParam!.min).toBeGreaterThanOrEqual(0);
			expect(dryParam!.max).toBeLessThanOrEqual(1);
		});
	});

	describe('SaturationPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = SaturationPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have saturation parameters', () => {
			const paramIds = SaturationPlugin.parameters.map(p => p.id);

			expect(paramIds).toContain('drive');
			expect(paramIds).toContain('mix');
			expect(paramIds).toContain('tone');
		});

		it('should have valid parameter ranges', () => {
			SaturationPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should have drive parameter greater than 1', () => {
			const driveParam = SaturationPlugin.parameters.find(p => p.id === 'drive');
			expect(driveParam).toBeDefined();
			expect(driveParam!.max).toBeGreaterThan(1); // Drive should be able to overdrive
		});
	});

	describe('LimiterPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = LimiterPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have limiter parameters', () => {
			const paramIds = LimiterPlugin.parameters.map(p => p.id);

			expect(paramIds).toContain('threshold');
			expect(paramIds).toContain('ceiling');
		});

		it('should have valid parameter ranges', () => {
			LimiterPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should have ceiling near 0dB', () => {
			const ceilingParam = LimiterPlugin.parameters.find(p => p.id === 'ceiling');
			expect(ceilingParam).toBeDefined();
			expect(ceilingParam!.default).toBeLessThanOrEqual(1); // Should be near or at 0dB
			expect(ceilingParam!.default).toBeGreaterThan(0.9); // But not silent
		});
	});

	describe('StereoWidenerPlugin', () => {
		it('should create processor with input/output nodes', () => {
			const processor = StereoWidenerPlugin.createProcessor(mockAudioContext);

			expect(processor.inputNode).toBeDefined();
			expect(processor.outputNode).toBeDefined();
			expect(processor.parameterNodes).toBeDefined();
		});

		it('should have width parameter', () => {
			const paramIds = StereoWidenerPlugin.parameters.map(p => p.id);

			expect(paramIds).toContain('width');
		});

		it('should have valid parameter ranges', () => {
			StereoWidenerPlugin.parameters.forEach(param => {
				expect(param.min).toBeDefined();
				expect(param.max).toBeDefined();
				expect(param.default).toBeDefined();
				expect(param.default).toBeGreaterThanOrEqual(param.min);
				expect(param.default).toBeLessThanOrEqual(param.max);
			});
		});

		it('should have width parameter with valid range', () => {
			const widthParam = StereoWidenerPlugin.parameters.find(p => p.id === 'width');
			expect(widthParam).toBeDefined();
			expect(widthParam!.min).toBeGreaterThanOrEqual(0);
			expect(widthParam!.max).toBeGreaterThanOrEqual(2);
			expect(widthParam!.default).toBeGreaterThan(0);
			expect(widthParam!.default).toBeLessThanOrEqual(widthParam!.max);
		});
	});

	describe('Plugin Names', () => {
		it('should have descriptive names', () => {
			expect(ProEQPlugin.name).toBeTruthy();
			expect(ProCompressorPlugin.name).toBeTruthy();
			expect(ProReverbPlugin.name).toBeTruthy();
			expect(SaturationPlugin.name).toBeTruthy();
			expect(LimiterPlugin.name).toBeTruthy();
			expect(StereoWidenerPlugin.name).toBeTruthy();

			expect(ProEQPlugin.name.length).toBeGreaterThan(3);
			expect(ProCompressorPlugin.name.length).toBeGreaterThan(3);
		});

		it('should have unique names', () => {
			const names = [
				ProEQPlugin.name,
				ProCompressorPlugin.name,
				ProReverbPlugin.name,
				SaturationPlugin.name,
				LimiterPlugin.name,
				StereoWidenerPlugin.name,
			];

			const uniqueNames = new Set(names);
			expect(uniqueNames.size).toBe(6);
		});
	});

	describe('Parameter Definitions', () => {
		const allPlugins = [
			{ name: 'ProEQ', config: ProEQPlugin },
			{ name: 'ProCompressor', config: ProCompressorPlugin },
			{ name: 'ProReverb', config: ProReverbPlugin },
			{ name: 'Saturation', config: SaturationPlugin },
			{ name: 'Limiter', config: LimiterPlugin },
			{ name: 'StereoWidener', config: StereoWidenerPlugin },
		];

		allPlugins.forEach(({ name, config }) => {
			it(`${name}: all parameters should have required fields`, () => {
				config.parameters.forEach(param => {
					expect(param.id).toBeTruthy();
					expect(param.name).toBeTruthy();
					expect(typeof param.min).toBe('number');
					expect(typeof param.max).toBe('number');
					expect(typeof param.default).toBe('number');
				});
			});

			it(`${name}: all parameter IDs should be unique`, () => {
				const ids = config.parameters.map(p => p.id);
				const uniqueIds = new Set(ids);
				expect(uniqueIds.size).toBe(ids.length);
			});

			it(`${name}: all parameter names should be descriptive`, () => {
				config.parameters.forEach(param => {
					expect(param.name.length).toBeGreaterThan(2);
				});
			});
		});
	});

	describe('Audio Graph Creation', () => {
		const allPlugins = [
			{ name: 'ProEQ', config: ProEQPlugin },
			{ name: 'ProCompressor', config: ProCompressorPlugin },
			{ name: 'ProReverb', config: ProReverbPlugin },
			{ name: 'Saturation', config: SaturationPlugin },
			{ name: 'Limiter', config: LimiterPlugin },
			{ name: 'StereoWidener', config: StereoWidenerPlugin },
		];

		allPlugins.forEach(({ name, config }) => {
			it(`${name}: should create complete audio graph`, () => {
				const processor = config.createProcessor(mockAudioContext);

				expect(processor).toBeDefined();
				expect(processor.inputNode).toBeDefined();
				expect(processor.outputNode).toBeDefined();
				expect(processor.parameterNodes).toBeInstanceOf(Map);
			});

			it(`${name}: should create parameter nodes map`, () => {
				const processor = config.createProcessor(mockAudioContext);

				// Should have at least some parameter nodes
				expect(processor.parameterNodes.size).toBeGreaterThan(0);

				// All registered parameters should be valid
				processor.parameterNodes.forEach((node, id) => {
					expect(id).toBeTruthy();
					expect(node).toBeDefined();
				});
			});
		});
	});
});
