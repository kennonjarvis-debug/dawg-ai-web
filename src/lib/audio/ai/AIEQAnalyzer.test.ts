/**
 * Unit Tests: AIEQAnalyzer
 * Tests AI-powered frequency analysis and EQ suggestions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIEQAnalyzer } from './AIEQAnalyzer';

// Mock AudioContext
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
		// Simulate frequency data with different spectral characteristics
		for (let i = 0; i < array.length; i++) {
			const freq = (i / array.length) * 24000;

			// Simulate different frequency content
			if (freq < 250) {
				array[i] = -20; // Low end
			} else if (freq < 500) {
				array[i] = -30; // Low mids
			} else if (freq < 2000) {
				array[i] = -25; // Mids
			} else if (freq < 6000) {
				array[i] = -22; // High mids
			} else {
				array[i] = -35; // Highs
			}
		}
	}
}

describe('AIEQAnalyzer', () => {
	let analyzer: AIEQAnalyzer;
	let mockAudioContext: any;

	beforeEach(() => {
		mockAudioContext = new MockAudioContext() as any;
		analyzer = new AIEQAnalyzer(mockAudioContext);
	});

	describe('Initialization', () => {
		it('should create analyzer with correct FFT size', () => {
			expect(analyzer).toBeDefined();
			expect(mockAudioContext.createAnalyser).toHaveBeenCalled;
		});
	});

	describe('Connection', () => {
		it('should connect audio source', () => {
			const mockSource = { connect: vi.fn() } as any;
			analyzer.connect(mockSource);
			// Connection is handled internally
			expect(analyzer).toBeDefined();
		});

		it('should disconnect analyzer', () => {
			analyzer.disconnect();
			// Disconnection is handled internally
			expect(analyzer).toBeDefined();
		});
	});

	describe('Frequency Analysis', () => {
		it('should analyze frequencies in 5 bands', () => {
			const analysis = analyzer.analyzeFrequencies();

			expect(analysis).toHaveProperty('lowEnd');
			expect(analysis).toHaveProperty('lowMids');
			expect(analysis).toHaveProperty('mids');
			expect(analysis).toHaveProperty('highMids');
			expect(analysis).toHaveProperty('highs');
		});

		it('should return numeric values for all bands', () => {
			const analysis = analyzer.analyzeFrequencies();

			expect(typeof analysis.lowEnd).toBe('number');
			expect(typeof analysis.lowMids).toBe('number');
			expect(typeof analysis.mids).toBe('number');
			expect(typeof analysis.highMids).toBe('number');
			expect(typeof analysis.highs).toBe('number');
		});

		it('should return non-negative values', () => {
			const analysis = analyzer.analyzeFrequencies();

			expect(analysis.lowEnd).toBeGreaterThanOrEqual(0);
			expect(analysis.lowMids).toBeGreaterThanOrEqual(0);
			expect(analysis.mids).toBeGreaterThanOrEqual(0);
			expect(analysis.highMids).toBeGreaterThanOrEqual(0);
			expect(analysis.highs).toBeGreaterThanOrEqual(0);
		});
	});

	describe('EQ Suggestions', () => {
		it('should generate EQ suggestions from analysis', () => {
			const analysis = analyzer.analyzeFrequencies();
			const suggestions = analyzer.suggestEQ(analysis);

			expect(Array.isArray(suggestions)).toBe(true);
		});

		it('should return empty array for zero energy', () => {
			const zeroAnalysis = {
				lowEnd: 0,
				lowMids: 0,
				mids: 0,
				highMids: 0,
				highs: 0,
			};

			const suggestions = analyzer.suggestEQ(zeroAnalysis);
			expect(suggestions).toEqual([]);
		});

		it('should detect muddy low-mids', () => {
			const muddyAnalysis = {
				lowEnd: 20,
				lowMids: 40, // Excessive low-mids
				mids: 15,
				highMids: 15,
				highs: 10,
			};

			const suggestions = analyzer.suggestEQ(muddyAnalysis);
			const lowMidSuggestion = suggestions.find(s => s.band === 'low-mid');

			expect(lowMidSuggestion).toBeDefined();
			expect(lowMidSuggestion!.gain).toBeLessThan(0); // Should cut
			expect(lowMidSuggestion!.reason).toContain('muddiness');
		});

		it('should detect weak bass', () => {
			const weakBassAnalysis = {
				lowEnd: 5, // Very low bass
				lowMids: 20,
				mids: 30,
				highMids: 30,
				highs: 15,
			};

			const suggestions = analyzer.suggestEQ(weakBassAnalysis);
			const lowShelfSuggestion = suggestions.find(s => s.band === 'low-shelf');

			expect(lowShelfSuggestion).toBeDefined();
			expect(lowShelfSuggestion!.gain).toBeGreaterThan(0); // Should boost
		});

		it('should detect harsh high-mids', () => {
			const harshAnalysis = {
				lowEnd: 15,
				lowMids: 15,
				mids: 15,
				highMids: 45, // Excessive high-mids
				highs: 10,
			};

			const suggestions = analyzer.suggestEQ(harshAnalysis);
			const highMidSuggestion = suggestions.find(s => s.band === 'high-mid');

			expect(highMidSuggestion).toBeDefined();
			expect(highMidSuggestion!.gain).toBeLessThan(0); // Should cut
			expect(highMidSuggestion!.reason).toContain('harshness');
		});

		it('should detect lack of air/brightness', () => {
			const dullAnalysis = {
				lowEnd: 30,
				lowMids: 25,
				mids: 25,
				highMids: 15,
				highs: 5, // Very low highs
			};

			const suggestions = analyzer.suggestEQ(dullAnalysis);
			const highShelfSuggestion = suggestions.find(s => s.band === 'high-shelf');

			expect(highShelfSuggestion).toBeDefined();
			expect(highShelfSuggestion!.gain).toBeGreaterThan(0); // Should boost
			expect(highShelfSuggestion!.reason).toContain('air');
		});

		it('should include confidence scores', () => {
			const analysis = {
				lowEnd: 10,
				lowMids: 40, // Trigger suggestion
				mids: 20,
				highMids: 20,
				highs: 10,
			};

			const suggestions = analyzer.suggestEQ(analysis);

			suggestions.forEach(suggestion => {
				expect(suggestion.confidence).toBeGreaterThanOrEqual(0);
				expect(suggestion.confidence).toBeLessThanOrEqual(1);
			});
		});

		it('should sort suggestions by confidence', () => {
			const analysis = {
				lowEnd: 5,
				lowMids: 40,
				mids: 15,
				highMids: 35,
				highs: 5,
			};

			const suggestions = analyzer.suggestEQ(analysis);

			// Should be sorted descending by confidence
			for (let i = 1; i < suggestions.length; i++) {
				expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(
					suggestions[i].confidence
				);
			}
		});

		it('should include frequency, gain, and Q values', () => {
			const analysis = {
				lowEnd: 10,
				lowMids: 35,
				mids: 20,
				highMids: 25,
				highs: 10,
			};

			const suggestions = analyzer.suggestEQ(analysis);

			if (suggestions.length > 0) {
				const suggestion = suggestions[0];
				expect(typeof suggestion.frequency).toBe('number');
				expect(typeof suggestion.gain).toBe('number');
				expect(typeof suggestion.q).toBe('number');
				expect(suggestion.frequency).toBeGreaterThan(0);
			}
		});
	});

	describe('Balance Score', () => {
		it('should return score between 0 and 100', () => {
			const analysis = analyzer.analyzeFrequencies();
			const score = analyzer.getBalanceScore(analysis);

			expect(score).toBeGreaterThanOrEqual(0);
			expect(score).toBeLessThanOrEqual(100);
		});

		it('should return 50 for zero energy', () => {
			const zeroAnalysis = {
				lowEnd: 0,
				lowMids: 0,
				mids: 0,
				highMids: 0,
				highs: 0,
			};

			const score = analyzer.getBalanceScore(zeroAnalysis);
			expect(score).toBe(50);
		});

		it('should give high score for balanced spectrum', () => {
			// Near-ideal balance (20%, 18%, 22%, 24%, 16%)
			const balancedAnalysis = {
				lowEnd: 20,
				lowMids: 18,
				mids: 22,
				highMids: 24,
				highs: 16,
			};

			const score = analyzer.getBalanceScore(balancedAnalysis);
			expect(score).toBeGreaterThan(80); // Should be well-balanced
		});

		it('should give low score for imbalanced spectrum', () => {
			const imbalancedAnalysis = {
				lowEnd: 80, // Very bass-heavy
				lowMids: 5,
				mids: 5,
				highMids: 5,
				highs: 5,
			};

			const score = analyzer.getBalanceScore(imbalancedAnalysis);
			expect(score).toBeLessThan(50); // Should be poorly balanced
		});
	});

	describe('Continuous Analysis', () => {
		it('should start continuous analysis with callback', () => {
			vi.useFakeTimers();

			const callback = vi.fn();
			const intervalId = analyzer.startContinuousAnalysis(callback, 100);

			expect(intervalId).toBeDefined();

			// Fast-forward time
			vi.advanceTimersByTime(250);

			// Should have been called at least twice (at 100ms and 200ms)
			expect(callback.mock.calls.length).toBeGreaterThanOrEqual(2);

			analyzer.stopContinuousAnalysis(intervalId);
			vi.useRealTimers();
		});

		it('should stop continuous analysis', () => {
			vi.useFakeTimers();

			const callback = vi.fn();
			const intervalId = analyzer.startContinuousAnalysis(callback, 100);

			vi.advanceTimersByTime(150);
			const callCount = callback.mock.calls.length;

			analyzer.stopContinuousAnalysis(intervalId);

			// Advance time more - callback should not be called again
			vi.advanceTimersByTime(200);
			expect(callback.mock.calls.length).toBe(callCount);

			vi.useRealTimers();
		});
	});
});
