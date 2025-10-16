/**
 * Compressor - DAWG AI Audio Engine
 * Dynamic range compressor effect
 * @module audio/effects/Compressor
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID, Decibels } from '../../types/core';

/**
 * Compressor Effect - Dynamic range compression
 */
export class Compressor extends Effect {
	private compressor: Tone.Compressor;

	constructor(id?: UUID, name: string = 'Compressor') {
		super(id!, name, 'compressor');

		// Create compressor
		this.compressor = new Tone.Compressor({
			threshold: -24,
			ratio: 4,
			attack: 0.003,
			release: 0.25,
			knee: 10
		});

		// Connect to wet signal path
		this.input.connect(this.compressor);
		this.compressor.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'threshold',
			value: -24,
			min: -100,
			max: 0,
			default: -24,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'ratio',
			value: 4,
			min: 1,
			max: 20,
			default: 4,
			unit: ':1',
			step: 0.1
		});

		this.registerParameter({
			name: 'attack',
			value: 0.003,
			min: 0,
			max: 1,
			default: 0.003,
			unit: 's',
			step: 0.001
		});

		this.registerParameter({
			name: 'release',
			value: 0.25,
			min: 0.001,
			max: 2,
			default: 0.25,
			unit: 's',
			step: 0.01
		});

		this.registerParameter({
			name: 'knee',
			value: 10,
			min: 0,
			max: 40,
			default: 10,
			unit: 'dB',
			step: 1
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
	 * Set compression ratio
	 * @param ratio - Compression ratio
	 */
	setRatio(ratio: number): void {
		this.setParameter('ratio', ratio);
	}

	/**
	 * Set attack time
	 * @param seconds - Attack time in seconds
	 */
	setAttack(seconds: number): void {
		this.setParameter('attack', seconds);
	}

	/**
	 * Set release time
	 * @param seconds - Release time in seconds
	 */
	setRelease(seconds: number): void {
		this.setParameter('release', seconds);
	}

	/**
	 * Set knee
	 * @param db - Knee in decibels
	 */
	setKnee(db: Decibels): void {
		this.setParameter('knee', db);
	}

	/**
	 * Get current gain reduction
	 * @returns Gain reduction in dB (estimated)
	 */
	getGainReduction(): Decibels {
		// Tone.js doesn't expose reduction directly, this is an approximation
		// In a real implementation, you'd use an analyser or AudioWorklet
		return 0; // Placeholder
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'threshold':
				this.compressor.threshold.value = value;
				break;
			case 'ratio':
				this.compressor.ratio.value = value;
				break;
			case 'attack':
				this.compressor.attack.value = value;
				break;
			case 'release':
				this.compressor.release.value = value;
				break;
			case 'knee':
				this.compressor.knee.value = value;
				break;
		}
	}

	/**
	 * Apply compressor to offline context
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

		const threshold = this.getParameter('threshold') || -24;
		const ratio = this.getParameter('ratio') || 4;
		const attack = this.getParameter('attack') || 0.003;
		const release = this.getParameter('release') || 0.25;
		const knee = this.getParameter('knee') || 10;

		// Create dynamics compressor node
		const compressor = offlineContext.createDynamicsCompressor();

		// Set compressor parameters
		compressor.threshold.value = threshold;
		compressor.ratio.value = ratio;
		compressor.attack.value = attack;
		compressor.release.value = release;
		compressor.knee.value = knee;

		// Connect: source -> compressor -> destination
		source.connect(compressor);
		compressor.connect(destination);

		return compressor;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.compressor.dispose();
		super.dispose();
	}
}
