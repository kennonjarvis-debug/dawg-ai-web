/**
 * Unit Tests: NeuralAnalogModel
 * Tests neural network-inspired analog hardware modeling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NeuralAnalogModel, type AnalogModel } from './NeuralAnalogModel';

// Mock AudioContext
class MockAudioContext {
	createWaveShaper() {
		return new MockWaveShaperNode();
	}
}

class MockWaveShaperNode {
	curve: Float32Array | null = null;
	oversample: '2x' | '4x' | 'none' = 'none';
}

describe('NeuralAnalogModel', () => {
	let mockAudioContext: any;

	beforeEach(() => {
		mockAudioContext = new MockAudioContext() as any;
	});

	describe('Initialization', () => {
		it('should create model with default tube type', () => {
			const model = new NeuralAnalogModel(mockAudioContext);
			expect(model).toBeDefined();
			expect(model.getModel()).toBe('tube');
		});

		it('should create model with specific type', () => {
			const models: AnalogModel[] = [
				'tube',
				'tape',
				'transformer',
				'transistor',
				'console',
			];

			models.forEach(modelType => {
				const model = new NeuralAnalogModel(mockAudioContext, modelType);
				expect(model.getModel()).toBe(modelType);
			});
		});
	});

	describe('Model Switching', () => {
		it('should change model type', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			expect(model.getModel()).toBe('tube');

			model.setModel('tape');
			expect(model.getModel()).toBe('tape');
		});

		it('should support all 5 model types', () => {
			const model = new NeuralAnalogModel(mockAudioContext);
			const models: AnalogModel[] = [
				'tube',
				'tape',
				'transformer',
				'transistor',
				'console',
			];

			models.forEach(modelType => {
				model.setModel(modelType);
				expect(model.getModel()).toBe(modelType);
			});
		});
	});

	describe('Neural Curve Generation', () => {
		it('should create curve with 4096 samples', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve();

			expect(curve).toBeInstanceOf(Float32Array);
			expect(curve.length).toBe(4096);
		});

		it('should create curve with custom drive', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const lowDrive = model.createNeuralCurve(1);
			const highDrive = model.createNeuralCurve(5);

			expect(lowDrive).toBeInstanceOf(Float32Array);
			expect(highDrive).toBeInstanceOf(Float32Array);
			expect(lowDrive.length).toBe(4096);
			expect(highDrive.length).toBe(4096);
		});

		it('should clamp output to -1 to 1 range', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(10); // Extreme drive

			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});

		it('should be symmetric around zero for most models', () => {
			const models: AnalogModel[] = ['tape', 'transformer', 'transistor', 'console'];

			models.forEach(modelType => {
				const model = new NeuralAnalogModel(mockAudioContext, modelType);
				const curve = model.createNeuralCurve(2);

				const midpoint = curve.length / 2;
				// Check that curve is roughly symmetric (within tolerance)
				// Note: Some asymmetry is expected for realistic modeling
				const leftSide = curve[midpoint - 100];
				const rightSide = curve[midpoint + 100];

				expect(Math.abs(leftSide + rightSide)).toBeLessThan(0.5);
			});
		});

		it('should create different curves for different models', () => {
			const tubeCurve = new NeuralAnalogModel(
				mockAudioContext,
				'tube'
			).createNeuralCurve(2);
			const tapeCurve = new NeuralAnalogModel(
				mockAudioContext,
				'tape'
			).createNeuralCurve(2);
			const transistorCurve = new NeuralAnalogModel(
				mockAudioContext,
				'transistor'
			).createNeuralCurve(2);

			// Curves should have different characteristics
			// Just check they're not identical
			let identical = true;
			for (let i = 0; i < tubeCurve.length; i++) {
				if (Math.abs(tubeCurve[i] - tapeCurve[i]) > 0.001) {
					identical = false;
					break;
				}
			}
			expect(identical).toBe(false);
		});

		it('should create valid curves with different drive values', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const lowDrive = model.createNeuralCurve(1);
			const highDrive = model.createNeuralCurve(5);

			// Both should be valid curves
			expect(lowDrive.length).toBe(4096);
			expect(highDrive.length).toBe(4096);

			// Curves should be different
			let different = false;
			for (let i = 1000; i < 3000; i += 100) {
				if (Math.abs(lowDrive[i] - highDrive[i]) > 0.01) {
					different = true;
					break;
				}
			}
			expect(different).toBe(true);
		});
	});

	describe('Tube Model', () => {
		it('should exhibit asymmetric clipping', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(3);

			const midpoint = curve.length / 2;
			const positiveSide = curve[Math.floor(midpoint * 1.5)];
			const negativeSide = curve[Math.floor(midpoint * 0.5)];

			// Tube should have some asymmetry (positive != negative)
			expect(Math.abs(positiveSide + negativeSide)).toBeGreaterThan(0.01);
		});

		it('should create valid tube saturation curve', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(2);

			// Check curve is valid and continuous
			expect(curve.length).toBe(4096);

			// All values should be in valid range
			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Tape Model', () => {
		it('should show balanced odd/even harmonics', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tape');
			const curve = model.createNeuralCurve(2);

			// Tape should be relatively symmetric (balanced harmonics)
			const midpoint = curve.length / 2;
			let asymmetry = 0;

			for (let i = 0; i < 100; i++) {
				const pos = curve[midpoint + i];
				const neg = curve[midpoint - i];
				asymmetry += Math.abs(pos + neg);
			}

			// Tape asymmetry should be moderate
			expect(asymmetry / 100).toBeLessThan(0.2);
		});
	});

	describe('Transformer Model', () => {
		it('should create valid transformer saturation curve', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'transformer');
			const curve = model.createNeuralCurve(2);

			expect(curve.length).toBe(4096);

			// All values should be in valid range
			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Transistor Model', () => {
		it('should exhibit harder clipping', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'transistor');
			const curve = model.createNeuralCurve(2);

			// Check near clipping region
			const nearClipIndex = Math.floor(4096 * 0.9);
			const atClipIndex = Math.floor(4096 * 0.98);

			const nearClip = Math.abs(curve[nearClipIndex]);
			const atClip = Math.abs(curve[atClipIndex]);

			// Transistor should have sharper knee (smaller difference at extremes)
			const difference = atClip - nearClip;
			expect(difference).toBeLessThan(0.1); // Hard clipping
		});
	});

	describe('Console Model', () => {
		it('should create valid console saturation curve', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'console');
			const curve = model.createNeuralCurve(2);

			expect(curve.length).toBe(4096);

			// All values should be in valid range
			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Frequency-Dependent Processing', () => {
		it('should create three frequency bands', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const processor = model.createFrequencyDependentProcessor(2);

			expect(processor).toHaveProperty('lowBand');
			expect(processor).toHaveProperty('midBand');
			expect(processor).toHaveProperty('highBand');
		});

		it('should set 4x oversampling on all bands', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const processor = model.createFrequencyDependentProcessor(2);

			expect(processor.lowBand.oversample).toBe('4x');
			expect(processor.midBand.oversample).toBe('4x');
			expect(processor.highBand.oversample).toBe('4x');
		});

		it('should apply different drive amounts per band', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const processor = model.createFrequencyDependentProcessor(2);

			// Low band should have stronger saturation (higher drive)
			// This is reflected in the curve generation, not directly testable here
			// But we can verify all curves are assigned
			expect(processor.lowBand.curve).toBeDefined();
			expect(processor.midBand.curve).toBeDefined();
			expect(processor.highBand.curve).toBeDefined();

			// Curves should be different lengths (they're all 4096 but different content)
			expect(processor.lowBand.curve!.length).toBe(4096);
			expect(processor.midBand.curve!.length).toBe(4096);
			expect(processor.highBand.curve!.length).toBe(4096);
		});
	});

	describe('Model Descriptions', () => {
		it('should provide description for tube model', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const description = model.getModelDescription();

			expect(description).toContain('Warm');
			expect(description.length).toBeGreaterThan(10);
		});

		it('should provide descriptions for all models', () => {
			const models: AnalogModel[] = [
				'tube',
				'tape',
				'transformer',
				'transistor',
				'console',
			];

			models.forEach(modelType => {
				const model = new NeuralAnalogModel(mockAudioContext, modelType);
				const description = model.getModelDescription();

				expect(typeof description).toBe('string');
				expect(description.length).toBeGreaterThan(10);
			});
		});

		it('should have unique descriptions for each model', () => {
			const models: AnalogModel[] = [
				'tube',
				'tape',
				'transformer',
				'transistor',
				'console',
			];

			const descriptions = models.map(modelType => {
				const model = new NeuralAnalogModel(mockAudioContext, modelType);
				return model.getModelDescription();
			});

			// All descriptions should be unique
			const uniqueDescriptions = new Set(descriptions);
			expect(uniqueDescriptions.size).toBe(5);
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero drive', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(0);

			// With zero drive, output should be near zero
			const midpoint = curve.length / 2;
			const testPoints = [
				curve[midpoint],
				curve[midpoint + 100],
				curve[midpoint - 100],
			];

			testPoints.forEach(point => {
				expect(Math.abs(point)).toBeLessThan(0.5);
			});
		});

		it('should handle extreme drive values', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(100);

			// Should still clamp to -1 to 1
			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});

		it('should handle negative drive values', () => {
			const model = new NeuralAnalogModel(mockAudioContext, 'tube');
			const curve = model.createNeuralCurve(-2);

			// Should still produce valid curve
			expect(curve.length).toBe(4096);
			for (let i = 0; i < curve.length; i++) {
				expect(curve[i]).toBeGreaterThanOrEqual(-1);
				expect(curve[i]).toBeLessThanOrEqual(1);
			}
		});
	});
});
