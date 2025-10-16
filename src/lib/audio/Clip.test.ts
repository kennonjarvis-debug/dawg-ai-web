/**
 * Clip Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Clip } from './Clip';

// Mock AudioBuffer
const createMockAudioBuffer = (duration: number = 1.0): AudioBuffer => {
	return {
		duration,
		length: 48000 * duration,
		numberOfChannels: 2,
		sampleRate: 48000,
		getChannelData: (channel: number) => new Float32Array(48000 * duration),
		copyFromChannel: () => {},
		copyToChannel: () => {}
	} as AudioBuffer;
};

describe('Clip', () => {
	let mockBuffer: AudioBuffer;

	beforeEach(() => {
		mockBuffer = createMockAudioBuffer(2.0);
	});

	describe('Construction', () => {
		it('should create a clip with required properties', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 0
			});

			expect(clip.trackId).toBe('track-1');
			expect(clip.buffer).toBe(mockBuffer);
			expect(clip.startTime).toBe(0);
			expect(clip.duration).toBe(2.0);
		});

		it('should use custom duration if provided', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 0,
				duration: 1.0
			});

			expect(clip.duration).toBe(1.0);
		});

		it('should set default values', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 0
			});

			expect(clip.offset).toBe(0);
			expect(clip.gain).toBe(1.0);
			expect(clip.fadeIn).toBe(0);
			expect(clip.fadeOut).toBe(0);
		});

		it('should throw error for negative start time', () => {
			expect(() => {
				new Clip({
					trackId: 'track-1',
					buffer: mockBuffer,
					startTime: -1
				});
			}).toThrow();
		});

		it('should throw error for invalid duration', () => {
			expect(() => {
				new Clip({
					trackId: 'track-1',
					buffer: mockBuffer,
					startTime: 0,
					duration: 5.0 // Exceeds buffer length
				});
			}).toThrow();
		});
	});

	describe('Properties', () => {
		it('should calculate end time correctly', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			expect(clip.endTime).toBe(3.0);
		});

		it('should get and set playback rate', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 0
			});

			clip.playbackRate = 2.0;
			expect(clip.playbackRate).toBe(2.0);
		});

		it('should throw error for invalid playback rate', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 0
			});

			expect(() => {
				clip.playbackRate = 0;
			}).toThrow();

			expect(() => {
				clip.playbackRate = -1;
			}).toThrow();
		});
	});

	describe('Clip Operations', () => {
		it('should check if time is contained in clip', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			expect(clip.contains(0.5)).toBe(false);
			expect(clip.contains(1.5)).toBe(true);
			expect(clip.contains(2.5)).toBe(true);
			expect(clip.contains(3.5)).toBe(false);
		});

		it('should detect overlaps', () => {
			const clip1 = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			const clip2 = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 2.0,
				duration: 2.0
			});

			const clip3 = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 4.0,
				duration: 1.0
			});

			expect(clip1.overlaps(clip2)).toBe(true);
			expect(clip1.overlaps(clip3)).toBe(false);
		});

		it('should move clip to new time', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0
			});

			clip.moveTo(5.0);
			expect(clip.startTime).toBe(5.0);
		});

		it('should throw error when moving to negative time', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0
			});

			expect(() => clip.moveTo(-1)).toThrow();
		});

		it('should trim from start', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			clip.trimStart(0.5);
			expect(clip.startTime).toBe(1.5);
			expect(clip.duration).toBe(1.5);
			expect(clip.offset).toBe(0.5);
		});

		it('should trim from end', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			clip.trimEnd(0.5);
			expect(clip.duration).toBe(1.5);
		});

		it('should split clip', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			const secondHalf = clip.split(2.0);

			expect(clip.duration).toBe(1.0);
			expect(secondHalf).toBeDefined();
			expect(secondHalf!.startTime).toBe(2.0);
			expect(secondHalf!.duration).toBe(1.0);
		});

		it('should return null when splitting outside bounds', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0
			});

			const result = clip.split(5.0);
			expect(result).toBeNull();
		});

		it('should clone clip', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0,
				gain: 0.8
			});

			const clone = clip.clone();

			expect(clone.id).not.toBe(clip.id);
			expect(clone.trackId).toBe(clip.trackId);
			expect(clone.startTime).toBe(clip.startTime);
			expect(clone.duration).toBe(clip.duration);
			expect(clone.gain).toBe(clip.gain);
		});
	});

	describe('Serialization', () => {
		it('should serialize to JSON', () => {
			const clip = new Clip({
				trackId: 'track-1',
				buffer: mockBuffer,
				startTime: 1.0,
				duration: 2.0,
				name: 'Test Clip'
			});

			const json = clip.toJSON();

			expect(json.id).toBe(clip.id);
			expect(json.trackId).toBe('track-1');
			expect(json.startTime).toBe(1.0);
			expect(json.duration).toBe(2.0);
			expect(json.name).toBe('Test Clip');
		});
	});
});
