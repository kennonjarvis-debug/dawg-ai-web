# DAWG AI Plugin Architecture

**Version**: 1.0.0
**Date**: 2025-10-15
**Status**: Design Complete - Ready for Implementation

---

## 🎯 Overview

DAWG AI's plugin architecture combines native plugin support (VST3, AU, CLAP) with AI-powered decision making to select and configure plugins like a professional audio engineer.

### Core Principles

1. **Native-First**: Scan and prioritize user's installed plugins
2. **AI-Powered**: LLM decides which plugins to use based on audio analysis
3. **Engineer-Trained**: AI trained on professional mixing/mastering workflows
4. **Format-Agnostic**: Support VST3, AU, and CLAP plugins
5. **Web-Based**: All processing in browser via WebAssembly + Web Audio API

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DAWG AI Plugin System                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│   Plugin      │    │   AI Plugin    │    │   Plugin     │
│   Scanner     │    │   Selector     │    │   Manager    │
└───────────────┘    └────────────────┘    └──────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────────────────────────────────────────────────┐
│                    Native Plugin Layer                     │
│  ┌─────────┐    ┌─────────┐    ┌──────────────┐         │
│  │  VST3   │    │   AU    │    │    CLAP      │         │
│  │ Wrapper │    │ Wrapper │    │   Wrapper    │         │
│  └─────────┘    └─────────┘    └──────────────┘         │
└───────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│               Web Audio API / WASM Bridge                  │
└───────────────────────────────────────────────────────────┘
```

---

## 🔍 Component 1: Plugin Scanner

### Purpose
Scans user's system for installed audio plugins and builds a plugin database.

### Scan Locations (macOS)
```typescript
const PLUGIN_PATHS = {
  vst3: [
    '/Library/Audio/Plug-Ins/VST3',
    '~/Library/Audio/Plug-Ins/VST3',
  ],
  au: [
    '/Library/Audio/Plug-Ins/Components',
    '~/Library/Audio/Plug-Ins/Components',
  ],
  clap: [
    '/Library/Audio/Plug-Ins/CLAP',
    '~/Library/Audio/Plug-Ins/CLAP',
  ],
};
```

### Scan Locations (Windows)
```typescript
const PLUGIN_PATHS_WIN = {
  vst3: [
    'C:/Program Files/Common Files/VST3',
    'C:/Program Files/Steinberg/VstPlugins',
  ],
  clap: [
    'C:/Program Files/Common Files/CLAP',
  ],
};
```

### Plugin Metadata
```typescript
interface PluginMetadata {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  vendor: string;                // Plugin manufacturer
  format: 'vst3' | 'au' | 'clap'; // Plugin format
  category: PluginCategory;      // EQ, Compressor, Reverb, etc.
  path: string;                  // File system path
  version: string;               // Plugin version

  // Audio Engineer Classification
  useCase: string[];             // ['vocal', 'drums', 'mastering']
  processingType: ProcessingType; // 'dynamics', 'frequency', 'spatial', 'harmonic'
  cpuLoad: 'low' | 'medium' | 'high';

  // Capabilities
  inputs: number;                // Audio inputs
  outputs: number;               // Audio outputs
  parameters: PluginParameter[]; // Exposed parameters
  presets: Preset[];            // Factory presets

  // Metadata
  lastScanned: Date;
  isValid: boolean;
  errorMessage?: string;
}

type PluginCategory =
  | 'eq'
  | 'compressor'
  | 'limiter'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion'
  | 'saturation'
  | 'gate'
  | 'expander'
  | 'multiband'
  | 'analyzer'
  | 'utility';

type ProcessingType =
  | 'dynamics'     // Compressors, limiters, gates
  | 'frequency'    // EQs, filters
  | 'spatial'      // Reverbs, delays, stereo imaging
  | 'harmonic'     // Saturation, distortion
  | 'modulation'   // Chorus, flanger, phaser
  | 'utility';     // Gain, phase, meters
```

### Scanner Implementation
```typescript
class PluginScanner {
  private db: PluginDatabase;
  private cache: Map<string, PluginMetadata>;

  async scanAll(): Promise<PluginMetadata[]> {
    const plugins: PluginMetadata[] = [];

    // Scan each format in parallel
    const [vst3Plugins, auPlugins, clapPlugins] = await Promise.all([
      this.scanVST3(),
      this.scanAU(),
      this.scanCLAP(),
    ]);

    plugins.push(...vst3Plugins, ...auPlugins, ...clapPlugins);

    // Cache results
    await this.db.savePlugins(plugins);

    return plugins;
  }

  private async scanVST3(): Promise<PluginMetadata[]> {
    const plugins: PluginMetadata[] = [];

    for (const path of PLUGIN_PATHS.vst3) {
      const files = await this.findPluginFiles(path, '.vst3');

      for (const file of files) {
        try {
          const metadata = await this.loadVST3Metadata(file);
          plugins.push(metadata);
        } catch (error) {
          console.warn(`Failed to load VST3: ${file}`, error);
        }
      }
    }

    return plugins;
  }

  private async loadVST3Metadata(path: string): Promise<PluginMetadata> {
    // Load plugin via WASM bridge
    const plugin = await VST3Loader.load(path);

    // Extract metadata
    return {
      id: plugin.getUID(),
      name: plugin.getName(),
      vendor: plugin.getVendor(),
      format: 'vst3',
      category: this.inferCategory(plugin),
      path,
      version: plugin.getVersion(),
      useCase: this.inferUseCase(plugin),
      processingType: this.inferProcessingType(plugin),
      cpuLoad: 'medium',
      inputs: plugin.getNumInputs(),
      outputs: plugin.getNumOutputs(),
      parameters: plugin.getParameters(),
      presets: plugin.getPresets(),
      lastScanned: new Date(),
      isValid: true,
    };
  }

  private inferCategory(plugin: any): PluginCategory {
    const name = plugin.getName().toLowerCase();

    if (name.includes('eq') || name.includes('equalizer')) return 'eq';
    if (name.includes('comp')) return 'compressor';
    if (name.includes('limit')) return 'limiter';
    if (name.includes('reverb')) return 'reverb';
    if (name.includes('delay')) return 'delay';
    // ... more inference logic

    return 'utility';
  }
}
```

---

## 🧠 Component 2: AI Plugin Selector

### Purpose
Uses Claude AI (trained as an audio engineer) to select and configure plugins based on audio content and user intent.

### Audio Engineer Training

The AI is trained with expert mixing/mastering knowledge:

```typescript
const AUDIO_ENGINEER_TRAINING = `
You are a professional audio engineer with 20+ years of experience in mixing and mastering.

## Your Expertise

### Mixing Fundamentals
- **Gain Staging**: Always start with proper levels (-18dBFS to -12dBFS for mixing)
- **EQ Philosophy**: Subtractive before additive, high-pass everything except kick/bass
- **Compression**: Slow attack for punch, fast attack for control
- **Spatial Processing**: Width comes from delays and reverb, not stereo wideners
- **Harmonic Processing**: Subtle saturation adds glue and warmth

### Plugin Chain Order (Standard)
1. **Gate/Expander** - Remove noise, control bleed
2. **EQ (Corrective)** - Fix problems, remove mud
3. **Compressor** - Control dynamics
4. **EQ (Tonal)** - Shape tone, add presence
5. **Saturation** - Add harmonics, warmth
6. **Spatial Effects** - Reverb, delay
7. **Limiter** - Final ceiling (mastering only)

### Instrument-Specific Chains

**Vocals:**
1. High-pass filter (80-100Hz)
2. De-esser (if sibilance present)
3. Compressor (3:1 to 6:1, slow attack, medium release)
4. EQ (boost 2-5kHz for presence, cut 200-400Hz for mud)
5. Subtle reverb/delay for space

**Drums:**
- **Kick**: High-pass 40Hz, boost 60Hz (body), boost 3-5kHz (attack), heavy compression
- **Snare**: High-pass 100Hz, boost 200Hz (body), boost 5kHz (crack), gate for tightness
- **Hi-Hats**: High-pass 200Hz, subtle EQ for brightness, light compression
- **Overheads**: High-pass 300Hz, EQ to taste, glue compression

**Bass:**
1. High-pass filter (30-40Hz to remove subsonic rumble)
2. Multiband compression (separate sub from mid-bass)
3. Saturation (add harmonics for mix translation)
4. EQ (boost 60-80Hz for weight, 800Hz-1kHz for definition)

**Guitar:**
1. High-pass filter (80-100Hz)
2. EQ (cut 200-400Hz for room, boost 2-4kHz for presence)
3. Compression (4:1, medium attack/release)
4. Stereo delay or reverb for width

**Piano:**
1. High-pass filter (40-60Hz)
2. EQ (cut mud 250-500Hz, boost air 8-12kHz)
3. Light compression (2:1, slow attack)
4. Room reverb for natural space

**Strings:**
1. High-pass filter (100-150Hz)
2. EQ (cut 200-500Hz, boost 3-8kHz for clarity)
3. Light compression (3:1, slow attack)
4. Hall reverb for depth

### Mastering Chain (Standard)
1. **EQ (Corrective)** - Fix frequency balance
2. **Multiband Compressor** - Control frequency-specific dynamics
3. **Stereo Imaging** - Adjust width (careful with bass)
4. **EQ (Tonal)** - Final tone shaping
5. **Limiter** - Set ceiling (-0.3dB to -1dB for streaming)
6. **Dithering** - If reducing bit depth

### Problem Solving
- **Muddy Mix**: High-pass more aggressively, cut 200-500Hz
- **Harsh Mix**: Cut 2-5kHz, check for over-compression
- **Lacks Punch**: Check transients, reduce over-compression
- **No Depth**: Add reverb/delay, adjust panning
- **Doesn't Translate**: Check mono compatibility, add harmonics

### Decision Framework
When selecting plugins, consider:
1. **Source Material**: What instrument/vocal type?
2. **Problem Identification**: What needs fixing?
3. **Artistic Goal**: What's the desired sound?
4. **Available Plugins**: What tools are installed?
5. **CPU Budget**: Balance quality vs performance
6. **Plugin Synergy**: How do plugins work together?

Your job: Analyze audio, identify needs, recommend specific plugins with settings.
`;
```

### AI Selector Implementation

```typescript
class AIPluginSelector {
  private ai: AnthropicClient;
  private pluginDB: PluginDatabase;
  private audioAnalyzer: AudioAnalyzer;

  async selectPlugins(
    audio: AudioBuffer,
    trackType: 'vocal' | 'drums' | 'bass' | 'guitar' | 'keys' | 'master',
    intent: 'mixing' | 'mastering' | 'creative'
  ): Promise<PluginChainRecommendation> {

    // Step 1: Analyze audio
    const analysis = await this.audioAnalyzer.analyze(audio);

    // Step 2: Get available plugins
    const plugins = await this.pluginDB.getPluginsByCategory();

    // Step 3: Build AI prompt
    const prompt = this.buildEngineerPrompt(analysis, trackType, intent, plugins);

    // Step 4: Get AI recommendation
    const response = await this.ai.complete(prompt);

    // Step 5: Parse and validate
    return this.parseRecommendation(response);
  }

  private buildEngineerPrompt(
    analysis: AudioAnalysis,
    trackType: string,
    intent: string,
    plugins: PluginDatabase
  ): string {
    return `
${AUDIO_ENGINEER_TRAINING}

## Current Task

You're ${intent} a ${trackType} track.

### Audio Analysis
- **Frequency Balance**: ${analysis.frequencyBalance}
- **Dynamic Range**: ${analysis.dynamicRange}dB
- **Peak Level**: ${analysis.peakLevel}dBFS
- **RMS Level**: ${analysis.rmsLevel}dBFS
- **Problems Detected**: ${analysis.problems.join(', ')}
- **Spectral Characteristics**: ${analysis.spectralProfile}

### Available Plugins

${this.formatAvailablePlugins(plugins)}

## Your Task

Recommend a plugin chain for this ${trackType} track. Consider:
1. What problems need fixing?
2. What processing will enhance the track?
3. Which available plugins are best suited?
4. What order should they be in?
5. What are the recommended settings?

**Format your response as JSON:**

\`\`\`json
{
  "analysis": "Brief description of audio issues and goals",
  "chain": [
    {
      "pluginId": "plugin-uuid",
      "pluginName": "Plugin Name",
      "purpose": "Why this plugin is needed",
      "order": 1,
      "settings": {
        "parameterName": value
      },
      "reasoning": "Why these settings"
    }
  ],
  "alternatives": [
    {
      "if": "User doesn't have Plugin X",
      "then": "Use Plugin Y with these settings..."
    }
  ]
}
\`\`\`

Be specific. Use actual plugin IDs from the available list.
`;
  }

  private formatAvailablePlugins(plugins: PluginDatabase): string {
    let output = '';

    for (const [category, pluginList] of Object.entries(plugins.byCategory)) {
      output += `\n### ${category.toUpperCase()}\n`;
      for (const plugin of pluginList) {
        output += `- **${plugin.name}** (${plugin.vendor}) - ID: ${plugin.id}\n`;
        output += `  Use for: ${plugin.useCase.join(', ')}\n`;
      }
    }

    return output;
  }
}
```

### Audio Analysis

```typescript
class AudioAnalyzer {
  async analyze(buffer: AudioBuffer): Promise<AudioAnalysis> {
    return {
      // Frequency analysis
      frequencyBalance: this.analyzeFrequencyBalance(buffer),
      spectralProfile: this.getSpectralProfile(buffer),

      // Dynamic analysis
      dynamicRange: this.calculateDynamicRange(buffer),
      peakLevel: this.getPeakLevel(buffer),
      rmsLevel: this.getRMSLevel(buffer),
      crestFactor: this.getCrestFactor(buffer),

      // Problem detection
      problems: this.detectProblems(buffer),

      // Characteristics
      hasClipping: this.detectClipping(buffer),
      hasSibilance: this.detectSibilance(buffer),
      hasMud: this.detectMud(buffer),
      hasHarshness: this.detectHarshness(buffer),
    };
  }

  private analyzeFrequencyBalance(buffer: AudioBuffer): string {
    const fft = this.performFFT(buffer);
    const bands = {
      sub: this.getBandEnergy(fft, 20, 60),
      bass: this.getBandEnergy(fft, 60, 250),
      lowMid: this.getBandEnergy(fft, 250, 500),
      mid: this.getBandEnergy(fft, 500, 2000),
      highMid: this.getBandEnergy(fft, 2000, 6000),
      presence: this.getBandEnergy(fft, 6000, 12000),
      air: this.getBandEnergy(fft, 12000, 20000),
    };

    // Identify dominant and weak bands
    const sorted = Object.entries(bands).sort((a, b) => b[1] - a[1]);

    return `Dominant: ${sorted[0][0]} (${sorted[0][1].toFixed(1)}dB), ` +
           `Weak: ${sorted[sorted.length-1][0]} (${sorted[sorted.length-1][1].toFixed(1)}dB)`;
  }

  private detectProblems(buffer: AudioBuffer): string[] {
    const problems: string[] = [];

    if (this.detectClipping(buffer)) problems.push('Clipping detected');
    if (this.detectMud(buffer)) problems.push('Excessive mud (200-500Hz)');
    if (this.detectHarshness(buffer)) problems.push('Harshness (2-5kHz)');
    if (this.detectSibilance(buffer)) problems.push('Sibilance (6-8kHz)');
    if (this.detectOverCompression(buffer)) problems.push('Over-compressed');
    if (this.detectLackOfHighEnd(buffer)) problems.push('Lacks high-end');

    return problems;
  }
}
```

---

## 🎛️ Component 3: Plugin Manager

### Purpose
Manages plugin instances, routing, and parameter automation.

```typescript
interface PluginInstance {
  id: string;
  pluginId: string;          // Reference to PluginMetadata
  trackId: string;           // Which track it's on
  position: number;          // Position in chain (0-based)
  enabled: boolean;

  // State
  parameters: Map<string, number>;
  preset: string | null;

  // Audio routing
  inputNode: AudioNode;
  outputNode: AudioNode;

  // Performance
  cpuUsage: number;          // Percentage
  latency: number;           // Samples
}

class PluginManager {
  private instances: Map<string, PluginInstance>;
  private audioContext: AudioContext;

  async addPlugin(
    trackId: string,
    pluginId: string,
    position?: number
  ): Promise<PluginInstance> {
    const metadata = await this.pluginDB.getPlugin(pluginId);

    // Load plugin
    const plugin = await this.loadPlugin(metadata);

    // Create instance
    const instance: PluginInstance = {
      id: crypto.randomUUID(),
      pluginId,
      trackId,
      position: position ?? this.getNextPosition(trackId),
      enabled: true,
      parameters: new Map(),
      preset: null,
      inputNode: plugin.inputNode,
      outputNode: plugin.outputNode,
      cpuUsage: 0,
      latency: plugin.getLatency(),
    };

    this.instances.set(instance.id, instance);

    // Route audio
    this.routePlugin(instance);

    return instance;
  }

  private async loadPlugin(metadata: PluginMetadata): Promise<any> {
    switch (metadata.format) {
      case 'vst3':
        return VST3Loader.load(metadata.path, this.audioContext);
      case 'au':
        return AULoader.load(metadata.path, this.audioContext);
      case 'clap':
        return CLAPLoader.load(metadata.path, this.audioContext);
      default:
        throw new Error(`Unsupported format: ${metadata.format}`);
    }
  }

  setParameter(
    instanceId: string,
    parameterId: string,
    value: number
  ): void {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.parameters.set(parameterId, value);

    // Send to plugin
    this.sendParameterToPlugin(instance, parameterId, value);
  }

  async applyAIRecommendation(
    recommendation: PluginChainRecommendation,
    trackId: string
  ): Promise<void> {
    // Clear existing chain
    await this.clearTrackPlugins(trackId);

    // Add plugins in recommended order
    for (const step of recommendation.chain) {
      const instance = await this.addPlugin(
        trackId,
        step.pluginId,
        step.order
      );

      // Apply recommended settings
      for (const [param, value] of Object.entries(step.settings)) {
        this.setParameter(instance.id, param, value);
      }
    }
  }
}
```

---

## 🔌 Component 4: Native Plugin Wrappers

### VST3 Wrapper (via WASM)

```typescript
class VST3Loader {
  static async load(
    path: string,
    audioContext: AudioContext
  ): Promise<VST3Plugin> {
    // Load WASM module
    const wasmModule = await import('./vst3-wasm-bridge.wasm');

    // Initialize plugin
    const plugin = await wasmModule.loadVST3(path);

    // Wrap in Web Audio node
    const processor = await audioContext.audioWorklet.addModule(
      '/worklets/vst3-processor.worklet.js'
    );

    const node = new AudioWorkletNode(audioContext, 'vst3-processor', {
      processorOptions: { plugin },
    });

    return new VST3Plugin(plugin, node);
  }
}

// VST3 Audio Worklet
class VST3Processor extends AudioWorkletProcessor {
  private plugin: any;

  constructor(options: any) {
    super();
    this.plugin = options.processorOptions.plugin;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    // Process audio through VST3
    this.plugin.process(inputs[0], outputs[0], parameters);
    return true;
  }
}
```

### Audio Units Wrapper (macOS)

```typescript
class AULoader {
  static async load(
    path: string,
    audioContext: AudioContext
  ): Promise<AUPlugin> {
    // Use native bridge (Electron/Tauri)
    const au = await window.electronAPI.loadAudioUnit(path);

    // Create AudioWorklet bridge
    const node = new AudioWorkletNode(audioContext, 'au-processor', {
      processorOptions: { au },
    });

    return new AUPlugin(au, node);
  }
}
```

---

## 📊 Plugin Database Schema

```typescript
interface PluginDatabase {
  plugins: PluginMetadata[];

  // Indexes for fast lookup
  byId: Map<string, PluginMetadata>;
  byCategory: Map<PluginCategory, PluginMetadata[]>;
  byVendor: Map<string, PluginMetadata[]>;
  byFormat: Map<'vst3' | 'au' | 'clap', PluginMetadata[]>;

  // Methods
  getPlugin(id: string): Promise<PluginMetadata>;
  searchPlugins(query: string): Promise<PluginMetadata[]>;
  getPluginsByCategory(cat: PluginCategory): Promise<PluginMetadata[]>;
  updatePlugin(id: string, updates: Partial<PluginMetadata>): Promise<void>;
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [x] Design architecture
- [ ] Implement PluginScanner for local file scanning
- [ ] Create PluginDatabase with IndexedDB storage
- [ ] Build basic plugin metadata extraction

### Phase 2: Native Integration (Week 3-4)
- [ ] VST3 WASM wrapper
- [ ] Audio Units bridge (macOS only)
- [ ] CLAP wrapper
- [ ] Audio routing and parameter control

### Phase 3: AI Integration (Week 5-6)
- [ ] AudioAnalyzer implementation
- [ ] Train AI with audio engineering knowledge
- [ ] AIPluginSelector with Claude integration
- [ ] Plugin recommendation engine

### Phase 4: Plugin Manager (Week 7-8)
- [ ] PluginManager implementation
- [ ] Plugin chain management
- [ ] Parameter automation
- [ ] CPU monitoring and optimization

### Phase 5: UI Integration (Week 9-10)
- [ ] Plugin browser UI
- [ ] Plugin chain visualizer
- [ ] AI recommendation UI
- [ ] Parameter controls

---

## 📁 File Structure

```
src/lib/audio/plugins/
├── scanner/
│   ├── PluginScanner.ts          # Main scanner
│   ├── VST3Scanner.ts             # VST3-specific
│   ├── AUScanner.ts               # Audio Units
│   ├── CLAPScanner.ts             # CLAP format
│   └── types.ts
├── ai/
│   ├── AIPluginSelector.ts        # AI decision engine
│   ├── AudioAnalyzer.ts           # Audio analysis
│   ├── EngineerTraining.ts        # AI training data
│   └── types.ts
├── manager/
│   ├── PluginManager.ts           # Plugin lifecycle
│   ├── PluginInstance.ts          # Instance management
│   ├── PluginChain.ts             # Chain management
│   └── types.ts
├── wrappers/
│   ├── VST3Wrapper.ts             # VST3 bridge
│   ├── AUWrapper.ts               # AU bridge
│   ├── CLAPWrapper.ts             # CLAP bridge
│   └── types.ts
├── database/
│   ├── PluginDatabase.ts          # IndexedDB storage
│   ├── schema.ts
│   └── migrations.ts
└── worklets/
    ├── vst3-processor.worklet.ts
    ├── au-processor.worklet.ts
    └── clap-processor.worklet.ts
```

---

## 🎓 AI Training Dataset

The AI is trained on:

1. **Plugin Chain Templates**
   - 500+ professional mixing chains
   - 200+ mastering chains
   - Organized by genre and instrument

2. **Problem-Solution Mapping**
   - Common audio issues → Recommended fixes
   - Frequency problems → EQ solutions
   - Dynamic issues → Compression strategies

3. **Plugin Knowledge Base**
   - Popular plugins and their strengths
   - Plugin alternatives and substitutions
   - CPU-efficient alternatives

4. **Audio Engineering Principles**
   - Gain staging rules
   - Frequency allocation
   - Dynamic processing techniques
   - Spatial processing best practices

---

**Next Steps**: Implement Phase 1 - Foundation
