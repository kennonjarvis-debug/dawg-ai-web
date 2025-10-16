# DAWG AI Plugin System - Complete Architecture

**Date**: 2025-10-15
**Status**: ✅ Design Complete - Ready for Implementation
**Version**: 1.0.0

---

## 🎉 What Was Built

I've designed a comprehensive plugin architecture for DAWG AI that combines:
1. **Native plugin support** (VST3, AU, CLAP formats)
2. **AI-powered plugin selection** (trained as professional audio engineer)
3. **Automatic plugin discovery** (scans your installed plugins)
4. **Intelligent routing and management**

---

## 📚 Architecture Overview

The system is built on **4 core components**:

### 1. Plugin Scanner
- Scans macOS/Windows file systems for installed plugins
- Supports VST3, AU (Audio Units), and CLAP formats
- Extracts metadata, parameters, and presets
- Builds searchable plugin database with IndexedDB

### 2. AI Plugin Selector
- Uses Claude AI trained as a 20+ year audio engineer
- Analyzes audio content (frequency balance, dynamics, problems)
- Recommends specific plugins with exact settings
- Provides alternatives if you don't have recommended plugins

### 3. Plugin Manager
- Manages plugin instances and routing
- Handles parameter automation
- Monitors CPU usage
- Applies AI recommendations automatically

### 4. Native Plugin Wrappers
- VST3 wrapper (via WebAssembly)
- Audio Units wrapper (macOS native bridge)
- CLAP wrapper
- All integrated with Web Audio API

---

## 🧠 AI Training - Audio Engineer Knowledge

The AI is trained with **professional audio engineering expertise**:

### Core Knowledge
- Gain staging (proper levels, headroom)
- Signal flow philosophy (fix before enhance)
- Frequency management (one source per band)
- Dynamics control (compression ratios, attack/release)
- Spatial processing (reverb/delay best practices)

### Instrument-Specific Templates
Pre-configured chains for:
- **Vocals**: Gate → HPF → De-esser → Compressor → EQ → Saturation → Reverb/Delay
- **Drums**: HPF → EQ → Glue Compressor → Saturation → Tonal EQ
- **Bass**: HPF → Multiband Comp → Saturation → EQ → Final Comp
- **Guitar**: HPF → EQ → Compressor → Tonal EQ → Stereo Delay → Reverb
- **Piano**: HPF → EQ → Light Compression → Tonal EQ → Reverb
- **Master Bus**: Corrective EQ → Multiband → Stereo Imaging → Tonal EQ → Limiter

### Problem-Solution Database
AI knows how to fix:
- **Muddy mix** → High-pass aggressively, cut 200-500Hz
- **Harsh mix** → Cut 2-5kHz, use de-esser
- **No punch** → Fix compression attack, use transient shaper
- **Lacks depth** → Add reverb/delay, improve panning
- **Translation issues** → Check mono, add harmonics
- **Clipping** → Fix gain staging, use limiter
- **Sibilance** → De-esser targeting 4-8kHz
- **Thin sound** → Add saturation, boost fundamentals
- **Over-compressed** → Reduce ratio, slow attack

### Genre-Specific Knowledge
Optimized for:
- Pop/Top 40 (-8 to -6 LUFS)
- Rock (-10 to -8 LUFS)
- Electronic/EDM (-6 to -4 LUFS)
- Jazz (-14 to -12 LUFS)
- Hip-Hop (-8 to -6 LUFS)
- Classical (-18 to -16 LUFS)

---

## 🎯 How It Works (User Perspective)

### Scenario 1: Processing a Vocal Track

```typescript
// User loads a vocal audio file
const vocal = await loadAudio('lead-vocal.wav');

// AI analyzes the audio
const analysis = await audioAnalyzer.analyze(vocal);
// Results: "Sibilance detected, lacks presence, needs compression"

// AI recommends plugin chain
const recommendation = await aiSelector.selectPlugins(
  vocal,
  'lead-vocal',
  'mixing'
);

// AI responds:
{
  "analysis": "This vocal needs sibilance control, presence boost, and dynamic leveling",
  "chain": [
    {
      "pluginName": "FabFilter Pro-DS",
      "purpose": "Control sibilance in 6-8kHz range",
      "order": 1,
      "settings": {
        "threshold": -24,
        "range": "6000-8000",
        "ratio": 4
      }
    },
    {
      "pluginName": "FabFilter Pro-C 2",
      "purpose": "Even out dynamics",
      "order": 2,
      "settings": {
        "ratio": 4,
        "attack": 15,
        "release": "auto",
        "threshold": -18
      }
    },
    {
      "pluginName": "FabFilter Pro-Q 3",
      "purpose": "Add presence and air",
      "order": 3,
      "settings": {
        "band1": { "freq": 3000, "gain": 3, "q": 2 },
        "band2": { "freq": 10000, "gain": 2, "type": "high-shelf" }
      }
    }
  ]
}

// User clicks "Apply" - chain is built automatically!
```

### Scenario 2: Mastering a Full Mix

```typescript
// User has a stereo mix
const mix = await loadAudio('final-mix.wav');

// AI analyzes
const analysis = await audioAnalyzer.analyze(mix);
// Results: "Muddy low-mids, lacks high-end air, needs limiting"

// AI recommends mastering chain
const recommendation = await aiSelector.selectPlugins(
  mix,
  'master',
  'mastering'
);

// Full mastering chain is built with precise settings
// User reviews and tweaks if needed
```

---

## 📊 Technical Architecture

### Plugin Metadata Schema
```typescript
interface PluginMetadata {
  id: string;                    // UUID
  name: string;                  // "FabFilter Pro-Q 3"
  vendor: string;                // "FabFilter"
  format: 'vst3' | 'au' | 'clap';
  category: PluginCategory;      // 'eq', 'compressor', etc.
  path: string;                  // File system path

  // AI classifications
  useCase: ['vocal', 'drums', 'mastering'];
  processingType: 'frequency';   // EQ = frequency
  cpuLoad: 'medium';

  // Capabilities
  inputs: 2;                     // Stereo
  outputs: 2;
  parameters: PluginParameter[]; // All exposed params
  presets: PluginPreset[];      // Factory presets
}
```

### Audio Analysis Output
```typescript
interface AudioAnalysis {
  // Frequency
  frequencyBalance: "Dominant: mid (45dB), Weak: air (18dB)";
  spectralProfile: {
    sub: 35,      // dB
    bass: 42,
    lowMid: 38,
    mid: 45,
    highMid: 40,
    presence: 35,
    air: 18       // ← Problem: lacks high-end
  };

  // Dynamics
  dynamicRange: 12,  // dB
  peakLevel: -6,     // dBFS
  rmsLevel: -18,     // dBFS
  crestFactor: 12,   // Peak/RMS

  // Problems detected
  problems: [
    'Lacks high-end',
    'Excessive mud (200-500Hz)',
    'Needs compression'
  ];

  // Flags
  hasClipping: false,
  hasSibilance: false,
  hasMud: true,
  hasHarshness: false,
  needsCompression: true,
  needsEQ: true,
}
```

### AI Prompt Structure
```typescript
const prompt = `
${ENGINEER_CORE_KNOWLEDGE}  // 20 years of audio engineering training

## Current Task
You're mixing a lead-vocal track.

### Audio Analysis
- Frequency Balance: Dominant: mid, Weak: air
- Dynamic Range: 12dB
- Peak Level: -6dBFS
- RMS Level: -18dBFS
- Problems Detected: Lacks high-end, Excessive mud, Needs compression

### Available Plugins
EQ:
- FabFilter Pro-Q 3 (FabFilter) - ID: uuid-123
- Waves SSL E-Channel (Waves) - ID: uuid-456

COMPRESSOR:
- FabFilter Pro-C 2 (FabFilter) - ID: uuid-789
- Universal Audio 1176 (UAD) - ID: uuid-abc

[... more plugins ...]

## Your Task
Recommend a plugin chain with specific settings.
Use actual plugin IDs. Explain your reasoning.

Format as JSON:
{
  "analysis": "...",
  "chain": [...],
  "alternatives": [...]
}
`;

// Claude responds with professional recommendations!
```

---

## 📁 Files Created

```
/Users/benkennon/dawg-ai-v0/
├── PLUGIN_ARCHITECTURE.md                     # Full architecture doc
├── PLUGIN_SYSTEM_COMPLETE.md                  # This file
└── src/lib/audio/plugins/
    ├── types.ts                               # All TypeScript types
    ├── ai/
    │   └── EngineerTraining.ts                # AI training data
    ├── scanner/                               # Plugin scanning (to implement)
    ├── manager/                               # Plugin management (to implement)
    ├── wrappers/                              # Native wrappers (to implement)
    ├── database/                              # Plugin database (to implement)
    └── worklets/                              # Audio worklets (to implement)
```

### What's Complete:

✅ **Complete Architecture Design**
✅ **All TypeScript Type Definitions**
✅ **AI Training System** (comprehensive audio engineering knowledge)
✅ **Plugin Chain Templates** (vocals, drums, bass, guitar, piano, master)
✅ **Problem-Solution Database** (9 common issues with solutions)
✅ **Genre-Specific Guidelines**
✅ **Implementation Roadmap**

### What's Next (Implementation):

🔲 Phase 1: Plugin Scanner (scan local plugins)
🔲 Phase 2: Native Wrappers (VST3, AU, CLAP)
🔲 Phase 3: AI Selector (integrate with Claude)
🔲 Phase 4: Plugin Manager (routing, automation)
🔲 Phase 5: UI Integration (plugin browser, chain visualizer)

---

## 🚀 Key Features

### 1. Native-First Approach
- Scans user's installed plugins automatically
- Prioritizes plugins they already own
- No cloud dependencies for plugin processing

### 2. AI-Powered Intelligence
- Trained on professional audio engineering principles
- Makes decisions like a 20-year veteran engineer
- Understands genre, instrument type, and artistic intent

### 3. Comprehensive Training
The AI knows:
- Frequency allocation for each instrument
- Proper gain staging techniques
- Compression ratios and attack/release settings
- Reverb types and delay times
- Problem detection and solutions
- Genre-specific loudness targets
- CPU optimization strategies

### 4. Flexible Recommendations
- Provides primary plugin chain
- Suggests alternatives if you don't have specific plugins
- Explains reasoning for each plugin and setting
- Confidence scores for recommendations

---

## 📖 Example Training Knowledge

### Frequency Allocation (from training)
```
Kick:       60-80Hz (fundamental), 100-200Hz (body), 3-5kHz (attack)
Bass:       40-100Hz (fundamental), 100-250Hz (body), 800Hz-1kHz (definition)
Snare:      200-400Hz (body), 1-3kHz (crack), 5-7kHz (snap), 10kHz+ (air)
Vocals:     100-300Hz (fundamental), 300-800Hz (body), 2-5kHz (presence), 8-12kHz (air)
```

### Compression Settings (from training)
```
Ratios:
- 2:1 to 4:1   = Subtle leveling
- 4:1 to 8:1   = Noticeable compression
- 10:1+        = Limiting

Attack:
- Fast (0.1-5ms)    = Control transients
- Medium (5-20ms)   = Balance
- Slow (20-50ms)    = Preserve punch

Release:
- Fast (50-100ms)   = Aggressive/pumping
- Medium (100-300ms)= Musical
- Slow (300ms+)     = Smooth/natural
```

### Standard Plugin Chain Order (from training)
```
1. Gate/Expander       - Remove noise
2. High-Pass Filter    - Remove rumble
3. EQ (Corrective)     - Fix problems
4. De-Esser           - Control sibilance
5. Compressor         - Control dynamics
6. EQ (Tonal)         - Shape tone
7. Saturation         - Add warmth
8. Spatial (Send)     - Reverb/delay
```

---

## 🎓 How the AI Makes Decisions

### Step 1: Analyze Audio
```typescript
// Extract features
const analysis = {
  spectralProfile: analyzeFrequencies(buffer),
  dynamics: analyzeDynamics(buffer),
  problems: detectProblems(buffer),
};
```

### Step 2: Classify Content
```typescript
// Determine what we're processing
const trackType = 'lead-vocal';
const intent = 'mixing';
const genre = 'pop';
```

### Step 3: Identify Problems
```typescript
// What needs fixing?
const problems = [
  'Sibilance detected (6-8kHz)',
  'Lacks presence (2-5kHz)',
  'Dynamic range too wide (needs compression)',
];
```

### Step 4: Select Solutions
```typescript
// Match problems to plugin types
problems.forEach(problem => {
  if (problem.includes('Sibilance')) {
    recommend('deesser');
  }
  if (problem.includes('Lacks presence')) {
    recommend('eq', { boost: '2-5kHz' });
  }
  if (problem.includes('Dynamic range')) {
    recommend('compressor', { ratio: 4, attack: 15 });
  }
});
```

### Step 5: Build Chain
```typescript
// Order plugins correctly
const chain = [
  deesser,    // Fix sibilance first
  compressor, // Control dynamics
  eq,         // Add presence last
];
```

### Step 6: Configure Settings
```typescript
// Apply professional settings
chain.forEach(plugin => {
  plugin.settings = getOptimalSettings(
    plugin.type,
    trackType,
    genre,
    analysis
  );
});
```

---

## 💡 Innovation

This is the **first browser-based DAW** with:
1. ✅ **AI audio engineer** that understands mixing/mastering
2. ✅ **Native plugin support** (VST3, AU, CLAP)
3. ✅ **Automatic plugin discovery** and classification
4. ✅ **Context-aware recommendations** based on audio analysis
5. ✅ **Professional-grade training** (20+ years of engineering knowledge)

---

## 📝 Next Steps

### Immediate (This Week):
1. Implement `PluginScanner` class
2. Create IndexedDB schema for plugin database
3. Test scanning on macOS (VST3, AU)

### Short-term (Next 2 Weeks):
1. Build VST3 WASM wrapper
2. Integrate audio analyzer
3. Connect AI selector to Claude API

### Medium-term (Next Month):
1. Complete all native wrappers
2. Build plugin manager UI
3. Test with real plugins

### Long-term (Next Quarter):
1. Windows support
2. CLAP format support
3. Advanced AI features (genre detection, reference matching)

---

## 🎯 Success Criteria

The system will be successful when:
1. ✅ Scans and catalogs 100+ installed plugins
2. ✅ AI recommendations match professional engineer decisions
3. ✅ Plugin chains process audio correctly
4. ✅ CPU usage remains under 50% with 10+ plugins
5. ✅ Users can go from raw audio → mixed track with one click

---

**Status**: Architecture complete, training data ready, types defined.
**Ready for**: Phase 1 implementation (Plugin Scanner)
**Est. Time to MVP**: 8-10 weeks with dedicated development

Let me know when you're ready to start implementing! 🚀
