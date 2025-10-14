/**
 * @dawg-ai/track-manager
 *
 * Track management system for DAWG AI
 * UI and logic for creating, organizing, and controlling audio/MIDI tracks
 *
 * @module @dawg-ai/track-manager
 */

// Components
export { TrackList } from './components/TrackList';
export { TrackHeader } from './components/TrackHeader';
export { TrackMeter } from './components/TrackMeter';
export { AddTrackButton } from './components/AddTrackButton';

// Store
export { useTrackStore } from './stores/track-store';
export { default as useTrackStoreDefault } from './stores/track-store';

// Types
export type {
  TrackState,
  TrackStore,
  EffectState,
  SendState,
  TrackTemplate,
  TrackCreateOptions,
} from './types/track';
