/**
 * Comp Engine Types - DAWG AI Audio Engine
 * Type definitions for automatic comping system
 * @module audio/comp/types
 */

import type { UUID } from '../../types/core';
import type { Take } from '../recording/types';

/**
 * Comp options
 */
export interface CompOptions {
	region: { startBar: number; endBar: number };
	trackId: string;
	method: 'auto' | 'manual';
}

/**
 * Comp segment - represents which take was selected for a specific region
 */
export interface CompSegment {
	takeId: UUID;
	startBar: number;
	endBar: number;
	score: number;
	reason: string; // "Best timing" / "Cleanest signal" / "No clipping"
}

/**
 * Crossfade between segments
 */
export interface Crossfade {
	bar: number;
	durationMs: number;
	type: 'equal-power' | 'linear';
}

/**
 * Complete comp result
 */
export interface CompResult {
	compTrackId: UUID;
	segments: CompSegment[];
	crossfades: Crossfade[];
	totalSegments: number;
	averageScore: number;
}

/**
 * Segment score breakdown for debugging
 */
export interface SegmentScore {
	takeId: UUID;
	segment: { startBar: number; endBar: number };
	timingScore: number; // 0-1 (1 = perfect timing)
	qualityScore: number; // 0-1 (1 = perfect quality)
	clippingScore: number; // 0-1 (1 = no clipping)
	totalScore: number; // Weighted average
	reason: string;
}

/**
 * Manual segment selection
 */
export interface ManualSegment {
	takeId: UUID;
	startBar: number;
	endBar: number;
}

/**
 * Comp engine configuration
 */
export interface CompEngineConfig {
	segmentSizeBeats: number; // Segment granularity (default: 4 = 1 bar)
	crossfadeDurationMs: number; // Duration of crossfades (default: 20ms)
	clippingThresholdDb: number; // Threshold for clipping detection (default: -0.5dB)

	// Scoring weights (must sum to 1.0)
	timingWeight: number; // Default: 0.4
	qualityWeight: number; // Default: 0.4
	clippingWeight: number; // Default: 0.2
}

/**
 * Default comp engine configuration
 */
export const DEFAULT_COMP_CONFIG: CompEngineConfig = {
	segmentSizeBeats: 4, // 1 bar
	crossfadeDurationMs: 20,
	clippingThresholdDb: -0.5,
	timingWeight: 0.4,
	qualityWeight: 0.4,
	clippingWeight: 0.2,
};
