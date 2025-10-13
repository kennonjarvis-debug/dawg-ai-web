/**
 * AudioEngine - Main audio engine singleton
 *
 * Core features:
 * - Multi-track audio playback and recording
 * - Transport control (play, pause, stop, seek)
 * - Track management (add, remove, route)
 * - Effects and send buses
 * - Project save/load
 * - Export/bounce functionality
 */

import * as Tone from 'tone';
import { AudioEngineConfig, TrackConfig, ProjectData, ExportOptions, TransportState } from './types/audio';
import { Track } from './Track';
import { AudioTrack } from './AudioTrack';
import { MIDITrack } from './MIDITrack';
import { MasterBus } from './MasterBus';
import { SendBus } from './SendBus';
import { Recorder } from './Recorder';

export class AudioEngine {
  private static instance: AudioEngine;

  private context: AudioContext;
  private tracks: Map<string, Track>;
  private masterBus: MasterBus;
  private sendBuses: Map<string, SendBus>;
  private recorder: Recorder;
  private transportState: TransportState = 'stopped';

  private constructor(config: AudioEngineConfig = {}) {
    // Initialize AudioContext with optimized settings
    this.context = new AudioContext({
      latencyHint: config.latencyHint || 'interactive',
      sampleRate: config.sampleRate || 48000,
    });

    // Set Tone.js to use our context
    Tone.setContext(this.context);

    // Initialize components
    this.tracks = new Map();
    this.sendBuses = new Map();
    this.masterBus = new MasterBus();
    this.recorder = new Recorder(this.masterBus.output);

    // Setup default send buses
    this.createSendBus('reverb', new Tone.Reverb({ decay: 2.5 }));
    this.createSendBus('delay', new Tone.FeedbackDelay('8n', 0.5));
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: AudioEngineConfig): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine(config);
    }
    return AudioEngine.instance;
  }

  /**
   * Add a new track
   * @param config - Track configuration
   * @returns The created track
   */
  addTrack(config: TrackConfig): Track {
    const id = this.generateId();

    const track = config.type === 'audio'
      ? new AudioTrack(id, config)
      : new MIDITrack(id, config);

    track.output.connect(this.masterBus.input);
    this.tracks.set(id, track);

    return track;
  }

  /**
   * Remove a track
   * @param id - Track ID
   */
  removeTrack(id: string): void {
    const track = this.tracks.get(id);
    if (!track) return;

    track.dispose();
    this.tracks.delete(id);
  }

  /**
   * Get track by ID
   * @param id - Track ID
   */
  getTrack(id: string): Track | undefined {
    return this.tracks.get(id);
  }

  /**
   * Get all tracks
   */
  getAllTracks(): Track[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Handle solo logic across all tracks
   * When any track is soloed, mute all non-soloed tracks
   */
  updateSoloState(): void {
    const soloedTracks = this.getAllTracks().filter(t => t.isSolo());

    if (soloedTracks.length > 0) {
      // Mute all non-soloed tracks
      this.getAllTracks().forEach(track => {
        if (!track.isSolo()) {
          track.output.gain.value = 0;
        } else {
          track.output.gain.value = 1;
        }
      });
    } else {
      // Restore all tracks to normal state
      this.getAllTracks().forEach(track => {
        track.output.gain.value = track.isMuted() ? 0 : 1;
      });
    }
  }

  // ============ Transport Control ============

  /**
   * Start playback
   */
  async play(): Promise<void> {
    await Tone.start(); // Resume AudioContext (required by browser policy)
    Tone.Transport.start();
    this.transportState = 'playing';
  }

  /**
   * Stop playback
   */
  stop(): void {
    Tone.Transport.stop();
    this.transportState = 'stopped';
  }

  /**
   * Pause playback
   */
  pause(): void {
    Tone.Transport.pause();
    this.transportState = 'paused';
  }

  /**
   * Get current transport state
   */
  getTransportState(): TransportState {
    return this.transportState;
  }

  /**
   * Set playback position
   * @param time - Time in seconds or Tone.js time format
   */
  setPosition(time: Tone.Unit.Time): void {
    Tone.Transport.seconds = Tone.Time(time).toSeconds();
  }

  /**
   * Get current playback position
   * @returns Position in seconds
   */
  getPosition(): number {
    return Tone.Transport.seconds;
  }

  /**
   * Set tempo
   * @param bpm - Beats per minute
   */
  setTempo(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  /**
   * Get current tempo
   * @returns BPM
   */
  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  /**
   * Set loop region
   * @param enabled - Enable/disable looping
   * @param start - Loop start time
   * @param end - Loop end time
   */
  setLoop(enabled: boolean, start?: Tone.Unit.Time, end?: Tone.Unit.Time): void {
    Tone.Transport.loop = enabled;
    if (enabled && start !== undefined && end !== undefined) {
      Tone.Transport.loopStart = start;
      Tone.Transport.loopEnd = end;
    }
  }

  /**
   * Get loop state
   */
  getLoop(): { enabled: boolean; start: number; end: number } {
    return {
      enabled: Tone.Transport.loop as boolean,
      start: Tone.Time(Tone.Transport.loopStart).toSeconds(),
      end: Tone.Time(Tone.Transport.loopEnd).toSeconds(),
    };
  }

  // ============ Recording ============

  /**
   * Start recording on a track
   * @param trackId - Track ID to record
   * @param deviceId - Optional input device ID
   */
  async startRecording(trackId: string, deviceId?: string): Promise<void> {
    const track = this.tracks.get(trackId);
    if (!track || track.type !== 'audio') {
      throw new Error('Invalid track for recording');
    }

    this.transportState = 'recording';
    await (track as AudioTrack).startRecording(deviceId);
  }

  /**
   * Stop recording on a track
   * @param trackId - Track ID
   * @returns The recorded AudioBuffer
   */
  async stopRecording(trackId: string): Promise<AudioBuffer> {
    const track = this.tracks.get(trackId);
    if (!track || track.type !== 'audio') {
      throw new Error('Invalid track for recording');
    }

    const buffer = await (track as AudioTrack).stopRecording();
    this.transportState = 'stopped';
    return buffer;
  }

  // ============ Send Buses ============

  /**
   * Create a new send bus
   * @param name - Send bus name
   * @param effect - Tone.js effect node
   */
  createSendBus(name: string, effect: Tone.ToneAudioNode): SendBus {
    const sendBus = new SendBus(name, effect);
    sendBus.output.connect(this.masterBus.input);
    this.sendBuses.set(name, sendBus);
    return sendBus;
  }

  /**
   * Get send bus by name
   * @param name - Send bus name
   */
  getSendBus(name: string): SendBus | undefined {
    return this.sendBuses.get(name);
  }

  /**
   * Get all send buses
   */
  getAllSendBuses(): SendBus[] {
    return Array.from(this.sendBuses.values());
  }

  /**
   * Remove a send bus
   * @param name - Send bus name
   */
  removeSendBus(name: string): void {
    const send = this.sendBuses.get(name);
    if (!send) return;

    // Disconnect all tracks from this send
    this.tracks.forEach(track => track.removeSend(send));

    send.dispose();
    this.sendBuses.delete(name);
  }

  /**
   * Route track to send bus
   * @param trackId - Track ID
   * @param sendName - Send bus name
   * @param amount - Send amount (0-1)
   */
  routeToSend(trackId: string, sendName: string, amount: number): void {
    const track = this.tracks.get(trackId);
    const send = this.sendBuses.get(sendName);

    if (!track || !send) return;

    track.routeToSend(send, amount);
  }

  // ============ Master Bus ============

  /**
   * Get master bus
   */
  getMasterBus(): MasterBus {
    return this.masterBus;
  }

  /**
   * Set master volume
   * @param db - Volume in decibels
   */
  setMasterVolume(db: number): void {
    this.masterBus.setVolume(db);
  }

  /**
   * Get master volume
   * @returns Volume in decibels
   */
  getMasterVolume(): number {
    return this.masterBus.getVolume();
  }

  // ============ Export ============

  /**
   * Export mix to audio file
   * @param options - Export options
   * @returns Audio blob
   */
  async exportMix(options: ExportOptions = { format: 'wav' }): Promise<Blob> {
    return await this.recorder.export(options);
  }

  // ============ Project Management ============

  /**
   * Save project state
   * @returns Project data object
   */
  async saveProject(): Promise<ProjectData> {
    const tracks = Array.from(this.tracks.values()).map(track => track.serialize());
    const loop = this.getLoop();

    return {
      version: '1.0.0',
      tempo: this.getTempo(),
      tracks,
      sends: Array.from(this.sendBuses.values()).map(send => send.serialize()),
      loopEnabled: loop.enabled,
      loopStart: loop.start,
      loopEnd: loop.end,
    };
  }

  /**
   * Load project state
   * @param data - Project data object
   */
  async loadProject(data: ProjectData): Promise<void> {
    // Clear existing tracks
    this.tracks.forEach((_, id) => this.removeTrack(id));

    // Set tempo
    this.setTempo(data.tempo);

    // Set loop
    if (data.loopEnabled && data.loopStart !== undefined && data.loopEnd !== undefined) {
      this.setLoop(true, data.loopStart, data.loopEnd);
    }

    // Load tracks
    for (const trackData of data.tracks) {
      const track = this.addTrack({
        type: trackData.type,
        name: trackData.name,
        color: trackData.color,
      });

      await track.deserialize(trackData);
    }

    // TODO: Restore send buses
  }

  // ============ Utilities ============

  /**
   * Get audio context
   */
  getContext(): AudioContext {
    return this.context;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.tracks.forEach(track => track.dispose());
    this.sendBuses.forEach(send => send.dispose());
    this.masterBus.dispose();
    this.recorder.dispose();
    this.context.close();
  }
}

export default AudioEngine;
