/**
 * DAWG AI Plugin System
 * Main entry point for plugin architecture
 */

// Types
export type * from './types';

// Database
export { PluginDatabase, getPluginDatabase } from './database/PluginDatabase';

// Scanner
export {
  PluginScanner,
  getPluginScanner,
  VST3Scanner,
  AUScanner,
  CLAPScanner,
} from './scanner';

export type {
  ScanOptions,
  VST3ScanOptions,
  AUScanOptions,
  CLAPScanOptions,
} from './scanner';

// Utilities
export * from './scanner/utils';

// Wrappers (Phase 2)
export {
  BasePluginWrapper,
  WebAudioPluginWrapper,
  VST3PluginWrapper,
  AUPluginWrapper,
  CLAPPluginWrapper,
  createPluginWrapper,
  createWebAudioPlugin,
  createVST3Plugin,
  createAUPlugin,
  createCLAPPlugin,
  SimpleGainPlugin,
  SimpleEQPlugin,
  SimpleCompressorPlugin,
  SimpleDelayPlugin,
  ProReverbPlugin,
  ProCompressorPlugin,
  ProEQPlugin,
  SaturationPlugin,
  LimiterPlugin,
  StereoWidenerPlugin,
} from './wrappers';

export type {
  PluginState,
  AudioBufferInfo,
  WebAudioPluginConfig,
  VST3NativeBridge,
  VST3PluginHandle,
  VST3PluginInfo,
  AUNativeBridge,
  AUPluginHandle,
  AUPluginInfo,
  CLAPNativeBridge,
  CLAPPluginHandle,
  CLAPDescriptor,
  CLAPProcessStatus,
} from './wrappers';

// Instance Manager (Phase 2.5)
export {
  PluginInstanceManager,
  getInstanceManager,
  resetInstanceManager,
} from './PluginInstanceManager';

export type {
  PluginInstance,
  PluginChain,
  NativeBridgesConfig,
  InstanceStats,
} from './PluginInstanceManager';

// Mock Native Bridges (Phase 3 - for testing)
export {
  MockVST3Bridge,
  MockAUBridge,
  MockCLAPBridge,
  createMockVST3Bridge,
  createMockAUBridge,
  createMockCLAPBridge,
  createAllMockBridges,
  getAllMockPlugins,
} from './bridges';

// Real Native Bridges (Phase 3 - production)
export {
  RealCLAPBridge,
  createRealCLAPBridge,
  isRealCLAPBridgeAvailable,
  getCLAPBridge,
  createAllBridges,
} from './bridges';
