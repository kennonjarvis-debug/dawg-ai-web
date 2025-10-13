/**
 * AudioTrack - Track for audio file playback and recording
 *
 * Features:
 * - Load and play audio files or buffers
 * - Record from microphone or line input
 * - Real-time monitoring during recording
 * - Sample-accurate playback sync
 */

import * as Tone from 'tone';
import { Track } from './Track';
import { TrackConfig, AudioTrackData } from './types/audio';

export class AudioTrack extends Track {
  private player: Tone.Player | null = null;
  private recorder: Tone.Recorder | null = null;
  private input: Tone.UserMedia | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private audioUrl: string | null = null;

  constructor(id: string, config: TrackConfig) {
    super(id, 'audio', config);
  }

  /**
   * Load audio from URL or AudioBuffer
   * @param source - URL string or AudioBuffer
   */
  async loadAudio(source: string | AudioBuffer): Promise<void> {
    // Dispose old player if exists
    if (this.player) {
      this.player.dispose();
    }

    // Store source reference
    if (typeof source === 'string') {
      this.audioUrl = source;
    } else {
      this.audioBuffer = source;
    }

    // Create new player and wait for it to load
    this.player = new Tone.Player(source).connect(this.volumeNode);

    // Wait for the buffer to load
    await Tone.loaded();
  }

  /**
   * Start playback
   * @param time - Optional start time (Tone.js time)
   */
  play(time?: Tone.Unit.Time): void {
    if (this.player && !this.isMuted()) {
      this.player.start(time);
    }
  }

  /**
   * Stop playback
   * @param time - Optional stop time (Tone.js time)
   */
  stop(time?: Tone.Unit.Time): void {
    if (this.player) {
      this.player.stop(time);
    }
  }

  /**
   * Seek to position
   * @param position - Position in seconds
   */
  seek(position: number): void {
    if (this.player) {
      this.player.seek(position);
    }
  }

  /**
   * Get track duration
   * @returns Duration in seconds
   */
  getDuration(): number {
    return this.player?.buffer.duration || 0;
  }

  /**
   * Start recording from microphone/line input
   * @param deviceId - Optional specific input device ID
   */
  async startRecording(deviceId?: string): Promise<void> {
    // Initialize user media
    this.input = new Tone.UserMedia();

    // Open with specific device if provided
    await this.input.open(deviceId);

    // Create recorder
    this.recorder = new Tone.Recorder();

    // Connect for recording
    this.input.connect(this.recorder);

    // Connect for monitoring (hear yourself)
    this.input.connect(this.volumeNode);

    // Start recording
    this.recorder.start();
  }

  /**
   * Stop recording and return the recorded audio
   * @returns The recorded AudioBuffer
   */
  async stopRecording(): Promise<AudioBuffer> {
    if (!this.recorder) {
      throw new Error('No active recording');
    }

    // Stop recording and get blob
    const recording = await this.recorder.stop();

    // Convert to AudioBuffer
    const arrayBuffer = await recording.arrayBuffer();
    this.audioBuffer = await Tone.context.decodeAudioData(arrayBuffer);

    // Clean up input
    if (this.input) {
      this.input.close();
      this.input.dispose();
      this.input = null;
    }

    // Load recorded audio into player for playback
    await this.loadAudio(this.audioBuffer);

    return this.audioBuffer;
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.recorder !== null && this.input !== null;
  }

  /**
   * Get audio buffer if loaded
   */
  getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  /**
   * Serialize track state
   */
  serialize(): AudioTrackData {
    return {
      id: this.id,
      type: 'audio',
      name: this.name,
      color: this.color,
      volume: this.getVolume(),
      pan: this.getPan(),
      mute: this.isMuted(),
      solo: this.isSolo(),
      audioUrl: this.audioUrl,
      effects: this.getEffects().map((effect) => ({
        type: effect.name,
        params: {}, // TODO: Serialize effect parameters
      })),
    };
  }

  /**
   * Deserialize and restore track state
   */
  async deserialize(data: AudioTrackData): Promise<void> {
    this.name = data.name;
    this.color = data.color;
    this.setVolume(data.volume);
    this.setPan(data.pan);
    this.setMute(data.mute);
    this.setSolo(data.solo);

    // Load audio if URL provided
    if (data.audioUrl) {
      await this.loadAudio(data.audioUrl);
    } else if (data.audioBuffer) {
      await this.loadAudio(data.audioBuffer);
    }

    // TODO: Deserialize and add effects
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.player) this.player.dispose();
    if (this.recorder) this.recorder.dispose();
    if (this.input) {
      this.input.close();
      this.input.dispose();
    }
    super.dispose();
  }
}

export default AudioTrack;
