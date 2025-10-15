/**
 * EffectsRack - DAWG AI Audio Engine
 * Manages a chain of effects for a track
 * @module audio/effects/EffectsRack
 */

import * as Tone from 'tone';
import type { UUID } from '../../types/core';
import { Effect } from './Effect';
import { EffectError, ErrorCode } from '../errors';
import { writable, type Writable } from 'svelte/store';

/**
 * EffectsRack - Manages a series of effects in a signal chain
 */
export class EffectsRack {
	private effects: Effect[];
	private input: Tone.Gain;
	private output: Tone.Gain;

	// Svelte store for reactivity
	public readonly effectsStore: Writable<Effect[]>;

	constructor() {
		this.effects = [];
		this.input = new Tone.Gain(1);
		this.output = new Tone.Gain(1);

		// Initialize with direct connection
		this.input.connect(this.output);

		// Create reactive store
		this.effectsStore = writable<Effect[]>([]);
	}

	/**
	 * Add an effect to the chain
	 * @param effect - Effect to add
	 * @param index - Optional index to insert at (default: end)
	 */
	addEffect(effect: Effect, index?: number): void {
		// Validate effect doesn't already exist
		if (this.effects.some((e) => e.id === effect.id)) {
			throw new EffectError(
				`Effect with id ${effect.id} already exists in rack`,
				ErrorCode.EFFECT_NOT_FOUND,
				effect.id
			);
		}

		// Add to array
		if (index !== undefined && index >= 0 && index <= this.effects.length) {
			this.effects.splice(index, 0, effect);
		} else {
			this.effects.push(effect);
		}

		// Rebuild signal chain
		this.rebuildChain();

		// Update store
		this.effectsStore.set([...this.effects]);
	}

	/**
	 * Remove an effect from the chain
	 * @param id - Effect ID to remove
	 */
	removeEffect(id: UUID): void {
		const index = this.effects.findIndex((e) => e.id === id);

		if (index === -1) {
			throw new EffectError(
				`Effect with id ${id} not found in rack`,
				ErrorCode.EFFECT_NOT_FOUND,
				id
			);
		}

		const effect = this.effects[index];
		this.effects.splice(index, 1);

		// Dispose the effect
		effect.dispose();

		// Rebuild signal chain
		this.rebuildChain();

		// Update store
		this.effectsStore.set([...this.effects]);
	}

	/**
	 * Reorder an effect in the chain
	 * @param fromIndex - Current index
	 * @param toIndex - Target index
	 */
	reorderEffect(fromIndex: number, toIndex: number): void {
		if (fromIndex < 0 || fromIndex >= this.effects.length) {
			throw new EffectError(
				`Invalid fromIndex: ${fromIndex}`,
				ErrorCode.INVALID_PARAMETER
			);
		}

		if (toIndex < 0 || toIndex >= this.effects.length) {
			throw new EffectError(
				`Invalid toIndex: ${toIndex}`,
				ErrorCode.INVALID_PARAMETER
			);
		}

		// Move effect
		const [effect] = this.effects.splice(fromIndex, 1);
		this.effects.splice(toIndex, 0, effect);

		// Rebuild signal chain
		this.rebuildChain();

		// Update store
		this.effectsStore.set([...this.effects]);
	}

	/**
	 * Get effect by ID
	 * @param id - Effect ID
	 * @returns Effect or undefined
	 */
	getEffect(id: UUID): Effect | undefined {
		return this.effects.find((e) => e.id === id);
	}

	/**
	 * Get all effects
	 * @returns Array of effects
	 */
	getEffects(): Effect[] {
		return [...this.effects];
	}

	/**
	 * Get number of effects
	 */
	get length(): number {
		return this.effects.length;
	}

	/**
	 * Check if rack is empty
	 */
	get isEmpty(): boolean {
		return this.effects.length === 0;
	}

	/**
	 * Clear all effects
	 */
	clear(): void {
		// Dispose all effects
		this.effects.forEach((effect) => effect.dispose());
		this.effects = [];

		// Rebuild chain
		this.rebuildChain();

		// Update store
		this.effectsStore.set([]);
	}

	/**
	 * Rebuild the effect signal chain
	 */
	private rebuildChain(): void {
		// Disconnect everything
		this.input.disconnect();
		this.effects.forEach((effect) => effect.disconnect());

		// Reconnect in series
		if (this.effects.length === 0) {
			// Direct connection if no effects
			this.input.connect(this.output);
		} else {
			// Connect input to first effect
			this.input.connect(this.effects[0].input);

			// Connect effects in series
			for (let i = 0; i < this.effects.length - 1; i++) {
				this.effects[i].connect(this.effects[i + 1].input);
			}

			// Connect last effect to output
			this.effects[this.effects.length - 1].connect(this.output);
		}
	}

	/**
	 * Get the input node
	 */
	getInput(): Tone.Gain {
		return this.input;
	}

	/**
	 * Get the output node
	 */
	getOutput(): Tone.Gain {
		return this.output;
	}

	/**
	 * Connect rack to destination
	 * @param destination - Audio destination
	 */
	connect(destination: any): void {
		this.output.connect(destination);
	}

	/**
	 * Disconnect rack
	 */
	disconnect(): void {
		this.output.disconnect();
	}

	/**
	 * Bypass all effects (set all to dry)
	 * @param bypass - True to bypass
	 */
	bypassAll(bypass: boolean): void {
		this.effects.forEach((effect) => {
			effect.setEnabled(!bypass);
		});
	}

	/**
	 * Get CPU usage estimate (placeholder)
	 * @returns Estimated CPU usage (0-1)
	 */
	getCPUUsage(): number {
		// Rough estimate: 0.05 per active effect
		const activeCount = this.effects.filter((e) => e.isEnabled()).length;
		return Math.min(activeCount * 0.05, 1.0);
	}

	/**
	 * Serialize rack to JSON
	 */
	toJSON() {
		return {
			effects: this.effects.map((effect) => effect.toJSON())
		};
	}

	/**
	 * Dispose all resources
	 */
	dispose(): void {
		this.clear();
		this.input.dispose();
		this.output.dispose();
	}
}
