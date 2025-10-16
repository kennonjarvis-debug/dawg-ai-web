/**
 * Tremolo - DAWG AI Audio Engine
 * Amplitude modulation effect with LFO
 * @module audio/effects/Tremolo
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Tremolo Effect - Amplitude modulation
 */
export class Tremolo extends Effect {
	private lfo: Tone.LFO;
	private gain: Tone.Gain;

	constructor(id?: UUID, name: string = 'Tremolo') {
		super(id!, name, 'tremolo' as any);

		// Create LFO for amplitude modulation
		this.lfo = new Tone.LFO({
			frequency: 4,
			min: 0,
			max: 1,
			type: 'sine'
		});

		// Create gain node for modulation
		this.gain = new Tone.Gain(1);

		// Connect signal chain
		this.input.connect(this.gain);
		this.gain.connect(this.wet.b);

		// Connect LFO to gain
		this.lfo.connect(this.gain.gain);
		this.lfo.start();

		// Register parameters
		this.registerParameter({
			name: 'rate',
			value: 4,
			min: 0.1,
			max: 20,
			default: 4,
			unit: 'Hz',
			step: 0.1
		});

		this.registerParameter({
			name: 'depth',
			value: 0.5,
			min: 0,
			max: 1,
			default: 0.5,
			unit: '',
			step: 0.01
		});

		this.registerParameter({
			name: 'wet',
			value: 0.5,
			min: 0,
			max: 1,
			default: 0.5,
			unit: '',
			step: 0.01
		});
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'rate':
				this.lfo.frequency.value = value;
				break;
			case 'depth':
				// Depth controls the LFO range: 0 = no modulation, 1 = full modulation
				this.lfo.min = 1 - value;
				this.lfo.max = 1;
				break;
			case 'wet':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Apply tremolo to offline context
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

		const rate = this.getParameter('rate') || 4;
		const depth = this.getParameter('depth') || 0.5;
		const wetValue = this.getParameter('wet') || 0.5;

		// Create nodes
		const modulatedGain = offlineContext.createGain();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		wetGain.gain.value = wetValue;
		dryGain.gain.value = 1 - wetValue;

		// Create amplitude modulation using sine wave
		const sampleRate = offlineContext.sampleRate;
		const duration = offlineContext.length / sampleRate;

		// Modulate gain with sine wave
		// Depth controls modulation amount: 0 = no modulation, 1 = full modulation (0 to 1)
		for (let t = 0; t < duration; t += 0.01) {
			const lfoValue = Math.sin(2 * Math.PI * rate * t);
			// Map LFO (-1 to 1) to gain range based on depth
			// depth=0: gain stays at 1
			// depth=1: gain varies from 0 to 1
			const gainValue = 1 - (depth * (1 - lfoValue) / 2);
			modulatedGain.gain.setValueAtTime(gainValue, t);
		}

		// Connect: source -> modulatedGain -> wetGain -> output
		//          source -> dryGain -> output
		source.connect(modulatedGain);
		modulatedGain.connect(wetGain);
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
		this.lfo.dispose();
		this.gain.dispose();
		super.dispose();
	}
}
