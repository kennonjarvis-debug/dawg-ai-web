/**
 * Professional Parametric EQ Plugin
 *
 * 5-band fully parametric EQ with:
 * - Low/high shelving filters
 * - 3 parametric bell filters
 * - Variable Q (bandwidth)
 * - Professional filter curves
 *
 * Sounds like Neve, SSL, or API console EQs
 */

import type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

export const ProEQPlugin: WebAudioPluginConfig = {
  name: 'Pro EQ',
  createProcessor: (context) => {
    const inputNode = context.createGain();
    const outputNode = context.createGain();

    // Low shelf (80Hz typical)
    const lowShelf = context.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 80;
    lowShelf.gain.value = 0;
    lowShelf.Q.value = 0.7;

    // Low-mid bell (250Hz typical - "warmth" band)
    const lowMid = context.createBiquadFilter();
    lowMid.type = 'peaking';
    lowMid.frequency.value = 250;
    lowMid.gain.value = 0;
    lowMid.Q.value = 1;

    // Mid bell (1kHz typical - "presence" band)
    const mid = context.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.gain.value = 0;
    mid.Q.value = 1;

    // High-mid bell (4kHz typical - "clarity" band)
    const highMid = context.createBiquadFilter();
    highMid.type = 'peaking';
    highMid.frequency.value = 4000;
    highMid.gain.value = 0;
    highMid.Q.value = 1;

    // High shelf (12kHz typical - "air" band)
    const highShelf = context.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 12000;
    highShelf.gain.value = 0;
    highShelf.Q.value = 0.7;

    // Output gain for overall level adjustment
    const outputGain = context.createGain();
    outputGain.gain.value = 1;

    // Connect in series
    inputNode.connect(lowShelf);
    lowShelf.connect(lowMid);
    lowMid.connect(mid);
    mid.connect(highMid);
    highMid.connect(highShelf);
    highShelf.connect(outputGain);
    outputGain.connect(outputNode);

    const parameterNodes = new Map<string, AudioParam | GainNode>();
    // Low shelf
    parameterNodes.set('low-freq', lowShelf.frequency);
    parameterNodes.set('low-gain', lowShelf.gain);
    parameterNodes.set('low-q', lowShelf.Q);
    // Low-mid bell
    parameterNodes.set('low-mid-freq', lowMid.frequency);
    parameterNodes.set('low-mid-gain', lowMid.gain);
    parameterNodes.set('low-mid-q', lowMid.Q);
    // Mid bell
    parameterNodes.set('mid-freq', mid.frequency);
    parameterNodes.set('mid-gain', mid.gain);
    parameterNodes.set('mid-q', mid.Q);
    // High-mid bell
    parameterNodes.set('high-mid-freq', highMid.frequency);
    parameterNodes.set('high-mid-gain', highMid.gain);
    parameterNodes.set('high-mid-q', highMid.Q);
    // High shelf
    parameterNodes.set('high-freq', highShelf.frequency);
    parameterNodes.set('high-gain', highShelf.gain);
    parameterNodes.set('high-q', highShelf.Q);
    // Output
    parameterNodes.set('output-gain', outputGain.gain);

    return {
      inputNode,
      outputNode,
      parameterNodes,
    };
  },

  parameters: [
    // Low shelf
    { id: 'low-freq', name: 'Low Frequency', min: 20, max: 200, default: 80 },
    { id: 'low-gain', name: 'Low Gain', min: -24, max: 24, default: 0 },
    { id: 'low-q', name: 'Low Q', min: 0.3, max: 2, default: 0.7 },

    // Low-mid
    { id: 'low-mid-freq', name: 'Low-Mid Frequency', min: 100, max: 1000, default: 250 },
    { id: 'low-mid-gain', name: 'Low-Mid Gain', min: -24, max: 24, default: 0 },
    { id: 'low-mid-q', name: 'Low-Mid Q', min: 0.3, max: 10, default: 1 },

    // Mid
    { id: 'mid-freq', name: 'Mid Frequency', min: 500, max: 5000, default: 1000 },
    { id: 'mid-gain', name: 'Mid Gain', min: -24, max: 24, default: 0 },
    { id: 'mid-q', name: 'Mid Q', min: 0.3, max: 10, default: 1 },

    // High-mid
    { id: 'high-mid-freq', name: 'High-Mid Frequency', min: 2000, max: 16000, default: 4000 },
    { id: 'high-mid-gain', name: 'High-Mid Gain', min: -24, max: 24, default: 0 },
    { id: 'high-mid-q', name: 'High-Mid Q', min: 0.3, max: 10, default: 1 },

    // High shelf
    { id: 'high-freq', name: 'High Frequency', min: 5000, max: 20000, default: 12000 },
    { id: 'high-gain', name: 'High Gain', min: -24, max: 24, default: 0 },
    { id: 'high-q', name: 'High Q', min: 0.3, max: 2, default: 0.7 },

    // Output
    { id: 'output-gain', name: 'Output Gain', min: 0.1, max: 2, default: 1 },
  ],
};
