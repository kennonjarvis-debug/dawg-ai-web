/**
 * Clip - DAWG AI Audio Engine
 * Represents an audio clip on a track with playback properties
 * @module audio/Clip
 */

import type { UUID, TimeInSeconds, GainLevel } from '../types/core';
import { AudioEngineError, ErrorCode } from './errors';

/**
 * Clip configuration interface
 */
export interface ClipConfig {
	id?: UUID;
	trackId: UUID;
	buffer: AudioBuffer;
	startTime: TimeInSeconds;
	duration?: TimeInSeconds;
	offset?: TimeInSeconds;
	gain?: GainLevel;
	fadeIn?: TimeInSeconds;
	fadeOut?: TimeInSeconds;
	name?: string;
}

/**
 * Clip class - Represents a segment of audio on a track
 */
export class Clip {
	public readonly id: UUID;
	public trackId: UUID;
	public buffer: AudioBuffer;
	public startTime: TimeInSeconds;
	public duration: TimeInSeconds;
	public offset: TimeInSeconds;
	public gain: GainLevel;
	public fadeIn: TimeInSeconds;
	public fadeOut: TimeInSeconds;
	public name: string;

	// Internal state
	private _isLooped: boolean = false;
	private _playbackRate: number = 1.0;

	constructor(config: ClipConfig) {
		// Validation
		if (!config.buffer) {
			throw new AudioEngineError('Clip requires an audio buffer', ErrorCode.INVALID_CLIP_DATA);
		}

		if (config.startTime < 0) {
			throw new AudioEngineError('Clip start time cannot be negative', ErrorCode.INVALID_PARAMETER);
		}

		this.id = config.id || this.generateId();
		this.trackId = config.trackId;
		this.buffer = config.buffer;
		this.startTime = config.startTime;
		this.duration = config.duration ?? config.buffer.duration;
		this.offset = config.offset ?? 0;
		this.gain = config.gain ?? 1.0;
		this.fadeIn = config.fadeIn ?? 0;
		this.fadeOut = config.fadeOut ?? 0;
		this.name = config.name ?? `Clip ${this.id.slice(0, 8)}`;

		// Validate duration
		if (this.duration <= 0) {
			throw new AudioEngineError('Clip duration must be positive', ErrorCode.INVALID_PARAMETER);
		}

		if (this.offset + this.duration > this.buffer.duration) {
			throw new AudioEngineError(
				'Clip duration + offset exceeds buffer length',
				ErrorCode.INVALID_PARAMETER
			);
		}
	}

	/**
	 * Get the end time of the clip
	 */
	get endTime(): TimeInSeconds {
		return this.startTime + this.duration;
	}

	/**
	 * Check if clip is looped
	 */
	get isLooped(): boolean {
		return this._isLooped;
	}

	/**
	 * Set loop status
	 */
	set isLooped(value: boolean) {
		this._isLooped = value;
	}

	/**
	 * Get playback rate
	 */
	get playbackRate(): number {
		return this._playbackRate;
	}

	/**
	 * Set playback rate (0.5 = half speed, 2.0 = double speed)
	 */
	set playbackRate(rate: number) {
		if (rate <= 0) {
			throw new AudioEngineError('Playback rate must be positive', ErrorCode.INVALID_PARAMETER);
		}
		this._playbackRate = rate;
	}

	/**
	 * Check if a time point is within this clip
	 * @param time - Time in seconds
	 * @returns True if time is within clip bounds
	 */
	contains(time: TimeInSeconds): boolean {
		return time >= this.startTime && time < this.endTime;
	}

	/**
	 * Check if this clip overlaps with another clip
	 * @param other - Other clip to check
	 * @returns True if clips overlap
	 */
	overlaps(other: Clip): boolean {
		return this.startTime < other.endTime && this.endTime > other.startTime;
	}

	/**
	 * Move the clip to a new start time
	 * @param time - New start time in seconds
	 */
	moveTo(time: TimeInSeconds): void {
		if (time < 0) {
			throw new AudioEngineError('Cannot move clip to negative time', ErrorCode.INVALID_PARAMETER);
		}
		this.startTime = time;
	}

	/**
	 * Trim the clip from the start
	 * @param amount - Amount to trim in seconds
	 */
	trimStart(amount: TimeInSeconds): void {
		if (amount < 0) {
			throw new AudioEngineError('Trim amount cannot be negative', ErrorCode.INVALID_PARAMETER);
		}

		const newDuration = this.duration - amount;
		if (newDuration <= 0) {
			throw new AudioEngineError('Trim would result in zero or negative duration', ErrorCode.INVALID_PARAMETER);
		}

		this.offset += amount;
		this.duration = newDuration;
		this.startTime += amount;
	}

	/**
	 * Trim the clip from the end
	 * @param amount - Amount to trim in seconds
	 */
	trimEnd(amount: TimeInSeconds): void {
		if (amount < 0) {
			throw new AudioEngineError('Trim amount cannot be negative', ErrorCode.INVALID_PARAMETER);
		}

		const newDuration = this.duration - amount;
		if (newDuration <= 0) {
			throw new AudioEngineError('Trim would result in zero or negative duration', ErrorCode.INVALID_PARAMETER);
		}

		this.duration = newDuration;
	}

	/**
	 * Split the clip at a given time
	 * @param time - Time to split at (relative to timeline)
	 * @returns New clip representing the second half, or null if split is invalid
	 */
	split(time: TimeInSeconds): Clip | null {
		if (!this.contains(time)) {
			return null;
		}

		const splitOffset = time - this.startTime;
		const firstDuration = splitOffset;
		const secondDuration = this.duration - splitOffset;

		// Modify this clip to be the first half
		this.duration = firstDuration;

		// Create new clip for second half
		const secondClip = new Clip({
			trackId: this.trackId,
			buffer: this.buffer,
			startTime: time,
			duration: secondDuration,
			offset: this.offset + splitOffset,
			gain: this.gain,
			fadeIn: 0,
			fadeOut: this.fadeOut
		});

		// Adjust fades
		this.fadeOut = 0;

		return secondClip;
	}

	/**
	 * Clone the clip
	 * @returns New clip with same properties but different ID
	 */
	clone(): Clip {
		return new Clip({
			trackId: this.trackId,
			buffer: this.buffer,
			startTime: this.startTime,
			duration: this.duration,
			offset: this.offset,
			gain: this.gain,
			fadeIn: this.fadeIn,
			fadeOut: this.fadeOut,
			name: `${this.name} (copy)`
		});
	}

	/**
	 * Serialize clip to JSON
	 */
	toJSON() {
		return {
			id: this.id,
			trackId: this.trackId,
			startTime: this.startTime,
			duration: this.duration,
			offset: this.offset,
			gain: this.gain,
			fadeIn: this.fadeIn,
			fadeOut: this.fadeOut,
			name: this.name,
			isLooped: this._isLooped,
			playbackRate: this._playbackRate,
			bufferDuration: this.buffer.duration,
			bufferChannels: this.buffer.numberOfChannels,
			bufferSampleRate: this.buffer.sampleRate
		};
	}

	/**
	 * Generate a unique ID
	 */
	private generateId(): UUID {
		return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}
