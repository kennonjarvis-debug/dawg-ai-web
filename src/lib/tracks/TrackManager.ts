/**
 * TrackManager - Core track management system
 * Handles track creation, deletion, organization, and settings
 * Based on API_CONTRACTS.md Module 3
 */

import { writable, derived, type Writable, get } from 'svelte/store';
import type { AudioEngine } from '../audio/AudioEngine';
import type { TrackData, TrackSettings, TrackType, Clip } from './types';
import type { UUID, Color } from '../types/core';

export class TrackManager {
  private audioEngine: AudioEngine;

  // Svelte stores for reactive UI
  public tracks: Writable<Map<UUID, TrackData>>;
  public trackOrder: Writable<UUID[]>;
  public selectedTrackId: Writable<UUID | null>;
  public selectedClipIds: Writable<Set<UUID>>;

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
    this.tracks = writable(new Map());
    this.trackOrder = writable([]);
    this.selectedTrackId = writable(null);
    this.selectedClipIds = writable(new Set());
  }

  /**
   * Create a new track
   */
  createTrack(type: TrackType, name?: string): TrackData {
    const id = this.generateId();
    const defaultColors = this.getDefaultColors();
    const colorIndex = get(this.trackOrder).length % defaultColors.length;

    const trackData: TrackData = {
      id,
      name: name || `${this.capitalizeFirst(type)} ${get(this.trackOrder).length + 1}`,
      type,
      color: defaultColors[colorIndex],
      order: get(this.trackOrder).length,
      height: 'medium',
      clips: [],
      settings: {
        volume: 0,
        pan: 0,
        mute: false,
        solo: false,
        recordArm: false,
        monitor: false,
        frozen: false,
        input: 'default',
        output: 'master'
      }
    };

    // Create audio engine track (if not a folder)
    if (type !== 'folder') {
      this.audioEngine.addTrack({
        id,
        name: trackData.name,
        type: type === 'midi' ? 'midi' : 'audio',
        color: trackData.color
      });
    }

    // Add to stores
    this.tracks.update(tracks => {
      tracks.set(id, trackData);
      return new Map(tracks);
    });

    this.trackOrder.update(order => [...order, id]);

    // Emit event
    this.emitEvent('track:created', { trackId: id, track: trackData });

    return trackData;
  }

  /**
   * Delete a track
   */
  deleteTrack(id: UUID): void {
    const track = get(this.tracks).get(id);
    if (!track) return;

    // Remove from audio engine
    if (track.type !== 'folder') {
      this.audioEngine.removeTrack(id);
    }

    // Ungroup children if folder
    if (track.type === 'folder') {
      this.ungroupTracks(id);
    }

    // Remove from stores
    this.tracks.update(tracks => {
      tracks.delete(id);
      return new Map(tracks);
    });

    this.trackOrder.update(order => order.filter(tid => tid !== id));

    // Clear selection if deleted track was selected
    this.selectedTrackId.update(selected => selected === id ? null : selected);

    // Emit event
    this.emitEvent('track:deleted', { trackId: id });
  }

  /**
   * Duplicate a track with its settings
   */
  duplicateTrack(id: UUID): TrackData | null {
    const originalTrack = get(this.tracks).get(id);
    if (!originalTrack) return null;

    const newTrack = this.createTrack(
      originalTrack.type,
      `${originalTrack.name} (Copy)`
    );

    // Copy settings (excluding clips for now)
    this.updateTrackSettings(newTrack.id, { ...originalTrack.settings });

    // Copy color
    this.tracks.update(tracks => {
      const track = tracks.get(newTrack.id);
      if (track) {
        track.color = originalTrack.color;
      }
      return new Map(tracks);
    });

    return newTrack;
  }

  /**
   * Rename a track
   */
  renameTrack(id: UUID, name: string): void {
    this.tracks.update(tracks => {
      const track = tracks.get(id);
      if (track) {
        track.name = name;

        // Update audio engine track name
        const audioTrack = this.audioEngine.getTrack(id);
        if (audioTrack) {
          audioTrack.name = name;
        }
      }
      return new Map(tracks);
    });

    this.emitEvent('track:updated', { trackId: id, property: 'name', value: name });
  }

  /**
   * Reorder tracks (drag and drop)
   */
  reorderTrack(trackId: UUID, newIndex: number): void {
    this.trackOrder.update(order => {
      const currentIndex = order.indexOf(trackId);
      if (currentIndex === -1) return order;

      const newOrder = [...order];
      newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, trackId);

      // Update order property
      this.tracks.update(tracks => {
        newOrder.forEach((id, index) => {
          const track = tracks.get(id);
          if (track) {
            track.order = index;
          }
        });
        return new Map(tracks);
      });

      return newOrder;
    });

    this.emitEvent('track:reordered', { trackId, newIndex });
  }

  /**
   * Group tracks into a folder
   */
  groupTracks(trackIds: UUID[], folderName: string): UUID {
    const folderId = this.createTrack('folder', folderName).id;
    const folderIndex = get(this.trackOrder).indexOf(folderId);

    // Move tracks after folder and assign parent
    trackIds.forEach((trackId, index) => {
      this.tracks.update(tracks => {
        const track = tracks.get(trackId);
        if (track) {
          track.parentId = folderId;
        }
        return new Map(tracks);
      });

      // Reorder to be after folder
      this.reorderTrack(trackId, folderIndex + index + 1);
    });

    return folderId;
  }

  /**
   * Ungroup tracks from a folder
   */
  ungroupTracks(folderId: UUID): void {
    this.tracks.update(tracks => {
      tracks.forEach(track => {
        if (track.parentId === folderId) {
          track.parentId = undefined;
        }
      });
      return new Map(tracks);
    });

    // Note: We don't delete the folder here, that's done separately
  }

  /**
   * Update track settings
   */
  updateTrackSettings(id: UUID, settings: Partial<TrackSettings>): void {
    this.tracks.update(tracks => {
      const track = tracks.get(id);
      if (!track) return tracks;

      track.settings = { ...track.settings, ...settings };

      // Sync with audio engine
      const audioTrack = this.audioEngine.getTrack(id);
      if (audioTrack) {
        if (settings.volume !== undefined) {
          audioTrack.setVolume(settings.volume);
        }
        if (settings.pan !== undefined) {
          audioTrack.setPan(settings.pan);
        }
        if (settings.mute !== undefined) {
          audioTrack.setMute(settings.mute);
        }
        if (settings.solo !== undefined) {
          audioTrack.setSolo(settings.solo);
        }
      }

      return new Map(tracks);
    });

    this.emitEvent('track:updated', { trackId: id, settings });
  }

  /**
   * Change track color
   */
  setTrackColor(id: UUID, color: Color): void {
    this.tracks.update(tracks => {
      const track = tracks.get(id);
      if (track) {
        track.color = color;
      }
      return new Map(tracks);
    });

    this.emitEvent('track:updated', { trackId: id, property: 'color', value: color });
  }

  /**
   * Set track height
   */
  setTrackHeight(id: UUID, height: TrackData['height']): void {
    this.tracks.update(tracks => {
      const track = tracks.get(id);
      if (track) {
        track.height = height;
      }
      return new Map(tracks);
    });
  }

  /**
   * Freeze track (render to audio for CPU savings)
   */
  async freezeTrack(id: UUID): Promise<void> {
    const track = get(this.tracks).get(id);
    if (!track || track.settings.frozen) return;

    // TODO: Implement track rendering
    // const audioBuffer = await this.renderTrack(id);

    this.updateTrackSettings(id, { frozen: true });
  }

  /**
   * Unfreeze track
   */
  unfreezeTrack(id: UUID): void {
    this.updateTrackSettings(id, { frozen: false });
  }

  /**
   * Select a track
   */
  selectTrack(id: UUID): void {
    this.selectedTrackId.set(id);
    this.emitEvent('track:selected', { trackId: id });
  }

  /**
   * Get selected track
   */
  getSelectedTrack(): TrackData | null {
    const selectedId = get(this.selectedTrackId);
    if (!selectedId) return null;
    return get(this.tracks).get(selectedId) || null;
  }

  /**
   * Get track by ID
   */
  getTrack(id: UUID): TrackData | undefined {
    return get(this.tracks).get(id);
  }

  /**
   * Get all tracks
   */
  getAllTracks(): TrackData[] {
    return Array.from(get(this.tracks).values());
  }

  /**
   * Get tracks in order
   */
  getOrderedTracks(): TrackData[] {
    const tracks = get(this.tracks);
    const order = get(this.trackOrder);
    return order.map(id => tracks.get(id)).filter(Boolean) as TrackData[];
  }

  /**
   * Add clip to track
   */
  addClip(trackId: UUID, clip: Clip): void {
    this.tracks.update(tracks => {
      const track = tracks.get(trackId);
      if (track) {
        track.clips.push(clip);
      }
      return new Map(tracks);
    });
  }

  /**
   * Remove clip from track
   */
  removeClip(trackId: UUID, clipId: UUID): void {
    this.tracks.update(tracks => {
      const track = tracks.get(trackId);
      if (track) {
        track.clips = track.clips.filter(c => c.id !== clipId);
      }
      return new Map(tracks);
    });
  }

  /**
   * Select clips
   */
  selectClip(clipId: UUID, addToSelection: boolean = false): void {
    this.selectedClipIds.update(selected => {
      if (!addToSelection) {
        selected.clear();
      }
      selected.add(clipId);
      return new Set(selected);
    });
  }

  /**
   * Clear clip selection
   */
  clearClipSelection(): void {
    this.selectedClipIds.set(new Set());
  }

  // === PRIVATE UTILITIES ===

  private generateId(): UUID {
    return `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getDefaultColors(): Color[] {
    return [
      '#ff006e', // Pink
      '#00d9ff', // Cyan
      '#00ff88', // Green
      '#a855f7', // Purple
      '#ffaa00', // Orange
      '#ff3366', // Red
      '#c084fc', // Light Purple
      '#ffd700', // Gold
    ];
  }

  private emitEvent(type: string, payload: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(type, { detail: payload }));
    }
  }
}
