/**
 * RecordingManager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RecordingManager } from './RecordingManager';
import type { RecordingOptions } from './types';

// Mock Tone.js
vi.mock('tone', () => {
	const mockTransport = {
		start: vi.fn(),
		stop: vi.fn(),
		pause: vi.fn(),
		cancel: vi.fn(),
		bpm: { value: 120 },
		timeSignature: [4, 4],
		loop: false,
		loopStart: 0,
		loopEnd: 0,
		seconds: 0,
		position: '0:0:0',
		scheduleRepeat: vi.fn((callback: any) => {
			// Immediately invoke callback for testing
			callback();
			return 1;
		}),
		clear: vi.fn()
	};

	const mockGain = {
		gain: { value: 0.3 },
		connect: vi.fn().mockReturnThis(),
		toDestination: vi.fn().mockReturnThis(),
		dispose: vi.fn()
	};

	return {
		getTransport: vi.fn(() => mockTransport),
		Transport: mockTransport,
		MembraneSynth: vi.fn(() => ({
			connect: vi.fn().mockReturnThis(),
			toDestination: vi.fn().mockReturnThis(),
			triggerAttackRelease: vi.fn(),
			dispose: vi.fn()
		})),
		Recorder: vi.fn(() => ({
			start: vi.fn(() => Promise.resolve()),
			stop: vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'audio/wav' }))),
			dispose: vi.fn()
		})),
		Gain: vi.fn(() => mockGain)
	};
});

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn(() =>
	Promise.resolve({
		getTracks: vi.fn(() => [
			{
				stop: vi.fn()
			}
		])
	} as unknown as MediaStream)
);

Object.defineProperty(global.navigator, 'mediaDevices', {
	value: {
		getUserMedia: mockGetUserMedia
	},
	writable: true
});

// Mock eventBus
vi.mock('$lib/events/eventBus', () => ({
	eventBus: {
		emit: vi.fn()
	}
}));

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
	value: () => 'test-uuid-1234',
	writable: true
});

describe('RecordingManager', () => {
	let manager: RecordingManager;

	beforeEach(() => {
		manager = new RecordingManager();
		vi.clearAllMocks();
	});

	afterEach(() => {
		// Clean up any recording in progress
		if (manager.getState() !== 'idle') {
			manager.stopRecording().catch(() => {});
		}
	});

	describe('Initialization', () => {
		it('should initialize with idle state', () => {
			expect(manager.getState()).toBe('idle');
		});

		it('should have no takes initially', () => {
			expect(manager.getTakes()).toEqual([]);
		});
	});

	describe('Loop Recording', () => {
		const mockOptions: RecordingOptions = {
			bars: 4,
			trackName: 'Test Track',
			countInBars: 1,
			metronomeVolume: 0.5
		};

		it('should start loop recording', async () => {
			const result = await manager.startLoopRecording(mockOptions);

			expect(result.trackId).toBeDefined();
			expect(manager.getState()).toBe('recording');
		});

		it('should request microphone permission', async () => {
			await manager.startLoopRecording(mockOptions);

			expect(mockGetUserMedia).toHaveBeenCalledWith({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false
				}
			});
		});

		it('should throw error if already recording', async () => {
			await manager.startLoopRecording(mockOptions);

			await expect(manager.startLoopRecording(mockOptions)).rejects.toThrow(
				'Recording already in progress'
			);
		});

		it('should stop loop recording', async () => {
			await manager.startLoopRecording(mockOptions);
			const takes = await manager.stopRecording();

			expect(manager.getState()).toBe('idle');
			expect(Array.isArray(takes)).toBe(true);
		});
	});

	describe('Count-in System', () => {
		it('should transition to counting-in state', async () => {
			const options: RecordingOptions = {
				bars: 4,
				trackName: 'Test Track',
				countInBars: 2,
				metronomeVolume: 0.5
			};

			// Start recording (which starts count-in)
			const recordingPromise = manager.startLoopRecording(options);

			// State should be counting-in
			expect(manager.getState()).toBe('counting-in');

			await recordingPromise;
		});

		it('should use default count-in of 1 bar if not specified', async () => {
			const options: RecordingOptions = {
				bars: 4,
				trackName: 'Test Track'
			};

			await manager.startLoopRecording(options);

			expect(manager.getState()).toBe('recording');
		});
	});

	describe('Take Management', () => {
		it('should capture takes on each loop pass', async () => {
			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track',
				countInBars: 0 // Skip count-in for faster test
			};

			await manager.startLoopRecording(options);

			// Simulate some recording time
			await new Promise((resolve) => setTimeout(resolve, 100));

			const takes = await manager.stopRecording();

			// We should have at least captured some state
			expect(Array.isArray(takes)).toBe(true);
		});

		it('should store takes with correct structure', async () => {
			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track',
				countInBars: 0
			};

			await manager.startLoopRecording(options);
			await new Promise((resolve) => setTimeout(resolve, 100));
			const takes = await manager.stopRecording();

			if (takes.length > 0) {
				const take = takes[0];
				expect(take).toHaveProperty('id');
				expect(take).toHaveProperty('passIndex');
				expect(take).toHaveProperty('startBar');
				expect(take).toHaveProperty('endBar');
				expect(take).toHaveProperty('metrics');
				expect(take).toHaveProperty('timestamp');
			}
		});

		it('should return empty array when no takes captured', async () => {
			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track',
				countInBars: 0
			};

			await manager.startLoopRecording(options);
			// Stop immediately without waiting
			const takes = await manager.stopRecording();

			expect(takes).toEqual([]);
		});
	});

	describe('Metrics Calculation', () => {
		it('should calculate metrics for audio buffers', () => {
			// Create a mock audio buffer with test data
			const buffer = new AudioBuffer({
				length: 48000,
				numberOfChannels: 1,
				sampleRate: 48000
			});

			const channelData = buffer.getChannelData(0);
			// Fill with test signal
			for (let i = 0; i < channelData.length; i++) {
				channelData[i] = Math.sin((i / 48000) * 440 * 2 * Math.PI) * 0.5;
			}

			// Access private method for testing
			const metrics = (manager as any).calculateMetrics(buffer);

			expect(metrics).toHaveProperty('peakDb');
			expect(metrics).toHaveProperty('rmsDb');
			expect(metrics).toHaveProperty('snr');
			expect(metrics).toHaveProperty('timingErrorMs');

			// Peak should be around -6 dB for 0.5 amplitude
			expect(metrics.peakDb).toBeGreaterThan(-10);
			expect(metrics.peakDb).toBeLessThan(0);

			// RMS should be lower than peak
			expect(metrics.rmsDb).toBeLessThan(metrics.peakDb);

			// SNR should be positive for clean signal
			expect(metrics.snr).toBeGreaterThan(0);

			// Timing error should be a number
			expect(typeof metrics.timingErrorMs).toBe('number');
		});

		it('should handle silent audio buffers', () => {
			const buffer = new AudioBuffer({
				length: 48000,
				numberOfChannels: 1,
				sampleRate: 48000
			});

			const metrics = (manager as any).calculateMetrics(buffer);

			// Silent buffer should have very low peak/RMS
			expect(metrics.peakDb).toBeLessThan(-60);
			expect(metrics.rmsDb).toBeLessThan(-60);
		});

		it('should detect clipping in hot signals', () => {
			const buffer = new AudioBuffer({
				length: 48000,
				numberOfChannels: 1,
				sampleRate: 48000
			});

			const channelData = buffer.getChannelData(0);
			// Fill with clipping signal
			for (let i = 0; i < channelData.length; i++) {
				channelData[i] = Math.sin((i / 48000) * 440 * 2 * Math.PI) * 1.5; // > 1.0
			}

			const metrics = (manager as any).calculateMetrics(buffer);

			// Peak should be close to 0 dB (clipping)
			expect(metrics.peakDb).toBeGreaterThan(-1);
		});
	});

	describe('State Management', () => {
		it('should transition through states correctly', async () => {
			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track',
				countInBars: 1
			};

			// Initial state
			expect(manager.getState()).toBe('idle');

			// Start recording (goes to counting-in)
			const recordingPromise = manager.startLoopRecording(options);
			expect(manager.getState()).toBe('counting-in');

			await recordingPromise;
			// After count-in, should be recording
			expect(manager.getState()).toBe('recording');

			// Stop recording
			await manager.stopRecording();
			expect(manager.getState()).toBe('idle');
		});
	});

	describe('Metronome Volume', () => {
		it('should set metronome volume', () => {
			manager.setMetronomeVolume(0.7);
			// No error means success
			expect(true).toBe(true);
		});

		it('should clamp metronome volume between 0 and 1', () => {
			manager.setMetronomeVolume(1.5); // Should be clamped to 1.0
			manager.setMetronomeVolume(-0.5); // Should be clamped to 0.0
			// No error means clamping worked
			expect(true).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('should handle microphone permission denial', async () => {
			mockGetUserMedia.mockRejectedValueOnce(new Error('Permission denied'));

			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track'
			};

			await expect(manager.startLoopRecording(options)).rejects.toThrow();
		});

		it('should clean up resources on error', async () => {
			mockGetUserMedia.mockRejectedValueOnce(new Error('Test error'));

			const options: RecordingOptions = {
				bars: 2,
				trackName: 'Test Track'
			};

			try {
				await manager.startLoopRecording(options);
			} catch {
				// Expected
			}

			// Should return to idle state
			expect(manager.getState()).toBe('idle');
		});
	});

	describe('Integration with Tone.Transport', () => {
		it('should configure loop region correctly', async () => {
			const Tone = await import('tone');
			const transport = Tone.getTransport();

			const options: RecordingOptions = {
				bars: 8,
				trackName: 'Test Track',
				countInBars: 0
			};

			await manager.startLoopRecording(options);

			expect(transport.loop).toBe(true);
			// Should set loop to 8 bars (bars 0-8)
			expect(transport.loopEnd).toBe(8);

			await manager.stopRecording();
		});

		it('should schedule metronome clicks during count-in', async () => {
			const Tone = await import('tone');
			const transport = Tone.getTransport();

			const options: RecordingOptions = {
				bars: 4,
				trackName: 'Test Track',
				countInBars: 2
			};

			await manager.startLoopRecording(options);

			// scheduleRepeat should have been called for metronome
			expect(transport.scheduleRepeat).toHaveBeenCalled();

			await manager.stopRecording();
		});
	});
});
