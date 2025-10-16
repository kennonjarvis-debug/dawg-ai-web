/**
 * Plugin Wrappers Module
 * Exports all plugin wrapper implementations
 */

// Base wrapper
export { BasePluginWrapper } from './BasePluginWrapper';
export type { PluginState, AudioBufferInfo } from './BasePluginWrapper';

// Web Audio wrapper (Production ready)
export {
  WebAudioPluginWrapper,
  createWebAudioPlugin,
  SimpleGainPlugin,
  SimpleEQPlugin,
  SimpleCompressorPlugin,
  SimpleDelayPlugin,
} from './WebAudioPluginWrapper';

// Professional Web Audio plugins (studio-quality)
export { ProReverbPlugin } from './ProReverbPlugin';
export { ProCompressorPlugin } from './ProCompressorPlugin';
export { ProEQPlugin } from './ProEQPlugin';
export { SaturationPlugin } from './SaturationPlugin';
export { LimiterPlugin } from './LimiterPlugin';
export { StereoWidenerPlugin } from './StereoWidenerPlugin';
export type { WebAudioPluginConfig } from './WebAudioPluginWrapper';

// VST3 wrapper (Stub - requires native bridge)
export {
  VST3PluginWrapper,
  createVST3Plugin,
} from './VST3PluginWrapper';
export type {
  VST3NativeBridge,
  VST3PluginHandle,
  VST3PluginInfo,
  VST3ParameterInfo,
  VST3ProgramInfo,
} from './VST3PluginWrapper';

// Audio Units wrapper (Stub - requires native bridge, macOS only)
export {
  AUPluginWrapper,
  createAUPlugin,
} from './AUPluginWrapper';
export type {
  AUNativeBridge,
  AUPluginHandle,
  AUPluginInfo,
  AUParameterInfo,
  AUPresetInfo,
  AudioTimeStamp,
} from './AUPluginWrapper';

// CLAP wrapper (Stub - requires native bridge)
export {
  CLAPPluginWrapper,
  createCLAPPlugin,
  CLAPProcessStatus,
} from './CLAPPluginWrapper';
export type {
  CLAPNativeBridge,
  CLAPPluginHandle,
  CLAPDescriptor,
  CLAPParameterInfo,
  CLAPAudioBuffer,
  CLAPEvent,
  CLAPProcessData,
} from './CLAPPluginWrapper';

/**
 * Factory function to create appropriate wrapper based on format
 */
export function createPluginWrapper(
  metadata: import('../types').PluginMetadata,
  audioContext: AudioContext,
  nativeBridges?: {
    vst3?: VST3NativeBridge;
    au?: AUNativeBridge;
    clap?: CLAPNativeBridge;
  }
): BasePluginWrapper {
  switch (metadata.format) {
    case 'web':
      // For Web Audio plugins, you need to provide a WebAudioPluginConfig
      // This is just a placeholder - real implementation should pass config
      throw new Error(
        'Web Audio plugins require WebAudioPluginConfig. Use createWebAudioPlugin() instead.'
      );

    case 'vst3':
      return createVST3Plugin(
        metadata,
        audioContext,
        nativeBridges?.vst3
      );

    case 'au':
      return createAUPlugin(
        metadata,
        audioContext,
        nativeBridges?.au
      );

    case 'clap':
      return createCLAPPlugin(
        metadata,
        audioContext,
        nativeBridges?.clap
      );

    default:
      throw new Error(`Unsupported plugin format: ${metadata.format}`);
  }
}
