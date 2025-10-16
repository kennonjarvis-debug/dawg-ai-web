/**
 * Recording Types - DAWG AI Audio Engine
 * Type definitions for recording system
 * @module audio/recording/types
 */

import type { UUID } from '../../types/core';

/**
 * Recording options
 */
export interface RecordingOptions {
	bars: number;
	trackName?: string;
	countInBars?: number;
	metronomeVolume?: number;
}

/**
 * Take metrics
 */
export interface TakeMetrics {
	peakDb: number;
	rmsDb: number;
	snr: number; // Signal-to-noise ratio
	timingErrorMs: number;
}

/**
 * Take data
 */
export interface Take {
	id: UUID;
	passIndex: number;
	startBar: number;
	endBar: number;
	clip: AudioBuffer;
	metrics: TakeMetrics;
	timestamp: Date;
}

/**
 * Recording state
 */
export type RecordingState = 'idle' | 'counting-in' | 'recording' | 'processing';

/**
 * Count-in state
 */
export interface CountInState {
	bar: number;
	beat: number;
}
