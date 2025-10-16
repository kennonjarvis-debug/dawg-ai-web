/**
 * Automation - DAWG AI Audio Engine
 * Parameter automation system for effects and tracks
 * @module audio/automation/Automation
 */

import type { UUID } from '../../types/core';

/**
 * Automation point - represents a value at a specific time
 */
export interface AutomationPoint {
	time: number; // Time in seconds
	value: number; // Parameter value
}

/**
 * Automation curve type
 */
export type AutomationCurveType = 'linear' | 'exponential' | 'step';

/**
 * Automation lane - stores automation data for a single parameter
 */
export interface AutomationLane {
	id: UUID;
	targetId: UUID; // Effect or track ID
	parameterName: string;
	points: AutomationPoint[];
	curveType: AutomationCurveType;
	enabled: boolean;
}

/**
 * Automation class - Manages parameter automation
 */
export class Automation {
	private lanes: Map<UUID, AutomationLane>;
	private recording: boolean = false;
	private recordingLaneId: UUID | null = null;

	constructor() {
		this.lanes = new Map();
	}

	/**
	 * Create a new automation lane
	 */
	createLane(
		targetId: UUID,
		parameterName: string,
		curveType: AutomationCurveType = 'linear'
	): UUID {
		const id = this.generateId();

		const lane: AutomationLane = {
			id,
			targetId,
			parameterName,
			points: [],
			curveType,
			enabled: true
		};

		this.lanes.set(id, lane);
		return id;
	}

	/**
	 * Add an automation point
	 */
	addPoint(laneId: UUID, time: number, value: number): void {
		const lane = this.lanes.get(laneId);
		if (!lane) {
			throw new Error(`Automation lane ${laneId} not found`);
		}

		// Insert point in chronological order
		const point: AutomationPoint = { time, value };
		const insertIndex = lane.points.findIndex((p) => p.time > time);

		if (insertIndex === -1) {
			lane.points.push(point);
		} else if (lane.points[insertIndex]?.time === time) {
			// Replace existing point at same time
			lane.points[insertIndex] = point;
		} else {
			lane.points.splice(insertIndex, 0, point);
		}
	}

	/**
	 * Remove an automation point
	 */
	removePoint(laneId: UUID, time: number, tolerance: number = 0.001): void {
		const lane = this.lanes.get(laneId);
		if (!lane) return;

		const index = lane.points.findIndex((p) => Math.abs(p.time - time) < tolerance);
		if (index !== -1) {
			lane.points.splice(index, 1);
		}
	}

	/**
	 * Remove all points in a time range
	 */
	removePointsInRange(laneId: UUID, startTime: number, endTime: number): void {
		const lane = this.lanes.get(laneId);
		if (!lane) return;

		lane.points = lane.points.filter((p) => p.time < startTime || p.time > endTime);
	}

	/**
	 * Get interpolated value at a specific time
	 */
	getValueAtTime(laneId: UUID, time: number): number | null {
		const lane = this.lanes.get(laneId);
		if (!lane || !lane.enabled || lane.points.length === 0) {
			return null;
		}

		// Find surrounding points
		let beforePoint: AutomationPoint | null = null;
		let afterPoint: AutomationPoint | null = null;

		for (let i = 0; i < lane.points.length; i++) {
			const point = lane.points[i];
			if (point.time <= time) {
				beforePoint = point;
			}
			if (point.time >= time && !afterPoint) {
				afterPoint = point;
				break;
			}
		}

		// No points before current time
		if (!beforePoint) {
			return afterPoint ? afterPoint.value : null;
		}

		// No points after current time
		if (!afterPoint) {
			return beforePoint.value;
		}

		// Exact match
		if (beforePoint.time === time) {
			return beforePoint.value;
		}

		// Interpolate between points
		return this.interpolate(beforePoint, afterPoint, time, lane.curveType);
	}

	/**
	 * Interpolate between two points
	 */
	private interpolate(
		p1: AutomationPoint,
		p2: AutomationPoint,
		time: number,
		curveType: AutomationCurveType
	): number {
		const t = (time - p1.time) / (p2.time - p1.time);

		switch (curveType) {
			case 'linear':
				return p1.value + (p2.value - p1.value) * t;

			case 'exponential':
				// Exponential interpolation (useful for frequency, volume)
				if (p1.value <= 0 || p2.value <= 0) {
					// Fall back to linear for non-positive values
					return p1.value + (p2.value - p1.value) * t;
				}
				const ratio = p2.value / p1.value;
				return p1.value * Math.pow(ratio, t);

			case 'step':
				// Step (hold previous value until next point)
				return p1.value;

			default:
				return p1.value + (p2.value - p1.value) * t;
		}
	}

	/**
	 * Start recording automation
	 */
	startRecording(laneId: UUID): void {
		const lane = this.lanes.get(laneId);
		if (!lane) {
			throw new Error(`Automation lane ${laneId} not found`);
		}

		this.recording = true;
		this.recordingLaneId = laneId;

		// Clear existing points in recording mode (optional - could be configurable)
		// lane.points = [];
	}

	/**
	 * Stop recording automation
	 */
	stopRecording(): void {
		this.recording = false;
		this.recordingLaneId = null;
	}

	/**
	 * Record automation point (called during playback)
	 */
	recordPoint(time: number, value: number): void {
		if (!this.recording || !this.recordingLaneId) return;

		this.addPoint(this.recordingLaneId, time, value);
	}

	/**
	 * Is currently recording
	 */
	isRecording(): boolean {
		return this.recording;
	}

	/**
	 * Get recording lane ID
	 */
	getRecordingLaneId(): UUID | null {
		return this.recordingLaneId;
	}

	/**
	 * Get all lanes for a target (effect or track)
	 */
	getLanesForTarget(targetId: UUID): AutomationLane[] {
		return Array.from(this.lanes.values()).filter((lane) => lane.targetId === targetId);
	}

	/**
	 * Get lane by ID
	 */
	getLane(laneId: UUID): AutomationLane | undefined {
		return this.lanes.get(laneId);
	}

	/**
	 * Get all lanes
	 */
	getAllLanes(): AutomationLane[] {
		return Array.from(this.lanes.values());
	}

	/**
	 * Delete a lane
	 */
	deleteLane(laneId: UUID): void {
		this.lanes.delete(laneId);
	}

	/**
	 * Enable/disable a lane
	 */
	setLaneEnabled(laneId: UUID, enabled: boolean): void {
		const lane = this.lanes.get(laneId);
		if (lane) {
			lane.enabled = enabled;
		}
	}

	/**
	 * Set curve type for a lane
	 */
	setCurveType(laneId: UUID, curveType: AutomationCurveType): void {
		const lane = this.lanes.get(laneId);
		if (lane) {
			lane.curveType = curveType;
		}
	}

	/**
	 * Apply automation to an AudioParam in offline context
	 */
	applyToOfflineParam(
		laneId: UUID,
		param: AudioParam,
		offlineContext: OfflineAudioContext,
		startTime: number = 0,
		endTime?: number
	): void {
		const lane = this.lanes.get(laneId);
		if (!lane || !lane.enabled || lane.points.length === 0) return;

		const duration = endTime || offlineContext.length / offlineContext.sampleRate;

		// Set automation points
		for (const point of lane.points) {
			if (point.time >= startTime && point.time <= duration) {
				const offsetTime = point.time - startTime;
				param.setValueAtTime(point.value, offsetTime);
			}
		}
	}

	/**
	 * Apply automation to a Tone.js Signal in realtime
	 */
	applyToRealtimeParam(laneId: UUID, param: any, currentTime: number): void {
		const value = this.getValueAtTime(laneId, currentTime);
		if (value !== null) {
			if (param.value !== undefined) {
				param.value = value;
			} else {
				param.setValueAtTime(value, currentTime);
			}
		}
	}

	/**
	 * Serialize to JSON
	 */
	toJSON(): any {
		return {
			lanes: Array.from(this.lanes.values())
		};
	}

	/**
	 * Load from JSON
	 */
	fromJSON(data: any): void {
		this.lanes.clear();

		if (data.lanes) {
			for (const lane of data.lanes) {
				this.lanes.set(lane.id, lane);
			}
		}
	}

	/**
	 * Generate unique ID
	 */
	private generateId(): UUID {
		return `automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Clear all automation data
	 */
	clear(): void {
		this.lanes.clear();
		this.recording = false;
		this.recordingLaneId = null;
	}
}
