# DAWG AI Plugin System - Phase 2: Wrappers Complete

**Date**: 2025-10-15
**Status**: ✅ Phase 2 Wrappers Implemented
**Next**: Phase 2.5 - Plugin Instance Manager, Phase 3 - Integration & Testing

---

## 🎉 What Was Implemented

### Phase 2: Plugin Wrappers

✅ **Base Plugin Wrapper Architecture**
✅ **Web Audio Plugin Wrapper** (Production Ready)
✅ **VST3 Plugin Wrapper** (Architectural Stub)
✅ **Audio Units Wrapper** (Architectural Stub, macOS)
✅ **CLAP Plugin Wrapper** (Architectural Stub)
✅ **Module Exports & Factory Functions**

---

## 📁 Files Created

### 1. Base Plugin Wrapper
```
src/lib/audio/plugins/wrappers/
└── BasePluginWrapper.ts (400+ lines)
```

**Purpose**: Abstract base class for all plugin wrappers

**Features**:
- Plugin state management (parameters, presets, bypass, enabled)
- Web Audio node integration (input/output/processor nodes)
- Parameter control with value clamping
- Parameter change callbacks/subscriptions
- Preset loading and management
- Bypass and enable/disable functionality
- State serialization/deserialization
- Abstract methods for subclasses:
  - `load()` - Initialize plugin
  - `unload()` - Clean up resources
  - `process()` - Offline audio processing
  - `applyParameter()` - Apply parameter to native plugin
  - `getLatency()` - Report processing latency
  - `getCPUUsage()` - Report CPU usage

**Key Interfaces**:
```typescript
interface PluginState {
  parameters: Map<string, number>;
  activePreset: string | null;
  bypass: boolean;
  enabled: boolean;
}

interface AudioBufferInfo {
  sampleRate: number;
  blockSize: number;
  numInputChannels: number;
  numOutputChannels: number;
}
```

**Usage**:
```typescript
const plugin = new SomePluginWrapper(metadata, audioContext);
await plugin.load();

// Set parameter
plugin.setParameter('gain', 0.5);

// Load preset
await plugin.loadPreset('preset-id');

// Bypass
plugin.setBypass(true);

// Connect to audio graph
plugin.connect(audioContext.destination);

// Cleanup
await plugin.unload();
```

---

### 2. Web Audio Plugin Wrapper
```
src/lib/audio/plugins/wrappers/
└── WebAudioPluginWrapper.ts (350+ lines)
```

**Status**: ✅ **Production Ready** - Fully functional

**Purpose**: Wrapper for plugins built with Web Audio API nodes

**Features**:
- Factory pattern for creating audio processors
- Automatic parameter mapping to AudioParam/GainNode
- Real-time audio processing via Web Audio graph
- Optional custom process function for offline rendering
- Zero dependencies - works in any modern browser

**Configuration**:
```typescript
interface WebAudioPluginConfig {
  createProcessor: (
    audioContext: AudioContext,
    metadata: PluginMetadata
  ) => {
    inputNode: AudioNode;
    outputNode: AudioNode;
    parameterNodes: Map<string, AudioParam | GainNode>;
  };

  process?: (
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, number>
  ) => void;
}
```

**Example Plugins Included**:

1. **SimpleGainPlugin** - Basic gain control
   ```typescript
   const gainNode = audioContext.createGain();
   return {
     inputNode: gainNode,
     outputNode: gainNode,
     parameterNodes: new Map([['gain', gainNode.gain]])
   };
   ```

2. **SimpleEQPlugin** - 3-band EQ (low/mid/high shelf)
   ```typescript
   // Low shelf (200 Hz), mid peak (1 kHz), high shelf (8 kHz)
   parameterNodes: new Map([
     ['lowGain', lowShelf.gain],
     ['midGain', mid.gain],
     ['highGain', highShelf.gain],
   ])
   ```

3. **SimpleCompressorPlugin** - Dynamics compression
   ```typescript
   // DynamicsCompressor with threshold, knee, ratio, attack, release
   ```

4. **SimpleDelayPlugin** - Delay with feedback
   ```typescript
   // Delay with feedback loop and dry/wet mix
   parameterNodes: new Map([
     ['delayTime', delay.delayTime],
     ['feedback', feedback.gain],
     ['mix', wetGain.gain],
   ])
   ```

**Usage**:
```typescript
const plugin = createWebAudioPlugin(
  metadata,
  audioContext,
  SimpleEQPlugin
);

await plugin.load();
plugin.setParameter('lowGain', 3); // +3dB boost
plugin.setParameter('highGain', -2); // -2dB cut
```

---

### 3. VST3 Plugin Wrapper
```
src/lib/audio/plugins/wrappers/
└── VST3PluginWrapper.ts (500+ lines)
```

**Status**: 🔨 **Architectural Stub** - Requires Native Bridge

**Purpose**: Wrapper for Steinberg VST3 format plugins

**Native Bridge Interface**:
```typescript
interface VST3NativeBridge {
  loadPlugin(path: string): Promise<VST3PluginHandle>;
  unloadPlugin(handle: VST3PluginHandle): Promise<void>;
  getMetadata(handle: VST3PluginHandle): Promise<VST3PluginInfo>;
  initialize(handle, sampleRate, maxBlockSize): Promise<void>;
  setParameter(handle, parameterId, value): void;
  getParameter(handle, parameterId): number;
  process(handle, inputs, outputs, numFrames): void;
  getLatency(handle): number;
  getCPUUsage(handle): number;
  setActive(handle, active): void;
}
```

**What's Implemented**:
- Complete wrapper architecture
- Parameter mapping (wrapper ↔ VST3)
- AudioWorklet integration stub
- Load/unload lifecycle
- State management
- Error handling

**What's Needed for Full Implementation**:
1. **Option 1: Electron Native Module**
   - C++ addon using VST3 SDK
   - Node-API (N-API) bindings
   - Load .vst3 bundles dynamically

2. **Option 2: WebAssembly**
   - Compile VST3 SDK to WASM
   - Emscripten filesystem for .vst3 files
   - SharedArrayBuffer for audio data

3. **Option 3: Tauri Rust Bindings**
   - Rust bindings to VST3 SDK
   - Tauri commands for JS interface

**VST3 Key Concepts**:
- Plugin Factory pattern
- Component + Controller separation
- Sample-accurate parameter automation
- Normalized parameters (0-1)
- Plugin UIDs for identification

**Implementation Notes** (from file):
```cpp
// Plugin loading
IPluginFactory* factory;
module->getFactory(&factory);
factory->createInstance(cid, IComponent::iid, (void**)&component);

// Parameter management
controller->setParamNormalized(paramId, value);

// Audio processing
processor->process(processData);
```

**Resources**:
- VST3 SDK: https://www.steinberg.net/developers/
- License: GPL v3 or Proprietary
- Platform: Windows, macOS, Linux

---

### 4. Audio Units Plugin Wrapper
```
src/lib/audio/plugins/wrappers/
└── AUPluginWrapper.ts (500+ lines)
```

**Status**: 🔨 **Architectural Stub** - Requires Native Bridge
**Platform**: 🍎 **macOS Only**

**Purpose**: Wrapper for Apple Audio Units format

**Native Bridge Interface**:
```typescript
interface AUNativeBridge {
  loadAudioUnit(path, type, subType): Promise<AUPluginHandle>;
  unloadAudioUnit(handle): Promise<void>;
  getMetadata(handle): Promise<AUPluginInfo>;
  initialize(handle, sampleRate, maxFrames): Promise<void>;
  setParameter(handle, id, value, scope, element): void;
  getParameter(handle, id, scope, element): number;
  setFactoryPreset(handle, presetNumber): Promise<void>;
  getFactoryPresets(handle): Promise<AUPresetInfo[]>;
  render(handle, flags, timestamp, bus, frames, ioData): void;
  getLatency(handle): number;
  getTailTime(handle): number;
  getCPULoad(handle): number;
  reset(handle): void;
}
```

**What's Implemented**:
- Complete wrapper architecture
- Parameter mapping with scope/element
- Factory preset support
- AudioWorklet integration stub
- AU-specific features (tail time, component types)

**What's Needed for Full Implementation**:
1. **Objective-C/C++ Native Module**
   - Link against AudioToolbox.framework
   - Use AudioComponent API
   - Expose via Node-API

2. **Tauri Rust Bindings**
   - Use coreaudio-sys crate
   - CoreAudio bindings

3. **Swift Bridge** (Alternative)
   - Modern Swift wrapper
   - swift-bridge for JS interface

**Audio Units Key Concepts**:
- Component types: 'aufx' (effect), 'aumu' (instrument)
- Scopes: Global, Input, Output
- Parameter units (Hz, dB, ms, percent)
- Factory presets built into plugin
- Render callback pattern
- Native macOS integration

**AU Types**:
- Effect: `kAudioUnitType_Effect`
- Instrument: `kAudioUnitType_MusicDevice`
- Mixer: `kAudioUnitType_Mixer`
- Generator: `kAudioUnitType_Generator`

**Implementation Notes** (from file):
```objc
// Component discovery
AudioComponentDescription desc = {
    .componentType = kAudioUnitType_Effect,
    .componentSubType = 'FPEQ',
    .componentManufacturer = 'FabF'
};

// Parameter management
AudioUnitSetParameter(instance, paramID, kAudioUnitScope_Global, 0, value, 0);

// Render callback
AudioUnitRender(instance, &flags, &timestamp, bus, frames, &ioData);
```

**Built-in macOS Audio Units for Testing**:
- AUGraphicEQ (Graphic EQ)
- AUDynamicsProcessor (Compressor)
- AUMatrixReverb (Reverb)
- AUDelay (Delay)
- AUPitch (Pitch Shifter)

**Resources**:
- Apple Developer Docs: https://developer.apple.com/documentation/audiotoolbox
- Core Audio Programming Guide
- AudioUnit Programming Guide

---

### 5. CLAP Plugin Wrapper
```
src/lib/audio/plugins/wrappers/
└── CLAPPluginWrapper.ts (550+ lines)
```

**Status**: 🔨 **Architectural Stub** - Requires Native Bridge

**Purpose**: Wrapper for CLAP (CLever Audio Plugin) format

**Native Bridge Interface**:
```typescript
interface CLAPNativeBridge {
  loadPlugin(path, pluginIndex?): Promise<CLAPPluginHandle>;
  unloadPlugin(handle): Promise<void>;
  getDescriptor(handle): Promise<CLAPDescriptor>;
  initialize(handle): Promise<boolean>;
  activate(handle, sampleRate, minFrames, maxFrames): Promise<boolean>;
  deactivate(handle): Promise<void>;
  startProcessing(handle): Promise<boolean>;
  stopProcessing(handle): Promise<void>;
  getParameterCount(handle): number;
  getParameterInfo(handle, index): CLAPParameterInfo;
  getParameterValue(handle, paramId): number;
  setParameterValue(handle, paramId, value): void;
  process(handle, processData): CLAPProcessStatus;
  getLatency(handle): number;
  flushParameters(handle, events): void;
}
```

**What's Implemented**:
- Complete wrapper architecture
- Parameter discovery and mapping
- Event system (parameter changes, MIDI)
- Process lifecycle (init → activate → start → process → stop → deactivate)
- CLAP-specific features (steady time, transport)

**What's Needed for Full Implementation**:
1. **Electron Native Module** (Recommended)
   - C++ addon with CLAP SDK
   - Dynamic library loading (.clap files)
   - Header-only C API

2. **Tauri Rust Bindings**
   - clap-sys crate
   - libloading for dynamic libs

3. **WebAssembly** (Experimental)
   - Compile CLAP host to WASM
   - Embed plugins in binary

**CLAP Advantages**:
- ✅ Open source (MIT license)
- ✅ Modern design (newer than VST3)
- ✅ Superior MIDI support (MPE, polyphonic expression)
- ✅ Per-note modulation
- ✅ Better state management
- ✅ Flexible extension system
- ✅ Sample-accurate events
- ✅ No licensing fees

**CLAP Key Concepts**:
- Plugin entry point and factory
- Descriptor-based plugin info
- Extension system for features
- Process data structure
- Event system (parameters, MIDI, notes)
- Module-based parameter grouping

**Implementation Notes** (from file):
```cpp
// Plugin entry
const clap_plugin_entry_t* entry = clap_entry;
entry->init(plugin_path);

// Plugin creation
const clap_plugin_factory_t* factory =
    entry->get_factory(CLAP_PLUGIN_FACTORY_ID);
const clap_plugin_t* plugin =
    factory->create_plugin(factory, host, desc->id);

// Parameter management
params->get_info(plugin, param_index, &info);
params->get_value(plugin, param_id, &value);

// Audio processing
clap_process_t process;
plugin->process(plugin, &process);
```

**Where to Find CLAP Plugins**:
- Surge XT (free, open source) - CLAP native
- Vital (free synth)
- u-he plugins (Diva, Repro, Zebra)
- Bitwig plugins
- TAL Software
- Growing ecosystem

**Resources**:
- CLAP GitHub: https://github.com/free-audio/clap
- CLAP Specification: https://github.com/free-audio/clap/wiki
- Example Host: https://github.com/free-audio/clap-host

---

### 6. Module Exports
```
src/lib/audio/plugins/wrappers/
└── index.ts (100 lines)
```

**Purpose**: Central export point for all wrappers

**Exports**:
- All wrapper classes
- All factory functions
- All type definitions
- Unified `createPluginWrapper()` factory

**Usage**:
```typescript
import {
  createWebAudioPlugin,
  createVST3Plugin,
  createAUPlugin,
  createCLAPPlugin,
  SimpleEQPlugin,
} from '@/lib/audio/plugins/wrappers';

// Web Audio (works now)
const eq = createWebAudioPlugin(metadata, audioContext, SimpleEQPlugin);
await eq.load();

// VST3 (needs native bridge)
const vst = createVST3Plugin(metadata, audioContext, vst3Bridge);
await vst.load();

// AU (needs native bridge, macOS only)
const au = createAUPlugin(metadata, audioContext, auBridge);
await au.load();

// CLAP (needs native bridge)
const clap = createCLAPPlugin(metadata, audioContext, clapBridge);
await clap.load();
```

**Unified Factory**:
```typescript
const plugin = createPluginWrapper(
  metadata,
  audioContext,
  {
    vst3: vst3Bridge,
    au: auBridge,
    clap: clapBridge,
  }
);
// Automatically chooses correct wrapper based on metadata.format
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              DAWG AI Plugin System (Phase 2)            │
└─────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌──────────────┐  ┌───────────────┐
│   Wrappers     │  │   Scanner    │  │   Database    │
│  (Phase 2)     │  │  (Phase 1)   │  │  (Phase 1)    │
└────────────────┘  └──────────────┘  └───────────────┘
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
┌─────────────────┐  ┌──────────────────────┐
│ BasePlugin      │  │  Native Bridges      │
│ Wrapper         │  │  (To be implemented) │
│ (Abstract)      │  │                      │
└─────────────────┘  └──────────────────────┘
         │                    │
    ┌────┼────┬────┬────┐    │
    │    │    │    │    │    │
    ▼    ▼    ▼    ▼    ▼    ▼
┌────┐ ┌────┐ ┌──┐ ┌──┐ ┌────────────┐
│Web │ │VST3│ │AU│ │CL│ │ Electron/  │
│Aud.│ │(St)│ │(S)│ │AP│ │ Tauri/WASM │
└────┘ └────┘ └──┘ └──┘ └────────────┘
  ✅     🔨    🔨   🔨

✅ = Production Ready
🔨 = Stub (needs native bridge)
(S) = Stub
```

---

## 💾 API Examples

### Example 1: Using Web Audio Plugin (Works Now!)

```typescript
import {
  createWebAudioPlugin,
  SimpleEQPlugin
} from '@/lib/audio/plugins';

// Create EQ plugin
const metadata = {
  id: 'simple-eq-1',
  name: 'Simple EQ',
  vendor: 'DAWG AI',
  format: 'web',
  category: 'eq',
  parameters: [
    { id: 'lowGain', name: 'Low Gain', min: -12, max: 12, default: 0 },
    { id: 'midGain', name: 'Mid Gain', min: -12, max: 12, default: 0 },
    { id: 'highGain', name: 'High Gain', min: -12, max: 12, default: 0 },
  ],
  // ... other metadata
};

const audioContext = new AudioContext();
const eq = createWebAudioPlugin(metadata, audioContext, SimpleEQPlugin);

// Load plugin
await eq.load();

// Adjust EQ
eq.setParameter('lowGain', 3);     // +3dB bass boost
eq.setParameter('midGain', -2);    // -2dB mid cut
eq.setParameter('highGain', 1);    // +1dB treble boost

// Connect to audio graph
const source = audioContext.createMediaElementSource(audioElement);
source.connect(eq.getInputNode());
eq.connect(audioContext.destination);

// Listen to parameter changes
eq.onParameterChange('lowGain', (value) => {
  console.log(`Low gain changed to ${value} dB`);
});

// Cleanup
await eq.unload();
```

### Example 2: Creating Custom Web Audio Plugin

```typescript
const CustomReverbPlugin: WebAudioPluginConfig = {
  createProcessor: (audioContext, metadata) => {
    const inputNode = audioContext.createGain();
    const dryGain = audioContext.createGain();
    const wetGain = audioContext.createGain();
    const convolver = audioContext.createConvolver();
    const outputNode = audioContext.createGain();

    // Load impulse response
    fetch('/impulse-responses/plate-reverb.wav')
      .then(r => r.arrayBuffer())
      .then(buffer => audioContext.decodeAudioData(buffer))
      .then(audioBuffer => { convolver.buffer = audioBuffer; });

    // Routing: dry + wet mix
    inputNode.connect(dryGain);
    inputNode.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(outputNode);
    wetGain.connect(outputNode);

    dryGain.gain.value = 0.7;
    wetGain.gain.value = 0.3;

    return {
      inputNode,
      outputNode,
      parameterNodes: new Map([
        ['dry', dryGain.gain],
        ['wet', wetGain.gain],
      ]),
    };
  },
};

const reverb = createWebAudioPlugin(metadata, audioContext, CustomReverbPlugin);
await reverb.load();
reverb.setParameter('wet', 0.5); // 50% wet mix
```

### Example 3: VST3 with Native Bridge (Future)

```typescript
// Once native bridge is implemented:
import { createVST3Plugin } from '@/lib/audio/plugins';
import { ElectronVST3Bridge } from './native-bridges/electron-vst3';

const vst3Bridge = new ElectronVST3Bridge();

const fabfilterProQ = createVST3Plugin(
  {
    id: 'fabfilter-pro-q-3',
    name: 'FabFilter Pro-Q 3',
    vendor: 'FabFilter',
    format: 'vst3',
    path: '/Library/Audio/Plug-Ins/VST3/FabFilter Pro-Q 3.vst3',
    // ... metadata
  },
  audioContext,
  vst3Bridge
);

await fabfilterProQ.load();
fabfilterProQ.setParameter('frequency-1', 1000);
fabfilterProQ.setParameter('gain-1', 3);
```

---

## ✅ What's Production Ready

1. ✅ **Base Plugin Wrapper**: Complete abstract class with all core functionality
2. ✅ **Web Audio Wrapper**: Fully functional, ready to use
3. ✅ **4 Example Plugins**: Gain, EQ, Compressor, Delay
4. ✅ **Type Definitions**: Complete TypeScript types for all wrappers
5. ✅ **Module Exports**: Clean API with factory functions
6. ✅ **Documentation**: Comprehensive implementation notes in each file

---

## ⚠️ What Needs Native Bridges

### VST3 Wrapper
**Status**: Architecture complete, needs native implementation
**Requirements**:
- VST3 SDK integration
- Electron/Tauri/WASM host
- Dynamic library loading
- AudioWorklet processor

**Complexity**: High
**Timeline**: 1-2 weeks with dedicated dev

### Audio Units Wrapper
**Status**: Architecture complete, needs native implementation
**Requirements**:
- macOS AudioToolbox framework
- Objective-C/Swift bridge
- Component API integration
- Only works on macOS

**Complexity**: Medium
**Timeline**: 1 week with macOS experience

### CLAP Wrapper
**Status**: Architecture complete, needs native implementation
**Requirements**:
- CLAP SDK (header-only, MIT)
- Dynamic library loading
- Event system implementation
- Simpler than VST3

**Complexity**: Medium
**Timeline**: 1 week

---

## 🚀 Next Steps

### Phase 2.5: Plugin Instance Manager (1-2 days)
Create a manager to handle multiple plugin instances:
- Load/unload plugins
- Route audio between plugins
- Manage plugin chains
- Handle latency compensation
- CPU usage monitoring

### Phase 3: Integration & Testing (1 week)
Once native bridges are implemented:
1. Test with real VST3 plugins
2. Test with macOS Audio Units
3. Test with CLAP plugins
4. Measure latency and CPU usage
5. Test state save/restore
6. Test automation
7. Create integration examples

### Phase 4: AI Integration (1 week)
Connect plugins with AI decision system:
1. Plugin selection AI (from Phase 1)
2. Parameter optimization
3. Automatic mixing
4. Genre-specific processing
5. Problem detection and fixing

---

## 📊 Phase 2 Statistics

- **Files Created**: 6
- **Lines of Code**: ~2,500
- **Classes Implemented**: 5
- **Interfaces Defined**: 15+
- **Example Plugins**: 4
- **Production Ready**: 1 wrapper (Web Audio) + 4 example plugins
- **Native Bridges Needed**: 3 (VST3, AU, CLAP)

---

## 🎓 Key Design Decisions

1. **Abstract Base Class**: Ensures consistent API across all formats
2. **Web Audio First**: Immediately usable in browser, no dependencies
3. **Native Bridge Pattern**: Clean separation between JS and native code
4. **Factory Functions**: Simple plugin creation API
5. **AudioWorklet Integration**: Low-latency real-time processing
6. **Parameter Mapping**: Flexible mapping between formats
7. **State Management**: Complete save/restore support
8. **Error Handling**: Graceful degradation, clear error messages

---

## 📖 Documentation Quality

Each wrapper file includes:
- ✅ Comprehensive implementation notes
- ✅ Native bridge requirements
- ✅ Code examples (C++/Objective-C)
- ✅ Testing suggestions
- ✅ Resource links
- ✅ Platform-specific considerations
- ✅ Performance tips

---

**Status**: Phase 2 Wrappers ✅ Complete
**Web Audio**: ✅ Production Ready
**Native Wrappers**: 🔨 Architectural Stubs Ready for Implementation
**Ready for**: Phase 2.5 - Plugin Instance Manager

🎯 The wrapper architecture is complete and robust. Web Audio plugins work immediately. Native format support awaits bridge implementation! 🚀
