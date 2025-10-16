/**
 * Reverb - DAWG AI Audio Engine
 * Reverb effect with pre-delay and wet/dry mix
 * @module audio/effects/Reverb
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Reverb Effect - Spacious reverb
 */
export class Reverb extends Effect {
	private reverb: Tone.Reverb;
	private preDelay: Tone.Delay;

	constructor(id?: UUID, name: string = 'Reverb') {
		super(id!, name, 'reverb');

		// Create reverb
		this.reverb = new Tone.Reverb({
			decay: 2.5,
			preDelay: 0.01
		});

		// Create pre-delay
		this.preDelay = new Tone.Delay(0.01);

		// Connect signal chain
		this.input.connect(this.preDelay);
		this.preDelay.connect(this.reverb);
		this.reverb.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'decay',
			value: 2.5,
			min: 0.1,
			max: 10,
			default: 2.5,
			unit: 's',
			step: 0.1
		});

		this.registerParameter({
			name: 'preDelay',
			value: 0.01,
			min: 0,
			max: 0.5,
			default: 0.01,
			unit: 's',
			step: 0.001
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
	 * Set decay time
	 * @param seconds - Decay time in seconds
	 */
	setDecay(seconds: number): void {
		this.setParameter('decay', seconds);
	}

	/**
	 * Set pre-delay time
	 * @param seconds - Pre-delay in seconds
	 */
	setPreDelay(seconds: number): void {
		this.setParameter('preDelay', seconds);
	}

	/**
	 * Set wet mix amount
	 * @param amount - Wet amount (0-1)
	 */
	setWetMix(amount: number): void {
		this.setParameter('wet', amount);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'decay':
				// Reverb decay needs to be regenerated
				this.regenerateReverb(value);
				break;
			case 'preDelay':
				this.preDelay.delayTime.value = value;
				break;
			case 'wet':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Regenerate reverb with new decay time
	 */
	private async regenerateReverb(decay: number): Promise<void> {
		// Store old reverb
		const oldReverb = this.reverb;

		// Create new reverb
		this.reverb = new Tone.Reverb({ decay });

		// Wait for reverb to generate
		await this.reverb.ready;

		// Reconnect
		this.preDelay.disconnect();
		this.preDelay.connect(this.reverb);
		this.reverb.connect(this.wet.b);

		// Dispose old reverb
		oldReverb.dispose();
	}

	/**
	 * Apply reverb to offline context for rendering
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

		// Create convolver for reverb in offline context
		const convolver = offlineContext.createConvolver();
		const preDelay = offlineContext.createDelay(0.5);
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const mix = offlineContext.createGain();

		// Get current parameter values
		const decayValue = this.getParameter('decay') || 2.5;
		const preDelayValue = this.getParameter('preDelay') || 0.01;
		const wetValue = this.getParameter('wet') || 0.5;

		// Set parameter values
		preDelay.delayTime.value = preDelayValue;
		wetGain.gain.value = wetValue;
		dryGain.gain.value = 1 - wetValue;

		// Generate impulse response for reverb
		const sampleRate = offlineContext.sampleRate;
		const length = sampleRate * decayValue;
		const impulse = offlineContext.createBuffer(2, length, sampleRate);
		const impulseL = impulse.getChannelData(0);
		const impulseR = impulse.getChannelData(1);

		// Generate exponentially decaying noise
		for (let i = 0; i < length; i++) {
			const decay = Math.exp(-i / (sampleRate * decayValue / 4));
			impulseL[i] = (Math.random() * 2 - 1) * decay;
			impulseR[i] = (Math.random() * 2 - 1) * decay;
		}

		convolver.buffer = impulse;

		// Connect nodes: source -> preDelay -> convolver -> wetGain -> mix
		//                source -> dryGain -> mix
		source.connect(preDelay);
		preDelay.connect(convolver);
		convolver.connect(wetGain);
		wetGain.connect(mix);

		source.connect(dryGain);
		dryGain.connect(mix);

		mix.connect(destination);

		return mix;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.reverb.dispose();
		this.preDelay.dispose();
		super.dispose();
	}
}
