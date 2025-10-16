/**
 * BitCrusher - DAWG AI Audio Engine
 * Bit depth and sample rate reduction for lo-fi effects
 * @module audio/effects/BitCrusher
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID } from '../../types/core';

/**
 * BitCrusher Effect - Digital distortion via bit reduction
 */
export class BitCrusher extends Effect {
	private bitCrusher: Tone.BitCrusher;

	constructor(id?: UUID, name: string = 'BitCrusher') {
		super(id!, name, 'bitcrusher' as any);

		// Create bit crusher
		this.bitCrusher = new Tone.BitCrusher({
			bits: 8
		});

		// Connect signal chain
		this.input.connect(this.bitCrusher);
		this.bitCrusher.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'bits',
			value: 8,
			min: 1,
			max: 16,
			default: 8,
			unit: '',
			step: 1
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
			case 'bits':
				this.bitCrusher.bits = Math.round(value);
				break;
			case 'wet':
				this.setMix(value);
				break;
		}
	}

	/**
	 * Apply bit crushing to offline context
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

		const bits = Math.round(this.getParameter('bits') || 8);
		const wetValue = this.getParameter('wet') || 0.5;

		// For offline bit crushing, we need to use a WaveShaperNode
		// to quantize the audio samples to the specified bit depth
		const bitCrushProcessor = offlineContext.createWaveShaper();
		const wetGain = offlineContext.createGain();
		const dryGain = offlineContext.createGain();
		const output = offlineContext.createGain();

		wetGain.gain.value = wetValue;
		dryGain.gain.value = 1 - wetValue;

		// Create transfer curve for bit crushing
		const samples = 65536; // High resolution for the curve
		const curve = new Float32Array(samples);
		const step = 1 / Math.pow(2, bits);

		for (let i = 0; i < samples; i++) {
			// Map from array index to audio range [-1, 1]
			const x = (i / samples) * 2 - 1;

			// Quantize to bit depth
			const quantized = Math.round(x / step) * step;

			// Clamp to [-1, 1]
			curve[i] = Math.max(-1, Math.min(1, quantized));
		}

		bitCrushProcessor.curve = curve;

		// Connect: source -> bitCrushProcessor -> wetGain -> output
		//          source -> dryGain -> output
		source.connect(bitCrushProcessor);
		bitCrushProcessor.connect(wetGain);
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
		this.bitCrusher.dispose();
		super.dispose();
	}
}
