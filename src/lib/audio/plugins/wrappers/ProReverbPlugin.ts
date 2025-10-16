/**
 * Professional Reverb Plugin
 *
 * High-quality algorithmic reverb using multiple delay lines,
 * feedback matrices, and early reflections.
 * Sounds comparable to professional reverb units.
 */

import type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

export const ProReverbPlugin: WebAudioPluginConfig = {
  name: 'Pro Reverb',
  createProcessor: (context) => {
    // Create a network of delays for dense reverb tail
    const inputNode = context.createGain();
    const outputNode = context.createGain();
    const wetGain = context.createGain();
    const dryGain = context.createGain();

    // Pre-delay
    const preDelay = context.createDelay(0.1);
    preDelay.delayTime.value = 0.02; // 20ms pre-delay

    // Early reflections (8 taps for spatial impression)
    const earlyReflections = [
      { delay: 0.013, gain: 0.8 },
      { delay: 0.019, gain: 0.7 },
      { delay: 0.023, gain: 0.65 },
      { delay: 0.029, gain: 0.6 },
      { delay: 0.031, gain: 0.55 },
      { delay: 0.037, gain: 0.5 },
      { delay: 0.041, gain: 0.45 },
      { delay: 0.043, gain: 0.4 },
    ].map(({ delay, gain }) => {
      const delayNode = context.createDelay(0.1);
      const gainNode = context.createGain();
      delayNode.delayTime.value = delay;
      gainNode.gain.value = gain;
      return { delay: delayNode, gain: gainNode };
    });

    // Late reverb - Schroeder reverberator with 4 comb filters
    const combFilters = [
      { delay: 0.0297, gain: 0.742 },
      { delay: 0.0371, gain: 0.733 },
      { delay: 0.0411, gain: 0.715 },
      { delay: 0.0437, gain: 0.697 },
    ].map(({ delay, gain }) => {
      const delayNode = context.createDelay(0.1);
      const gainNode = context.createGain();
      const feedbackGain = context.createGain();

      delayNode.delayTime.value = delay;
      gainNode.gain.value = gain;
      feedbackGain.gain.value = 0.84; // Feedback for tail

      return { delay: delayNode, gain: gainNode, feedback: feedbackGain };
    });

    // All-pass filters for diffusion (4 stages)
    const allpassFilters = [
      { delay: 0.0051, gain: 0.7 },
      { delay: 0.0067, gain: 0.7 },
      { delay: 0.0083, gain: 0.7 },
      { delay: 0.0097, gain: 0.7 },
    ].map(({ delay, gain }) => {
      const delayNode = context.createDelay(0.02);
      const gainNode = context.createGain();
      const feedbackGain = context.createGain();

      delayNode.delayTime.value = delay;
      gainNode.gain.value = gain;
      feedbackGain.gain.value = -gain; // Inverted feedback for all-pass

      return { delay: delayNode, gain: gainNode, feedback: feedbackGain };
    });

    // High-frequency damping (reverb gets darker over time)
    const dampingFilter = context.createBiquadFilter();
    dampingFilter.type = 'lowpass';
    dampingFilter.frequency.value = 4000;
    dampingFilter.Q.value = 0.7;

    // Low-cut to remove muddiness
    const lowCut = context.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.value = 200;
    lowCut.Q.value = 0.7;

    // Connect early reflections
    inputNode.connect(preDelay);
    earlyReflections.forEach(({ delay, gain }) => {
      preDelay.connect(delay);
      delay.connect(gain);
      gain.connect(wetGain);
    });

    // Connect comb filters (in parallel)
    const combMixer = context.createGain();
    combMixer.gain.value = 0.25; // Mix 4 combs

    combFilters.forEach(({ delay, gain, feedback }) => {
      preDelay.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay); // Feedback loop
      delay.connect(gain);
      gain.connect(combMixer);
    });

    // Connect all-pass filters (in series for diffusion)
    let allpassChain = combMixer;
    allpassFilters.forEach(({ delay, gain, feedback }) => {
      allpassChain.connect(delay);
      delay.connect(gain);
      gain.connect(feedback);
      feedback.connect(delay); // All-pass feedback
      allpassChain = gain;
    });

    // Apply damping and filtering
    allpassChain.connect(dampingFilter);
    dampingFilter.connect(lowCut);
    lowCut.connect(wetGain);

    // Mix wet/dry
    inputNode.connect(dryGain);
    dryGain.connect(outputNode);
    wetGain.connect(outputNode);

    wetGain.gain.value = 0.3; // 30% wet
    dryGain.gain.value = 0.7; // 70% dry

    const parameterNodes = new Map<string, AudioParam | GainNode>();
    parameterNodes.set('room-size', combFilters[0].delay.delayTime);
    parameterNodes.set('decay', combFilters[0].feedback.gain);
    parameterNodes.set('damping', dampingFilter.frequency);
    parameterNodes.set('pre-delay', preDelay.delayTime);
    parameterNodes.set('wet', wetGain.gain);
    parameterNodes.set('dry', dryGain.gain);

    return {
      inputNode,
      outputNode,
      parameterNodes,
    };
  },

  parameters: [
    { id: 'room-size', name: 'Room Size', min: 0.01, max: 0.1, default: 0.05 },
    { id: 'decay', name: 'Decay Time', min: 0.3, max: 0.95, default: 0.7 },
    { id: 'damping', name: 'High Damping', min: 1000, max: 16000, default: 4000 },
    { id: 'pre-delay', name: 'Pre-Delay', min: 0, max: 0.1, default: 0.02 },
    { id: 'wet', name: 'Wet', min: 0, max: 1, default: 0.3 },
    { id: 'dry', name: 'Dry', min: 0, max: 1, default: 0.7 },
  ],
};
