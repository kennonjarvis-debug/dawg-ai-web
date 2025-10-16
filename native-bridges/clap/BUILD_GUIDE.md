# CLAP Native Bridge - Build Guide

Complete guide to compiling and using the real CLAP plugin bridge.

## Prerequisites

### Install Rust (One-time setup)

```bash
# Install Rust toolchain (takes 2-3 minutes)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow on-screen instructions, then:
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### Install Node.js Dependencies

```bash
# In the project root
cd /Users/benkennon/dawg-ai-v0
npm install

# Install napi-rs CLI globally (optional, for easier builds)
npm install -g @napi-rs/cli
```

## Building the Bridge

### Quick Build (Recommended)

```bash
# Navigate to bridge directory
cd native-bridges/clap

# Install dependencies
npm install

# Build release version (optimized)
npm run build

# Output will be in: index.node or clap-bridge.node
```

### Manual Build Steps

```bash
cd native-bridges/clap

# Step 1: Build Rust library
cargo build --release

# Step 2: Build Node.js native module
npx napi build --platform --release

# Output: index.node
```

### Debug Build (For Development)

```bash
cd native-bridges/clap

# Build without optimizations (faster compile)
npm run build:debug

# Or manually:
cargo build
npx napi build --platform
```

## Verifying the Build

### Check if binary was created

```bash
cd native-bridges/clap

# Check for the compiled binary
ls -lh index.node  # or clap-bridge.node

# You should see a file ~1-2MB in size
```

### Test the native module

```bash
cd native-bridges/clap

# Create test script
node -e "
const bridge = require('./index.node');
console.log('Bridge loaded successfully!');
console.log('Available functions:', Object.keys(bridge));
"
```

Expected output:
```
Bridge loaded successfully!
Available functions: [
  'loadPlugin',
  'unloadPlugin',
  'getDescriptor',
  'initialize',
  'activate',
  'deactivate',
  'startProcessing',
  'stopProcessing',
  'getParameterCount',
  'getParameterInfo',
  'getParameterValue',
  'setParameterValue',
  'getLatency'
]
```

## Using the Real Bridge

### Automatic Detection (Recommended)

The system automatically uses the real bridge if compiled, otherwise falls back to mock:

```typescript
import { createAllBridges, getInstanceManager } from '@/lib/audio/plugins';

const audioContext = new AudioContext();

// Automatically uses real CLAP bridge if available
const bridges = createAllBridges();

const manager = getInstanceManager(audioContext, bridges);

// Load a real CLAP plugin!
const metadata = {
  id: 'surge-xt',
  name: 'Surge XT',
  vendor: 'Surge Synth Team',
  format: 'clap',
  path: '/Library/Audio/Plug-Ins/CLAP/Surge XT.clap',
  category: 'synth',
  // ... other metadata
};

const instanceId = await manager.loadPlugin(metadata);

// Use it exactly like mock plugins!
const instance = manager.getInstance(instanceId);
instance.wrapper.setParameter('param-0', 0.5);
```

### Manual Bridge Selection

```typescript
import {
  isRealCLAPBridgeAvailable,
  createRealCLAPBridge,
  createMockCLAPBridge
} from '@/lib/audio/plugins/bridges';

// Check if real bridge is available
if (isRealCLAPBridgeAvailable()) {
  console.log('Using real CLAP bridge');
  const clapBridge = createRealCLAPBridge();
} else {
  console.log('Using mock bridge (compile native bridge for real plugins)');
  const clapBridge = createMockCLAPBridge();
}
```

## Testing with Real Plugins

### Download Free CLAP Plugins

1. **Surge XT** (Synth)
   - https://surge-synthesizer.github.io/
   - Free, open-source, CLAP native
   - Excellent for testing

2. **Vital** (Wavetable Synth)
   - https://vital.audio/
   - Free version available
   - CLAP support

3. **TAL Plugins**
   - https://tal-software.com/
   - Several free plugins with CLAP

### Test Script

```typescript
// test-real-clap.ts
import { createAllBridges, getInstanceManager } from '@/lib/audio/plugins';

async function testRealCLAP() {
  console.log('Testing Real CLAP Bridge...\n');

  const audioContext = new AudioContext();
  const bridges = createAllBridges();
  const manager = getInstanceManager(audioContext, bridges);

  // Test with Surge XT
  const surgeMetadata = {
    id: 'surge-xt',
    name: 'Surge XT',
    vendor: 'Surge Synth Team',
    format: 'clap' as const,
    path: '/Library/Audio/Plug-Ins/CLAP/Surge XT.clap',
    category: 'synth' as const,
    processingType: 'synthesis' as const,
    useCase: ['production', 'composition'] as any[],
    cpuLoad: 'medium' as const,
    inputs: 0,
    outputs: 2,
    sidechain: false,
    midiInput: true,
    parameters: [],
    presets: [],
    version: '1.3.0',
    lastScanned: new Date(),
    isValid: true,
  };

  try {
    console.log('Loading Surge XT...');
    const id = await manager.loadPlugin(surgeMetadata);
    console.log('✅ Loaded successfully! Instance ID:', id);

    const instance = manager.getInstance(id);
    console.log('Plugin wrapper:', instance?.wrapper.getMetadata().name);

    // Get parameter count
    const paramCount = instance?.wrapper.getParameterCount?.();
    console.log('Parameter count:', paramCount);

    // Cleanup
    await manager.unloadPlugin(id);
    console.log('✅ Unloaded successfully');

    console.log('\n🎉 Real CLAP bridge is working!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealCLAP();
```

Run with:
```bash
npx tsx test-real-clap.ts
```

## Troubleshooting

### Error: "Native bridge not compiled"

**Solution**: Build the bridge
```bash
cd native-bridges/clap
npm run build
```

### Error: "Failed to load library"

**Cause**: Plugin file doesn't exist or wrong path

**Solution**: Check plugin path
```bash
# macOS
ls -l /Library/Audio/Plug-Ins/CLAP/*.clap
ls -l ~/Library/Audio/Plug-Ins/CLAP/*.clap

# Windows
dir "C:\Program Files\Common Files\CLAP\*.clap"

# Linux
ls -l ~/.clap/*.clap
```

### Error: "clap_entry not found"

**Cause**: File is not a valid CLAP plugin

**Solution**: Verify it's a .clap file:
```bash
file /path/to/plugin.clap
# Should show: Mach-O 64-bit dynamically linked shared library
```

### Build Errors

**Missing Rust**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Missing dependencies**:
```bash
cd native-bridges/clap
npm install
cargo update
```

**Platform-specific issues**:

**macOS**: Ensure Xcode Command Line Tools installed
```bash
xcode-select --install
```

**Windows**: Ensure Visual Studio Build Tools installed
- Download from: https://visualstudio.microsoft.com/downloads/

**Linux**: Ensure build essentials installed
```bash
sudo apt-get install build-essential
```

## Performance Tips

1. **Use Release Builds** for production (much faster)
2. **Test with Debug Builds** during development
3. **Monitor CPU usage** with real plugins
4. **Start with simple plugins** (single band EQ) before complex ones

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| macOS Intel (x86_64) | ✅ Supported | Native compilation |
| macOS Apple Silicon (ARM64) | ✅ Supported | Native compilation |
| Windows (x86_64) | ✅ Supported | Requires VS Build Tools |
| Linux (x86_64) | ✅ Supported | Requires build-essential |

## Next Steps

1. ✅ Build the bridge (`npm run build`)
2. ✅ Test with free plugins (Surge XT, Vital)
3. ✅ Integrate into your DAW UI
4. 🔨 Add VST3 bridge (future)
5. 🔨 Add AU bridge (future, macOS only)

## Need Help?

- Check the main README: `/Users/benkennon/dawg-ai-v0/README.md`
- Review test files: `/Users/benkennon/dawg-ai-v0/tests/`
- Open an issue: https://github.com/yourusername/dawg-ai/issues

## Build Time

- First build: ~2-3 minutes (downloads dependencies)
- Subsequent builds: ~30 seconds
- Debug builds: ~15 seconds

## Binary Size

- Release build: ~1-2 MB
- Debug build: ~5-10 MB

Your build is now complete! The real CLAP bridge is ready to load actual plugins. 🚀
