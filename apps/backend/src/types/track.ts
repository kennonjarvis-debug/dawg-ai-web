/**
 * Track Types for DAWG AI - Module 3: Track Manager
 * Based on DAWG_AI_COMPLETE_PROMPTS.md specification
 */

export type TrackType = 'audio' | 'midi';

export interface SendState {
  sendId: string;
  sendName: string;
  amount: number; // 0 to 1
}

export interface EffectState {
  id: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface TrackState {
  id: string;
  type: TrackType;
  name: string;
  color: string;
  volume: number; // dB (-60 to +12)
  pan: number; // -1 (left) to 1 (right)
  mute: boolean;
  solo: boolean;
  armed: boolean;
  meter: number; // Current audio level (0 to 1)
  effects: EffectState[];
  sends: SendState[];
  order: number; // Track position in list
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackRequest {
  type: TrackType;
  name?: string;
  color?: string;
}

export interface UpdateTrackRequest {
  name?: string;
  color?: string;
  volume?: number;
  pan?: number;
  mute?: boolean;
  solo?: boolean;
  armed?: boolean;
  order?: number;
}

export interface ReorderTracksRequest {
  trackIds: string[]; // New order of track IDs
}

export interface DuplicateTrackResponse {
  originalId: string;
  newId: string;
  track: TrackState;
}

export interface TrackMeterUpdate {
  trackId: string;
  level: number;
  timestamp: number;
}

export interface TrackUpdateEvent {
  type: 'track:created' | 'track:updated' | 'track:deleted' | 'track:reordered' | 'track:meter';
  trackId?: string;
  data: any;
  timestamp: number;
}

export interface ProjectState {
  tracks: Record<string, TrackState>;
  soloedTracks: string[];
  selectedTrackId: string | null;
}
