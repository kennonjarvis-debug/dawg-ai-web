/**
 * MasterBus - Final output stage with metering and limiting
 *
 * Handles the master output chain with:
 * - Limiter to prevent clipping
 * - Metering for level visualization
 * - Frequency analysis for visualizations
 */

import * as Tone from 'tone';

export class MasterBus {
  public input: Tone.Gain;
  public output: Tone.Gain;

  private limiter: Tone.Limiter;
  private meter: Tone.Meter;
  private analyser: AnalyserNode;

  constructor() {
    this.input = new Tone.Gain(1);
    this.limiter = new Tone.Limiter(-1); // Prevent clipping at -1dB
    this.meter = new Tone.Meter();
    this.output = new Tone.Gain(1);

    // Connect chain: input → limiter → meter → output → destination
    this.input.connect(this.limiter);
    this.limiter.connect(this.meter);
    this.meter.connect(this.output);
    this.output.toDestination();

    // Create analyser for visualization
    this.analyser = Tone.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.output.connect(this.analyser);
  }

  /**
   * Get current meter level in dB
   */
  getMeterLevel(): number {
    return this.meter.getValue() as number;
  }

  /**
   * Get frequency spectrum data for visualization
   */
  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Get waveform data for visualization
   */
  getWaveformData(): Uint8Array {
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  /**
   * Set master output volume
   * @param db - Volume in decibels
   */
  setVolume(db: number): void {
    this.output.gain.value = Tone.dbToGain(db);
  }

  /**
   * Get current master volume
   * @returns Volume in decibels
   */
  getVolume(): number {
    return Tone.gainToDb(this.output.gain.value);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.input.dispose();
    this.limiter.dispose();
    this.meter.dispose();
    this.output.dispose();
  }
}

export default MasterBus;
