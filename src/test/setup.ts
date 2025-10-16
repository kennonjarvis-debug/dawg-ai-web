/**
 * Test setup for Vitest
 * Provides mocks for Web Audio API and other browser APIs
 */

import { vi } from 'vitest';

// Mock AudioContext
class MockAudioContext {
	sampleRate = 48000;
	baseLatency = 0.005;
	outputLatency = 0.005;
	state = 'running';
	destination = {};

	async resume() {
		this.state = 'running';
		return Promise.resolve();
	}

	async close() {
		this.state = 'closed';
		return Promise.resolve();
	}

	createGain() {
		return {
			gain: { value: 1 },
			connect: vi.fn(),
			disconnect: vi.fn()
		};
	}

	createAnalyser() {
		return {
			fftSize: 2048,
			frequencyBinCount: 1024,
			getByteFrequencyData: vi.fn(),
			getByteTimeDomainData: vi.fn(),
			connect: vi.fn(),
			disconnect: vi.fn()
		};
	}

	decodeAudioData(arrayBuffer: ArrayBuffer) {
		return Promise.resolve({
			duration: 1.0,
			length: 48000,
			numberOfChannels: 2,
			sampleRate: 48000,
			getChannelData: () => new Float32Array(48000)
		} as AudioBuffer);
	}
}

// Mock AudioBuffer
class MockAudioBuffer {
	duration: number;
	length: number;
	numberOfChannels: number;
	sampleRate: number;

	constructor(options: AudioBufferOptions) {
		this.duration = options.length / options.sampleRate;
		this.length = options.length;
		this.numberOfChannels = options.numberOfChannels;
		this.sampleRate = options.sampleRate;
	}

	getChannelData(channel: number) {
		return new Float32Array(this.length);
	}

	copyFromChannel() {}
	copyToChannel() {}
}

// Set up global mocks
(global as any).AudioContext = MockAudioContext;
(global as any).AudioBuffer = MockAudioBuffer;
(global as any).window = global;
