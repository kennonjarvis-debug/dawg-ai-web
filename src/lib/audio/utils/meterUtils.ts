/**
 * Meter Utilities - DAWG AI Audio Engine
 * Utilities for audio metering and level visualization
 * @module audio/utils/meterUtils
 */

import type { Decibels } from '../../types/core';
import { gainToDb } from './audioUtils';

/**
 * Meter ballistics configuration
 */
export interface MeterBallistics {
	attackTime: number; // Attack time in ms
	releaseTime: number; // Release time in ms
	peakHoldTime: number; // Peak hold time in ms
}

/**
 * Standard meter ballistics presets
 */
export const METER_BALLISTICS = {
	// Fast response for monitoring
	FAST: {
		attackTime: 5,
		releaseTime: 100,
		peakHoldTime: 1000
	} as MeterBallistics,

	// Medium response for mixing
	MEDIUM: {
		attackTime: 10,
		releaseTime: 300,
		peakHoldTime: 1500
	} as MeterBallistics,

	// Slow response for mastering
	SLOW: {
		attackTime: 20,
		releaseTime: 600,
		peakHoldTime: 2000
	} as MeterBallistics,

	// VU meter emulation
	VU: {
		attackTime: 300,
		releaseTime: 300,
		peakHoldTime: 0
	} as MeterBallistics
};

/**
 * Meter scale types
 */
export type MeterScale = 'linear' | 'logarithmic' | 'db';

/**
 * Convert linear meter value to dB scale
 * @param value - Linear value (0-1)
 * @param minDb - Minimum dB value (e.g., -60)
 * @param maxDb - Maximum dB value (e.g., 0)
 * @returns dB value
 */
export function linearToDb(value: number, minDb: Decibels = -60, maxDb: Decibels = 0): Decibels {
	if (value <= 0) return minDb;
	if (value >= 1) return maxDb;

	const db = gainToDb(value);
	return Math.max(minDb, Math.min(maxDb, db));
}

/**
 * Convert dB value to linear meter scale (0-1)
 * @param db - Decibels
 * @param minDb - Minimum dB value
 * @param maxDb - Maximum dB value
 * @returns Linear value (0-1)
 */
export function dbToLinear(db: Decibels, minDb: Decibels = -60, maxDb: Decibels = 0): number {
	if (db <= minDb) return 0;
	if (db >= maxDb) return 1;

	return (db - minDb) / (maxDb - minDb);
}

/**
 * Apply meter ballistics to smooth level changes
 */
export class MeterSmoother {
	private currentLevel: number = 0;
	private peakLevel: number = 0;
	private lastPeakTime: number = 0;
	private ballistics: MeterBallistics;
	private lastUpdateTime: number = Date.now();

	constructor(ballistics: MeterBallistics = METER_BALLISTICS.MEDIUM) {
		this.ballistics = ballistics;
	}

	/**
	 * Update with new level
	 * @param level - New level (linear, 0-1)
	 * @returns Smoothed level
	 */
	update(level: number): number {
		const now = Date.now();
		const dt = now - this.lastUpdateTime;
		this.lastUpdateTime = now;

		// Attack/release smoothing
		if (level > this.currentLevel) {
			// Attack
			const attackCoef = 1 - Math.exp(-dt / this.ballistics.attackTime);
			this.currentLevel += (level - this.currentLevel) * attackCoef;
		} else {
			// Release
			const releaseCoef = 1 - Math.exp(-dt / this.ballistics.releaseTime);
			this.currentLevel += (level - this.currentLevel) * releaseCoef;
		}

		// Peak hold
		if (level > this.peakLevel) {
			this.peakLevel = level;
			this.lastPeakTime = now;
		} else if (now - this.lastPeakTime > this.ballistics.peakHoldTime) {
			// Decay peak
			this.peakLevel *= 0.95;
		}

		return this.currentLevel;
	}

	/**
	 * Get current smoothed level
	 */
	getLevel(): number {
		return this.currentLevel;
	}

	/**
	 * Get peak level
	 */
	getPeak(): number {
		return this.peakLevel;
	}

	/**
	 * Reset meter
	 */
	reset(): void {
		this.currentLevel = 0;
		this.peakLevel = 0;
		this.lastPeakTime = Date.now();
		this.lastUpdateTime = Date.now();
	}
}

/**
 * Get meter color based on level
 * @param db - Level in dB
 * @returns CSS color string
 */
export function getMeterColor(db: Decibels): string {
	if (db > -3) return '#ff0000'; // Red - clipping danger
	if (db > -6) return '#ff6600'; // Orange - hot
	if (db > -12) return '#ffff00'; // Yellow - loud
	if (db > -24) return '#00ff00'; // Green - good
	return '#00ff00'; // Green - low
}

/**
 * Get meter segment colors (for segmented meters)
 * @param segments - Number of segments
 * @returns Array of color strings
 */
export function getMeterSegmentColors(segments: number = 20): string[] {
	const colors: string[] = [];

	for (let i = 0; i < segments; i++) {
		const ratio = i / segments;

		if (ratio > 0.95) {
			colors.push('#ff0000'); // Red
		} else if (ratio > 0.85) {
			colors.push('#ff6600'); // Orange
		} else if (ratio > 0.75) {
			colors.push('#ffff00'); // Yellow
		} else {
			colors.push('#00ff00'); // Green
		}
	}

	return colors;
}

/**
 * Check if level is clipping
 * @param db - Level in dB
 * @param threshold - Clipping threshold (default: -0.1 dB)
 * @returns True if clipping
 */
export function isClipping(db: Decibels, threshold: Decibels = -0.1): boolean {
	return db > threshold;
}

/**
 * Calculate LUFS (Loudness Units Full Scale)
 * Simplified implementation - full EBU R128 would be more complex
 * @param samples - Audio samples
 * @param sampleRate - Sample rate
 * @returns Approximate LUFS value
 */
export function calculateLUFS(samples: Float32Array, sampleRate: number): Decibels {
	// K-weighting filter (simplified)
	// Real implementation would use proper filtering

	let sum = 0;
	for (let i = 0; i < samples.length; i++) {
		sum += samples[i] * samples[i];
	}

	const rms = Math.sqrt(sum / samples.length);
	const db = gainToDb(rms);

	// Approximate LUFS offset
	return db - 0.691; // Simplified offset
}

/**
 * Calculate true peak (inter-sample peaks)
 * Simplified - true peak requires oversampling
 * @param samples - Audio samples
 * @returns True peak in dBTP
 */
export function calculateTruePeak(samples: Float32Array): Decibels {
	let peak = 0;

	for (let i = 0; i < samples.length - 1; i++) {
		// Check actual sample
		const abs1 = Math.abs(samples[i]);
		if (abs1 > peak) peak = abs1;

		// Check interpolated value between samples (simplified)
		const interpolated = (samples[i] + samples[i + 1]) / 2;
		const abs2 = Math.abs(interpolated);
		if (abs2 > peak) peak = abs2;
	}

	return gainToDb(peak);
}

/**
 * Format dB value for display
 * @param db - Decibels
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatDb(db: Decibels, decimals: number = 1): string {
	if (db === -Infinity) return '-∞';
	return `${db.toFixed(decimals)} dB`;
}

/**
 * Create meter gradient for canvas/CSS
 * @param orientation - 'vertical' or 'horizontal'
 * @returns Gradient color stops
 */
export function createMeterGradient(orientation: 'vertical' | 'horizontal' = 'vertical'): string[] {
	if (orientation === 'vertical') {
		return [
			'#ff0000 0%', // Top (clipping)
			'#ff6600 5%',
			'#ffff00 15%',
			'#00ff00 25%',
			'#00ff00 100%' // Bottom
		];
	} else {
		return [
			'#00ff00 0%', // Left
			'#00ff00 75%',
			'#ffff00 85%',
			'#ff6600 95%',
			'#ff0000 100%' // Right (clipping)
		];
	}
}
