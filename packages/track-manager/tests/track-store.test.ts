/**
 * Track Store Test Suite
 *
 * Tests for Zustand track management store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTrackStore } from '../src/stores/track-store';
import { AudioEngine } from '@dawg-ai/audio-engine';

// Mock AudioEngine
vi.mock('@dawg-ai/audio-engine', () => ({
  AudioEngine: {
    getInstance: vi.fn(() => ({
      addTrack: vi.fn((config) => ({
        id: `track-${Date.now()}`,
        color: '#00d9ff',
        setVolume: vi.fn(),
        setPan: vi.fn(),
        setMute: vi.fn(),
        setSolo: vi.fn(),
        setArmed: vi.fn(),
        isMuted: vi.fn(() => false),
        isSolo: vi.fn(() => false),
        isArmed: vi.fn(() => false),
      })),
      removeTrack: vi.fn(),
      getTrack: vi.fn(),
      updateSoloState: vi.fn(),
      routeToSend: vi.fn(),
    })),
  },
}));

describe('Track Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useTrackStore.getState();
    store.tracks.clear();
    store.selectedTrackId = null;
    store.soloedTracks.clear();
  });

  describe('Track Management', () => {
    it('should add a track', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio', 'Test Track');

      expect(store.tracks.has(trackId)).toBe(true);
      expect(store.tracks.get(trackId)?.name).toBe('Test Track');
      expect(store.tracks.get(trackId)?.type).toBe('audio');
    });

    it('should add track with auto-generated name', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('midi');

      expect(store.tracks.get(trackId)?.name).toMatch(/MIDI \d+/);
    });

    it('should remove a track', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio', 'Test Track');

      expect(store.tracks.has(trackId)).toBe(true);

      store.removeTrack(trackId);
      expect(store.tracks.has(trackId)).toBe(false);
    });

    it('should duplicate a track', () => {
      const store = useTrackStore.getState();
      const originalId = store.addTrack('audio', 'Original');

      const duplicateId = store.duplicateTrack(originalId);

      expect(duplicateId).not.toBe(originalId);
      expect(store.tracks.get(duplicateId)?.name).toBe('Original (Copy)');
    });
  });

  describe('Track Selection', () => {
    it('should select a track', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.selectTrack(trackId);
      expect(store.selectedTrackId).toBe(trackId);
    });
  });

  describe('Track Properties', () => {
    it('should set track name', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio', 'Old Name');

      store.setTrackName(trackId, 'New Name');
      expect(store.tracks.get(trackId)?.name).toBe('New Name');
    });

    it('should set track color', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.setTrackColor(trackId, '#ff0000');
      expect(store.tracks.get(trackId)?.color).toBe('#ff0000');
    });
  });

  describe('Track Controls', () => {
    it('should toggle mute', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      expect(store.tracks.get(trackId)?.mute).toBe(false);

      store.toggleMute(trackId);
      expect(store.tracks.get(trackId)?.mute).toBe(true);

      store.toggleMute(trackId);
      expect(store.tracks.get(trackId)?.mute).toBe(false);
    });

    it('should toggle solo', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      expect(store.tracks.get(trackId)?.solo).toBe(false);

      store.toggleSolo(trackId);
      expect(store.tracks.get(trackId)?.solo).toBe(true);
      expect(store.soloedTracks.has(trackId)).toBe(true);

      store.toggleSolo(trackId);
      expect(store.tracks.get(trackId)?.solo).toBe(false);
      expect(store.soloedTracks.has(trackId)).toBe(false);
    });

    it('should toggle arm', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      expect(store.tracks.get(trackId)?.armed).toBe(false);

      store.toggleArm(trackId);
      expect(store.tracks.get(trackId)?.armed).toBe(true);
    });
  });

  describe('Track Reordering', () => {
    it('should reorder tracks', () => {
      const store = useTrackStore.getState();
      const track1 = store.addTrack('audio', 'Track 1');
      const track2 = store.addTrack('audio', 'Track 2');
      const track3 = store.addTrack('audio', 'Track 3');

      const tracksBefore = Array.from(store.tracks.keys());
      expect(tracksBefore).toEqual([track1, track2, track3]);

      store.reorderTracks(0, 2); // Move track 1 to position 2

      const tracksAfter = Array.from(store.tracks.keys());
      expect(tracksAfter).toEqual([track2, track3, track1]);
    });
  });

  describe('Metering', () => {
    it('should update meter level', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.updateMeter(trackId, 0.75);
      expect(store.tracks.get(trackId)?.meter).toBe(0.75);
    });
  });

  describe('Effects Management', () => {
    it('should add effect', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      const effect = {
        id: 'fx-1',
        type: 'reverb',
        enabled: true,
        params: { decay: 2.5 },
      };

      store.addEffect(trackId, effect);

      const track = store.tracks.get(trackId);
      expect(track?.effects).toHaveLength(1);
      expect(track?.effects[0]).toEqual(effect);
    });

    it('should remove effect', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      const effect = {
        id: 'fx-1',
        type: 'reverb',
        enabled: true,
        params: {},
      };

      store.addEffect(trackId, effect);
      store.removeEffect(trackId, 'fx-1');

      const track = store.tracks.get(trackId);
      expect(track?.effects).toHaveLength(0);
    });

    it('should update effect params', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      const effect = {
        id: 'fx-1',
        type: 'reverb',
        enabled: true,
        params: { decay: 2.5 },
      };

      store.addEffect(trackId, effect);
      store.updateEffect(trackId, 'fx-1', { decay: 3.0 });

      const track = store.tracks.get(trackId);
      expect(track?.effects[0].params.decay).toBe(3.0);
    });
  });

  describe('Send Management', () => {
    it('should add send', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.addSend(trackId, 'reverb', 0.5);

      const track = store.tracks.get(trackId);
      expect(track?.sends).toHaveLength(1);
      expect(track?.sends[0]).toEqual({ busName: 'reverb', amount: 0.5 });
    });

    it('should remove send', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.addSend(trackId, 'reverb', 0.5);
      store.removeSend(trackId, 'reverb');

      const track = store.tracks.get(trackId);
      expect(track?.sends).toHaveLength(0);
    });

    it('should update send amount', () => {
      const store = useTrackStore.getState();
      const trackId = store.addTrack('audio');

      store.addSend(trackId, 'reverb', 0.5);
      store.updateSend(trackId, 'reverb', 0.75);

      const track = store.tracks.get(trackId);
      expect(track?.sends[0].amount).toBe(0.75);
    });
  });
});
