/**
 * Track Manager Store
 * Singleton store for global track management
 */

import { writable, derived } from 'svelte/store';
import { TrackManager } from './TrackManager';
import { AudioEngine } from '../audio/AudioEngine';
import type { TrackData } from './types';

// Initialize audio engine (will be replaced with actual instance)
let audioEngineInstance: AudioEngine;

// Lazy initialization
function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = AudioEngine.getInstance({
      sampleRate: 48000,
      latencyHint: 'interactive',
      lookAhead: 0.1
    });
  }
  return audioEngineInstance;
}

// Create track manager instance
export const trackManager = new TrackManager(getAudioEngine());

// Export stores for reactive components
export const tracks = trackManager.tracks;
export const trackOrder = trackManager.trackOrder;
export const selectedTrackId = trackManager.selectedTrackId;
export const selectedClipIds = trackManager.selectedClipIds;

// Derived stores
export const orderedTracks = derived(
  [tracks, trackOrder],
  ([$tracks, $trackOrder]) => {
    return $trackOrder
      .map(id => $tracks.get(id))
      .filter(Boolean) as TrackData[];
  }
);

export const selectedTrack = derived(
  [tracks, selectedTrackId],
  ([$tracks, $selectedTrackId]) => {
    if (!$selectedTrackId) return null;
    return $tracks.get($selectedTrackId) || null;
  }
);

export const hasSelectedTrack = derived(
  selectedTrackId,
  $selectedTrackId => $selectedTrackId !== null
);

export const trackCount = derived(
  tracks,
  $tracks => $tracks.size
);

// Helper functions
export function createTrack(type: TrackData['type'], name?: string) {
  return trackManager.createTrack(type, name);
}

export function deleteTrack(id: string) {
  trackManager.deleteTrack(id);
}

export function selectTrack(id: string) {
  trackManager.selectTrack(id);
}

export function updateTrackSettings(id: string, settings: Partial<TrackData['settings']>) {
  trackManager.updateTrackSettings(id, settings);
}
