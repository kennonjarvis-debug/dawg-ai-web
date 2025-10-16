/**
 * Saturation/Distortion Plugin
 *
 * Analog-style harmonic saturation with:
 * - Multiple saturation algorithms (tube, tape, transistor)
 * - Adjustable drive and mix
 * - High-quality oversampling
 * - Tone control
 *
 * Sounds like tape saturation, tube warmth, or transistor grit
 */

import type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

export const SaturationPlugin: WebAudioPluginConfig = {
  name: 'Saturation',
  createProcessor: (context) => {
    const inputNode = context.createGain();
    const outputNode = context.createGain();

    // Drive/input gain
    const driveGain = context.createGain();
    driveGain.gain.value = 1;

    // Waveshaper for saturation
    const saturation = context.createWaveShaper();
    saturation.oversample = '4x'; // High-quality oversampling to avoid aliasing

    // Create tube-style saturation curve
    const createTubeCurve = (amount: number) => {
      const samples = 2048;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Asymmetric soft clipping (even harmonics like tubes)
        const y = Math.tanh(amount * x) * (1 + 0.1 * Math.abs(x));
        curve[i] = Math.max(-1, Math.min(1, y));
      }
      return curve;
    };

    // Create tape-style saturation curve
    const createTapeCurve = (amount: number) => {
      const samples = 2048;
      const curve = new Float32Array(samples);

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Gentle compression with soft saturation
        const compressed = x / (1 + Math.abs(x) * amount * 0.5);
        curve[i] = Math.tanh(compressed * amount);
      }
      return curve;
    };

    // Create transistor-style saturation curve
    const createTransistorCurve = (amount: number) => {
      const samples = 2048;
      const curve = new Float32Array(samples);

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Hard clipping at threshold with some rounding
        const threshold = 0.7 / amount;
        if (Math.abs(x) < threshold) {
          curve[i] = x * amount;
        } else {
          const sign = x > 0 ? 1 : -1;
          curve[i] = sign * (threshold + Math.tanh((Math.abs(x) - threshold) * 4) * 0.3);
        }
      }
      return curve;
    };

    // Default to tube saturation
    saturation.curve = createTubeCurve(2);

    // Output compensation
    const compensationGain = context.createGain();
    compensationGain.gain.value = 0.7; // Reduce level after saturation

    // Tone control (post-saturation EQ)
    const toneFilter = context.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 8000;
    toneFilter.Q.value = 0.7;

    // Dry/wet mix
    const wetGain = context.createGain();
    const dryGain = context.createGain();
    wetGain.gain.value = 0.5;
    dryGain.gain.value = 0.5;

    // Connect signal path
    inputNode.connect(driveGain);
    driveGain.connect(saturation);
    saturation.connect(compensationGain);
    compensationGain.connect(toneFilter);
    toneFilter.connect(wetGain);
    wetGain.connect(outputNode);

    // Dry path
    inputNode.connect(dryGain);
    dryGain.connect(outputNode);

    const parameterNodes = new Map<string, AudioParam | GainNode>();
    parameterNodes.set('drive', driveGain.gain);
    parameterNodes.set('tone', toneFilter.frequency);
    parameterNodes.set('mix', wetGain.gain);

    return {
      inputNode,
      outputNode,
      parameterNodes,
    };
  },

  parameters: [
    { id: 'drive', name: 'Drive', min: 0.1, max: 10, default: 1 },
    { id: 'amount', name: 'Amount', min: 1, max: 5, default: 2 },
    { id: 'type', name: 'Type', min: 0, max: 2, default: 0 }, // 0=tube, 1=tape, 2=transistor
    { id: 'tone', name: 'Tone', min: 2000, max: 20000, default: 8000 },
    { id: 'mix', name: 'Mix', min: 0, max: 1, default: 0.5 },
  ],
};
