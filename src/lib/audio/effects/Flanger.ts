/**
 * Flanger - DAWG AI Audio Engine
 * Classic flanger effect with LFO modulation
 * @module audio/effects/Flanger
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Flanger Effect - Sweeping comb filter
 */
export class Flanger extends Effect {
	private lfo: Tone.LFO;
	private delay: Tone.Delay;
	private feedback: Tone.Gain;

	constructor(id?: UUID, name: string = 'Flanger') {
		super(id!, name, 'flanger' as any);

		// Create LFO
		this.lfo = new Tone.LFO({
			frequency: 0.5,
			min: 0.001,
			max: 0.008
		});

		// Create delay
		this.delay = new Tone.Delay(0.005);

		// Create feedback
		this.feedback = new Tone.Gain(0.5);

		// Connect signal chain
		this.input.connect(this.delay);
		this.delay.connect(this.feedback);
		this.feedback.connect(this.delay);
		this.delay.connect(this.wet.b);

		// Connect LFO to delay time
		this.lfo.connect(this.delay.delayTime);
		this.lfo.start();

		// Register parameters
		this.registerParameter({
			name: 'rate',
			value: 0.5,
			min: 0.1,
			max: 10,
			default: 0.5,
			unit: 'Hz',
			step: 0.1
		});

		this.registerParameter({
			name: 'depth',
			value: 0.007,
			min: 0.001,
			max: 0.02,
			default: 0.007,
			unit: 's',
			step: 0.001
		});

		this.registerParameter({
			name: 'feedback',
			value: 0.5,
			min: 0,
			max: 0.95,
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
				this.lfo.max = value;
				break;
			case 'feedback':
				this.feedback.gain.value = value;
				break;
			case 'wet':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Apply flanger to offline context
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
		const depth = this.getParameter('depth') || 0.007;
		const feedbackValue = this.getParameter('feedback') || 0.5;
		const wetValue = this.getParameter('wet') || 0.5;

		// Create nodes
		const delay = offlineContext.createDelay(0.05);
		const feedback = offlineContext.createGain();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		feedback.gain.value = feedbackValue;
		wetGain.gain.value = wetValue;
		dryGain.gain.value = 1 - wetValue;

		// Create LFO modulation (manual sine wave modulation)
		const sampleRate = offlineContext.sampleRate;
		const duration = offlineContext.length / sampleRate;

		// Modulate delay time with sine wave
		const baseDelay = 0.005;
		for (let t = 0; t < duration; t += 0.01) {
			const lfoValue = Math.sin(2 * Math.PI * rate * t) * depth / 2 + baseDelay;
			delay.delayTime.setValueAtTime(lfoValue, t);
		}

		// Connect: source -> delay -> feedback -> delay (feedback loop)
		//          source -> dryGain -> output
		//          delay -> wetGain -> output
		source.connect(delay);
		delay.connect(feedback);
		feedback.connect(delay);
		delay.connect(wetGain);
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
		this.delay.dispose();
		this.feedback.dispose();
		super.dispose();
	}
}
