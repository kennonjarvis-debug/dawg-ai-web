/**
 * Track Manager Service
 * Core business logic for track CRUD operations
 */

import {
  TrackState,
  TrackType,
  CreateTrackRequest,
  UpdateTrackRequest,
  ProjectState,
  TrackUpdateEvent,
} from '../types/track.js';
import { EventEmitter } from 'events';

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52BE80'
];

export class TrackManager extends EventEmitter {
  private tracks: Map<string, TrackState> = new Map();
  private soloedTracks: Set<string> = new Set();
  private selectedTrackId: string | null = null;
  private trackOrder: string[] = [];

  constructor() {
    super();
  }

  /**
   * Create a new track
   */
  createTrack(request: CreateTrackRequest): TrackState {
    const id = this.generateId();
    const trackNumber = this.tracks.size + 1;
    const color = request.color || this.getNextColor();
    const name = request.name || `${request.type === 'audio' ? 'Audio' : 'MIDI'} ${trackNumber}`;

    const track: TrackState = {
      id,
      type: request.type,
      name,
      color,
      volume: 0, // 0 dB (unity gain)
      pan: 0, // Center
      mute: false,
      solo: false,
      armed: false,
      meter: 0,
      effects: [],
      sends: [],
      order: this.trackOrder.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tracks.set(id, track);
    this.trackOrder.push(id);

    // Emit event
    this.emitEvent({
      type: 'track:created',
      trackId: id,
      data: track,
      timestamp: Date.now(),
    });

    return track;
  }

  /**
   * Get track by ID
   */
  getTrack(id: string): TrackState | undefined {
    return this.tracks.get(id);
  }

  /**
   * Get all tracks in order
   */
  getAllTracks(): TrackState[] {
    return this.trackOrder
      .map(id => this.tracks.get(id))
      .filter((track): track is TrackState => track !== undefined);
  }

  /**
   * Update track properties
   */
  updateTrack(id: string, updates: UpdateTrackRequest): TrackState | null {
    const track = this.tracks.get(id);
    if (!track) {
      return null;
    }

    // Apply updates
    const updatedTrack: TrackState = {
      ...track,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Handle solo logic
    if (updates.solo !== undefined) {
      if (updates.solo) {
        this.soloedTracks.add(id);
      } else {
        this.soloedTracks.delete(id);
      }

      // Auto-mute other tracks when soloing
      this.applySoloMuteLogic();
    }

    this.tracks.set(id, updatedTrack);

    // Emit event
    this.emitEvent({
      type: 'track:updated',
      trackId: id,
      data: updatedTrack,
      timestamp: Date.now(),
    });

    return updatedTrack;
  }

  /**
   * Delete track
   */
  deleteTrack(id: string): boolean {
    const track = this.tracks.get(id);
    if (!track) {
      return false;
    }

    this.tracks.delete(id);
    this.trackOrder = this.trackOrder.filter(tid => tid !== id);
    this.soloedTracks.delete(id);

    if (this.selectedTrackId === id) {
      this.selectedTrackId = null;
    }

    // Reorder remaining tracks
    this.reindexTracks();

    // Emit event
    this.emitEvent({
      type: 'track:deleted',
      trackId: id,
      data: { id },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Duplicate track
   */
  duplicateTrack(id: string): TrackState | null {
    const original = this.tracks.get(id);
    if (!original) {
      return null;
    }

    const newTrack = this.createTrack({
      type: original.type,
      name: `${original.name} (Copy)`,
      color: original.color,
    });

    // Copy settings
    this.updateTrack(newTrack.id, {
      volume: original.volume,
      pan: original.pan,
      // Effects and sends would be copied here in full implementation
    });

    return this.tracks.get(newTrack.id) || null;
  }

  /**
   * Reorder tracks
   */
  reorderTracks(newOrder: string[]): boolean {
    // Validate all track IDs exist
    if (newOrder.length !== this.tracks.size) {
      return false;
    }

    for (const id of newOrder) {
      if (!this.tracks.has(id)) {
        return false;
      }
    }

    this.trackOrder = newOrder;
    this.reindexTracks();

    // Emit event
    this.emitEvent({
      type: 'track:reordered',
      data: { order: newOrder },
      timestamp: Date.now(),
    });

    return true;
  }

  /**
   * Update track meter level (for real-time audio metering)
   */
  updateMeter(id: string, level: number): void {
    const track = this.tracks.get(id);
    if (!track) {
      return;
    }

    track.meter = Math.max(0, Math.min(1, level));
    track.updatedAt = new Date().toISOString();

    // Emit meter update (throttled in real implementation)
    this.emitEvent({
      type: 'track:meter',
      trackId: id,
      data: { level, trackId: id },
      timestamp: Date.now(),
    });
  }

  /**
   * Get current project state
   */
  getProjectState(): ProjectState {
    const tracksObject: Record<string, TrackState> = {};
    this.tracks.forEach((track, id) => {
      tracksObject[id] = track;
    });

    return {
      tracks: tracksObject,
      soloedTracks: Array.from(this.soloedTracks),
      selectedTrackId: this.selectedTrackId,
    };
  }

  /**
   * Load project state (for project load functionality)
   */
  loadProjectState(state: ProjectState): void {
    this.tracks.clear();
    this.trackOrder = [];
    this.soloedTracks = new Set(state.soloedTracks);
    this.selectedTrackId = state.selectedTrackId;

    // Load tracks
    const trackArray = Object.values(state.tracks).sort((a, b) => a.order - b.order);

    for (const track of trackArray) {
      this.tracks.set(track.id, track);
      this.trackOrder.push(track.id);
    }
  }

  /**
   * Clear all tracks (for new project)
   */
  clear(): void {
    this.tracks.clear();
    this.trackOrder = [];
    this.soloedTracks.clear();
    this.selectedTrackId = null;
  }

  // Private helper methods

  private generateId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextColor(): string {
    const index = this.tracks.size % DEFAULT_COLORS.length;
    return DEFAULT_COLORS[index];
  }

  private reindexTracks(): void {
    this.trackOrder.forEach((id, index) => {
      const track = this.tracks.get(id);
      if (track) {
        track.order = index;
      }
    });
  }

  private applySoloMuteLogic(): void {
    if (this.soloedTracks.size === 0) {
      // No tracks soloed - unmute all
      this.tracks.forEach(track => {
        if (track.solo) {
          track.solo = false;
        }
      });
      return;
    }

    // Tracks are soloed - ensure solo state is correct
    this.tracks.forEach((track, id) => {
      track.solo = this.soloedTracks.has(id);
    });
  }

  private emitEvent(event: TrackUpdateEvent): void {
    this.emit('track-event', event);
  }
}

// Singleton instance for the API
export const trackManager = new TrackManager();
