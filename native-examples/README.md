# Native Plugin Bridge Examples

This directory contains reference implementations for native plugin bridges.

## Overview

These examples show how to implement real native bridges for VST3, Audio Units, and CLAP plugins using Electron (Node-API) or Tauri (Rust).

## Files

- **vst3-bridge.cpp** - VST3 bridge implementation in C++ with Node-API
- **au-bridge.mm** - Audio Units bridge in Objective-C++ (macOS only)
- **clap-bridge.rs** - CLAP bridge in Rust with napi-rs
- **binding.gyp** - node-gyp build configuration for C++ bridges

## Requirements

### VST3 Bridge
- C++17 compiler
- VST3 SDK from https://www.steinberg.net/developers/
- Node.js + node-addon-api
- Platforms: Windows, macOS, Linux

### AU Bridge
- Xcode Command Line Tools
- macOS 10.13+
- AudioToolbox.framework
- CoreAudio.framework
- Platforms: macOS only

### CLAP Bridge
- Rust 1.70+
- clap-sys crate
- libloading crate
- napi-rs OR tauri
- Platforms: Windows, macOS, Linux

## Building

### Option 1: Electron/Node.js with node-gyp

```bash
# Install dependencies
npm install node-addon-api node-gyp

# Build all bridges
node-gyp rebuild

# Or build specific bridge
node-gyp rebuild --target=vst3_bridge
```

### Option 2: Rust with Cargo (CLAP only)

```bash
# Navigate to examples
cd native-examples

# Build Rust bridge
cargo build --release

# Output will be in target/release/
```

### Option 3: Tauri

```bash
# Setup Tauri project
npm create tauri-app

# Add Rust bridge to src-tauri/src/
# Register commands in main.rs
# Build with Tauri
npm run tauri build
```

## Usage

### Using with TypeScript

```typescript
import { VST3NativeBridge } from './wrappers/VST3PluginWrapper';

// Load native bridge
const vst3Bridge: VST3NativeBridge = require('./build/Release/vst3_bridge.node');

// Use with wrapper
const plugin = new VST3PluginWrapper(metadata, audioContext, vst3Bridge);
await plugin.load();
```

### Using Mock Bridges (Recommended for Development)

```typescript
import {
  createMockVST3Bridge,
  createMockAUBridge,
  createMockCLAPBridge
} from '@/lib/audio/plugins/bridges';

// Create mock bridges
const bridges = {
  vst3: createMockVST3Bridge(),
  au: createMockAUBridge(),
  clap: createMockCLAPBridge()
};

// Use with wrapper
const plugin = new VST3PluginWrapper(metadata, audioContext, bridges.vst3);
await plugin.load();
```

## Implementation Status

| Format | Example Code | Mock Bridge | Build Config | Status |
|--------|-------------|-------------|--------------|--------|
| VST3 | ✅ Complete | ✅ Complete | ✅ Complete | Ready to implement |
| AU | ✅ Complete | ✅ Complete | ✅ Complete | Ready to implement (macOS only) |
| CLAP | ✅ Complete | ✅ Complete | ✅ Complete | Ready to implement |

## Next Steps

1. **Choose Platform**:
   - Electron for desktop app
   - Tauri for modern, Rust-based desktop
   - Web-only (skip native, use Web Audio plugins only)

2. **Implement One Format First**:
   - Start with CLAP (easiest, MIT license)
   - Then VST3 (largest ecosystem)
   - Then AU (macOS users only)

3. **Testing**:
   - Use mock bridges for initial development
   - Test with free plugins first (Surge XT, Vital)
   - Gradually add real plugin support

4. **Integration**:
   - Replace mock bridges with real ones
   - No changes needed to wrapper code!
   - Everything else continues to work

## Resources

### VST3
- SDK: https://www.steinberg.net/developers/
- Documentation: https://steinbergmedia.github.io/vst3_dev_portal/
- License: GPL v3 OR proprietary
- Examples: https://github.com/steinbergmedia/vst3sdk

### Audio Units
- Documentation: https://developer.apple.com/documentation/audiotoolbox
- Core Audio Guide: https://developer.apple.com/library/archive/documentation/MusicAudio/Conceptual/CoreAudioOverview/
- Built-in plugins: /System/Library/Components/
- User plugins: ~/Library/Audio/Plug-Ins/Components/

### CLAP
- Repository: https://github.com/free-audio/clap
- Specification: https://github.com/free-audio/clap/wiki
- License: MIT (very permissive!)
- Example Host: https://github.com/free-audio/clap-host
- Rust bindings: https://github.com/glowcoil/clap-sys

### Node.js Native Addons
- Node-API: https://nodejs.org/api/n-api.html
- node-addon-api: https://github.com/nodejs/node-addon-api
- napi-rs (Rust): https://napi.rs/

### Tauri
- Website: https://tauri.app/
- Rust Commands: https://tauri.app/v1/guides/features/command
- Better performance than Electron
- Smaller bundle size

## Troubleshooting

### VST3 Errors
- **Module not found**: Check VST3 SDK path in binding.gyp
- **Symbol not found**: Ensure VST3 SDK is compiled
- **License error**: VST3 requires GPL or commercial license

### AU Errors
- **Framework not found**: macOS only, install Xcode
- **Component not found**: Plugin may not be installed
- **Sandbox errors**: Disable sandboxing for file access

### CLAP Errors
- **Library load failed**: Check .clap file path
- **Entry point not found**: Ensure plugin is valid CLAP
- **Segfault**: Check null pointer handling

## Performance Tips

1. **Use SharedArrayBuffer** for zero-copy audio transfer
2. **Process in AudioWorklet** for low latency
3. **Cache plugin instances** to avoid reloading
4. **Monitor CPU usage** and limit concurrent plugins
5. **Implement latency compensation** for aligned playback

## License

These examples are provided for reference only.

- Example code: Public domain / MIT
- VST3 SDK: GPL v3 or proprietary (separate license required)
- Audio Units: Apple developer license
- CLAP: MIT (free for all use)
