/**
 * Command Schema - Zod-validated DAW commands
 * Instance 2: Jarvis AI Brain + NLU
 */

import { z } from 'zod';

/**
 * Beat Commands
 */
export const BeatLoadCommand = z.object({
  type: z.literal('beat.load'),
  query: z.string().optional(),
  styleTags: z.array(z.string()).optional(),
  bpm: z.number().min(60).max(200).optional(),
  mood: z.array(z.string()).optional(),
  key: z.string().optional()
});

export const BeatGenerateCommand = z.object({
  type: z.literal('beat.generate'),
  style: z.string(),
  bpm: z.number().min(60).max(200),
  bars: z.number().min(1).max(64).default(8),
  key: z.string().optional(),
  mood: z.string().optional()
});

export const BeatPreviewCommand = z.object({
  type: z.literal('beat.preview'),
  beatId: z.string(),
  candidateIndex: z.number().optional()
});

export const BeatAcceptCommand = z.object({
  type: z.literal('beat.accept'),
  beatId: z.string(),
  candidateIndex: z.number().optional()
});

/**
 * Transport Commands
 */
export const TransportPlayCommand = z.object({
  type: z.literal('transport.play')
});

export const TransportPauseCommand = z.object({
  type: z.literal('transport.pause')
});

export const TransportStopCommand = z.object({
  type: z.literal('transport.stop')
});

export const TransportRecordCommand = z.object({
  type: z.literal('transport.record'),
  bars: z.number().min(1).max(64).default(16),
  countIn: z.number().min(0).max(4).default(1),
  loop: z.boolean().default(true),
  maxTakes: z.number().min(1).max(10).default(4)
});

export const TransportSetTempoCommand = z.object({
  type: z.literal('transport.setTempo'),
  bpm: z.number().min(60).max(200)
});

export const TransportSetLoopCommand = z.object({
  type: z.literal('transport.setLoop'),
  enabled: z.boolean(),
  startBar: z.number().optional(),
  endBar: z.number().optional()
});

/**
 * Track Commands
 */
export const TrackCreateCommand = z.object({
  type: z.literal('track.create'),
  name: z.string(),
  trackType: z.enum(['audio', 'midi', 'instrument']),
  instrument: z.string().optional()
});

export const TrackMuteCommand = z.object({
  type: z.literal('track.mute'),
  trackId: z.string(),
  muted: z.boolean()
});

export const TrackSoloCommand = z.object({
  type: z.literal('track.solo'),
  trackId: z.string(),
  soloed: z.boolean()
});

export const TrackVolumeCommand = z.object({
  type: z.literal('track.volume'),
  trackId: z.string(),
  volumeDb: z.number().min(-60).max(6)
});

export const TrackPanCommand = z.object({
  type: z.literal('track.pan'),
  trackId: z.string(),
  pan: z.number().min(-1).max(1)
});

export const TrackDeleteCommand = z.object({
  type: z.literal('track.delete'),
  trackId: z.string()
});

/**
 * Comp Commands
 */
export const CompCreateCommand = z.object({
  type: z.literal('comp.create'),
  trackId: z.string(),
  method: z.enum(['auto', 'manual']).default('auto'),
  takes: z.array(z.string()).optional()
});

export const CompSelectSegmentCommand = z.object({
  type: z.literal('comp.selectSegment'),
  compId: z.string(),
  segmentIndex: z.number(),
  takeId: z.string()
});

export const CompFinalizeCommand = z.object({
  type: z.literal('comp.finalize'),
  compId: z.string()
});

/**
 * Effects Commands
 */
export const EffectAddCommand = z.object({
  type: z.literal('effect.add'),
  trackId: z.string(),
  effectType: z.enum(['reverb', 'delay', 'eq', 'compressor', 'distortion', 'chorus', 'phaser', 'filter']),
  preset: z.string().optional()
});

export const EffectRemoveCommand = z.object({
  type: z.literal('effect.remove'),
  trackId: z.string(),
  effectId: z.string()
});

export const EffectUpdateCommand = z.object({
  type: z.literal('effect.update'),
  trackId: z.string(),
  effectId: z.string(),
  parameters: z.record(z.any())
});

export const EffectBypassCommand = z.object({
  type: z.literal('effect.bypass'),
  trackId: z.string(),
  effectId: z.string(),
  bypassed: z.boolean()
});

/**
 * MIDI Commands
 */
export const MidiQuantizeCommand = z.object({
  type: z.literal('midi.quantize'),
  trackId: z.string(),
  division: z.enum(['1/4', '1/8', '1/16', '1/32']).default('1/16'),
  strength: z.number().min(0).max(1).default(1.0)
});

export const MidiTransposeCommand = z.object({
  type: z.literal('midi.transpose'),
  trackId: z.string(),
  semitones: z.number().min(-24).max(24)
});

export const MidiSetVelocityCommand = z.object({
  type: z.literal('midi.setVelocity'),
  trackId: z.string(),
  velocity: z.number().min(0).max(127)
});

/**
 * Project Commands
 */
export const ProjectSaveCommand = z.object({
  type: z.literal('project.save'),
  name: z.string().optional()
});

export const ProjectLoadCommand = z.object({
  type: z.literal('project.load'),
  projectId: z.string()
});

export const ProjectExportCommand = z.object({
  type: z.literal('project.export'),
  format: z.enum(['wav', 'mp3', 'flac']).default('wav'),
  quality: z.enum(['low', 'medium', 'high']).default('high')
});

export const ProjectNewCommand = z.object({
  type: z.literal('project.new'),
  name: z.string(),
  bpm: z.number().min(60).max(200).default(140),
  timeSignature: z.tuple([z.number(), z.number()]).default([4, 4] as [number, number])
});

/**
 * Mix Commands
 */
export const MixAutoLevelCommand = z.object({
  type: z.literal('mix.autoLevel'),
  trackIds: z.array(z.string()).optional()
});

export const MixMasterVolumeCommand = z.object({
  type: z.literal('mix.masterVolume'),
  volumeDb: z.number().min(-60).max(6)
});

/**
 * Utility Commands
 */
export const UndoCommand = z.object({
  type: z.literal('undo')
});

export const RedoCommand = z.object({
  type: z.literal('redo')
});

/**
 * Combined Command Schema (discriminated union)
 */
export const CommandSchema = z.discriminatedUnion('type', [
  // Beat
  BeatLoadCommand,
  BeatGenerateCommand,
  BeatPreviewCommand,
  BeatAcceptCommand,
  // Transport
  TransportPlayCommand,
  TransportPauseCommand,
  TransportStopCommand,
  TransportRecordCommand,
  TransportSetTempoCommand,
  TransportSetLoopCommand,
  // Track
  TrackCreateCommand,
  TrackMuteCommand,
  TrackSoloCommand,
  TrackVolumeCommand,
  TrackPanCommand,
  TrackDeleteCommand,
  // Comp
  CompCreateCommand,
  CompSelectSegmentCommand,
  CompFinalizeCommand,
  // Effects
  EffectAddCommand,
  EffectRemoveCommand,
  EffectUpdateCommand,
  EffectBypassCommand,
  // MIDI
  MidiQuantizeCommand,
  MidiTransposeCommand,
  MidiSetVelocityCommand,
  // Project
  ProjectSaveCommand,
  ProjectLoadCommand,
  ProjectExportCommand,
  ProjectNewCommand,
  // Mix
  MixAutoLevelCommand,
  MixMasterVolumeCommand,
  // Utility
  UndoCommand,
  RedoCommand
]);

/**
 * Type inference from Zod schema
 */
export type Command = z.infer<typeof CommandSchema>;

// Individual command types for type narrowing
export type BeatLoadCommandType = z.infer<typeof BeatLoadCommand>;
export type BeatGenerateCommandType = z.infer<typeof BeatGenerateCommand>;
export type BeatPreviewCommandType = z.infer<typeof BeatPreviewCommand>;
export type BeatAcceptCommandType = z.infer<typeof BeatAcceptCommand>;
export type TransportPlayCommandType = z.infer<typeof TransportPlayCommand>;
export type TransportPauseCommandType = z.infer<typeof TransportPauseCommand>;
export type TransportStopCommandType = z.infer<typeof TransportStopCommand>;
export type TransportRecordCommandType = z.infer<typeof TransportRecordCommand>;
export type TransportSetTempoCommandType = z.infer<typeof TransportSetTempoCommand>;
export type TransportSetLoopCommandType = z.infer<typeof TransportSetLoopCommand>;
export type TrackCreateCommandType = z.infer<typeof TrackCreateCommand>;
export type TrackMuteCommandType = z.infer<typeof TrackMuteCommand>;
export type TrackSoloCommandType = z.infer<typeof TrackSoloCommand>;
export type TrackVolumeCommandType = z.infer<typeof TrackVolumeCommand>;
export type TrackPanCommandType = z.infer<typeof TrackPanCommand>;
export type TrackDeleteCommandType = z.infer<typeof TrackDeleteCommand>;
export type CompCreateCommandType = z.infer<typeof CompCreateCommand>;
export type CompSelectSegmentCommandType = z.infer<typeof CompSelectSegmentCommand>;
export type CompFinalizeCommandType = z.infer<typeof CompFinalizeCommand>;
export type EffectAddCommandType = z.infer<typeof EffectAddCommand>;
export type EffectRemoveCommandType = z.infer<typeof EffectRemoveCommand>;
export type EffectUpdateCommandType = z.infer<typeof EffectUpdateCommand>;
export type EffectBypassCommandType = z.infer<typeof EffectBypassCommand>;
export type MidiQuantizeCommandType = z.infer<typeof MidiQuantizeCommand>;
export type MidiTransposeCommandType = z.infer<typeof MidiTransposeCommand>;
export type MidiSetVelocityCommandType = z.infer<typeof MidiSetVelocityCommand>;
export type ProjectSaveCommandType = z.infer<typeof ProjectSaveCommand>;
export type ProjectLoadCommandType = z.infer<typeof ProjectLoadCommand>;
export type ProjectExportCommandType = z.infer<typeof ProjectExportCommand>;
export type ProjectNewCommandType = z.infer<typeof ProjectNewCommand>;
export type MixAutoLevelCommandType = z.infer<typeof MixAutoLevelCommand>;
export type MixMasterVolumeCommandType = z.infer<typeof MixMasterVolumeCommand>;
export type UndoCommandType = z.infer<typeof UndoCommand>;
export type RedoCommandType = z.infer<typeof RedoCommand>;

/**
 * Command validation helper
 */
export function validateCommand(command: unknown): Command {
  return CommandSchema.parse(command);
}

/**
 * Safe command validation (returns result instead of throwing)
 */
export function safeValidateCommand(command: unknown):
  | { success: true; data: Command }
  | { success: false; error: z.ZodError } {
  const result = CommandSchema.safeParse(command);
  return result;
}
