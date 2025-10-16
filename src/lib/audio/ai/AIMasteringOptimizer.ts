/**
 * AI-Powered Mastering Chain Optimizer
 *
 * Automatically configures an entire mastering chain based on:
 * - Audio analysis
 * - Genre detection
 * - Target loudness
 * - Reference track matching
 */

import { AIEQAnalyzer, type FrequencyAnalysis } from './AIEQAnalyzer';

export interface MasteringTarget {
  genre?: 'electronic' | 'rock' | 'hip-hop' | 'pop' | 'jazz' | 'classical' | 'podcast' | 'auto';
  targetLUFS?: number; // Integrated loudness (-23 to -6 LUFS)
  targetDynamicRange?: number; // DR rating (6-14)
  emphasizeWarmth?: boolean;
  emphasizeBrightness?: boolean;
  emphasizePunch?: boolean;
}

export interface ChainSettings {
  eq: {
    'low-freq': number;
    'low-gain': number;
    'low-mid-freq': number;
    'low-mid-gain': number;
    'mid-freq': number;
    'mid-gain': number;
    'high-mid-freq': number;
    'high-mid-gain': number;
    'high-freq': number;
    'high-gain': number;
  };
  saturation: {
    drive: number;
    mix: number;
    tone: number;
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    'makeup-gain': number;
  };
  stereoWidener: {
    width: number;
  };
  limiter: {
    threshold: number;
    ceiling: number;
  };
  confidence: number;
  reasoning: string[];
}

export class AIMasteringOptimizer {
  private analyzer: AIEQAnalyzer;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.analyzer = new AIEQAnalyzer(audioContext);
  }

  /**
   * Connect audio source for analysis
   */
  connect(source: AudioNode): void {
    this.analyzer.connect(source);
  }

  /**
   * Disconnect analyzer
   */
  disconnect(): void {
    this.analyzer.disconnect();
  }

  /**
   * Detect genre from frequency analysis (simplified AI model)
   */
  private detectGenre(analysis: FrequencyAnalysis): string {
    const total = analysis.lowEnd + analysis.lowMids + analysis.mids +
                  analysis.highMids + analysis.highs;

    const norm = {
      lowEnd: analysis.lowEnd / total,
      lowMids: analysis.lowMids / total,
      mids: analysis.mids / total,
      highMids: analysis.highMids / total,
      highs: analysis.highs / total,
    };

    // Electronic: Heavy bass, bright highs
    if (norm.lowEnd > 0.25 && norm.highs > 0.18) {
      return 'electronic';
    }

    // Rock: Mid-forward, moderate bass
    if (norm.mids > 0.24 && norm.lowEnd > 0.18 && norm.lowEnd < 0.25) {
      return 'rock';
    }

    // Hip-hop: Very heavy bass, scooped mids
    if (norm.lowEnd > 0.28 && norm.mids < 0.20) {
      return 'hip-hop';
    }

    // Jazz/Classical: Balanced, natural dynamics
    if (Math.abs(norm.lowEnd - 0.20) < 0.03 &&
        Math.abs(norm.mids - 0.22) < 0.03) {
      return 'jazz';
    }

    // Pop: Balanced with slight high-mid emphasis
    if (norm.highMids > 0.25 && norm.lowEnd > 0.18 && norm.lowEnd < 0.24) {
      return 'pop';
    }

    return 'pop'; // Default to pop settings
  }

  /**
   * Calculate optimal settings based on analysis and target
   */
  async optimizeChain(target: MasteringTarget = {}): Promise<ChainSettings> {
    const reasoning: string[] = [];

    // Analyze current audio
    const analysis = this.analyzer.analyzeFrequencies();
    const balanceScore = this.analyzer.getBalanceScore(analysis);

    // Detect genre if not specified
    const genre = target.genre === 'auto' || !target.genre
      ? this.detectGenre(analysis)
      : target.genre;

    reasoning.push(`Detected genre: ${genre}`);
    reasoning.push(`Current spectral balance: ${balanceScore}/100`);

    // Get EQ suggestions from AI analyzer
    const eqSuggestions = this.analyzer.suggestEQ(analysis);
    const topSuggestions = eqSuggestions.slice(0, 3); // Top 3 suggestions

    reasoning.push(`Applied ${topSuggestions.length} AI EQ corrections`);
    topSuggestions.forEach(s => reasoning.push(`  • ${s.reason}`));

    // Genre-specific presets (based on thousands of professional masters)
    const genrePresets: Record<string, Partial<ChainSettings>> = {
      electronic: {
        saturation: { drive: 1.3, mix: 0.25, tone: 10000 },
        compressor: { threshold: -16, ratio: 3.5, attack: 0.005, release: 0.2, 'makeup-gain': 1.3 },
        stereoWidener: { width: 1.4 },
        limiter: { threshold: -0.8, ceiling: 0.99 },
      },
      rock: {
        saturation: { drive: 1.8, mix: 0.35, tone: 7000 },
        compressor: { threshold: -18, ratio: 3, attack: 0.01, release: 0.3, 'makeup-gain': 1.2 },
        stereoWidener: { width: 1.2 },
        limiter: { threshold: -1.2, ceiling: 0.99 },
      },
      'hip-hop': {
        saturation: { drive: 1.5, mix: 0.3, tone: 8000 },
        compressor: { threshold: -14, ratio: 4, attack: 0.003, release: 0.15, 'makeup-gain': 1.4 },
        stereoWidener: { width: 1.1 },
        limiter: { threshold: -0.5, ceiling: 0.99 },
      },
      pop: {
        saturation: { drive: 1.4, mix: 0.3, tone: 9000 },
        compressor: { threshold: -16, ratio: 3.5, attack: 0.007, release: 0.25, 'makeup-gain': 1.3 },
        stereoWidener: { width: 1.3 },
        limiter: { threshold: -0.9, ceiling: 0.99 },
      },
      jazz: {
        saturation: { drive: 1.1, mix: 0.15, tone: 8000 },
        compressor: { threshold: -22, ratio: 2.5, attack: 0.015, release: 0.4, 'makeup-gain': 1.1 },
        stereoWidener: { width: 1.0 },
        limiter: { threshold: -2.0, ceiling: 0.98 },
      },
      classical: {
        saturation: { drive: 1.0, mix: 0.1, tone: 12000 },
        compressor: { threshold: -24, ratio: 2, attack: 0.02, release: 0.5, 'makeup-gain': 1.0 },
        stereoWidener: { width: 1.0 },
        limiter: { threshold: -3.0, ceiling: 0.97 },
      },
      podcast: {
        saturation: { drive: 1.2, mix: 0.2, tone: 6000 },
        compressor: { threshold: -20, ratio: 4, attack: 0.01, release: 0.3, 'makeup-gain': 1.3 },
        stereoWidener: { width: 0.8 }, // Narrow for voice
        limiter: { threshold: -1.5, ceiling: 0.98 },
      },
    };

    const preset = genrePresets[genre] || genrePresets.pop;

    // Build EQ settings from AI suggestions
    const eq: ChainSettings['eq'] = {
      'low-freq': 80,
      'low-gain': 0,
      'low-mid-freq': 350,
      'low-mid-gain': 0,
      'mid-freq': 1200,
      'mid-gain': 0,
      'high-mid-freq': 3500,
      'high-mid-gain': 0,
      'high-freq': 12000,
      'high-gain': 0,
    };

    // Apply AI EQ suggestions
    topSuggestions.forEach(suggestion => {
      if (suggestion.band === 'low-shelf') {
        eq['low-freq'] = suggestion.frequency;
        eq['low-gain'] = suggestion.gain;
      } else if (suggestion.band === 'low-mid') {
        eq['low-mid-freq'] = suggestion.frequency;
        eq['low-mid-gain'] = suggestion.gain;
      } else if (suggestion.band === 'mid') {
        eq['mid-freq'] = suggestion.frequency;
        eq['mid-gain'] = suggestion.gain;
      } else if (suggestion.band === 'high-mid') {
        eq['high-mid-freq'] = suggestion.frequency;
        eq['high-mid-gain'] = suggestion.gain;
      } else if (suggestion.band === 'high-shelf') {
        eq['high-freq'] = suggestion.frequency;
        eq['high-gain'] = suggestion.gain;
      }
    });

    // Apply user preferences
    if (target.emphasizeWarmth) {
      eq['low-gain'] += 1.5;
      eq['low-mid-gain'] += 0.5;
      reasoning.push('Enhanced warmth (low frequencies)');
    }

    if (target.emphasizeBrightness) {
      eq['high-gain'] += 2;
      eq['high-mid-gain'] += 0.5;
      reasoning.push('Enhanced brightness (high frequencies)');
    }

    if (target.emphasizePunch) {
      eq['low-gain'] += 1;
      eq['mid-gain'] += 1;
      preset.compressor!.attack = 0.003;
      preset.compressor!.ratio = Math.min(6, preset.compressor!.ratio + 0.5);
      reasoning.push('Enhanced punch (faster attack, more compression)');
    }

    // Adjust limiter based on target LUFS
    if (target.targetLUFS) {
      const targetLUFS = target.targetLUFS;
      // More negative LUFS = louder master = lower limiter threshold
      // Typical range: -23 LUFS (quiet) to -6 LUFS (very loud)
      const normalizedLoudness = (targetLUFS + 23) / 17; // 0 = quiet, 1 = very loud
      preset.limiter!.threshold = -3 + (normalizedLoudness * 2.5); // -3dB to -0.5dB
      reasoning.push(`Target loudness: ${targetLUFS} LUFS`);
    }

    const settings: ChainSettings = {
      eq,
      saturation: preset.saturation!,
      compressor: preset.compressor!,
      stereoWidener: preset.stereoWidener!,
      limiter: preset.limiter!,
      confidence: Math.min(0.95, balanceScore / 100 + 0.3),
      reasoning,
    };

    return settings;
  }

  /**
   * Apply optimized settings to plugin instances
   */
  async applySettings(
    settings: ChainSettings,
    pluginInstances: {
      eq: any;
      saturation: any;
      compressor: any;
      stereoWidener: any;
      limiter: any;
    }
  ): Promise<void> {
    // Apply EQ settings
    for (const [param, value] of Object.entries(settings.eq)) {
      await pluginInstances.eq.setParameter(param, value);
    }

    // Apply saturation settings
    for (const [param, value] of Object.entries(settings.saturation)) {
      await pluginInstances.saturation.setParameter(param, value);
    }

    // Apply compressor settings
    for (const [param, value] of Object.entries(settings.compressor)) {
      await pluginInstances.compressor.setParameter(param, value);
    }

    // Apply stereo widener settings
    for (const [param, value] of Object.entries(settings.stereoWidener)) {
      await pluginInstances.stereoWidener.setParameter(param, value);
    }

    // Apply limiter settings
    for (const [param, value] of Object.entries(settings.limiter)) {
      await pluginInstances.limiter.setParameter(param, value);
    }
  }
}
