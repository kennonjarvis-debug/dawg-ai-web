/**
 * EQ - DAWG AI Audio Engine
 * Three-band equalizer effect
 * @module audio/effects/EQ
 */

import * as Tone from 'tone';
import { Effect } from './Effect';
import type { UUID, Decibels } from '../../types/core';

/**
 * EQ Effect - Three-band equalizer
 */
export class EQ extends Effect {
	private eq3: Tone.EQ3;

	constructor(id?: UUID, name: string = 'EQ') {
		super(id!, name, 'eq');

		// Create EQ3 (low, mid, high)
		this.eq3 = new Tone.EQ3({
			low: 0,
			mid: 0,
			high: 0,
			lowFrequency: 400,
			highFrequency: 2500
		});

		// Connect to wet signal path
		this.input.connect(this.eq3);
		this.eq3.connect(this.wet.b);

		// Register parameters
		this.registerParameter({
			name: 'lowGain',
			value: 0,
			min: -24,
			max: 24,
			default: 0,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'midGain',
			value: 0,
			min: -24,
			max: 24,
			default: 0,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'highGain',
			value: 0,
			min: -24,
			max: 24,
			default: 0,
			unit: 'dB',
			step: 0.1
		});

		this.registerParameter({
			name: 'lowFrequency',
			value: 400,
			min: 20,
			max: 1000,
			default: 400,
			unit: 'Hz',
			step: 10
		});

		this.registerParameter({
			name: 'highFrequency',
			value: 2500,
			min: 1000,
			max: 20000,
			default: 2500,
			unit: 'Hz',
			step: 100
		});
	}

	/**
	 * Set low band gain
	 * @param db - Gain in decibels
	 */
	setLowGain(db: Decibels): void {
		this.setParameter('lowGain', db);
	}

	/**
	 * Set mid band gain
	 * @param db - Gain in decibels
	 */
	setMidGain(db: Decibels): void {
		this.setParameter('midGain', db);
	}

	/**
	 * Set high band gain
	 * @param db - Gain in decibels
	 */
	setHighGain(db: Decibels): void {
		this.setParameter('highGain', db);
	}

	/**
	 * Set low/mid crossover frequency
	 * @param hz - Frequency in Hz
	 */
	setLowFrequency(hz: number): void {
		this.setParameter('lowFrequency', hz);
	}

	/**
	 * Set mid/high crossover frequency
	 * @param hz - Frequency in Hz
	 */
	setHighFrequency(hz: number): void {
		this.setParameter('highFrequency', hz);
	}

	/**
	 * Handle parameter changes
	 */
	protected onParameterChange(name: string, value: number): void {
		switch (name) {
			case 'lowGain':
				this.eq3.low.value = value;
				break;
			case 'midGain':
				this.eq3.mid.value = value;
				break;
			case 'highGain':
				this.eq3.high.value = value;
				break;
			case 'lowFrequency':
				this.eq3.lowFrequency.value = value;
				break;
			case 'highFrequency':
				this.eq3.highFrequency.value = value;
				break;
		}
	}

	/**
	 * Apply EQ to offline context
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

		const lowGain = this.getParameter('lowGain') || 0;
		const midGain = this.getParameter('midGain') || 0;
		const highGain = this.getParameter('highGain') || 0;
		const lowFreq = this.getParameter('lowFrequency') || 400;
		const highFreq = this.getParameter('highFrequency') || 2500;

		// Create three-band EQ using shelving and peaking filters
		const lowShelf = offlineContext.createBiquadFilter();
		const midPeak = offlineContext.createBiquadFilter();
		const highShelf = offlineContext.createBiquadFilter();

		// Low shelf filter
		lowShelf.type = 'lowshelf';
		lowShelf.frequency.value = lowFreq;
		lowShelf.gain.value = lowGain;

		// Mid peaking filter
		midPeak.type = 'peaking';
		midPeak.frequency.value = (lowFreq + highFreq) / 2;
		midPeak.Q.value = 0.7;
		midPeak.gain.value = midGain;

		// High shelf filter
		highShelf.type = 'highshelf';
		highShelf.frequency.value = highFreq;
		highShelf.gain.value = highGain;

		// Connect in series: source -> lowShelf -> midPeak -> highShelf -> destination
		source.connect(lowShelf);
		lowShelf.connect(midPeak);
		midPeak.connect(highShelf);
		highShelf.connect(destination);

		return highShelf;
	}

	/**
	 * Dispose resources
	 */
	dispose(): void {
		this.eq3.dispose();
		super.dispose();
	}
}
