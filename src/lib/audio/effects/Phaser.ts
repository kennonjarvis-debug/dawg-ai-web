/**
 * Phaser - DAWG AI Audio Engine
 * Phaser effect for stereo modulation and movement
 * @module audio/effects/Phaser
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Phaser Effect - Stereo phase modulation
 */
export class Phaser extends Effect {
	private phaser: Tone.Phaser;

	constructor(id?: UUID, name: string = 'Phaser') {
		super(id!, name, 'phaser');

		// Create phaser
		this.phaser = new Tone.Phaser({
			frequency: 0.5,
			octaves: 3,
			stages: 10,
			Q: 10,
			baseFrequency: 350
		});

		// Connect to wet signal path
		this.input.connect(this.phaser);
		this.phaser.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'rate',
			value: 0.5,
			min: 0.01,
			max: 10,
			default: 0.5,
			unit: 'Hz',
			step: 0.01
		});

		this.registerParameter({
			name: 'depth',
			value: 3,
			min: 0,
			max: 8,
			default: 3,
			unit: 'oct',
			step: 0.1
		});

		this.registerParameter({
			name: 'stages',
			value: 10,
			min: 2,
			max: 16,
			default: 10,
			unit: '',
			step: 1
		});

		this.registerParameter({
			name: 'frequency',
			value: 350,
			min: 200,
			max: 5000,
			default: 350,
			unit: 'Hz',
			step: 10
		});

		this.registerParameter({
			name: 'q',
			value: 10,
			min: 0.1,
			max: 100,
			default: 10,
			unit: '',
			step: 0.1
		});

		this.registerParameter({
			name: 'mix',
			value: 0.5,
			min: 0,
			max: 1,
			default: 0.5,
			unit: '',
			step: 0.01
		});
	}

	/**
	 * Set modulation rate
	 * @param hz - Rate in Hz
	 */
	setRate(hz: number): void {
		this.setParameter('rate', hz);
	}

	/**
	 * Set modulation depth in octaves
	 * @param octaves - Depth in octaves
	 */
	setDepth(octaves: number): void {
		this.setParameter('depth', octaves);
	}

	/**
	 * Set number of stages (complexity)
	 * @param stages - Number of allpass filters (2-16)
	 */
	setStages(stages: number): void {
		this.setParameter('stages', Math.round(stages));
	}

	/**
	 * Set base frequency
	 * @param hz - Base frequency in Hz
	 */
	setFrequency(hz: number): void {
		this.setParameter('frequency', hz);
	}

	/**
	 * Set resonance (Q factor)
	 * @param q - Q factor
	 */
	setQ(q: number): void {
		this.setParameter('q', q);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'rate':
				this.phaser.frequency.value = value;
				break;
			case 'depth':
				this.phaser.octaves = value;
				break;
			case 'stages':
				this.phaser.stages = Math.round(value);
				break;
			case 'frequency':
				this.phaser.baseFrequency = value;
				break;
			case 'q':
				this.phaser.Q.value = value;
				break;
			case 'mix':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Apply phaser to offline context
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

		const rate = this.getParameter('rate') || 0.5;
		const depth = this.getParameter('depth') || 3;
		const stages = Math.round(this.getParameter('stages') || 10);
		const baseFreq = this.getParameter('frequency') || 350;
		const q = this.getParameter('q') || 10;
		const mix = this.getParameter('mix') || 0.5;

		// Create allpass filter chain for phasing effect
		const filters: BiquadFilterNode[] = [];
		let currentNode: AudioNode = source;

		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		wetGain.gain.value = mix;
		dryGain.gain.value = 1 - mix;

		const sampleRate = offlineContext.sampleRate;
		const duration = offlineContext.length / sampleRate;

		// Create allpass filter stages
		for (let i = 0; i < stages; i++) {
			const filter = offlineContext.createBiquadFilter();
			filter.type = 'allpass';
			filter.Q.value = q;

			// Modulate filter frequency with LFO
			for (let t = 0; t < duration; t += 0.01) {
				const lfoValue = Math.sin(2 * Math.PI * rate * t);
				// Map LFO to frequency range based on depth (octaves)
				const freqMultiplier = Math.pow(2, (lfoValue * depth / 2));
				const frequency = baseFreq * freqMultiplier;
				filter.frequency.setValueAtTime(Math.min(20000, Math.max(20, frequency)), t);
			}

			currentNode.connect(filter);
			currentNode = filter;
			filters.push(filter);
		}

		// Connect final stage to wet/dry mix
		currentNode.connect(wetGain);
		wetGain.connect(output);

		source.connect(dryGain);
		dryGain.connect(output);

		output.connect(destination);

		return output;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.phaser.dispose();
		super.dispose();
	}
}
