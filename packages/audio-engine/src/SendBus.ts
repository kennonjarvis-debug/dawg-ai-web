/**
 * SendBus - Auxiliary effect bus for shared effects
 *
 * Allows multiple tracks to route to a shared effect (e.g., reverb, delay)
 * Each track can control its send amount independently
 */

import * as Tone from 'tone';
import { SendBusData } from './types/audio';

export class SendBus {
  public readonly name: string;
  public input: Tone.Gain;
  public output: Tone.Gain;
  public effect: Tone.ToneAudioNode;

  private wetDry: Tone.CrossFade;

  constructor(name: string, effect: Tone.ToneAudioNode) {
    this.name = name;
    this.effect = effect;

    // Create input/output nodes
    this.input = new Tone.Gain(1);
    this.wetDry = new Tone.CrossFade(1); // 100% wet by default for sends
    this.output = new Tone.Gain(1);

    // Connect: input → effect → wetDry(wet) → output
    //                     ↓
    //          input → wetDry(dry) → output
    this.input.connect(this.effect);
    this.effect.connect(this.wetDry.b); // wet signal

    this.input.connect(this.wetDry.a); // dry signal (for parallel processing if needed)
    this.wetDry.connect(this.output);
  }

  /**
   * Set wet/dry mix (0 = dry, 1 = wet)
   * @param amount - 0 to 1
   */
  setWetDry(amount: number): void {
    this.wetDry.fade.value = Math.max(0, Math.min(1, amount));
  }

  /**
   * Get current wet/dry mix
   */
  getWetDry(): number {
    return this.wetDry.fade.value;
  }

  /**
   * Set output volume
   * @param db - Volume in decibels
   */
  setVolume(db: number): void {
    this.output.gain.value = Tone.dbToGain(db);
  }

  /**
   * Get current output volume
   * @returns Volume in decibels
   */
  getVolume(): number {
    return Tone.gainToDb(this.output.gain.value);
  }

  /**
   * Serialize send bus state
   */
  serialize(): SendBusData {
    return {
      name: this.name,
      effectType: this.effect.name,
      params: {
        wetDry: this.getWetDry(),
        volume: this.getVolume(),
      },
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.input.dispose();
    this.wetDry.dispose();
    this.output.dispose();
    this.effect.dispose();
  }
}

export default SendBus;
