/**
 * useEffects Hook - Instance 2 (Audio Engine)
 *
 * Manages audio effects chain for individual tracks
 * Integrates with existing usePlayback hook
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ParametricEQ,
  DynamicsCompressor,
  ConvolutionReverb,
  Delay,
  EQParams,
  CompressorParams,
  ReverbParams,
  DelayParams,
  EQ_PRESETS,
} from '@/src/utils/audioEffects';

export interface TrackEffectsChain {
  eq: ParametricEQ | null;
  compressor: DynamicsCompressor | null;
  reverb: ConvolutionReverb | null;
  delay: Delay | null;
}

export interface UseEffectsOptions {
  trackId: string;
  audioContext: AudioContext | null;
  enabled?: boolean;
}

export interface UseEffectsReturn {
  // Effect processors
  eq: ParametricEQ | null;
  compressor: DynamicsCompressor | null;
  reverb: ConvolutionReverb | null;
  delay: Delay | null;

  // EQ controls
  updateEQ: (params: Partial<EQParams>) => void;
  loadEQPreset: (presetName: keyof typeof EQ_PRESETS) => void;
  toggleEQ: (enabled: boolean) => void;
  getEQParams: () => EQParams | null;

  // Compressor controls
  updateCompressor: (params: Partial<CompressorParams>) => void;
  toggleCompressor: (enabled: boolean) => void;
  getCompressorParams: () => CompressorParams | null;

  // Reverb controls
  updateReverb: (params: Partial<ReverbParams>) => void;
  toggleReverb: (enabled: boolean) => void;
  getReverbParams: () => ReverbParams | null;

  // Delay controls
  updateDelay: (params: Partial<DelayParams>) => void;
  toggleDelay: (enabled: boolean) => void;
  syncDelayToBPM: (bpm: number, subdivision?: number) => void;
  getDelayParams: () => DelayParams | null;

  // Connect effects chain to source and destination
  connectChain: (source: AudioNode, destination: AudioNode) => void;
  disconnectChain: () => void;

  // Cleanup
  destroy: () => void;
}

export function useEffects({
  trackId,
  audioContext,
  enabled = true,
}: UseEffectsOptions): UseEffectsReturn {
  const [eq, setEQ] = useState<ParametricEQ | null>(null);
  const [compressor, setCompressor] = useState<DynamicsCompressor | null>(null);
  const [reverb, setReverb] = useState<ConvolutionReverb | null>(null);
  const [delay, setDelay] = useState<Delay | null>(null);

  const chainRef = useRef<{
    eq: ParametricEQ | null;
    compressor: DynamicsCompressor | null;
    reverb: ConvolutionReverb | null;
    delay: Delay | null;
    inputNode: GainNode | null;
    outputNode: GainNode | null;
  }>({
    eq: null,
    compressor: null,
    reverb: null,
    delay: null,
    inputNode: null,
    outputNode: null,
  });

  // Initialize effects chain when audio context is available
  useEffect(() => {
    if (!audioContext || !enabled) {
      return;
    }

    // Create effect processors
    const eqProcessor = new ParametricEQ(audioContext, EQ_PRESETS.flat);
    const compressorProcessor = new DynamicsCompressor(audioContext, {
      enabled: false, // Disabled by default
    });
    const reverbProcessor = new ConvolutionReverb(audioContext, {
      enabled: false, // Disabled by default
    });
    const delayProcessor = new Delay(audioContext, {
      enabled: false, // Disabled by default
    });

    // Create input/output gain nodes for the chain
    const inputNode = audioContext.createGain();
    const outputNode = audioContext.createGain();

    // Connect chain: input -> EQ -> compressor -> reverb -> delay -> output
    inputNode.connect(eqProcessor.getInputNode());
    eqProcessor.connect(compressorProcessor.getInputNode());
    compressorProcessor.connect(reverbProcessor.getInputNode());
    reverbProcessor.connect(delayProcessor.getInputNode());
    delayProcessor.connect(outputNode);

    // Store references
    chainRef.current = {
      eq: eqProcessor,
      compressor: compressorProcessor,
      reverb: reverbProcessor,
      delay: delayProcessor,
      inputNode,
      outputNode,
    };

    setEQ(eqProcessor);
    setCompressor(compressorProcessor);
    setReverb(reverbProcessor);
    setDelay(delayProcessor);

    // Cleanup on unmount
    return () => {
      eqProcessor.destroy();
      compressorProcessor.destroy();
      reverbProcessor.destroy();
      delayProcessor.destroy();
      inputNode.disconnect();
      outputNode.disconnect();
    };
  }, [audioContext, enabled]);

  // Update EQ parameters
  const updateEQ = (params: Partial<EQParams>) => {
    if (chainRef.current.eq) {
      chainRef.current.eq.updateParams(params);
    }
  };

  // Update compressor parameters
  const updateCompressor = (params: Partial<CompressorParams>) => {
    if (chainRef.current.compressor) {
      chainRef.current.compressor.updateParams(params);
    }
  };

  // Load EQ preset
  const loadEQPreset = (presetName: keyof typeof EQ_PRESETS) => {
    if (chainRef.current.eq) {
      chainRef.current.eq.loadPreset(presetName);
    }
  };

  // Toggle EQ on/off
  const toggleEQ = (enabled: boolean) => {
    if (chainRef.current.eq) {
      chainRef.current.eq.setEnabled(enabled);
    }
  };

  // Toggle compressor on/off
  const toggleCompressor = (enabled: boolean) => {
    if (chainRef.current.compressor) {
      chainRef.current.compressor.setEnabled(enabled);
    }
  };

  // Get current EQ params
  const getEQParams = (): EQParams | null => {
    return chainRef.current.eq ? chainRef.current.eq.getParams() : null;
  };

  // Get current compressor params
  const getCompressorParams = (): CompressorParams | null => {
    return chainRef.current.compressor ? chainRef.current.compressor.getParams() : null;
  };

  // Connect effects chain between source and destination
  const connectChain = (source: AudioNode, destination: AudioNode) => {
    if (!chainRef.current.inputNode || !chainRef.current.outputNode) {
      console.warn(`[useEffects] Chain not initialized for track ${trackId}`);
      return;
    }

    // Connect: source -> input -> [effects] -> output -> destination
    source.connect(chainRef.current.inputNode);
    chainRef.current.outputNode.connect(destination);
  };

  // Disconnect effects chain
  const disconnectChain = () => {
    if (chainRef.current.inputNode) {
      chainRef.current.inputNode.disconnect();
    }
    if (chainRef.current.outputNode) {
      chainRef.current.outputNode.disconnect();
    }
  };

  // Reverb controls
  const updateReverb = (params: Partial<ReverbParams>) => {
    if (chainRef.current.reverb) {
      chainRef.current.reverb.updateParams(params);
    }
  };

  const toggleReverb = (enabled: boolean) => {
    if (chainRef.current.reverb) {
      chainRef.current.reverb.setEnabled(enabled);
    }
  };

  const getReverbParams = (): ReverbParams | null => {
    return chainRef.current.reverb ? chainRef.current.reverb.getParams() : null;
  };

  // Delay controls
  const updateDelay = (params: Partial<DelayParams>) => {
    if (chainRef.current.delay) {
      chainRef.current.delay.updateParams(params);
    }
  };

  const toggleDelay = (enabled: boolean) => {
    if (chainRef.current.delay) {
      chainRef.current.delay.setEnabled(enabled);
    }
  };

  const syncDelayToBPM = (bpm: number, subdivision: number = 0.25) => {
    if (chainRef.current.delay) {
      chainRef.current.delay.syncToBPM(bpm, subdivision);
    }
  };

  const getDelayParams = (): DelayParams | null => {
    return chainRef.current.delay ? chainRef.current.delay.getParams() : null;
  };

  // Destroy all effects
  const destroy = () => {
    if (chainRef.current.eq) {
      chainRef.current.eq.destroy();
    }
    if (chainRef.current.compressor) {
      chainRef.current.compressor.destroy();
    }
    if (chainRef.current.reverb) {
      chainRef.current.reverb.destroy();
    }
    if (chainRef.current.delay) {
      chainRef.current.delay.destroy();
    }
    if (chainRef.current.inputNode) {
      chainRef.current.inputNode.disconnect();
    }
    if (chainRef.current.outputNode) {
      chainRef.current.outputNode.disconnect();
    }

    chainRef.current = {
      eq: null,
      compressor: null,
      reverb: null,
      delay: null,
      inputNode: null,
      outputNode: null,
    };

    setEQ(null);
    setCompressor(null);
    setReverb(null);
    setDelay(null);
  };

  return {
    eq,
    compressor,
    reverb,
    delay,
    updateEQ,
    updateCompressor,
    updateReverb,
    updateDelay,
    loadEQPreset,
    toggleEQ,
    toggleCompressor,
    toggleReverb,
    toggleDelay,
    syncDelayToBPM,
    getEQParams,
    getCompressorParams,
    getReverbParams,
    getDelayParams,
    connectChain,
    disconnectChain,
    destroy,
  };
}
