/**
 * Error Handling - DAWG AI Audio Engine
 * Custom error types and error codes
 * @module audio/errors
 */

/**
 * Error codes for audio engine operations
 */
export enum ErrorCode {
	// Initialization errors
	NOT_INITIALIZED = 'NOT_INITIALIZED',
	ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',

	// Audio context errors
	AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
	AUDIO_CONTEXT_SUSPENDED = 'AUDIO_CONTEXT_SUSPENDED',
	AUDIO_CONTEXT_CLOSED = 'AUDIO_CONTEXT_CLOSED',

	// Track errors
	TRACK_NOT_FOUND = 'TRACK_NOT_FOUND',
	TRACK_ALREADY_EXISTS = 'TRACK_ALREADY_EXISTS',
	INVALID_TRACK_TYPE = 'INVALID_TRACK_TYPE',

	// Clip errors
	CLIP_NOT_FOUND = 'CLIP_NOT_FOUND',
	INVALID_CLIP_DATA = 'INVALID_CLIP_DATA',

	// Effect errors
	EFFECT_NOT_FOUND = 'EFFECT_NOT_FOUND',
	INVALID_EFFECT_TYPE = 'INVALID_EFFECT_TYPE',

	// Recording errors
	RECORDING_NOT_STARTED = 'RECORDING_NOT_STARTED',
	RECORDING_ALREADY_STARTED = 'RECORDING_ALREADY_STARTED',
	MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',

	// Parameter errors
	INVALID_PARAMETER = 'INVALID_PARAMETER',
	PARAMETER_OUT_OF_RANGE = 'PARAMETER_OUT_OF_RANGE',

	// Buffer errors
	BUFFER_DECODE_ERROR = 'BUFFER_DECODE_ERROR',
	BUFFER_NOT_FOUND = 'BUFFER_NOT_FOUND',

	// Network errors
	NETWORK_ERROR = 'NETWORK_ERROR',
	FILE_LOAD_ERROR = 'FILE_LOAD_ERROR',

	// Export errors
	EXPORT_ERROR = 'EXPORT_ERROR',
	UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',

	// General errors
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	OPERATION_FAILED = 'OPERATION_FAILED'
}

/**
 * Base error class for Audio Engine
 */
export class AudioEngineError extends Error {
	public readonly code: ErrorCode;
	public readonly timestamp: number;

	constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR) {
		super(message);
		this.name = 'AudioEngineError';
		this.code = code;
		this.timestamp = Date.now();

		// Maintains proper stack trace for where error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AudioEngineError);
		}
	}

	/**
	 * Convert error to JSON for logging/serialization
	 */
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			timestamp: this.timestamp,
			stack: this.stack
		};
	}
}

/**
 * Track-specific error
 */
export class TrackError extends AudioEngineError {
	public readonly trackId?: string;

	constructor(message: string, code: ErrorCode, trackId?: string) {
		super(message, code);
		this.name = 'TrackError';
		this.trackId = trackId;
	}
}

/**
 * Effect-specific error
 */
export class EffectError extends AudioEngineError {
	public readonly effectId?: string;

	constructor(message: string, code: ErrorCode, effectId?: string) {
		super(message, code);
		this.name = 'EffectError';
		this.effectId = effectId;
	}
}

/**
 * Recording-specific error
 */
export class RecordingError extends AudioEngineError {
	constructor(message: string, code: ErrorCode) {
		super(message, code);
		this.name = 'RecordingError';
	}
}

/**
 * Buffer-specific error
 */
export class BufferError extends AudioEngineError {
	constructor(message: string, code: ErrorCode) {
		super(message, code);
		this.name = 'BufferError';
	}
}

/**
 * Type guard to check if error is AudioEngineError
 */
export function isAudioEngineError(error: unknown): error is AudioEngineError {
	return error instanceof AudioEngineError;
}

/**
 * Helper function to create error from unknown error
 */
export function createAudioEngineError(error: unknown): AudioEngineError {
	if (isAudioEngineError(error)) {
		return error;
	}

	if (error instanceof Error) {
		return new AudioEngineError(error.message, ErrorCode.UNKNOWN_ERROR);
	}

	return new AudioEngineError(String(error), ErrorCode.UNKNOWN_ERROR);
}
