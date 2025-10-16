/**
 * Track Manager Types
 * Based on API_CONTRACTS.md
 */

import type { UUID, Color, Decibels, TimeInSeconds } from '../types/core';

export type TrackType = 'audio' | 'midi' | 'aux' | 'folder';

export type TrackHeight = 'collapsed' | 'small' | 'medium' | 'large';

export interface TrackData {
  id: UUID;
  name: string;
  type: TrackType;
  color: Color;
  icon?: string;
  order: number;
  height: TrackHeight;
  parentId?: UUID; // For folder grouping
  settings: TrackSettings;
  clips: Clip[];
}

export interface TrackSettings {
  volume: Decibels;
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  recordArm: boolean;
  monitor: boolean;
  frozen: boolean;
  input: string;
  output: string;
}

export interface Clip {
  id: UUID;
  trackId: UUID;
  name: string;
  startTime: TimeInSeconds;
  duration: TimeInSeconds;
  offset: TimeInSeconds; // Offset into the source audio
  gain: number; // 0-1
  fadeIn: TimeInSeconds;
  fadeOut: TimeInSeconds;
  color?: Color;
  // For audio clips
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  // For MIDI clips
  midiNotes?: MIDINote[];
}

export interface MIDINote {
  id: UUID;
  pitch: number; // 0-127
  velocity: number; // 0-127
  time: TimeInSeconds;
  duration: TimeInSeconds;
}

export interface TrackAutomation {
  trackId: UUID;
  parameter: string; // e.g., 'volume', 'pan', 'effect.reverb.mix'
  points: AutomationPoint[];
}

export interface AutomationPoint {
  time: TimeInSeconds;
  value: number;
  curve?: 'linear' | 'exponential' | 'logarithmic';
}
