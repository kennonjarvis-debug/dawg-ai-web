/**
 * Stereo Widener Plugin
 *
 * Professional stereo imaging with:
 * - Mid/Side processing
 * - Haas effect (psychoacoustic widening)
 * - Safe mono compatibility
 * - Frequency-dependent width
 *
 * Sounds like iZotope Ozone Imager or Waves S1
 */

import type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

export const StereoWidenerPlugin: WebAudioPluginConfig = {
  name: 'Stereo Widener',
  createProcessor: (context) => {
    const inputNode = context.createGain();
    const outputNode = context.createGain();

    // Create stereo splitter and merger
    const splitter = context.createChannelSplitter(2);
    const merger = context.createChannelMerger(2);

    // Mid/Side matrix
    // Mid = (L + R) / 2
    // Side = (L - R) / 2

    // For widening, we boost the side signal
    const midGain = context.createGain();
    const sideGain = context.createGain();
    midGain.gain.value = 0.7;
    sideGain.gain.value = 1.5; // Boost sides for width

    // Haas effect - slight delay on one channel for width
    const haasDelay = context.createDelay(0.05);
    haasDelay.delayTime.value = 0.02; // 20ms delay

    const haasGain = context.createGain();
    haasGain.gain.value = 0.3; // Subtle effect

    // High-pass filter for side signal (safer mono compatibility)
    const sideHighPass = context.createBiquadFilter();
    sideHighPass.type = 'highpass';
    sideHighPass.frequency.value = 200;
    sideHighPass.Q.value = 0.7;

    // Create matrix for M/S encoding
    const leftToMid = context.createGain();
    const rightToMid = context.createGain();
    const leftToSide = context.createGain();
    const rightToSide = context.createGain();

    leftToMid.gain.value = 0.5;
    rightToMid.gain.value = 0.5;
    leftToSide.gain.value = 0.5;
    rightToSide.gain.value = -0.5;

    // Create matrix for M/S decoding
    const midToLeft = context.createGain();
    const sideToLeft = context.createGain();
    const midToRight = context.createGain();
    const sideToRight = context.createGain();

    midToLeft.gain.value = 1;
    sideToLeft.gain.value = 1;
    midToRight.gain.value = 1;
    sideToRight.gain.value = -1;

    // Mid channel processing
    const midChannel = context.createGain();

    // Side channel processing
    const sideChannel = context.createGain();

    // Connect M/S encoding
    inputNode.connect(splitter);

    // Left to Mid/Side
    splitter.connect(leftToMid, 0);
    splitter.connect(leftToSide, 0);

    // Right to Mid/Side
    splitter.connect(rightToMid, 1);
    splitter.connect(rightToSide, 1);

    // Sum to Mid
    leftToMid.connect(midChannel);
    rightToMid.connect(midChannel);

    // Sum to Side
    leftToSide.connect(sideChannel);
    rightToSide.connect(sideChannel);

    // Process Mid
    midChannel.connect(midGain);

    // Process Side (with filtering)
    sideChannel.connect(sideHighPass);
    sideHighPass.connect(sideGain);

    // Add Haas effect to side
    sideGain.connect(haasDelay);
    haasDelay.connect(haasGain);

    // M/S decoding
    midGain.connect(midToLeft);
    midGain.connect(midToRight);
    sideGain.connect(sideToLeft);
    sideGain.connect(sideToRight);
    haasGain.connect(sideToLeft);

    // Merge back to stereo
    midToLeft.connect(merger, 0, 0);
    sideToLeft.connect(merger, 0, 0);
    midToRight.connect(merger, 0, 1);
    sideToRight.connect(merger, 0, 1);

    merger.connect(outputNode);

    const parameterNodes = new Map<string, AudioParam | GainNode>();
    parameterNodes.set('width', sideGain.gain);
    parameterNodes.set('haas-amount', haasGain.gain);
    parameterNodes.set('haas-delay', haasDelay.delayTime);
    parameterNodes.set('side-lowcut', sideHighPass.frequency);

    return {
      inputNode,
      outputNode,
      parameterNodes,
    };
  },

  parameters: [
    { id: 'width', name: 'Width', min: 0, max: 3, default: 1.5 },
    { id: 'haas-amount', name: 'Haas Amount', min: 0, max: 0.5, default: 0.3 },
    { id: 'haas-delay', name: 'Haas Delay', min: 0.001, max: 0.05, default: 0.02 },
    { id: 'side-lowcut', name: 'Side Low Cut', min: 20, max: 500, default: 200 },
  ],
};
