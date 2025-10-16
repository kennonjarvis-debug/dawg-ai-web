/**
 * Limiter - DAWG AI Audio Engine
 * Brick-wall limiter for loudness control and anti-clipping
 * @module audio/effects/Limiter
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID, Decibels } from '../../types/core';

/**
 * Limiter Effect - Brick-wall limiting for loudness control
 */
export class Limiter extends Effect {
	private limiter: Tone.Limiter;

	constructor(id?: UUID, name: string = 'Limiter') {
		super(id!, name, 'limiter');

		// Create limiter
		this.limiter = new Tone.Limiter(-0.5);

		// Connect to wet signal path
		this.input.connect(this.limiter);
		this.limiter.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'threshold',
			value: -0.5,
			min: -12,
			max: 0,
			default: -0.5,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'release',
			value: 0.01,
			min: 0.001,
			max: 1,
			default: 0.01,
			unit: 's',
			step: 0.001
		});
	}

	/**
	 * Set threshold
	 * @param db - Threshold in decibels
	 */
	setThreshold(db: Decibels): void {
		this.setParameter('threshold', db);
	}

	/**
	 * Set release time
	 * @param seconds - Release time in seconds
	 */
	setRelease(seconds: number): void {
		this.setParameter('release', seconds);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'threshold':
				// Tone.Limiter threshold is set at construction
				// We need to recreate the limiter for threshold changes
				this.recreateLimiter(value);
				break;
			case 'release':
				// Release is not directly exposed in Tone.Limiter
				// In production, use custom AudioWorklet
				break;
		}
	}

	/**
	 * Recreate limiter with new threshold
	 */
	private recreateLimiter(threshold: number): void {
		const oldLimiter = this.limiter;

		this.limiter = new Tone.Limiter(threshold);

		// Reconnect
		this.input.disconnect();
		oldLimiter.disconnect();

		this.input.connect(this.limiter);
		this.limiter.connect(this.wet.b);

		oldLimiter.dispose();
	}

	/**
	 * Apply limiter to offline context
	 */
	applyToOfflineContext(
		offlineContext: OfflineAudioContext,
		source: AudioNode,
		destination: AudioNode
	): AudioNode {
		if (!this.enabled) {
			source.connect(destination);
			return source;
		}

		const threshold = this.getParameter('threshold') || -0.5;

		// Create dynamics compressor configured as a limiter
		// (high ratio, fast attack, no knee)
		const limiter = offlineContext.createDynamicsCompressor();
		limiter.threshold.value = threshold;
		limiter.ratio.value = 20; // High ratio for limiting
		limiter.attack.value = 0.001; // Fast attack
		limiter.release.value = 0.01;
		limiter.knee.value = 0; // Hard knee

		// Connect: source -> limiter -> destination
		source.connect(limiter);
		limiter.connect(destination);

		return limiter;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.limiter.dispose();
		super.dispose();
	}
}
