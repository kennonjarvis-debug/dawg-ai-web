/**
 * Delay - DAWG AI Audio Engine
 * Feedback delay effect with tempo sync
 * @module audio/effects/Delay
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Delay Effect - Feedback delay with tempo sync
 */
export class Delay extends Effect {
	private feedbackDelay: Tone.FeedbackDelay;

	constructor(id?: UUID, name: string = 'Delay') {
		super(id!, name, 'delay');

		// Create feedback delay
		this.feedbackDelay = new Tone.FeedbackDelay({
			delayTime: '8n', // 8th note
			feedback: 0.5,
			wet: 0.5
		});

		// Connect to wet signal path
		this.input.connect(this.feedbackDelay);
		this.feedbackDelay.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'delayTime',
			value: 0.125, // 8th note at 120 BPM
			min: 0.001,
			max: 2,
			default: 0.125,
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
	 * Set delay time
	 * @param seconds - Delay time in seconds
	 */
	setDelayTime(seconds: number): void {
		this.setParameter('delayTime', seconds);
	}

	/**
	 * Set delay time using note value (tempo-synced)
	 * @param notation - Tone.js time notation (e.g., '4n', '8n', '16n')
	 */
	setDelayTimeNote(notation: string): void {
		this.feedbackDelay.delayTime.value = notation;
	}

	/**
	 * Set feedback amount
	 * @param amount - Feedback (0-0.95)
	 */
	setFeedback(amount: number): void {
		this.setParameter('feedback', amount);
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
			case 'delayTime':
				this.feedbackDelay.delayTime.value = value;
				break;
			case 'feedback':
				this.feedbackDelay.feedback.value = value;
				break;
			case 'wet':
				this.feedbackDelay.wet.value = value;
				break;
		}
	}

	/**
	 * Apply delay to offline context
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

		const delayTime = this.getParameter('delayTime') || 0.125;
		const feedbackValue = this.getParameter('feedback') || 0.5;
		const wetValue = this.getParameter('wet') || 0.5;

		// Create nodes
		const delay = offlineContext.createDelay(2.0);
		const feedback = offlineContext.createGain();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		// Set parameter values
		delay.delayTime.value = delayTime;
		feedback.gain.value = feedbackValue;
		wetGain.gain.value = wetValue;
		dryGain.gain.value = 1 - wetValue;

		// Connect feedback delay loop:
		// source -> delay -> feedback -> delay (loop)
		//        -> delay -> wetGain -> output
		// source -> dryGain -> output
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
		this.feedbackDelay.dispose();
		super.dispose();
	}
}
