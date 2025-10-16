/**
 * DAWG AI Engine API Client
 * Connects to Python AI backend at localhost:9000
 */

const DAWG_AI_BASE_URL = import.meta.env.VITE_DAWG_AI_URL || 'http://localhost:9000';

export interface MIDIGenerationParams {
  style: 'drums' | 'melody' | 'bass';
  tempo?: number;
  bars?: number;
  temperature?: number;
}

export interface BasslineParams {
  key?: string;
  scale?: string;
  bars?: number;
  tempo?: number;
}

export interface MelodyParams {
  key?: string;
  scale?: string;
  bars?: number;
  tempo?: number;
}

export interface AudioAnalysisResult {
  tempo: number;
  key: string;
  duration: number;
  spectral_features?: any;
}

export interface MixingSuggestions {
  suggestions: Array<{
    track?: string;
    suggestion: string;
    confidence: number;
  }>;
  overall_quality: number;
}

/**
 * DAWG AI API Client
 */
export class DAWGAIAPI {
  private baseUrl: string;

  constructor(baseUrl: string = DAWG_AI_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health check
   */
  async health(): Promise<{ status: string; version?: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Generate MIDI
   */
  async generateMIDI(params: MIDIGenerationParams): Promise<{ midi_base64: string; notes?: any[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('style', params.style);
    if (params.tempo) queryParams.append('tempo', params.tempo.toString());
    if (params.bars) queryParams.append('bars', params.bars.toString());
    if (params.temperature) queryParams.append('temperature', params.temperature.toString());

    const response = await fetch(`${this.baseUrl}/api/v1/generate/midi?${queryParams}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`MIDI generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate bassline
   */
  async generateBassline(params: BasslineParams = {}): Promise<{ midi_base64: string; notes?: any[] }> {
    const queryParams = new URLSearchParams();
    if (params.key) queryParams.append('key', params.key);
    if (params.scale) queryParams.append('scale', params.scale);
    if (params.bars) queryParams.append('bars', params.bars.toString());
    if (params.tempo) queryParams.append('tempo', params.tempo.toString());

    const response = await fetch(`${this.baseUrl}/api/v1/generate/bassline?${queryParams}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Bassline generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate melody
   */
  async generateMelody(params: MelodyParams = {}): Promise<{ midi_base64: string; notes?: any[] }> {
    const queryParams = new URLSearchParams();
    if (params.key) queryParams.append('key', params.key);
    if (params.scale) queryParams.append('scale', params.scale);
    if (params.bars) queryParams.append('bars', params.bars.toString());
    if (params.tempo) queryParams.append('tempo', params.tempo.toString());

    const response = await fetch(`${this.baseUrl}/api/v1/generate/melody?${queryParams}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Melody generation failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Analyze audio file
   */
  async analyzeAudio(file: File): Promise<AudioAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/api/v1/analyze/audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Audio analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get mixing suggestions
   */
  async getMixingSuggestions(): Promise<MixingSuggestions> {
    const response = await fetch(`${this.baseUrl}/api/v1/mixing/suggest`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Mixing suggestions failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Auto-level tracks
   */
  async autoLevel(): Promise<{ gain_adjustments: Record<string, number> }> {
    const response = await fetch(`${this.baseUrl}/api/v1/mixing/auto_level`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Auto-level failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const dawgAI = new DAWGAIAPI();
