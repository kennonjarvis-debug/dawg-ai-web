/**
 * Audio Utilities - DAWG AI Audio Engine
 * Helper functions for audio processing and conversion
 * @module audio/utils/audioUtils
 */

import * as Tone from 'tone';
import type { Decibels, TimeInSeconds } from '../../types/core';

/**
 * Convert linear gain (0-1) to decibels
 * @param gain - Linear gain value
 * @returns Decibels
 */
export function gainToDb(gain: number): Decibels {
	if (gain <= 0) return -Infinity;
	return 20 * Math.log10(gain);
}

/**
 * Convert decibels to linear gain
 * @param db - Decibels
 * @returns Linear gain (0-1)
 */
export function dbToGain(db: Decibels): number {
	if (db === -Infinity) return 0;
	return Math.pow(10, db / 20);
}

/**
 * Convert MIDI note number to frequency (Hz)
 * @param midiNote - MIDI note number (0-127)
 * @returns Frequency in Hz
 */
export function midiToFrequency(midiNote: number): number {
	return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Convert frequency to MIDI note number
 * @param frequency - Frequency in Hz
 * @returns MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
	return 69 + 12 * Math.log2(frequency / 440);
}

/**
 * Convert frequency to note name
 * @param frequency - Frequency in Hz
 * @returns Note name (e.g., "A4", "C#5")
 */
export function frequencyToNoteName(frequency: number): string {
	const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	const midiNote = Math.round(frequencyToMidi(frequency));
	const octave = Math.floor(midiNote / 12) - 1;
	const noteIndex = midiNote % 12;
	return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Convert seconds to samples
 * @param seconds - Time in seconds
 * @param sampleRate - Sample rate (default: current context)
 * @returns Number of samples
 */
export function secondsToSamples(seconds: TimeInSeconds, sampleRate?: number): number {
	const rate = sampleRate ?? Tone.getContext().sampleRate;
	return Math.floor(seconds * rate);
}

/**
 * Convert samples to seconds
 * @param samples - Number of samples
 * @param sampleRate - Sample rate (default: current context)
 * @returns Time in seconds
 */
export function samplesToSeconds(samples: number, sampleRate?: number): TimeInSeconds {
	const rate = sampleRate ?? Tone.getContext().sampleRate;
	return samples / rate;
}

/**
 * Convert BPM and note division to seconds
 * @param bpm - Beats per minute
 * @param division - Note division (e.g., 4 for quarter note, 8 for eighth)
 * @returns Duration in seconds
 */
export function noteDurationToSeconds(bpm: number, division: number): TimeInSeconds {
	return (60 / bpm) * (4 / division);
}

/**
 * Normalize audio buffer to peak level
 * @param buffer - Audio buffer to normalize
 * @param targetPeak - Target peak level (0-1)
 * @returns Normalized buffer
 */
export function normalizeBuffer(buffer: AudioBuffer, targetPeak: number = 1.0): AudioBuffer {
	// Find peak
	let peak = 0;
	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		const data = buffer.getChannelData(channel);
		for (let i = 0; i < data.length; i++) {
			const abs = Math.abs(data[i]);
			if (abs > peak) peak = abs;
		}
	}

	// Calculate gain
	const gain = peak > 0 ? targetPeak / peak : 1;

	// Apply gain
	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		const data = buffer.getChannelData(channel);
		for (let i = 0; i < data.length; i++) {
			data[i] *= gain;
		}
	}

	return buffer;
}

/**
 * Calculate RMS level of audio buffer
 * @param buffer - Audio buffer
 * @param channel - Channel index (default: 0)
 * @returns RMS level
 */
export function calculateRMS(buffer: AudioBuffer, channel: number = 0): number {
	const data = buffer.getChannelData(channel);
	let sum = 0;

	for (let i = 0; i < data.length; i++) {
		sum += data[i] * data[i];
	}

	return Math.sqrt(sum / data.length);
}

/**
 * Calculate peak level of audio buffer
 * @param buffer - Audio buffer
 * @param channel - Channel index (default: 0)
 * @returns Peak level
 */
export function calculatePeak(buffer: AudioBuffer, channel: number = 0): number {
	const data = buffer.getChannelData(channel);
	let peak = 0;

	for (let i = 0; i < data.length; i++) {
		const abs = Math.abs(data[i]);
		if (abs > peak) peak = abs;
	}

	return peak;
}

/**
 * Apply fade in to audio buffer
 * @param buffer - Audio buffer
 * @param duration - Fade duration in seconds
 * @returns Buffer with fade applied
 */
export function applyFadeIn(buffer: AudioBuffer, duration: TimeInSeconds): AudioBuffer {
	const fadeSamples = secondsToSamples(duration, buffer.sampleRate);

	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		const data = buffer.getChannelData(channel);

		for (let i = 0; i < Math.min(fadeSamples, data.length); i++) {
			const gain = i / fadeSamples;
			data[i] *= gain;
		}
	}

	return buffer;
}

/**
 * Apply fade out to audio buffer
 * @param buffer - Audio buffer
 * @param duration - Fade duration in seconds
 * @returns Buffer with fade applied
 */
export function applyFadeOut(buffer: AudioBuffer, duration: TimeInSeconds): AudioBuffer {
	const fadeSamples = secondsToSamples(duration, buffer.sampleRate);
	const startSample = buffer.length - fadeSamples;

	for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
		const data = buffer.getChannelData(channel);

		for (let i = Math.max(0, startSample); i < data.length; i++) {
			const gain = 1 - (i - startSample) / fadeSamples;
			data[i] *= gain;
		}
	}

	return buffer;
}

/**
 * Mix two audio buffers
 * @param buffer1 - First buffer
 * @param buffer2 - Second buffer
 * @param gain1 - Gain for first buffer (0-1)
 * @param gain2 - Gain for second buffer (0-1)
 * @returns Mixed buffer
 */
export function mixBuffers(
	buffer1: AudioBuffer,
	buffer2: AudioBuffer,
	gain1: number = 0.5,
	gain2: number = 0.5
): AudioBuffer {
	const channels = Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels);
	const length = Math.max(buffer1.length, buffer2.length);
	const sampleRate = buffer1.sampleRate;

	const mixed = new AudioBuffer({
		numberOfChannels: channels,
		length,
		sampleRate
	});

	for (let channel = 0; channel < channels; channel++) {
		const output = mixed.getChannelData(channel);
		const data1 = channel < buffer1.numberOfChannels ? buffer1.getChannelData(channel) : null;
		const data2 = channel < buffer2.numberOfChannels ? buffer2.getChannelData(channel) : null;

		for (let i = 0; i < length; i++) {
			let sample = 0;
			if (data1 && i < data1.length) sample += data1[i] * gain1;
			if (data2 && i < data2.length) sample += data2[i] * gain2;
			output[i] = sample;
		}
	}

	return mixed;
}

/**
 * Format time in seconds to MM:SS.mmm
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: TimeInSeconds): string {
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	const ms = Math.floor((seconds % 1) * 1000);

	return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Check if browser supports Web Audio API
 * @returns True if supported
 */
export function isWebAudioSupported(): boolean {
	return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
}

/**
 * Get optimal buffer size for low latency
 * @returns Recommended buffer size
 */
export function getOptimalBufferSize(): number {
	// Prefer smaller buffer sizes for lower latency
	// Common sizes: 128, 256, 512, 1024, 2048
	const context = Tone.getContext();

	if (context.baseLatency < 0.01) {
		return 128;
	} else if (context.baseLatency < 0.02) {
		return 256;
	} else {
		return 512;
	}
}
