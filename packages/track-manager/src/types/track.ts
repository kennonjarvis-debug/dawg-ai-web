/**
 * Track Manager Type Definitions
 *
 * Defines interfaces and types for track management system
 */

/**
 * Effect state in track
 */
export interface EffectState {
  id: string;
  type: string;
  enabled: boolean;
  params: Record<string, unknown>;
}

/**
 * Send state (routing to send bus)
 */
export interface SendState {
  busName: string;
  amount: number; // 0-1
}

/**
 * Individual track state
 */
export interface TrackState {
  id: string;
  type: 'audio' | 'midi';
  name: string;
  color: string;
  volume: number; // dB
  pan: number; // -1 to 1
  mute: boolean;
  solo: boolean;
  armed: boolean;
  meter: number; // Current level 0-1
  effects: EffectState[];
  sends: SendState[];
}

/**
 * Track store state and actions
 */
export interface TrackStore {
  tracks: Map<string, TrackState>;
  selectedTrackId: string | null;
  soloedTracks: Set<string>;

  // Actions
  addTrack: (type: 'audio' | 'midi', name?: string) => string;
  removeTrack: (id: string) => void;
  duplicateTrack: (id: string) => string;

  selectTrack: (id: string) => void;

  setTrackName: (id: string, name: string) => void;
  setTrackColor: (id: string, color: string) => void;
  setTrackVolume: (id: string, volume: number) => void;
  setTrackPan: (id: string, pan: number) => void;

  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
  toggleArm: (id: string) => void;

  reorderTracks: (fromIndex: number, toIndex: number) => void;

  updateMeter: (id: string, level: number) => void;

  // Effect management
  addEffect: (trackId: string, effect: EffectState) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  updateEffect: (trackId: string, effectId: string, params: Record<string, unknown>) => void;

  // Send management
  addSend: (trackId: string, busName: string, amount: number) => void;
  removeSend: (trackId: string, busName: string) => void;
  updateSend: (trackId: string, busName: string, amount: number) => void;
}

/**
 * Track template for save/load
 */
export interface TrackTemplate {
  name: string;
  type: 'audio' | 'midi';
  color: string;
  effects: EffectState[];
  sends: SendState[];
  description?: string;
}

/**
 * Track creation options
 */
export interface TrackCreateOptions {
  type: 'audio' | 'midi';
  name?: string;
  color?: string;
  template?: TrackTemplate;
}
