/**
 * useVocalEffects Hook - Instance 2 (Audio Engine)
 *
 * Manages vocal effects chain for individual tracks
 * Integrates with pitch detection and audio effects
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PitchCorrection,
  VocalDoubler,
  DeEsser,
  PitchCorrectionParams,
  VocalDoublerParams,
  DeEsserParams,
  VOCAL_PRESETS,
} from '@/src/utils/vocalEffects';

export interface VocalEffectsChain {
  pitchCorrection: PitchCorrection | null;
  doubler: VocalDoubler | null;
  deEsser: DeEsser | null;
}

export interface UseVocalEffectsOptions {
  trackId: string;
  audioContext: AudioContext | null;
  enabled?: boolean;
}

export interface UseVocalEffectsReturn {
  // Effect processors
  pitchCorrection: PitchCorrection | null;
  doubler: VocalDoubler | null;
  deEsser: DeEsser | null;

  // Pitch correction controls
  updatePitchCorrection: (params: Partial<PitchCorrectionParams>) => void;
  togglePitchCorrection: (enabled: boolean) => void;
  getPitchCorrectionParams: () => PitchCorrectionParams | null;
  setPitchCorrectionScale: (scale: 'chromatic' | 'major' | 'minor' | 'pentatonic', rootNote: number) => void;

  // Vocal doubler controls
  updateDoubler: (params: Partial<VocalDoublerParams>) => void;
  toggleDoubler: (enabled: boolean) => void;
  getDoublerParams: () => VocalDoublerParams | null;

  // De-esser controls
  updateDeEsser: (params: Partial<DeEsserParams>) => void;
  toggleDeEsser: (enabled: boolean) => void;
  getDeEsserParams: () => DeEsserParams | null;
  setDeEsserListenMode: (enabled: boolean) => void;

  // Preset management
  loadPreset: (presetName: keyof typeof VOCAL_PRESETS) => void;
  getAvailablePresets: () => string[];

  // Chain management
  connectChain: (source: AudioNode, destination: AudioNode) => void;
  disconnectChain: () => void;

  // Cleanup
  destroy: () => void;
}

export function useVocalEffects({
  trackId,
  audioContext,
  enabled = true,
}: UseVocalEffectsOptions): UseVocalEffectsReturn {
  const [pitchCorrection, setPitchCorrection] = useState<PitchCorrection | null>(null);
  const [doubler, setDoubler] = useState<VocalDoubler | null>(null);
  const [deEsser, setDeEsser] = useState<DeEsser | null>(null);

  const chainRef = useRef<{
    pitchCorrection: PitchCorrection | null;
    doubler: VocalDoubler | null;
    deEsser: DeEsser | null;
    inputNode: GainNode | null;
    outputNode: GainNode | null;
  }>({
    pitchCorrection: null,
    doubler: null,
    deEsser: null,
    inputNode: null,
    outputNode: null,
  });

  // Initialize vocal effects chain when audio context is available
  useEffect(() => {
    if (!audioContext || !enabled) {
      return;
    }

    // Create effect processors
    const pitchCorrectionProcessor = new PitchCorrection(audioContext, {
      enabled: false, // Disabled by default
    });
    const doublerProcessor = new VocalDoubler(audioContext, {
      enabled: false, // Disabled by default
    });
    const deEsserProcessor = new DeEsser(audioContext, {
      enabled: true, // De-esser enabled by default (subtle, always helpful)
      frequency: 6000,
      threshold: -30,
      reduction: 6,
    });

    // Create input/output gain nodes for the chain
    const inputNode = audioContext.createGain();
    const outputNode = audioContext.createGain();

    // Connect chain: input -> pitchCorrection -> doubler -> deEsser -> output
    inputNode.connect(pitchCorrectionProcessor.input);
    pitchCorrectionProcessor.connect(doublerProcessor.input);
    doublerProcessor.connect(deEsserProcessor.input);
    deEsserProcessor.connect(outputNode);

    // Store references
    chainRef.current = {
      pitchCorrection: pitchCorrectionProcessor,
      doubler: doublerProcessor,
      deEsser: deEsserProcessor,
      inputNode,
      outputNode,
    };

    setPitchCorrection(pitchCorrectionProcessor);
    setDoubler(doublerProcessor);
    setDeEsser(deEsserProcessor);

    // Cleanup on unmount
    return () => {
      pitchCorrectionProcessor.destroy();
      doublerProcessor.destroy();
      deEsserProcessor.destroy();
      inputNode.disconnect();
      outputNode.disconnect();
    };
  }, [audioContext, enabled]);

  // Pitch correction controls
  const updatePitchCorrection = (params: Partial<PitchCorrectionParams>) => {
    if (chainRef.current.pitchCorrection) {
      chainRef.current.pitchCorrection.updateParams(params);
    }
  };

  const togglePitchCorrection = (enabled: boolean) => {
    if (chainRef.current.pitchCorrection) {
      chainRef.current.pitchCorrection.setEnabled(enabled);
    }
  };

  const getPitchCorrectionParams = (): PitchCorrectionParams | null => {
    return chainRef.current.pitchCorrection
      ? chainRef.current.pitchCorrection.getParams()
      : null;
  };

  const setPitchCorrectionScale = (
    scale: 'chromatic' | 'major' | 'minor' | 'pentatonic',
    rootNote: number
  ) => {
    if (chainRef.current.pitchCorrection) {
      chainRef.current.pitchCorrection.updateParams({ scale, rootNote });
    }
  };

  // Vocal doubler controls
  const updateDoubler = (params: Partial<VocalDoublerParams>) => {
    if (chainRef.current.doubler) {
      chainRef.current.doubler.updateParams(params);
    }
  };

  const toggleDoubler = (enabled: boolean) => {
    if (chainRef.current.doubler) {
      chainRef.current.doubler.setEnabled(enabled);
    }
  };

  const getDoublerParams = (): VocalDoublerParams | null => {
    return chainRef.current.doubler ? chainRef.current.doubler.getParams() : null;
  };

  // De-esser controls
  const updateDeEsser = (params: Partial<DeEsserParams>) => {
    if (chainRef.current.deEsser) {
      chainRef.current.deEsser.updateParams(params);
    }
  };

  const toggleDeEsser = (enabled: boolean) => {
    if (chainRef.current.deEsser) {
      chainRef.current.deEsser.setEnabled(enabled);
    }
  };

  const getDeEsserParams = (): DeEsserParams | null => {
    return chainRef.current.deEsser ? chainRef.current.deEsser.getParams() : null;
  };

  const setDeEsserListenMode = (enabled: boolean) => {
    if (chainRef.current.deEsser) {
      chainRef.current.deEsser.updateParams({ listenMode: enabled });
    }
  };

  // Preset management
  const loadPreset = (presetName: keyof typeof VOCAL_PRESETS) => {
    const preset = VOCAL_PRESETS[presetName];

    if (preset.pitchCorrection && chainRef.current.pitchCorrection) {
      chainRef.current.pitchCorrection.updateParams(preset.pitchCorrection);
    }

    if (preset.doubler && chainRef.current.doubler) {
      chainRef.current.doubler.updateParams(preset.doubler);
    }

    if (preset.deEsser && chainRef.current.deEsser) {
      chainRef.current.deEsser.updateParams(preset.deEsser);
    }
  };

  const getAvailablePresets = (): string[] => {
    return Object.keys(VOCAL_PRESETS);
  };

  // Connect vocal effects chain between source and destination
  const connectChain = (source: AudioNode, destination: AudioNode) => {
    if (!chainRef.current.inputNode || !chainRef.current.outputNode) {
      console.warn(`[useVocalEffects] Chain not initialized for track ${trackId}`);
      return;
    }

    // Connect: source -> input -> [vocal effects] -> output -> destination
    source.connect(chainRef.current.inputNode);
    chainRef.current.outputNode.connect(destination);
  };

  // Disconnect vocal effects chain
  const disconnectChain = () => {
    if (chainRef.current.inputNode) {
      chainRef.current.inputNode.disconnect();
    }
    if (chainRef.current.outputNode) {
      chainRef.current.outputNode.disconnect();
    }
  };

  // Destroy all vocal effects
  const destroy = () => {
    if (chainRef.current.pitchCorrection) {
      chainRef.current.pitchCorrection.destroy();
    }
    if (chainRef.current.doubler) {
      chainRef.current.doubler.destroy();
    }
    if (chainRef.current.deEsser) {
      chainRef.current.deEsser.destroy();
    }
    if (chainRef.current.inputNode) {
      chainRef.current.inputNode.disconnect();
    }
    if (chainRef.current.outputNode) {
      chainRef.current.outputNode.disconnect();
    }

    chainRef.current = {
      pitchCorrection: null,
      doubler: null,
      deEsser: null,
      inputNode: null,
      outputNode: null,
    };

    setPitchCorrection(null);
    setDoubler(null);
    setDeEsser(null);
  };

  return {
    pitchCorrection,
    doubler,
    deEsser,
    updatePitchCorrection,
    togglePitchCorrection,
    getPitchCorrectionParams,
    setPitchCorrectionScale,
    updateDoubler,
    toggleDoubler,
    getDoublerParams,
    updateDeEsser,
    toggleDeEsser,
    getDeEsserParams,
    setDeEsserListenMode,
    loadPreset,
    getAvailablePresets,
    connectChain,
    disconnectChain,
    destroy,
  };
}
