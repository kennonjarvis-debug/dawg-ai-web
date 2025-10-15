/**
 * Effect - DAWG AI Audio Engine
 * Base class for all audio effects
 * @module audio/effects/Effect
 */

import * as Tone from 'tone';
import type { UUID, EffectType } from '../../types/core';
import { EffectError, ErrorCode } from '../errors';

/**
 * Effect parameter definition
 */
export interface EffectParameter {
	name: string;
	value: number;
	min: number;
	max: number;
	default: number;
	unit: string;
	step: number;
}

/**
 * Effect configuration for serialization
 */
export interface EffectConfig {
	id: UUID;
	name: string;
	type: EffectType;
	enabled: boolean;
	parameters: Record<string, EffectParameter>;
}

/**
 * Base Effect class - Abstract class for all effects
 */
export abstract class Effect {
	public readonly id: UUID;
	public name: string;
	public readonly type: EffectType;
	public enabled: boolean;
	public readonly parameters: Map<string, EffectParameter>;

	public readonly input: Tone.Gain;
	public readonly output: Tone.Gain;

	protected wet: Tone.CrossFade;
	protected dryWet: number = 1.0; // 0 = dry, 1 = wet

	constructor(id: UUID, name: string, type: EffectType) {
		this.id = id || this.generateId();
		this.name = name;
		this.type = type;
		this.enabled = true;
		this.parameters = new Map();

		// Create input/output nodes
		this.input = new Tone.Gain(1);
		this.output = new Tone.Gain(1);

		// Create dry/wet crossfade
		this.wet = new Tone.CrossFade(1);

		// Connect dry signal
		this.input.connect(this.wet.a);

		// Wet signal will be connected by subclass
		this.wet.connect(this.output);
	}

	/**
	 * Set a parameter value
	 * @param name - Parameter name
	 * @param value - New value
	 */
	setParameter(name: string, value: number): void {
		const param = this.parameters.get(name);

		if (!param) {
			throw new EffectError(
				`Parameter "${name}" not found in effect "${this.name}"`,
				ErrorCode.INVALID_PARAMETER,
				this.id
			);
		}

		// Validate range
		if (value < param.min || value > param.max) {
			throw new EffectError(
				`Parameter "${name}" value ${value} is out of range [${param.min}, ${param.max}]`,
				ErrorCode.PARAMETER_OUT_OF_RANGE,
				this.id
			);
		}

		// Update parameter
		param.value = value;

		// Call subclass implementation
		this.onParameterChange(name, value);
	}

	/**
	 * Get a parameter value
	 * @param name - Parameter name
	 * @returns Parameter value or undefined if not found
	 */
	getParameter(name: string): number | undefined {
		return this.parameters.get(name)?.value;
	}

	/**
	 * Get all parameters
	 */
	getParameters(): Record<string, EffectParameter> {
		const params: Record<string, EffectParameter> = {};
		this.parameters.forEach((param, name) => {
			params[name] = { ...param };
		});
		return params;
	}

	/**
	 * Set dry/wet mix
	 * @param amount - Mix amount (0 = dry, 1 = wet)
	 */
	setMix(amount: number): void {
		if (amount < 0 || amount > 1) {
			throw new EffectError(
				'Mix amount must be between 0 and 1',
				ErrorCode.PARAMETER_OUT_OF_RANGE,
				this.id
			);
		}
		this.dryWet = amount;
		this.wet.fade.value = amount;
	}

	/**
	 * Get dry/wet mix
	 */
	getMix(): number {
		return this.dryWet;
	}

	/**
	 * Enable/disable the effect
	 * @param enabled - True to enable
	 */
	setEnabled(enabled: boolean): void {
		this.enabled = enabled;

		if (enabled) {
			this.wet.fade.value = this.dryWet;
		} else {
			this.wet.fade.value = 0; // Full dry
		}
	}

	/**
	 * Toggle effect on/off
	 */
	toggle(): void {
		this.setEnabled(!this.enabled);
	}

	/**
	 * Check if effect is enabled
	 */
	isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Register a parameter
	 * @param param - Parameter definition
	 */
	protected registerParameter(param: EffectParameter): void {
		this.parameters.set(param.name, param);
	}

	/**
	 * Subclass hook for parameter changes
	 * @param name - Parameter name
	 * @param value - New value
	 */
	protected abstract onParameterChange(name: string, value: number): void;

	/**
	 * Serialize effect to JSON
	 */
	toJSON(): EffectConfig {
		return {
			id: this.id,
			name: this.name,
			type: this.type,
			enabled: this.enabled,
			parameters: this.getParameters()
		};
	}

	/**
	 * Connect effect to destination
	 * @param destination - Audio destination
	 */
	connect(destination: any): void {
		this.output.connect(destination);
	}

	/**
	 * Disconnect effect
	 */
	disconnect(): void {
		this.output.disconnect();
	}

	/**
	 * Dispose of all resources
	 */
	dispose(): void {
		this.input.dispose();
		this.output.dispose();
		this.wet.dispose();
	}

	/**
	 * Generate a unique ID
	 */
	private generateId(): UUID {
		return `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
