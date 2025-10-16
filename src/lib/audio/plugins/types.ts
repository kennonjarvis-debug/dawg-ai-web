/**
 * DAWG AI Plugin System - Core Types
 *
 * Defines all types for the plugin architecture including metadata,
 * instances, chains, and AI recommendations.
 */

export type PluginFormat = 'vst3' | 'au' | 'clap' | 'web';

export type PluginCategory =
  | 'eq'
  | 'compressor'
  | 'limiter'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'flanger'
  | 'phaser'
  | 'distortion'
  | 'saturation'
  | 'gate'
  | 'expander'
  | 'multiband'
  | 'analyzer'
  | 'utility'
  | 'deesser'
  | 'stereo-imager'
  | 'harmonic-exciter'
  | 'transient-shaper';

export type ProcessingType =
  | 'dynamics'     // Compressors, limiters, gates, expanders
  | 'frequency'    // EQs, filters
  | 'spatial'      // Reverbs, delays, stereo imaging
  | 'harmonic'     // Saturation, distortion, exciters
  | 'modulation'   // Chorus, flanger, phaser
  | 'utility';     // Gain, phase, meters, analyzers

export type UseCase =
  | 'vocal'
  | 'drums'
  | 'bass'
  | 'guitar'
  | 'keys'
  | 'strings'
  | 'brass'
  | 'woodwind'
  | 'percussion'
  | 'mastering'
  | 'mixing'
  | 'creative';

export type CPULoad = 'low' | 'medium' | 'high' | 'very-high';

/**
 * Plugin Metadata
 * Complete information about an installed plugin
 */
export interface PluginMetadata {
  // Identity
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Display name
  vendor: string;                // Plugin manufacturer
  format: PluginFormat;          // Plugin format
  version: string;               // Plugin version

  // Classification
  category: PluginCategory;      // Primary category
  secondaryCategories?: PluginCategory[]; // Additional categories
  processingType: ProcessingType; // Type of audio processing

  // File system
  path: string;                  // Absolute file path
  filename: string;              // Just the filename

  // Audio engineer metadata
  useCase: UseCase[];            // Recommended use cases
  cpuLoad: CPULoad;              // Relative CPU usage

  // Capabilities
  inputs: number;                // Number of audio inputs
  outputs: number;               // Number of audio outputs
  sidechain: boolean;            // Supports sidechain input
  midiInput: boolean;            // Accepts MIDI

  // Parameters
  parameters: PluginParameter[]; // Exposed parameters
  presets: PluginPreset[];      // Factory presets

  // Metadata
  lastScanned: Date;
  isValid: boolean;
  errorMessage?: string;

  // Optional
  description?: string;
  website?: string;
  manual?: string;               // Path to manual
  thumbnail?: string;            // Plugin icon/image
}

/**
 * Plugin Parameter
 * Exposed parameter that can be automated
 */
export interface PluginParameter {
  id: string;                    // Unique parameter ID
  name: string;                  // Display name
  label: string;                 // Short label

  // Value range
  min: number;
  max: number;
  default: number;

  // Type
  type: 'continuous' | 'discrete' | 'toggle' | 'choice';
  unit?: string;                 // 'dB', 'Hz', 'ms', '%'

  // For choice parameters
  choices?: string[];

  // Automation
  automatable: boolean;

  // Display
  curve?: 'linear' | 'log' | 'exp'; // Value scaling
  precision?: number;            // Decimal places
}

/**
 * Plugin Preset
 * Factory or user preset
 */
export interface PluginPreset {
  id: string;
  name: string;
  isFactory: boolean;
  category?: string;
  description?: string;

  // Parameter values
  parameters: Record<string, number>;

  // Metadata
  author?: string;
  tags?: string[];
}

/**
 * Plugin Instance
 * A loaded instance of a plugin on a track
 */
export interface PluginInstance {
  id: string;                    // Instance ID
  pluginId: string;              // Reference to PluginMetadata
  trackId: string;               // Which track it's on
  position: number;              // Position in chain (0-based)
  enabled: boolean;              // Bypass state

  // State
  parameters: Map<string, number>; // Current parameter values
  preset: string | null;         // Active preset ID

  // Audio routing
  inputNode: AudioNode;
  outputNode: AudioNode;

  // Performance
  cpuUsage: number;              // Current CPU % (0-100)
  latency: number;               // Latency in samples

  // UI state
  uiVisible: boolean;
  uiPosition?: { x: number; y: number };
}

/**
 * Plugin Chain
 * Ordered collection of plugins on a track
 */
export interface PluginChain {
  trackId: string;
  plugins: PluginInstance[];

  // Overall stats
  totalLatency: number;          // Combined latency
  totalCPU: number;              // Combined CPU usage
}

/**
 * Audio Analysis Result
 * Analysis of audio content for AI decision making
 */
export interface AudioAnalysis {
  // Frequency analysis
  frequencyBalance: string;      // Description of frequency distribution
  spectralProfile: SpectralProfile;

  // Dynamic analysis
  dynamicRange: number;          // dB
  peakLevel: number;             // dBFS
  rmsLevel: number;              // dBFS
  crestFactor: number;           // Peak/RMS ratio

  // Problem detection
  problems: string[];            // Detected issues

  // Characteristics
  hasClipping: boolean;
  hasSibilance: boolean;
  hasMud: boolean;
  hasHarshness: boolean;
  needsCompression: boolean;
  needsEQ: boolean;
  needsSpatialProcessing: boolean;
}

/**
 * Spectral Profile
 * Detailed frequency band analysis
 */
export interface SpectralProfile {
  sub: number;         // 20-60Hz (dB)
  bass: number;        // 60-250Hz (dB)
  lowMid: number;      // 250-500Hz (dB)
  mid: number;         // 500-2000Hz (dB)
  highMid: number;     // 2000-6000Hz (dB)
  presence: number;    // 6000-12000Hz (dB)
  air: number;         // 12000-20000Hz (dB)

  // Additional metrics
  dominant: string;    // Dominant frequency band
  weak: string;        // Weakest frequency band
}

/**
 * Plugin Chain Recommendation
 * AI-generated plugin chain recommendation
 */
export interface PluginChainRecommendation {
  // Analysis
  analysis: string;              // AI's analysis of the audio
  confidence: number;            // 0-1 confidence score

  // Recommended chain
  chain: PluginChainStep[];

  // Alternatives
  alternatives: Alternative[];

  // Metadata
  createdAt: Date;
  trackType: string;
  intent: string;
}

/**
 * Plugin Chain Step
 * Single plugin in a recommended chain
 */
export interface PluginChainStep {
  pluginId: string;              // Plugin to use
  pluginName: string;            // For display

  purpose: string;               // Why this plugin is needed
  order: number;                 // Position in chain (1-based)

  // Settings
  settings: Record<string, number>;
  reasoning: string;             // Why these settings

  // Optional preset
  preset?: string;
}

/**
 * Alternative Recommendation
 * Alternative if user doesn't have recommended plugin
 */
export interface Alternative {
  if: string;                    // Condition
  then: string;                  // Alternative action
  pluginId?: string;             // Alternative plugin
}

/**
 * Track Type
 * Type of audio track for AI processing
 */
export type TrackType =
  | 'vocal'
  | 'lead-vocal'
  | 'backing-vocal'
  | 'drums'
  | 'kick'
  | 'snare'
  | 'hi-hat'
  | 'toms'
  | 'cymbals'
  | 'bass'
  | 'synth-bass'
  | 'guitar'
  | 'acoustic-guitar'
  | 'electric-guitar'
  | 'keys'
  | 'piano'
  | 'synth'
  | 'pad'
  | 'strings'
  | 'brass'
  | 'woodwind'
  | 'percussion'
  | 'fx'
  | 'master';

/**
 * Processing Intent
 * What the user wants to achieve
 */
export type ProcessingIntent =
  | 'mixing'              // Prepare for mix
  | 'mastering'           // Finalize master
  | 'creative'            // Creative processing
  | 'fix'                 // Fix problems
  | 'enhance'             // Enhance existing sound
  | 'emulate';            // Emulate a reference

/**
 * Plugin Database Interface
 * Storage and retrieval of plugin metadata
 */
export interface PluginDatabase {
  // Core data
  plugins: PluginMetadata[];

  // Indexed lookups
  byId: Map<string, PluginMetadata>;
  byCategory: Map<PluginCategory, PluginMetadata[]>;
  byVendor: Map<string, PluginMetadata[]>;
  byFormat: Map<PluginFormat, PluginMetadata[]>;

  // Methods
  getPlugin(id: string): Promise<PluginMetadata>;
  searchPlugins(query: string): Promise<PluginMetadata[]>;
  getPluginsByCategory(cat: PluginCategory): Promise<PluginMetadata[]>;
  updatePlugin(id: string, updates: Partial<PluginMetadata>): Promise<void>;
  addPlugin(plugin: PluginMetadata): Promise<void>;
  removePlugin(id: string): Promise<void>;

  // Bulk operations
  saveAll(plugins: PluginMetadata[]): Promise<void>;
  loadAll(): Promise<PluginMetadata[]>;
}

/**
 * Plugin Scan Result
 * Result of scanning for plugins
 */
export interface PluginScanResult {
  success: boolean;
  pluginsFound: number;
  pluginsLoaded: number;
  errors: PluginScanError[];
  duration: number;              // Scan duration in ms
  timestamp: Date;
}

/**
 * Plugin Scan Error
 * Error encountered during plugin scanning
 */
export interface PluginScanError {
  path: string;
  error: string;
  timestamp: Date;
}
