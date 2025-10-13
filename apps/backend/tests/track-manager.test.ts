/**
 * Track Manager Tests
 * Unit tests for track CRUD operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TrackManager } from '../src/services/track-manager';

describe('TrackManager', () => {
  let manager: TrackManager;

  beforeEach(() => {
    manager = new TrackManager();
  });

  describe('createTrack', () => {
    it('should create an audio track with default values', () => {
      const track = manager.createTrack({ type: 'audio' });

      expect(track.type).toBe('audio');
      expect(track.name).toContain('Audio');
      expect(track.volume).toBe(0);
      expect(track.pan).toBe(0);
      expect(track.mute).toBe(false);
      expect(track.solo).toBe(false);
      expect(track.armed).toBe(false);
      expect(track.order).toBe(0);
    });

    it('should create a MIDI track with custom name', () => {
      const track = manager.createTrack({
        type: 'midi',
        name: 'Piano',
      });

      expect(track.type).toBe('midi');
      expect(track.name).toBe('Piano');
    });

    it('should assign unique IDs to tracks', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });

      expect(track1.id).not.toBe(track2.id);
    });

    it('should assign sequential order numbers', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });
      const track3 = manager.createTrack({ type: 'midi' });

      expect(track1.order).toBe(0);
      expect(track2.order).toBe(1);
      expect(track3.order).toBe(2);
    });
  });

  describe('getTrack', () => {
    it('should retrieve track by ID', () => {
      const created = manager.createTrack({ type: 'audio', name: 'Test' });
      const retrieved = manager.getTrack(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test');
    });

    it('should return undefined for non-existent track', () => {
      const track = manager.getTrack('non-existent-id');
      expect(track).toBeUndefined();
    });
  });

  describe('getAllTracks', () => {
    it('should return empty array when no tracks exist', () => {
      const tracks = manager.getAllTracks();
      expect(tracks).toEqual([]);
    });

    it('should return all tracks in order', () => {
      const track1 = manager.createTrack({ type: 'audio', name: 'Track 1' });
      const track2 = manager.createTrack({ type: 'midi', name: 'Track 2' });
      const track3 = manager.createTrack({ type: 'audio', name: 'Track 3' });

      const tracks = manager.getAllTracks();

      expect(tracks).toHaveLength(3);
      expect(tracks[0].id).toBe(track1.id);
      expect(tracks[1].id).toBe(track2.id);
      expect(tracks[2].id).toBe(track3.id);
    });
  });

  describe('updateTrack', () => {
    it('should update track name', () => {
      const track = manager.createTrack({ type: 'audio' });
      const updated = manager.updateTrack(track.id, { name: 'New Name' });

      expect(updated?.name).toBe('New Name');
    });

    it('should update track volume', () => {
      const track = manager.createTrack({ type: 'audio' });
      const updated = manager.updateTrack(track.id, { volume: -6 });

      expect(updated?.volume).toBe(-6);
    });

    it('should update track pan', () => {
      const track = manager.createTrack({ type: 'audio' });
      const updated = manager.updateTrack(track.id, { pan: -0.5 });

      expect(updated?.pan).toBe(-0.5);
    });

    it('should toggle mute', () => {
      const track = manager.createTrack({ type: 'audio' });
      const updated = manager.updateTrack(track.id, { mute: true });

      expect(updated?.mute).toBe(true);
    });

    it('should return null for non-existent track', () => {
      const updated = manager.updateTrack('non-existent', { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('deleteTrack', () => {
    it('should delete existing track', () => {
      const track = manager.createTrack({ type: 'audio' });
      const success = manager.deleteTrack(track.id);

      expect(success).toBe(true);
      expect(manager.getTrack(track.id)).toBeUndefined();
    });

    it('should return false for non-existent track', () => {
      const success = manager.deleteTrack('non-existent');
      expect(success).toBe(false);
    });

    it('should reindex remaining tracks after deletion', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });
      const track3 = manager.createTrack({ type: 'audio' });

      manager.deleteTrack(track2.id);

      const tracks = manager.getAllTracks();
      expect(tracks).toHaveLength(2);
      expect(tracks[0].order).toBe(0);
      expect(tracks[1].order).toBe(1);
    });
  });

  describe('duplicateTrack', () => {
    it('should duplicate track with same settings', () => {
      const original = manager.createTrack({
        type: 'audio',
        name: 'Original',
      });
      manager.updateTrack(original.id, { volume: -3, pan: 0.5 });

      const duplicate = manager.duplicateTrack(original.id);

      expect(duplicate).toBeDefined();
      expect(duplicate?.id).not.toBe(original.id);
      expect(duplicate?.name).toContain('Copy');
      expect(duplicate?.volume).toBe(-3);
      expect(duplicate?.pan).toBe(0.5);
    });

    it('should return null for non-existent track', () => {
      const duplicate = manager.duplicateTrack('non-existent');
      expect(duplicate).toBeNull();
    });
  });

  describe('reorderTracks', () => {
    it('should reorder tracks successfully', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });
      const track3 = manager.createTrack({ type: 'audio' });

      const success = manager.reorderTracks([track3.id, track1.id, track2.id]);

      expect(success).toBe(true);

      const tracks = manager.getAllTracks();
      expect(tracks[0].id).toBe(track3.id);
      expect(tracks[1].id).toBe(track1.id);
      expect(tracks[2].id).toBe(track2.id);
    });

    it('should fail with invalid track IDs', () => {
      manager.createTrack({ type: 'audio' });
      const success = manager.reorderTracks(['invalid-id']);
      expect(success).toBe(false);
    });
  });

  describe('updateMeter', () => {
    it('should update track meter level', () => {
      const track = manager.createTrack({ type: 'audio' });
      manager.updateMeter(track.id, 0.75);

      const updated = manager.getTrack(track.id);
      expect(updated?.meter).toBe(0.75);
    });

    it('should clamp meter values between 0 and 1', () => {
      const track = manager.createTrack({ type: 'audio' });

      manager.updateMeter(track.id, 1.5);
      expect(manager.getTrack(track.id)?.meter).toBe(1);

      manager.updateMeter(track.id, -0.5);
      expect(manager.getTrack(track.id)?.meter).toBe(0);
    });
  });

  describe('solo logic', () => {
    it('should track soloed tracks', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });

      manager.updateTrack(track1.id, { solo: true });

      const state = manager.getProjectState();
      expect(state.soloedTracks).toContain(track1.id);
      expect(state.soloedTracks).not.toContain(track2.id);
    });

    it('should allow multiple tracks to be soloed', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'audio' });

      manager.updateTrack(track1.id, { solo: true });
      manager.updateTrack(track2.id, { solo: true });

      const state = manager.getProjectState();
      expect(state.soloedTracks).toHaveLength(2);
    });
  });

  describe('getProjectState', () => {
    it('should return complete project state', () => {
      const track1 = manager.createTrack({ type: 'audio' });
      const track2 = manager.createTrack({ type: 'midi' });
      manager.updateTrack(track1.id, { solo: true });

      const state = manager.getProjectState();

      expect(Object.keys(state.tracks)).toHaveLength(2);
      expect(state.soloedTracks).toContain(track1.id);
    });
  });

  describe('clear', () => {
    it('should clear all tracks', () => {
      manager.createTrack({ type: 'audio' });
      manager.createTrack({ type: 'midi' });

      manager.clear();

      expect(manager.getAllTracks()).toHaveLength(0);
    });
  });
});
