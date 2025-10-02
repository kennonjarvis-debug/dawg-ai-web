/**
 * Audio Effects Utilities - Instance 2 (Audio Engine)
 *
 * Provides audio effect processors using Web Audio API
 * - 3-band Parametric EQ
 * - Dynamics compression
 * - Reverb (convolution)
 * - Delay
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface EQBandParams {
  frequency: number;  // Hz
  gain: number;       // dB (-12 to +12)
  Q: number;          // Quality factor (0.1 to 10)
  type: BiquadFilterType;
}

export interface EQParams {
  low: EQBandParams;
  mid: EQBandParams;
  high: EQBandParams;
  enabled: boolean;
}

export interface CompressorParams {
  threshold: number;    // dB (-100 to 0)
  ratio: number;        // 1 to 20
  attack: number;       // seconds (0 to 1)
  release: number;      // seconds (0 to 1)
  knee: number;         // dB (0 to 40)
  enabled: boolean;
}

export interface ReverbParams {
  wetDryMix: number;    // 0 to 1
  decay: number;        // seconds (0.1 to 10)
  preDelay: number;     // milliseconds (0 to 100)
  enabled: boolean;
}

export interface DelayParams {
  time: number;         // seconds (0 to 2)
  feedback: number;     // 0 to 1
  wetDryMix: number;    // 0 to 1
  enabled: boolean;
}

// ============================================================================
// EQ PRESETS
// ============================================================================

export const EQ_PRESETS: Record<string, EQParams> = {
  flat: {
    enabled: true,
    low: { frequency: 80, gain: 0, Q: 1.0, type: 'lowshelf' },
    mid: { frequency: 1000, gain: 0, Q: 1.0, type: 'peaking' },
    high: { frequency: 8000, gain: 0, Q: 1.0, type: 'highshelf' },
  },
  vocal: {
    enabled: true,
    low: { frequency: 80, gain: -2, Q: 1.0, type: 'lowshelf' },
    mid: { frequency: 3000, gain: 3, Q: 2.0, type: 'peaking' },
    high: { frequency: 10000, gain: 2, Q: 1.0, type: 'highshelf' },
  },
  warmth: {
    enabled: true,
    low: { frequency: 120, gain: 3, Q: 1.0, type: 'lowshelf' },
    mid: { frequency: 1000, gain: -1, Q: 1.0, type: 'peaking' },
    high: { frequency: 8000, gain: -2, Q: 1.0, type: 'highshelf' },
  },
  presence: {
    enabled: true,
    low: { frequency: 80, gain: -3, Q: 1.0, type: 'lowshelf' },
    mid: { frequency: 2500, gain: 4, Q: 2.0, type: 'peaking' },
    high: { frequency: 12000, gain: 3, Q: 1.0, type: 'highshelf' },
  },
  radio: {
    enabled: true,
    low: { frequency: 200, gain: -6, Q: 1.0, type: 'lowshelf' },
    mid: { frequency: 2000, gain: 6, Q: 3.0, type: 'peaking' },
    high: { frequency: 6000, gain: -4, Q: 1.0, type: 'highshelf' },
  },
};

// ============================================================================
// EQ PROCESSOR
// ============================================================================

export class ParametricEQ {
  private context: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private lowBand: BiquadFilterNode;
  private midBand: BiquadFilterNode;
  private highBand: BiquadFilterNode;
  private bypassNode: GainNode;
  private params: EQParams;

  constructor(context: AudioContext, initialParams?: Partial<EQParams>) {
    this.context = context;
    this.params = initialParams ? { ...EQ_PRESETS.flat, ...initialParams } : EQ_PRESETS.flat;

    // Create nodes
    this.input = context.createGain();
    this.output = context.createGain();
    this.bypassNode = context.createGain();

    // Create filter nodes
    this.lowBand = context.createBiquadFilter();
    this.midBand = context.createBiquadFilter();
    this.highBand = context.createBiquadFilter();

    // Set initial filter types
    this.lowBand.type = 'lowshelf';
    this.midBand.type = 'peaking';
    this.highBand.type = 'highshelf';

    // Connect nodes: input -> low -> mid -> high -> output
    this.input.connect(this.lowBand);
    this.lowBand.connect(this.midBand);
    this.midBand.connect(this.highBand);
    this.highBand.connect(this.output);

    // Bypass connection
    this.input.connect(this.bypassNode);

    // Apply initial parameters
    this.updateParams(this.params);
  }

  getInputNode(): AudioNode {
    return this.input;
  }

  connect(destination: AudioNode): void {
    if (this.params.enabled) {
      this.output.connect(destination);
    } else {
      this.bypassNode.connect(destination);
    }
  }

  disconnect(): void {
    this.output.disconnect();
    this.bypassNode.disconnect();
  }

  updateParams(params: Partial<EQParams>): void {
    this.params = { ...this.params, ...params };

    if (params.low) {
      this.updateBand(this.lowBand, { ...this.params.low, ...params.low });
    }
    if (params.mid) {
      this.updateBand(this.midBand, { ...this.params.mid, ...params.mid });
    }
    if (params.high) {
      this.updateBand(this.highBand, { ...this.params.high, ...params.high });
    }

    // Handle bypass
    if (params.enabled !== undefined) {
      this.setEnabled(params.enabled);
    }
  }

  private updateBand(filter: BiquadFilterNode, params: EQBandParams): void {
    const now = this.context.currentTime;
    filter.frequency.setValueAtTime(params.frequency, now);
    filter.gain.setValueAtTime(params.gain, now);
    filter.Q.setValueAtTime(params.Q, now);
    filter.type = params.type;
  }

  setEnabled(enabled: boolean): void {
    this.params.enabled = enabled;
    this.disconnect();
    if (enabled) {
      this.output.connect(this.context.destination);
    } else {
      this.bypassNode.connect(this.context.destination);
    }
  }

  loadPreset(presetName: keyof typeof EQ_PRESETS): void {
    const preset = EQ_PRESETS[presetName];
    if (preset) {
      this.updateParams(preset);
    }
  }

  getParams(): EQParams {
    return { ...this.params };
  }

  destroy(): void {
    this.disconnect();
    this.input.disconnect();
    this.lowBand.disconnect();
    this.midBand.disconnect();
    this.highBand.disconnect();
  }
}

// ============================================================================
// COMPRESSOR PROCESSOR
// ============================================================================

export class DynamicsCompressor {
  private context: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private compressor: DynamicsCompressorNode;
  private bypassNode: GainNode;
  private params: CompressorParams;

  constructor(context: AudioContext, initialParams?: Partial<CompressorParams>) {
    this.context = context;
    this.params = initialParams ? { ...this.getDefaultParams(), ...initialParams } : this.getDefaultParams();

    // Create nodes
    this.input = context.createGain();
    this.output = context.createGain();
    this.bypassNode = context.createGain();
    this.compressor = context.createDynamicsCompressor();

    // Connect: input -> compressor -> output
    this.input.connect(this.compressor);
    this.compressor.connect(this.output);

    // Bypass connection
    this.input.connect(this.bypassNode);

    // Apply initial parameters
    this.updateParams(this.params);
  }

  private getDefaultParams(): CompressorParams {
    return {
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 30,
      enabled: true,
    };
  }

  getInputNode(): AudioNode {
    return this.input;
  }

  connect(destination: AudioNode): void {
    if (this.params.enabled) {
      this.output.connect(destination);
    } else {
      this.bypassNode.connect(destination);
    }
  }

  disconnect(): void {
    this.output.disconnect();
    this.bypassNode.disconnect();
  }

  updateParams(params: Partial<CompressorParams>): void {
    this.params = { ...this.params, ...params };
    const now = this.context.currentTime;

    if (params.threshold !== undefined) {
      this.compressor.threshold.setValueAtTime(params.threshold, now);
    }
    if (params.ratio !== undefined) {
      this.compressor.ratio.setValueAtTime(params.ratio, now);
    }
    if (params.attack !== undefined) {
      this.compressor.attack.setValueAtTime(params.attack, now);
    }
    if (params.release !== undefined) {
      this.compressor.release.setValueAtTime(params.release, now);
    }
    if (params.knee !== undefined) {
      this.compressor.knee.setValueAtTime(params.knee, now);
    }
    if (params.enabled !== undefined) {
      this.setEnabled(params.enabled);
    }
  }

  setEnabled(enabled: boolean): void {
    this.params.enabled = enabled;
    this.disconnect();
    if (enabled) {
      this.output.connect(this.context.destination);
    } else {
      this.bypassNode.connect(this.context.destination);
    }
  }

  getParams(): CompressorParams {
    return { ...this.params };
  }

  // Get real-time compression reduction (for metering)
  getReduction(): number {
    return this.compressor.reduction;
  }

  destroy(): void {
    this.disconnect();
    this.input.disconnect();
    this.compressor.disconnect();
  }
}

// ============================================================================
// REVERB PROCESSOR
// ============================================================================

export class ConvolutionReverb {
  private context: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private convolver: ConvolverNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private bypassNode: GainNode;
  private params: ReverbParams;

  constructor(context: AudioContext, initialParams?: Partial<ReverbParams>) {
    this.context = context;
    this.params = initialParams ? { ...this.getDefaultParams(), ...initialParams } : this.getDefaultParams();

    // Create nodes
    this.input = context.createGain();
    this.output = context.createGain();
    this.bypassNode = context.createGain();

    this.convolver = context.createConvolver();
    this.wetGain = context.createGain();
    this.dryGain = context.createGain();

    // Connect: input -> [dry path] -> output
    //               -> [wet path with convolver] -> output
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.input.connect(this.convolver);
    this.convolver.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Bypass connection
    this.input.connect(this.bypassNode);

    // Generate initial impulse response
    this.generateImpulseResponse(this.params.decay, this.params.preDelay);

    // Apply initial parameters
    this.updateParams(this.params);
  }

  private getDefaultParams(): ReverbParams {
    return {
      wetDryMix: 0.3,      // 30% wet
      decay: 2.0,          // 2 second decay
      preDelay: 0,         // No pre-delay
      enabled: true,
    };
  }

  getInputNode(): AudioNode {
    return this.input;
  }

  /**
   * Generate impulse response for convolution reverb
   */
  private generateImpulseResponse(decay: number, preDelay: number): void {
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.context.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    const preDelaySamples = Math.floor((preDelay / 1000) * sampleRate);

    for (let i = 0; i < length; i++) {
      // Exponential decay
      const n = i - preDelaySamples;
      if (n < 0) {
        impulseL[i] = 0;
        impulseR[i] = 0;
      } else {
        const decay = Math.exp((-3 * n) / length);
        // Add randomness for natural sound
        impulseL[i] = (Math.random() * 2 - 1) * decay;
        impulseR[i] = (Math.random() * 2 - 1) * decay;
      }
    }

    this.convolver.buffer = impulse;
  }

  connect(destination: AudioNode): void {
    if (this.params.enabled) {
      this.output.connect(destination);
    } else {
      this.bypassNode.connect(destination);
    }
  }

  disconnect(): void {
    this.output.disconnect();
    this.bypassNode.disconnect();
  }

  updateParams(params: Partial<ReverbParams>): void {
    this.params = { ...this.params, ...params };
    const now = this.context.currentTime;

    if (params.wetDryMix !== undefined) {
      const wet = params.wetDryMix;
      const dry = 1 - wet;
      this.wetGain.gain.setValueAtTime(wet, now);
      this.dryGain.gain.setValueAtTime(dry, now);
    }

    if (params.decay !== undefined || params.preDelay !== undefined) {
      this.generateImpulseResponse(
        params.decay ?? this.params.decay,
        params.preDelay ?? this.params.preDelay
      );
    }

    if (params.enabled !== undefined) {
      this.setEnabled(params.enabled);
    }
  }

  setEnabled(enabled: boolean): void {
    this.params.enabled = enabled;
    this.disconnect();
    if (enabled) {
      this.output.connect(this.context.destination);
    } else {
      this.bypassNode.connect(this.context.destination);
    }
  }

  getParams(): ReverbParams {
    return { ...this.params };
  }

  destroy(): void {
    this.disconnect();
    this.input.disconnect();
    this.convolver.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
  }
}

// ============================================================================
// DELAY PROCESSOR
// ============================================================================

export class Delay {
  private context: AudioContext;
  private input: GainNode;
  private output: GainNode;
  private delay: DelayNode;
  private feedback: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private bypassNode: GainNode;
  private params: DelayParams;

  constructor(context: AudioContext, initialParams?: Partial<DelayParams>) {
    this.context = context;
    this.params = initialParams ? { ...this.getDefaultParams(), ...initialParams } : this.getDefaultParams();

    // Create nodes
    this.input = context.createGain();
    this.output = context.createGain();
    this.bypassNode = context.createGain();

    this.delay = context.createDelay(5.0); // Max 5 seconds
    this.feedback = context.createGain();
    this.wetGain = context.createGain();
    this.dryGain = context.createGain();

    // Connect: input -> dry -> output
    //               -> delay -> feedback -> delay (loop)
    //                        -> wet -> output
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);

    this.input.connect(this.delay);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.delay); // Feedback loop
    this.delay.connect(this.wetGain);
    this.wetGain.connect(this.output);

    // Bypass connection
    this.input.connect(this.bypassNode);

    // Apply initial parameters
    this.updateParams(this.params);
  }

  getInputNode(): AudioNode {
    return this.input;
  }

  private getDefaultParams(): DelayParams {
    return {
      time: 0.25,          // 250ms (quarter note at 120 BPM)
      feedback: 0.3,       // 30% feedback
      wetDryMix: 0.3,      // 30% wet
      enabled: true,
    };
  }

  connect(destination: AudioNode): void {
    if (this.params.enabled) {
      this.output.connect(destination);
    } else {
      this.bypassNode.connect(destination);
    }
  }

  disconnect(): void {
    this.output.disconnect();
    this.bypassNode.disconnect();
  }

  updateParams(params: Partial<DelayParams>): void {
    this.params = { ...this.params, ...params };
    const now = this.context.currentTime;

    if (params.time !== undefined) {
      this.delay.delayTime.setValueAtTime(params.time, now);
    }

    if (params.feedback !== undefined) {
      this.feedback.gain.setValueAtTime(params.feedback, now);
    }

    if (params.wetDryMix !== undefined) {
      const wet = params.wetDryMix;
      const dry = 1 - wet;
      this.wetGain.gain.setValueAtTime(wet, now);
      this.dryGain.gain.setValueAtTime(dry, now);
    }

    if (params.enabled !== undefined) {
      this.setEnabled(params.enabled);
    }
  }

  setEnabled(enabled: boolean): void {
    this.params.enabled = enabled;
    this.disconnect();
    if (enabled) {
      this.output.connect(this.context.destination);
    } else {
      this.bypassNode.connect(this.context.destination);
    }
  }

  /**
   * Sync delay time to BPM
   * @param bpm Beats per minute
   * @param subdivision Note value (1 = whole, 0.5 = half, 0.25 = quarter, etc.)
   */
  syncToBPM(bpm: number, subdivision: number = 0.25): void {
    const beatDuration = 60 / bpm; // Duration of one beat in seconds
    const delayTime = beatDuration * subdivision;
    this.updateParams({ time: delayTime });
  }

  getParams(): DelayParams {
    return { ...this.params };
  }

  destroy(): void {
    this.disconnect();
    this.input.disconnect();
    this.delay.disconnect();
    this.feedback.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert dB to linear gain
 */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear gain to dB
 */
export function gainToDb(gain: number): number {
  return 20 * Math.log10(gain);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate delay time from BPM and note subdivision
 */
export function bpmToDelayTime(bpm: number, subdivision: number = 0.25): number {
  const beatDuration = 60 / bpm;
  return beatDuration * subdivision;
}
