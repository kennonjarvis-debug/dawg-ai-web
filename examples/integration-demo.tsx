/**
 * DAWG AI - Integration Demo
 *
 * This example demonstrates how to integrate:
 * - Design System (Svelte 5 UI components)
 * - Audio Engine (Web Audio + Tone.js)
 * - Backend API (Track management)
 */

import { onMount } from 'svelte';
import { AudioEngine } from '@dawg-ai/audio-engine';
import type { AudioTrack, MIDITrack } from '@dawg-ai/audio-engine';
import {
  TransportControls,
  Mixer,
  Knob,
  FaderChannel
} from '@dawg-ai/design-system';
import '@dawg-ai/design-system/styles';

// API client for backend
const API_BASE = 'http://localhost:3002';

class TrackAPI {
  static async getAllTracks() {
    const response = await fetch(`${API_BASE}/api/tracks`);
    return response.json();
  }

  static async createTrack(data: { type: 'audio' | 'midi'; name: string; color?: string }) {
    const response = await fetch(`${API_BASE}/api/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  static async updateTrack(id: string, updates: any) {
    const response = await fetch(`${API_BASE}/api/tracks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  }
}

// Main Integration Component
export default function IntegrationDemo() {
  let engine: AudioEngine;
  let playing = $state(false);
  let recording = $state(false);
  let bpm = $state(120);
  let tracks = $state<any[]>([]);

  onMount(async () => {
    // Initialize audio engine
    engine = AudioEngine.getInstance({
      sampleRate: 48000,
      latencyHint: 'interactive'
    });

    // Load tracks from backend API
    const response = await TrackAPI.getAllTracks();
    tracks = response.data;

    // Create audio tracks in engine
    for (const track of tracks) {
      if (track.type === 'audio') {
        const audioTrack = engine.addTrack({
          type: 'audio',
          name: track.name,
          color: track.color,
          volume: track.volume,
          pan: track.pan
        }) as AudioTrack;

        // Sync audio track with backend
        audioTrack.setVolume(track.volume);
        audioTrack.setPan(track.pan);
        audioTrack.setMute(track.mute);
        audioTrack.setSolo(track.solo);
      }
    }

    return () => {
      // Cleanup on unmount
      engine.stop();
    };
  });

  // Transport control handlers
  async function handlePlayPause() {
    if (playing) {
      engine.pause();
    } else {
      await engine.play();
    }
    playing = !playing;
  }

  function handleStop() {
    engine.stop();
    playing = false;
  }

  function handleRecord() {
    recording = !recording;
    // Start recording on armed tracks
    if (recording) {
      const armedTracks = engine.getAllTracks().filter(t => t.isArmed());
      for (const track of armedTracks) {
        if (track instanceof AudioTrack) {
          track.startRecording();
        }
      }
    } else {
      // Stop recording
      const recordingTracks = engine.getAllTracks().filter(t => t.isRecording?.());
      for (const track of recordingTracks) {
        if (track instanceof AudioTrack) {
          track.stopRecording();
        }
      }
    }
  }

  function handleBpmChange(newBpm: number) {
    bpm = newBpm;
    engine.setTempo(bpm);
  }

  // Track control handlers
  function handleVolumeChange(trackId: string, volume: number) {
    const track = engine.getTrack(trackId);
    if (track) {
      track.setVolume(volume);
      // Sync with backend
      TrackAPI.updateTrack(trackId, { volume });
    }
  }

  function handlePanChange(trackId: string, pan: number) {
    const track = engine.getTrack(trackId);
    if (track) {
      track.setPan(pan);
      // Sync with backend
      TrackAPI.updateTrack(trackId, { pan });
    }
  }

  function handleMute(trackId: string, mute: boolean) {
    const track = engine.getTrack(trackId);
    if (track) {
      track.setMute(mute);
      // Sync with backend
      TrackAPI.updateTrack(trackId, { mute });
    }
  }

  function handleSolo(trackId: string, solo: boolean) {
    const track = engine.getTrack(trackId);
    if (track) {
      track.setSolo(solo);
      // Sync with backend
      TrackAPI.updateTrack(trackId, { solo });
    }
  }

  async function handleAddTrack() {
    // Create track in backend
    const response = await TrackAPI.createTrack({
      type: 'audio',
      name: `Audio ${tracks.length + 1}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    });

    // Add to local state
    tracks = [...tracks, response.data];

    // Create in audio engine
    engine.addTrack({
      type: 'audio',
      name: response.data.name,
      color: response.data.color
    });
  }

  return (
    <div class="dawg-ai-integration-demo">
      <header>
        <h1>DAWG AI - Integration Demo</h1>
        <p>Design System + Audio Engine + Backend API</p>
      </header>

      {/* Transport Controls */}
      <section class="transport">
        <TransportControls
          {playing}
          {recording}
          {bpm}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onRecord={handleRecord}
          onBpmChange={handleBpmChange}
        />
      </section>

      {/* Mixer */}
      <section class="mixer">
        <h2>Mixer</h2>
        <Mixer
          tracks={tracks.map(t => ({
            id: t.id,
            name: t.name,
            color: t.color,
            volume: t.volume,
            pan: t.pan,
            muted: t.mute,
            solo: t.solo,
            armed: t.armed,
            meterLevel: engine.getTrack(t.id)?.getMeterLevel?.() || 0
          }))}
          onTrackUpdate={(trackId, updates) => {
            if (updates.volume !== undefined) handleVolumeChange(trackId, updates.volume);
            if (updates.pan !== undefined) handlePanChange(trackId, updates.pan);
            if (updates.muted !== undefined) handleMute(trackId, updates.muted);
            if (updates.solo !== undefined) handleSolo(trackId, updates.solo);
          }}
        />
        <button onclick={handleAddTrack}>Add Track</button>
      </section>

      {/* Individual Track Controls */}
      <section class="tracks">
        <h2>Tracks</h2>
        {#each tracks as track}
          <div class="track-controls">
            <h3>{track.name}</h3>

            {/* Volume Knob */}
            <Knob
              value={track.volume}
              min={-60}
              max={6}
              label="Volume"
              unit="dB"
              onchange={(value) => handleVolumeChange(track.id, value)}
            />

            {/* Pan Knob */}
            <Knob
              value={track.pan}
              min={-1}
              max={1}
              label="Pan"
              onchange={(value) => handlePanChange(track.id, value)}
            />

            {/* Fader Channel */}
            <FaderChannel
              trackName={track.name}
              volume={track.volume}
              pan={track.pan}
              muted={track.mute}
              solo={track.solo}
              meterLevel={engine.getTrack(track.id)?.getMeterLevel?.() || 0}
              onVolumeChange={(v) => handleVolumeChange(track.id, v)}
              onPanChange={(p) => handlePanChange(track.id, p)}
              onMuteToggle={() => handleMute(track.id, !track.mute)}
              onSoloToggle={() => handleSolo(track.id, !track.solo)}
            />
          </div>
        {/each}
      </section>

      <style>
        .dawg-ai-integration-demo {
          padding: 2rem;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          min-height: 100vh;
        }

        header {
          margin-bottom: 2rem;
        }

        h1 {
          font-size: 2rem;
          margin: 0 0 0.5rem;
        }

        section {
          margin-bottom: 3rem;
          padding: 1.5rem;
          background: var(--color-bg-secondary);
          border-radius: 8px;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .track-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: var(--color-bg-tertiary);
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .track-controls h3 {
          margin: 0;
          min-width: 150px;
        }

        button {
          background: var(--color-accent-primary);
          color: var(--color-bg-primary);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        button:hover {
          opacity: 0.8;
        }
      </style>
    </div>
  );
}
