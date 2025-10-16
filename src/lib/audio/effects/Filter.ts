/**
 * Filter - DAWG AI Audio Engine
 * Multi-mode filter (lowpass, highpass, bandpass, notch)
 * @module audio/effects/Filter
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Filter types
 */
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'allpass' | 'peaking' | 'lowshelf' | 'highshelf';

/**
 * Filter Effect - Multi-mode resonant filter
 */
export class Filter extends Effect {
	private filter: Tone.Filter;

	constructor(id?: UUID, name: string = 'Filter') {
		super(id!, name, 'filter');

		// Create filter
		this.filter = new Tone.Filter({
			type: 'lowpass',
			frequency: 1000,
			Q: 1,
			gain: 0
		});

		// Connect to wet signal path
		this.input.connect(this.filter);
		this.filter.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'frequency',
			value: 1000,
			min: 20,
			max: 20000,
			default: 1000,
			unit: 'Hz',
			step: 1
		});

		this.registerParameter({
			name: 'resonance',
			value: 1,
			min: 0.001,
			max: 30,
			default: 1,
			unit: '',
			step: 0.1
		});

		this.registerParameter({
			name: 'rolloff',
			value: -12,
			min: -96,
			max: -12,
			default: -12,
			unit: 'dB/oct',
			step: 12
		});

		this.registerParameter({
			name: 'gain',
			value: 0,
			min: -24,
			max: 24,
			default: 0,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'mix',
			value: 1,
			min: 0,
			max: 1,
			default: 1,
			unit: '',
			step: 0.01
		});
	}

	/**
	 * Set filter frequency
	 * @param hz - Frequency in Hz
	 */
	setFrequency(hz: number): void {
		this.setParameter('frequency', hz);
	}

	/**
	 * Set filter resonance (Q)
	 * @param q - Q factor
	 */
	setResonance(q: number): void {
		this.setParameter('resonance', q);
	}

	/**
	 * Set filter rolloff
	 * @param db - Rolloff in dB/octave (-12, -24, -48, -96)
	 */
	setRolloff(db: -12 | -24 | -48 | -96): void {
		this.setParameter('rolloff', db);
	}

	/**
	 * Set filter gain (for peaking/shelving filters)
	 * @param db - Gain in dB
	 */
	setGain(db: number): void {
		this.setParameter('gain', db);
	}

	/**
	 * Set filter type
	 * @param type - Filter type
	 */
	setFilterType(type: FilterType): void {
		this.filter.type = type;
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'frequency':
				this.filter.frequency.value = value;
				break;
			case 'resonance':
				this.filter.Q.value = value;
				break;
			case 'rolloff':
				// Rolloff must be -12, -24, -48, or -96
				const validRolloffs = [-12, -24, -48, -96] as const;
				const closest = validRolloffs.reduce((prev, curr) =>
					Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
				);
				this.filter.rolloff = closest;
				break;
			case 'gain':
				this.filter.gain.value = value;
				break;
			case 'mix':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Get current frequency
	 */
	getFrequency(): number {
		return this.filter.frequency.value;
	}

	/**
	 * Get current Q
	 */
	getResonance(): number {
		return this.filter.Q.value;
	}

	/**
	 * Get current filter type
	 */
	getFilterType(): FilterType {
		return this.filter.type;
	}

	/**
	 * Apply filter to offline context
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

		const frequency = this.getParameter('frequency') || 1000;
		const resonance = this.getParameter('resonance') || 1;
		const gain = this.getParameter('gain') || 0;
		const mix = this.getParameter('mix') || 1;

		// Create nodes
		const filter = offlineContext.createBiquadFilter();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		// Set filter parameters
		filter.type = this.filter.type as BiquadFilterType;
		filter.frequency.value = frequency;
		filter.Q.value = resonance;
		filter.gain.value = gain;

		// Set mix values
		wetGain.gain.value = mix;
		dryGain.gain.value = 1 - mix;

		// Connect: source -> filter -> wetGain -> output
		//          source -> dryGain -> output
		source.connect(filter);
		filter.connect(wetGain);
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
		this.filter.dispose();
		super.dispose();
	}
}
