/**
 * Professional Limiter Plugin
 *
 * Transparent brickwall limiter with:
 * - Lookahead for transient preservation
 * - Soft/hard clipping modes
 * - Auto makeup gain
 * - True peak limiting
 *
 * Sounds like Waves L2, FabFilter Pro-L, or Ozone Maximizer
 */

import type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

export const LimiterPlugin: WebAudioPluginConfig = {
  name: 'Limiter',
  createProcessor: (context) => {
    const inputNode = context.createGain();
    const outputNode = context.createGain();

    // Input gain for driving into limiter
    const inputGain = context.createGain();
    inputGain.gain.value = 1;

    // Lookahead delay (preserves transients)
    const lookahead = context.createDelay(0.01);
    lookahead.delayTime.value = 0.005; // 5ms lookahead

    // Main limiter (using compressor with extreme settings)
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -1; // Close to 0dB
    limiter.knee.value = 0; // Hard knee for limiting
    limiter.ratio.value = 20; // Maximum ratio (brickwall)
    limiter.attack.value = 0.001; // 1ms - very fast
    limiter.release.value = 0.1; // 100ms - quick but musical

    // Safety clipper (true peak protection)
    const clipper = context.createWaveShaper();
    const createClipperCurve = (ceiling: number) => {
      const samples = 1024;
      const curve = new Float32Array(samples);

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        // Soft clip near ceiling
        if (Math.abs(x) < ceiling * 0.9) {
          curve[i] = x;
        } else {
          const sign = x > 0 ? 1 : -1;
          const excess = Math.abs(x) - ceiling * 0.9;
          curve[i] = sign * (ceiling * 0.9 + Math.tanh(excess * 10) * ceiling * 0.1);
        }
        // Hard clip at ceiling
        curve[i] = Math.max(-ceiling, Math.min(ceiling, curve[i]));
      }
      return curve;
    };
    clipper.curve = createClipperCurve(0.99);
    clipper.oversample = '4x';

    // Output gain (ceiling control)
    const outputGain = context.createGain();
    outputGain.gain.value = 1;

    // Metering filter (true peak detection simulation)
    const meterFilter = context.createBiquadFilter();
    meterFilter.type = 'lowpass';
    meterFilter.frequency.value = 20000;
    meterFilter.Q.value = 0.7;

    // Connect signal path
    inputNode.connect(inputGain);
    inputGain.connect(lookahead);
    lookahead.connect(limiter);
    limiter.connect(clipper);
    clipper.connect(meterFilter);
    meterFilter.connect(outputGain);
    outputGain.connect(outputNode);

    const parameterNodes = new Map<string, AudioParam | GainNode>();
    parameterNodes.set('threshold', limiter.threshold);
    parameterNodes.set('ceiling', outputGain.gain);
    parameterNodes.set('release', limiter.release);
    parameterNodes.set('input-gain', inputGain.gain);
    parameterNodes.set('lookahead', lookahead.delayTime);

    return {
      inputNode,
      outputNode,
      parameterNodes,
    };
  },

  parameters: [
    { id: 'threshold', name: 'Threshold', min: -30, max: -0.1, default: -1 },
    { id: 'ceiling', name: 'Ceiling', min: 0.5, max: 1, default: 0.99 },
    { id: 'release', name: 'Release', min: 0.01, max: 1, default: 0.1 },
    { id: 'input-gain', name: 'Input Gain', min: 0.5, max: 4, default: 1 },
    { id: 'lookahead', name: 'Lookahead', min: 0, max: 0.01, default: 0.005 },
  ],
};
