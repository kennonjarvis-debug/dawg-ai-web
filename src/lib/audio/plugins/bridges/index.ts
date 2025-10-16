/**
 * Native Bridges Module
 *
 * Exports both mock and real native bridge implementations.
 * Mock bridges are fully functional for testing and development.
 * Real bridges load actual native plugins (requires compilation).
 */

// Import for internal use
import { createMockVST3Bridge, getMockVST3Plugins } from './MockVST3Bridge';
import { createMockAUBridge, getMockAUPlugins } from './MockAUBridge';
import { createMockCLAPBridge, getMockCLAPPlugins } from './MockCLAPBridge';
import { getCLAPBridge } from './RealCLAPBridge';

// Mock VST3 Bridge
export {
  MockVST3Bridge,
  createMockVST3Bridge,
  getMockVST3Plugins,
} from './MockVST3Bridge';

// Mock Audio Units Bridge
export {
  MockAUBridge,
  createMockAUBridge,
  getMockAUPlugins,
} from './MockAUBridge';

// Mock CLAP Bridge
export {
  MockCLAPBridge,
  createMockCLAPBridge,
  getMockCLAPPlugins,
} from './MockCLAPBridge';

// Real CLAP Bridge (requires compilation)
export {
  RealCLAPBridge,
  createRealCLAPBridge,
  isRealCLAPBridgeAvailable,
  getCLAPBridge,
} from './RealCLAPBridge';

/**
 * Create all mock bridges for testing
 */
export function createAllMockBridges() {
  return {
    vst3: createMockVST3Bridge(),
    au: createMockAUBridge(),
    clap: createMockCLAPBridge(),
  };
}

/**
 * Create all bridges (uses real CLAP if available, mock otherwise)
 */
export function createAllBridges() {
  return {
    vst3: createMockVST3Bridge(), // Mock VST3 (no real implementation yet)
    au: createMockAUBridge(),     // Mock AU (no real implementation yet)
    clap: getCLAPBridge(),         // Real CLAP if compiled, mock otherwise
  };
}

/**
 * Get all available mock plugins across all formats
 */
export function getAllMockPlugins() {
  return {
    vst3: getMockVST3Plugins(),
    au: getMockAUPlugins(),
    clap: getMockCLAPPlugins(),
  };
}
