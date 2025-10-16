/**
 * AudioEngine Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioEngine } from './AudioEngine';

// Mock Tone.js
vi.mock('tone', () => {
	const mockContext = {
		sampleRate: 48000,
		baseLatency: 0.005,
		outputLatency: 0.005,
		state: 'running',
		resume: vi.fn(() => Promise.resolve()),
		close: vi.fn(() => Promise.resolve())
	};

	return {
		getContext: vi.fn(() => mockContext),
		setContext: vi.fn(),
		getTransport: vi.fn(() => ({
			start: vi.fn(),
			stop: vi.fn(),
			pause: vi.fn(),
			bpm: { value: 120 },
			timeSignature: [4, 4],
			loop: false,
			loopStart: 0,
			loopEnd: 0,
			seconds: 0,
			lookAhead: 0.1,
			schedule: vi.fn()
		})),
		getDestination: vi.fn(() => ({})),
		start: vi.fn(() => Promise.resolve()),
		Transport: {
			start: vi.fn(),
			stop: vi.fn(),
			pause: vi.fn(),
			bpm: { value: 120 },
			timeSignature: [4, 4],
			loop: false,
			loopStart: 0,
			loopEnd: 0,
			seconds: 0,
			lookAhead: 0.1
		},
		Channel: vi.fn(() => ({
			volume: { value: 0, rampTo: vi.fn() },
			pan: { value: 0 },
			mute: false,
			solo: false,
			connect: vi.fn(),
			disconnect: vi.fn(),
			dispose: vi.fn()
		})),
		Limiter: vi.fn(() => ({
			connect: vi.fn(),
			disconnect: vi.fn(),
			dispose: vi.fn()
		})),
		Meter: vi.fn(() => ({
			getValue: vi.fn(() => [-20, -20]),
			connect: vi.fn(),
			disconnect: vi.fn(),
			dispose: vi.fn()
		})),
		Analyser: vi.fn(() => ({
			getValue: vi.fn(() => new Float32Array(1024)),
			type: 'fft',
			connect: vi.fn(),
			disconnect: vi.fn(),
			dispose: vi.fn()
		})),
		Gain: vi.fn(() => ({
			connect: vi.fn(),
			disconnect: vi.fn(),
			dispose: vi.fn()
		})),
		Recorder: vi.fn(() => ({
			start: vi.fn(),
			stop: vi.fn(() => Promise.resolve(new Blob())),
			connect: vi.fn(),
			dispose: vi.fn()
		}))
	}
}));

describe('AudioEngine', () => {
	let engine: AudioEngine;

	beforeEach(async () => {
		// Reset singleton
		(AudioEngine as any).instance = null;

		// Create new instance
		engine = AudioEngine.getInstance({
			sampleRate: 48000,
			latencyHint: 'interactive'
		});

		await engine.initialize();
	});

	afterEach(() => {
		if (engine) {
			engine.dispose();
		}
	});

	describe('Singleton Pattern', () => {
		it('should return the same instance', () => {
			const instance1 = AudioEngine.getInstance();
			const instance2 = AudioEngine.getInstance();

			expect(instance1).toBe(instance2);
		});

		it('should use config only on first instantiation', () => {
			const instance = AudioEngine.getInstance({ sampleRate: 96000 });
			expect(instance).toBeDefined();
		});
	});

	describe('Initialization', () => {
		it('should initialize successfully', () => {
			expect(engine.initialized).toBe(true);
		});

		it('should not reinitialize if already initialized', async () => {
			await engine.initialize();
			expect(engine.initialized).toBe(true);
		});

		it('should have correct sample rate', () => {
			expect(engine.context.sampleRate).toBe(48000);
		});
	});

	describe('Track Management', () => {
		it('should add a track', () => {
			const track = engine.addTrack({
				name: 'Test Track',
				type: 'audio'
			});

			expect(track).toBeDefined();
			expect(track.name).toBe('Test Track');
			expect(engine.trackCount).toBe(1);
		});

		it('should remove a track', () => {
			const track = engine.addTrack({
				name: 'Test Track',
				type: 'audio'
			});

			engine.removeTrack(track.id);
			expect(engine.trackCount).toBe(0);
		});

		it('should get a track by id', () => {
			const track = engine.addTrack({
				name: 'Test Track',
				type: 'audio'
			});

			const retrieved = engine.getTrack(track.id);
			expect(retrieved).toBe(track);
		});

		it('should get all tracks', () => {
			engine.addTrack({ name: 'Track 1', type: 'audio' });
			engine.addTrack({ name: 'Track 2', type: 'audio' });

			const tracks = engine.getAllTracks();
			expect(tracks.length).toBe(2);
		});

		it('should throw error when removing non-existent track', () => {
			expect(() => {
				engine.removeTrack('non-existent');
			}).toThrow();
		});
	});

	describe('Transport Control', () => {
		it('should start playback', () => {
			engine.play();
			expect(engine.isPlaying).toBe(true);
		});

		it('should stop playback', () => {
			engine.play();
			engine.stop();
			expect(engine.isPlaying).toBe(false);
		});

		it('should pause playback', () => {
			engine.play();
			engine.pause();
			expect(engine.isPlaying).toBe(false);
		});
	});

	describe('Tempo and Timing', () => {
		it('should set tempo', () => {
			engine.setTempo(140);
			expect(engine.getTempo()).toBe(140);
		});

		it('should throw error for invalid tempo', () => {
			expect(() => engine.setTempo(10)).toThrow();
			expect(() => engine.setTempo(1000)).toThrow();
		});

		it('should set time signature', () => {
			engine.setTimeSignature(3, 4);
			const sig = engine.getTimeSignature();
			expect(sig).toEqual([3, 4]);
		});

		it('should set loop points', () => {
			engine.setLoop(0, 10, true);
			expect(engine.transport.loop).toBe(true);
		});
	});

	describe('Metrics', () => {
		it('should get latency', () => {
			const latency = engine.getLatency();
			expect(latency).toBeGreaterThanOrEqual(0);
		});

		it('should get CPU load', () => {
			const load = engine.getCPULoad();
			expect(load).toBeGreaterThanOrEqual(0);
			expect(load).toBeLessThanOrEqual(1);
		});
	});

	describe('Error Handling', () => {
		it('should throw error when not initialized', () => {
			const uninitializedEngine = AudioEngine.getInstance();
			(uninitializedEngine as any).isInitialized = false;

			expect(() => uninitializedEngine.play()).toThrow();
		});
	});
});
