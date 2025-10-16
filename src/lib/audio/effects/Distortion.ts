/**
 * Distortion - DAWG AI Audio Engine
 * Distortion/saturation effect (tube, tape, digital)
 * @module audio/effects/Distortion
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * Distortion types
 */
export type DistortionType = 'soft' | 'hard' | 'tube' | 'tape';

/**
 * Distortion Effect - Harmonic distortion and saturation
 */
export class Distortion extends Effect {
	private distortion: Tone.Distortion;
	private preGain: Tone.Gain;
	private postGain: Tone.Gain;

	constructor(id?: UUID, name: string = 'Distortion') {
		super(id!, name, 'distortion');

		// Create gain nodes for drive control
		this.preGain = new Tone.Gain(1);
		this.postGain = new Tone.Gain(1);

		// Create distortion
		this.distortion = new Tone.Distortion({
			distortion: 0.4,
			oversample: '4x'
		});

		// Connect signal chain
		this.input.connect(this.preGain);
		this.preGain.connect(this.distortion);
		this.distortion.connect(this.postGain);
		this.postGain.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'drive',
			value: 0.4,
			min: 0,
			max: 1,
			default: 0.4,
			unit: '',
			step: 0.01
		});

		this.registerParameter({
			name: 'tone',
			value: 0.5,
			min: 0,
			max: 1,
			default: 0.5,
			unit: '',
			step: 0.01
		});

		this.registerParameter({
			name: 'output',
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
	 * Set drive amount
	 * @param amount - Drive amount (0-1)
	 */
	setDrive(amount: number): void {
		this.setParameter('drive', amount);
	}

	/**
	 * Set tone (high-frequency rolloff)
	 * @param amount - Tone amount (0-1)
	 */
	setTone(amount: number): void {
		this.setParameter('tone', amount);
	}

	/**
	 * Set output level
	 * @param db - Output level in dB
	 */
	setOutput(db: number): void {
		this.setParameter('output', db);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'drive':
				this.distortion.distortion = value;
				// Adjust pre-gain for different drive amounts
				this.preGain.gain.value = 1 + value * 2;
				break;
			case 'tone':
				// Tone control not directly available in Tone.Distortion
				// In production, add a filter after distortion
				break;
			case 'output':
				// Convert dB to gain
				this.postGain.gain.value = Math.pow(10, value / 20);
				break;
			case 'mix':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Set distortion type
	 * @param type - Distortion algorithm type
	 */
	setDistortionType(type: DistortionType): void {
		// Different distortion curves
		switch (type) {
			case 'soft':
				this.distortion.oversample = '2x';
				break;
			case 'hard':
				this.distortion.oversample = 'none';
				break;
			case 'tube':
				this.distortion.oversample = '4x';
				break;
			case 'tape':
				this.distortion.oversample = '4x';
				break;
		}
	}

	/**
	 * Apply distortion to offline context
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

		const drive = this.getParameter('drive') || 0.4;
		const outputDb = this.getParameter('output') || 0;
		const mix = this.getParameter('mix') || 1;

		// Create nodes
		const preGain = offlineContext.createGain();
		const waveshaper = offlineContext.createWaveShaper();
		const postGain = offlineContext.createGain();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		// Set gain values
		preGain.gain.value = 1 + drive * 2;
		postGain.gain.value = Math.pow(10, outputDb / 20);
		wetGain.gain.value = mix;
		dryGain.gain.value = 1 - mix;

		// Create distortion curve
		const samples = 44100;
		const curve = new Float32Array(samples);
		const deg = Math.PI / 180;

		for (let i = 0; i < samples; i++) {
			const x = (i * 2) / samples - 1;
			// Soft clipping curve with drive control
			const k = drive * 100;
			curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
		}

		waveshaper.curve = curve;
		waveshaper.oversample = '4x';

		// Connect: source -> preGain -> waveshaper -> postGain -> wetGain -> output
		//          source -> dryGain -> output
		source.connect(preGain);
		preGain.connect(waveshaper);
		waveshaper.connect(postGain);
		postGain.connect(wetGain);
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
		this.distortion.dispose();
		this.preGain.dispose();
		this.postGain.dispose();
		super.dispose();
	}
}
