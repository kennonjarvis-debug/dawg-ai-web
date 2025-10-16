/**
 * Audio Engine Core - DAWG AI
 * Main exports for Module 2
 * @module audio
 */

// Core engine
export { AudioEngine, getAudioEngine } from './AudioEngine';
export type { AudioEngineConfig } from './AudioEngine';

// Track management
export { Track } from './Track';
export type { TrackConfig } from './Track';

// Clip management
export { Clip } from './Clip';
export type { ClipConfig } from './Clip';

// Master bus
export { MasterBus } from './MasterBus';
export type { MasterBusConfig, MeterData, MasterBusDebugInfo } from './MasterBus';

// Buffer pool
export { BufferPool, getGlobalBufferPool, setGlobalBufferPool } from './BufferPool';
export type { BufferPoolConfig } from './BufferPool';

// Effects
export { Effect } from './effects/Effect';
export type { EffectParameter, EffectConfig } from './effects/Effect';
export { EffectsRack } from './effects/EffectsRack';
export { EQ } from './effects/EQ';
export { Compressor } from './effects/Compressor';
export { Reverb } from './effects/Reverb';
export { Delay } from './effects/Delay';
export { Limiter } from './effects/Limiter';
export { Gate } from './effects/Gate';
export { Distortion } from './effects/Distortion';
export type { DistortionType } from './effects/Distortion';
export { Chorus } from './effects/Chorus';
export { Phaser } from './effects/Phaser';
export { Filter } from './effects/Filter';
export type { FilterType } from './effects/Filter';

// Preset Management
export { PresetManager, getPresetManager } from './effects/PresetManager';
export type { EffectPreset, PresetCategory } from './effects/PresetManager';

// MIDI
export { MIDIClip } from './midi/MIDIClip';
export type { MIDIClipConfig } from './midi/MIDIClip';
export { MIDIManager, getMIDIManager } from './midi/MIDIManager';
export type {
	MIDINote,
	MIDIControlChange,
	MIDIPitchBend,
	MIDIProgramChange,
	MIDIEvent,
	MIDIClipData,
	QuantizeGrid,
	QuantizeOptions,
	MIDIRecordingState,
	MIDIInputConfig,
	MIDIInstrumentType,
	MIDIInstrumentConfig
} from './midi/types';
export {
	quantizeNotes,
	humanizeNotes,
	makeNotesLegato,
	makeNotesStaccato,
	gridToSeconds,
	quantizeTime,
	applyGroove,
	GROOVE_PRESETS
} from './midi/quantize';
export {
	copySelectedNotes,
	cutSelectedNotes,
	pasteNotes,
	duplicateNotesMultiple,
	stretchSelectedNotes,
	reverseSelectedNotes,
	arpeggiateSelectedNotes,
	rampVelocity,
	randomizeVelocity,
	mergeOverlappingNotes,
	splitLongNotes,
	createCCRamp,
	removeDuplicateNotes,
	hasClipboardContent,
	clearClipboard
} from './midi/editing';

// Utilities
export * from './utils/audioUtils';
export * from './utils/meterUtils';

// Error handling
export {
	AudioEngineError,
	TrackError,
	EffectError,
	RecordingError,
	BufferError,
	ErrorCode,
	isAudioEngineError,
	createAudioEngineError
} from './errors';
