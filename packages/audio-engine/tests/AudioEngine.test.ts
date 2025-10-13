/**
 * AudioEngine Test Suite
 *
 * Comprehensive tests for the audio engine core functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioEngine } from '../src/AudioEngine';
import { AudioTrack } from '../src/AudioTrack';
import { MIDITrack } from '../src/MIDITrack';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = AudioEngine.getInstance();
  });

  afterEach(() => {
    // Clean up tracks between tests
    engine.getAllTracks().forEach(track => {
      engine.removeTrack(track.id);
    });
  });

  describe('Singleton Pattern', () => {
    it('should create singleton instance', () => {
      const engine2 = AudioEngine.getInstance();
      expect(engine).toBe(engine2);
    });

    it('should return the same instance across multiple calls', () => {
      const instances = Array(5).fill(null).map(() => AudioEngine.getInstance());
      instances.forEach(instance => {
        expect(instance).toBe(engine);
      });
    });
  });

  describe('Track Management', () => {
    it('should add an audio track', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Audio Track' });
      expect(track).toBeInstanceOf(AudioTrack);
      expect(track.name).toBe('Test Audio Track');
      expect(engine.getAllTracks()).toHaveLength(1);
    });

    it('should add a MIDI track', () => {
      const track = engine.addTrack({ type: 'midi', name: 'Test MIDI Track' });
      expect(track).toBeInstanceOf(MIDITrack);
      expect(track.name).toBe('Test MIDI Track');
      expect(engine.getAllTracks()).toHaveLength(1);
    });

    it('should remove a track', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      expect(engine.getAllTracks()).toHaveLength(1);

      engine.removeTrack(track.id);
      expect(engine.getAllTracks()).toHaveLength(0);
    });

    it('should get track by ID', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      const retrieved = engine.getTrack(track.id);
      expect(retrieved).toBe(track);
    });

    it('should return undefined for non-existent track', () => {
      const retrieved = engine.getTrack('non-existent-id');
      expect(retrieved).toBeUndefined();
    });

    it('should add multiple tracks', () => {
      engine.addTrack({ type: 'audio', name: 'Track 1' });
      engine.addTrack({ type: 'audio', name: 'Track 2' });
      engine.addTrack({ type: 'midi', name: 'Track 3' });

      expect(engine.getAllTracks()).toHaveLength(3);
    });

    it('should assign default color if not provided', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      expect(track.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should use custom color when provided', () => {
      const track = engine.addTrack({
        type: 'audio',
        name: 'Test Track',
        color: '#ff0000',
      });
      expect(track.color).toBe('#ff0000');
    });
  });

  describe('Transport Control', () => {
    it('should start playback', async () => {
      await engine.play();
      expect(engine.getTransportState()).toBe('playing');
    });

    it('should stop playback', async () => {
      await engine.play();
      engine.stop();
      expect(engine.getTransportState()).toBe('stopped');
    });

    it('should pause playback', async () => {
      await engine.play();
      engine.pause();
      expect(engine.getTransportState()).toBe('paused');
    });

    it('should set and get position', () => {
      engine.setPosition(5);
      expect(engine.getPosition()).toBeCloseTo(5, 1);
    });

    it('should set and get tempo', () => {
      engine.setTempo(140);
      expect(engine.getTempo()).toBe(140);
    });

    it('should enable loop', () => {
      engine.setLoop(true, 0, 8);
      const loop = engine.getLoop();
      expect(loop.enabled).toBe(true);
      expect(loop.start).toBe(0);
      expect(loop.end).toBe(8);
    });

    it('should disable loop', () => {
      engine.setLoop(false);
      const loop = engine.getLoop();
      expect(loop.enabled).toBe(false);
    });
  });

  describe('Track Controls', () => {
    it('should set track volume', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      track.setVolume(-6);
      expect(track.getVolume()).toBe(-6);
    });

    it('should set track pan', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      track.setPan(0.5);
      expect(track.getPan()).toBe(0.5);
    });

    it('should clamp pan values', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      track.setPan(2);
      expect(track.getPan()).toBe(1);

      track.setPan(-2);
      expect(track.getPan()).toBe(-1);
    });

    it('should mute and unmute track', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      expect(track.isMuted()).toBe(false);

      track.setMute(true);
      expect(track.isMuted()).toBe(true);

      track.setMute(false);
      expect(track.isMuted()).toBe(false);
    });

    it('should solo and unsolo track', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      expect(track.isSolo()).toBe(false);

      track.setSolo(true);
      expect(track.isSolo()).toBe(true);

      track.setSolo(false);
      expect(track.isSolo()).toBe(false);
    });

    it('should arm and disarm track for recording', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      expect(track.isArmed()).toBe(false);

      track.setArmed(true);
      expect(track.isArmed()).toBe(true);

      track.setArmed(false);
      expect(track.isArmed()).toBe(false);
    });
  });

  describe('Send Buses', () => {
    it('should create send bus', () => {
      const send = engine.getSendBus('reverb');
      expect(send).toBeDefined();
      expect(send?.name).toBe('reverb');
    });

    it('should get all send buses', () => {
      const buses = engine.getAllSendBuses();
      expect(buses.length).toBeGreaterThan(0);
      expect(buses.some(b => b.name === 'reverb')).toBe(true);
      expect(buses.some(b => b.name === 'delay')).toBe(true);
    });

    it('should route track to send', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      engine.routeToSend(track.id, 'reverb', 0.5);

      const sends = track.getSends();
      expect(sends.size).toBe(1);
    });

    it('should handle invalid track for send routing', () => {
      engine.routeToSend('invalid-id', 'reverb', 0.5);
      // Should not throw error
    });

    it('should handle invalid send bus for routing', () => {
      const track = engine.addTrack({ type: 'audio', name: 'Test Track' });
      engine.routeToSend(track.id, 'nonexistent', 0.5);
      // Should not throw error
    });
  });

  describe('Master Bus', () => {
    it('should get master bus', () => {
      const master = engine.getMasterBus();
      expect(master).toBeDefined();
    });

    it('should set master volume', () => {
      engine.setMasterVolume(-3);
      expect(engine.getMasterVolume()).toBeCloseTo(-3, 1);
    });

    it('should get meter level', () => {
      const master = engine.getMasterBus();
      const level = master.getMeterLevel();
      expect(typeof level).toBe('number');
    });

    it('should get frequency data', () => {
      const master = engine.getMasterBus();
      const data = master.getFrequencyData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should get waveform data', () => {
      const master = engine.getMasterBus();
      const data = master.getWaveformData();
      expect(data).toBeInstanceOf(Uint8Array);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('Project Management', () => {
    it('should save project', async () => {
      engine.addTrack({ type: 'audio', name: 'Track 1' });
      engine.addTrack({ type: 'midi', name: 'Track 2' });
      engine.setTempo(128);

      const project = await engine.saveProject();

      expect(project.version).toBe('1.0.0');
      expect(project.tempo).toBe(128);
      expect(project.tracks).toHaveLength(2);
    });

    it('should save and restore tempo', async () => {
      engine.setTempo(150);
      const project = await engine.saveProject();

      engine.setTempo(120);
      await engine.loadProject(project);

      expect(engine.getTempo()).toBe(150);
    });

    it('should save and restore loop settings', async () => {
      engine.setLoop(true, 0, 16);
      const project = await engine.saveProject();

      engine.setLoop(false);
      await engine.loadProject(project);

      const loop = engine.getLoop();
      expect(loop.enabled).toBe(true);
      expect(loop.start).toBe(0);
      expect(loop.end).toBe(16);
    });

    it('should clear existing tracks when loading project', async () => {
      engine.addTrack({ type: 'audio', name: 'Track 1' });
      engine.addTrack({ type: 'audio', name: 'Track 2' });

      const project = await engine.saveProject();
      engine.addTrack({ type: 'audio', name: 'Track 3' });

      expect(engine.getAllTracks()).toHaveLength(3);

      await engine.loadProject(project);
      expect(engine.getAllTracks()).toHaveLength(2);
    });
  });

  describe('Context', () => {
    it('should get audio context', () => {
      const context = engine.getContext();
      expect(context).toBeInstanceOf(AudioContext);
    });

    it('should have correct sample rate', () => {
      const context = engine.getContext();
      expect(context.sampleRate).toBe(48000);
    });
  });
});
