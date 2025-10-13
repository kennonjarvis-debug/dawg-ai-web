/**
 * Track - Base class for audio and MIDI tracks
 *
 * Provides common functionality:
 * - Volume and pan controls
 * - Mute and solo
 * - Effects chain
 * - Send routing
 * - State management
 */

import * as Tone from 'tone';
import { TrackConfig, TrackState, TrackData } from './types/audio';
import { SendBus } from './SendBus';

export abstract class Track {
  readonly id: string;
  readonly type: 'audio' | 'midi';
  name: string;
  color: string;

  protected volumeNode: Tone.Volume;
  protected panNode: Tone.Panner;
  protected muteNode: Tone.Volume;
  protected effectsChain: Tone.ToneAudioNode[];

  public output: Tone.Gain;

  private state: TrackState;
  private sends: Map<SendBus, Tone.Gain>;

  constructor(id: string, type: 'audio' | 'midi', config: TrackConfig) {
    this.id = id;
    this.type = type;
    this.name = config.name;
    this.color = config.color || this.randomColor();

    // Initialize audio nodes
    this.volumeNode = new Tone.Volume(config.volume || 0);
    this.panNode = new Tone.Panner(config.pan || 0);
    this.muteNode = new Tone.Volume(-Infinity);
    this.output = new Tone.Gain(1);
    this.effectsChain = [];
    this.sends = new Map();

    // Initial state
    this.state = {
      volume: config.volume || 0,
      pan: config.pan || 0,
      mute: false,
      solo: false,
      armed: false,
    };

    // Connect nodes
    this.reconnectChain();
  }

  /**
   * Set track volume
   * @param db - Volume in decibels
   */
  setVolume(db: number): void {
    this.state.volume = db;
    this.volumeNode.volume.value = db;
  }

  /**
   * Get current volume
   * @returns Volume in decibels
   */
  getVolume(): number {
    return this.state.volume;
  }

  /**
   * Set track pan
   * @param value - Pan value from -1 (left) to 1 (right)
   */
  setPan(value: number): void {
    this.state.pan = Math.max(-1, Math.min(1, value));
    this.panNode.pan.value = this.state.pan;
  }

  /**
   * Get current pan
   * @returns Pan value from -1 to 1
   */
  getPan(): number {
    return this.state.pan;
  }

  /**
   * Set mute state
   * @param mute - True to mute, false to unmute
   */
  setMute(mute: boolean): void {
    this.state.mute = mute;
    this.muteNode.volume.value = mute ? -Infinity : 0;
  }

  /**
   * Get mute state
   */
  isMuted(): boolean {
    return this.state.mute;
  }

  /**
   * Set solo state
   * @param solo - True to solo, false to unsolo
   */
  setSolo(solo: boolean): void {
    this.state.solo = solo;
    // Solo logic handled by AudioEngine
  }

  /**
   * Get solo state
   */
  isSolo(): boolean {
    return this.state.solo;
  }

  /**
   * Set record arm state
   * @param armed - True to arm for recording
   */
  setArmed(armed: boolean): void {
    this.state.armed = armed;
  }

  /**
   * Get record arm state
   */
  isArmed(): boolean {
    return this.state.armed;
  }

  /**
   * Add an effect to the chain
   * @param effect - Tone.js audio node
   * @param index - Optional position in chain
   */
  addEffect(effect: Tone.ToneAudioNode, index?: number): void {
    if (index !== undefined) {
      this.effectsChain.splice(index, 0, effect);
    } else {
      this.effectsChain.push(effect);
    }
    this.reconnectChain();
  }

  /**
   * Remove an effect from the chain
   * @param index - Position in chain
   */
  removeEffect(index: number): void {
    const effect = this.effectsChain[index];
    if (effect) {
      effect.dispose();
      this.effectsChain.splice(index, 1);
      this.reconnectChain();
    }
  }

  /**
   * Get all effects in chain
   */
  getEffects(): Tone.ToneAudioNode[] {
    return [...this.effectsChain];
  }

  /**
   * Route track to a send bus
   * @param send - The send bus to route to
   * @param amount - Send amount (0-1)
   */
  routeToSend(send: SendBus, amount: number): void {
    let sendGain = this.sends.get(send);

    if (!sendGain) {
      sendGain = new Tone.Gain(amount);
      this.output.connect(sendGain);
      sendGain.connect(send.input);
      this.sends.set(send, sendGain);
    } else {
      sendGain.gain.value = amount;
    }
  }

  /**
   * Remove routing to a send bus
   * @param send - The send bus to disconnect
   */
  removeSend(send: SendBus): void {
    const sendGain = this.sends.get(send);
    if (sendGain) {
      sendGain.disconnect();
      sendGain.dispose();
      this.sends.delete(send);
    }
  }

  /**
   * Get all send routings
   */
  getSends(): Map<SendBus, number> {
    const result = new Map<SendBus, number>();
    this.sends.forEach((gain, send) => {
      result.set(send, gain.gain.value);
    });
    return result;
  }

  /**
   * Reconnect the audio chain after changes
   * Chain order: volumeNode → panNode → effects → muteNode → output
   */
  protected reconnectChain(): void {
    // Disconnect everything
    this.volumeNode.disconnect();
    this.panNode.disconnect();
    this.effectsChain.forEach((effect) => effect.disconnect());
    this.muteNode.disconnect();

    // Reconnect in order
    let prev: Tone.ToneAudioNode = this.volumeNode;

    this.panNode.connect(this.volumeNode);
    prev = this.panNode;

    this.effectsChain.forEach((effect) => {
      prev.connect(effect);
      prev = effect;
    });

    prev.connect(this.muteNode);
    this.muteNode.connect(this.output);
  }

  /**
   * Serialize track state
   */
  abstract serialize(): TrackData;

  /**
   * Deserialize and restore track state
   */
  abstract deserialize(data: TrackData): Promise<void>;

  /**
   * Clean up resources
   */
  dispose(): void {
    this.volumeNode.dispose();
    this.panNode.dispose();
    this.muteNode.dispose();
    this.effectsChain.forEach((effect) => effect.dispose());
    this.sends.forEach((gain) => gain.dispose());
    this.output.dispose();
  }

  /**
   * Generate a random color for the track
   */
  private randomColor(): string {
    const colors = ['#00d9ff', '#ff006e', '#7000ff', '#00ff88', '#ffaa00'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default Track;
