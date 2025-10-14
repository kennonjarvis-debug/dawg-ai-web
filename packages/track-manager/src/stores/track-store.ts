/**
 * Track Store - Zustand state management for track operations
 *
 * Manages all track state and integrates with AudioEngine
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AudioEngine } from '@dawg-ai/audio-engine';
import type { TrackStore, TrackState, EffectState, SendState } from '../types/track';

export const useTrackStore = create<TrackStore>()(
  immer((set, get) => ({
    tracks: new Map(),
    selectedTrackId: null,
    soloedTracks: new Set(),

    // Track creation
    addTrack: (type, name) => {
      const engine = AudioEngine.getInstance();
      const trackName = name || `${type === 'audio' ? 'Audio' : 'MIDI'} ${get().tracks.size + 1}`;

      const track = engine.addTrack({
        type,
        name: trackName,
      });

      set((state) => {
        state.tracks.set(track.id, {
          id: track.id,
          type,
          name: trackName,
          color: track.color,
          volume: 0,
          pan: 0,
          mute: false,
          solo: false,
          armed: false,
          meter: 0,
          effects: [],
          sends: [],
        });
      });

      return track.id;
    },

    removeTrack: (id) => {
      const engine = AudioEngine.getInstance();
      engine.removeTrack(id);

      set((state) => {
        state.tracks.delete(id);
        if (state.selectedTrackId === id) {
          state.selectedTrackId = null;
        }
        state.soloedTracks.delete(id);
      });
    },

    duplicateTrack: (id) => {
      const original = get().tracks.get(id);
      if (!original) return '';

      const newId = get().addTrack(original.type, `${original.name} (Copy)`);
      const engine = AudioEngine.getInstance();
      const newTrack = engine.getTrack(newId);

      if (newTrack) {
        newTrack.setVolume(original.volume);
        newTrack.setPan(original.pan);

        set((state) => {
          const track = state.tracks.get(newId);
          if (track) {
            track.color = original.color;
            track.effects = [...original.effects];
            track.sends = [...original.sends];
          }
        });
      }

      return newId;
    },

    // Selection
    selectTrack: (id) => {
      set({ selectedTrackId: id });
    },

    // Track properties
    setTrackName: (id, name) => {
      set((state) => {
        const track = state.tracks.get(id);
        if (track) track.name = name;
      });
    },

    setTrackColor: (id, color) => {
      set((state) => {
        const track = state.tracks.get(id);
        if (track) track.color = color;
      });
    },

    setTrackVolume: (id, volume) => {
      const engine = AudioEngine.getInstance();
      const track = engine.getTrack(id);

      if (track) {
        track.setVolume(volume);
        set((state) => {
          const trackState = state.tracks.get(id);
          if (trackState) trackState.volume = volume;
        });
      }
    },

    setTrackPan: (id, pan) => {
      const engine = AudioEngine.getInstance();
      const track = engine.getTrack(id);

      if (track) {
        track.setPan(pan);
        set((state) => {
          const trackState = state.tracks.get(id);
          if (trackState) trackState.pan = pan;
        });
      }
    },

    // Track controls
    toggleMute: (id) => {
      const engine = AudioEngine.getInstance();
      const track = engine.getTrack(id);

      if (track) {
        const newMute = !track.isMuted();
        track.setMute(newMute);

        set((state) => {
          const trackState = state.tracks.get(id);
          if (trackState) trackState.mute = newMute;
        });
      }
    },

    toggleSolo: (id) => {
      const engine = AudioEngine.getInstance();
      const track = engine.getTrack(id);

      if (track) {
        const newSolo = !track.isSolo();
        track.setSolo(newSolo);

        set((state) => {
          const trackState = state.tracks.get(id);
          if (trackState) trackState.solo = newSolo;

          if (newSolo) {
            state.soloedTracks.add(id);
          } else {
            state.soloedTracks.delete(id);
          }
        });

        // Update solo state on engine
        engine.updateSoloState();
      }
    },

    toggleArm: (id) => {
      const engine = AudioEngine.getInstance();
      const track = engine.getTrack(id);

      if (track) {
        const newArmed = !track.isArmed();
        track.setArmed(newArmed);

        set((state) => {
          const trackState = state.tracks.get(id);
          if (trackState) trackState.armed = newArmed;
        });
      }
    },

    // Reordering
    reorderTracks: (fromIndex, toIndex) => {
      set((state) => {
        const tracksArray = Array.from(state.tracks.entries());
        const [removed] = tracksArray.splice(fromIndex, 1);
        tracksArray.splice(toIndex, 0, removed);
        state.tracks = new Map(tracksArray);
      });
    },

    // Metering
    updateMeter: (id, level) => {
      set((state) => {
        const track = state.tracks.get(id);
        if (track) track.meter = level;
      });
    },

    // Effects management
    addEffect: (trackId, effect) => {
      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          track.effects.push(effect);
        }
      });
    },

    removeEffect: (trackId, effectId) => {
      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          track.effects = track.effects.filter((e) => e.id !== effectId);
        }
      });
    },

    updateEffect: (trackId, effectId, params) => {
      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          const effect = track.effects.find((e) => e.id === effectId);
          if (effect) {
            effect.params = { ...effect.params, ...params };
          }
        }
      });
    },

    // Send management
    addSend: (trackId, busName, amount) => {
      const engine = AudioEngine.getInstance();
      engine.routeToSend(trackId, busName, amount);

      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          track.sends.push({ busName, amount });
        }
      });
    },

    removeSend: (trackId, busName) => {
      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          track.sends = track.sends.filter((s) => s.busName !== busName);
        }
      });
    },

    updateSend: (trackId, busName, amount) => {
      const engine = AudioEngine.getInstance();
      engine.routeToSend(trackId, busName, amount);

      set((state) => {
        const track = state.tracks.get(trackId);
        if (track) {
          const send = track.sends.find((s) => s.busName === busName);
          if (send) {
            send.amount = amount;
          }
        }
      });
    },
  }))
);

export default useTrackStore;
