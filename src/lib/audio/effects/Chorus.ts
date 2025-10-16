/**
 * Chorus - DAWG AI Audio Engine
 * Chorus effect for stereo widening and thickness
 * @module audio/effects/Chorus
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Chorus Effect - Stereo widening through modulated delays
 */
export class Chorus extends Effect {
	private chorus: Tone.Chorus;

	constructor(id?: UUID, name: string = 'Chorus') {
		super(id!, name, 'chorus');

		// Create chorus
		this.chorus = new Tone.Chorus({
			frequency: 1.5,
			delayTime: 3.5,
			depth: 0.7,
			type: 'sine',
			spread: 180
		});

		// Connect to wet signal path
		this.input.connect(this.chorus);
		this.chorus.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'rate',
			value: 1.5,
			min: 0.1,
			max: 10,
			default: 1.5,
			unit: 'Hz',
			step: 0.1
		});

		this.registerParameter({
			name: 'depth',
			value: 0.7,
			min: 0,
			max: 1,
			default: 0.7,
			unit: '',
			step: 0.01
		});

		this.registerParameter({
			name: 'delay',
			value: 3.5,
			min: 2,
			max: 20,
			default: 3.5,
			unit: 'ms',
			step: 0.1
		});

		this.registerParameter({
			name: 'feedback',
			value: 0,
			min: 0,
			max: 0.9,
			default: 0,
			unit: '',
			step: 0.01
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
	 * Set modulation depth
	 * @param amount - Depth (0-1)
	 */
	setDepth(amount: number): void {
		this.setParameter('depth', amount);
	}

	/**
	 * Set delay time
	 * @param ms - Delay in milliseconds
	 */
	setDelay(ms: number): void {
		this.setParameter('delay', ms);
	}

	/**
	 * Set feedback amount
	 * @param amount - Feedback (0-0.9)
	 */
	setFeedback(amount: number): void {
		this.setParameter('feedback', amount);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'rate':
				this.chorus.frequency.value = value;
				break;
			case 'depth':
				this.chorus.depth = value;
				break;
			case 'delay':
				this.chorus.delayTime = value;
				break;
			case 'feedback':
				this.chorus.feedback.value = value;
				break;
			case 'mix':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Start the chorus LFO
	 */
	start(): void {
		this.chorus.start();
	}

	/**
	 * Stop the chorus LFO
	 */
	stop(): void {
		this.chorus.stop();
	}

	/**
	 * Apply chorus to offline context
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

		const rate = this.getParameter('rate') || 1.5;
		const depth = this.getParameter('depth') || 0.7;
		const delayMs = this.getParameter('delay') || 3.5;
		const feedbackValue = this.getParameter('feedback') || 0;
		const mix = this.getParameter('mix') || 0.5;

		// Create multiple modulated delays for chorus effect
		const numVoices = 2;
		const delays: DelayNode[] = [];
		const feedbacks: GainNode[] = [];
		const merger = offlineContext.createChannelMerger(2);
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		wetGain.gain.value = mix;
		dryGain.gain.value = 1 - mix;

		const sampleRate = offlineContext.sampleRate;
		const duration = offlineContext.length / sampleRate;
		const baseDelay = delayMs / 1000;

		for (let i = 0; i < numVoices; i++) {
			const delay = offlineContext.createDelay(0.05);
			const feedback = offlineContext.createGain();
			feedback.gain.value = feedbackValue;

			// Create LFO modulation with phase offset for each voice
			const phaseOffset = (i / numVoices) * Math.PI;
			for (let t = 0; t < duration; t += 0.01) {
				const lfoValue = Math.sin(2 * Math.PI * rate * t + phaseOffset);
				const delayTime = baseDelay + (lfoValue * depth * baseDelay);
				delay.delayTime.setValueAtTime(delayTime, t);
			}

			// Connect feedback loop
			source.connect(delay);
			delay.connect(feedback);
			feedback.connect(delay);

			// Connect to merger (stereo spread)
			delay.connect(merger, 0, i % 2);

			delays.push(delay);
			feedbacks.push(feedback);
		}

		// Connect final output
		merger.connect(wetGain);
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
		this.chorus.dispose();
		super.dispose();
	}
}
