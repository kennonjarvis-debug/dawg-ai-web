/**
 * Gate - DAWG AI Audio Engine
 * Noise gate for removing unwanted noise below threshold
 * @module audio/effects/Gate
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID, Decibels } from '../../types/core';

/**
 * Gate Effect - Threshold-based noise removal
 */
export class Gate extends Effect {
	private gate: Tone.Gate;

	constructor(id?: UUID, name: string = 'Gate') {
		super(id!, name, 'gate');

		// Create gate
		this.gate = new Tone.Gate({
			threshold: -50,
			smoothing: 0.1
		});

		// Connect to wet signal path
		this.input.connect(this.gate);
		this.gate.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'threshold',
			value: -50,
			min: -96,
			max: -6,
			default: -50,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'attack',
			value: 0.001,
			min: 0,
			max: 0.5,
			default: 0.001,
			unit: 's',
			step: 0.001
		});

		this.registerParameter({
			name: 'release',
			value: 0.1,
			min: 0.001,
			max: 2,
			default: 0.1,
			unit: 's',
			step: 0.01
		});

		this.registerParameter({
			name: 'smoothing',
			value: 0.1,
			min: 0,
			max: 1,
			default: 0.1,
			unit: '',
			step: 0.01
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
	 * Set smoothing amount
	 * @param amount - Smoothing (0-1)
	 */
	setSmoothing(amount: number): void {
		this.setParameter('smoothing', amount);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'threshold':
				this.gate.threshold.value = value;
				break;
			case 'attack':
				this.gate.attack.value = value;
				break;
			case 'release':
				this.gate.release.value = value;
				break;
			case 'smoothing':
				this.gate.smoothing = value;
				break;
		}
	}

	/**
	 * Apply gate to offline context
	 * Simplified implementation using a compressor with expansion characteristics
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

		const threshold = this.getParameter('threshold') || -50;

		// Use a compressor with very low ratio to simulate gate behavior
		// In a full implementation, this would use custom processing
		const gate = offlineContext.createDynamicsCompressor();
		gate.threshold.value = threshold;
		gate.ratio.value = 20; // High ratio for gating effect
		gate.attack.value = 0.001;
		gate.release.value = 0.1;
		gate.knee.value = 0;

		// Connect: source -> gate -> destination
		source.connect(gate);
		gate.connect(destination);

		return gate;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.gate.dispose();
		super.dispose();
	}
}
