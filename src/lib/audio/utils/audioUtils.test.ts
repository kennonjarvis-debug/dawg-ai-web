/**
 * Audio Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
	gainToDb,
	dbToGain,
	midiToFrequency,
	frequencyToMidi,
	frequencyToNoteName,
	secondsToSamples,
	samplesToSeconds,
	noteDurationToSeconds,
	formatTime,
	isWebAudioSupported
} from './audioUtils';

describe('audioUtils', () => {
	describe('Gain/dB Conversion', () => {
		it('should convert gain to dB', () => {
			expect(gainToDb(1.0)).toBeCloseTo(0, 1);
			expect(gainToDb(0.5)).toBeCloseTo(-6.02, 1);
			expect(gainToDb(0.1)).toBeCloseTo(-20, 1);
			expect(gainToDb(0)).toBe(-Infinity);
		});

		it('should convert dB to gain', () => {
			expect(dbToGain(0)).toBeCloseTo(1.0, 2);
			expect(dbToGain(-6)).toBeCloseTo(0.5, 2);
			expect(dbToGain(-20)).toBeCloseTo(0.1, 2);
			expect(dbToGain(-Infinity)).toBe(0);
		});

		it('should be reversible', () => {
			const gain = 0.75;
			const db = gainToDb(gain);
			const backToGain = dbToGain(db);
			expect(backToGain).toBeCloseTo(gain, 5);
		});
	});

	describe('MIDI/Frequency Conversion', () => {
		it('should convert MIDI to frequency', () => {
			expect(midiToFrequency(69)).toBeCloseTo(440, 1); // A4
			expect(midiToFrequency(60)).toBeCloseTo(261.63, 1); // C4
			expect(midiToFrequency(81)).toBeCloseTo(880, 1); // A5
		});

		it('should convert frequency to MIDI', () => {
			expect(frequencyToMidi(440)).toBeCloseTo(69, 1); // A4
			expect(frequencyToMidi(261.63)).toBeCloseTo(60, 1); // C4
			expect(frequencyToMidi(880)).toBeCloseTo(81, 1); // A5
		});

		it('should be reversible', () => {
			const midi = 72; // C5
			const freq = midiToFrequency(midi);
			const backToMidi = frequencyToMidi(freq);
			expect(backToMidi).toBeCloseTo(midi, 5);
		});

		it('should convert frequency to note name', () => {
			expect(frequencyToNoteName(440)).toBe('A4');
			expect(frequencyToNoteName(261.63)).toBe('C4');
			expect(frequencyToNoteName(523.25)).toBe('C5');
		});
	});

	describe('Time Conversion', () => {
		it('should convert seconds to samples', () => {
			expect(secondsToSamples(1, 48000)).toBe(48000);
			expect(secondsToSamples(0.5, 48000)).toBe(24000);
			expect(secondsToSamples(2, 44100)).toBe(88200);
		});

		it('should convert samples to seconds', () => {
			expect(samplesToSeconds(48000, 48000)).toBe(1);
			expect(samplesToSeconds(24000, 48000)).toBe(0.5);
			expect(samplesToSeconds(88200, 44100)).toBe(2);
		});

		it('should be reversible', () => {
			const seconds = 1.5;
			const samples = secondsToSamples(seconds, 48000);
			const backToSeconds = samplesToSeconds(samples, 48000);
			expect(backToSeconds).toBeCloseTo(seconds, 5);
		});

		it('should calculate note duration from BPM', () => {
			// At 120 BPM, quarter note = 0.5 seconds
			expect(noteDurationToSeconds(120, 4)).toBeCloseTo(0.5, 2);

			// At 120 BPM, eighth note = 0.25 seconds
			expect(noteDurationToSeconds(120, 8)).toBeCloseTo(0.25, 2);

			// At 60 BPM, quarter note = 1.0 seconds
			expect(noteDurationToSeconds(60, 4)).toBeCloseTo(1.0, 2);
		});
	});

	describe('Time Formatting', () => {
		it('should format time correctly', () => {
			expect(formatTime(0)).toBe('00:00.000');
			expect(formatTime(1.5)).toBe('00:01.500');
			expect(formatTime(65.123)).toBe('01:05.123');
			expect(formatTime(125.456)).toBe('02:05.456');
		});
	});

	describe('Browser Support', () => {
		it('should check for Web Audio API support', () => {
			const supported = isWebAudioSupported();
			expect(typeof supported).toBe('boolean');
		});
	});
});
