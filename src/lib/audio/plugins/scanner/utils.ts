/**
 * Plugin Scanner Utilities
 *
 * Utility functions for plugin scanning, metadata extraction,
 * and file system operations.
 */

import type {
  PluginMetadata,
  PluginCategory,
  ProcessingType,
  PluginParameter,
  PluginPreset,
  CPULoad,
  UseCase,
} from '../types';

/**
 * Platform detection
 */
export function getPlatform(): 'macos' | 'windows' | 'linux' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'macos';
  } else if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows';
  } else if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Get standard plugin paths for the current platform
 */
export function getPluginPaths(): {
  vst3: string[];
  au: string[];
  clap: string[];
} {
  const platform = getPlatform();

  switch (platform) {
    case 'macos':
      return {
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

    case 'windows':
      return {
        vst3: [
          'C:\\Program Files\\Common Files\\VST3',
          'C:\\Program Files\\Steinberg\\VstPlugins',
        ],
        au: [], // AU not available on Windows
        clap: ['C:\\Program Files\\Common Files\\CLAP'],
      };

    case 'linux':
      return {
        vst3: [
          '~/.vst3',
          '/usr/lib/vst3',
          '/usr/local/lib/vst3',
        ],
        au: [], // AU not available on Linux
        clap: [
          '~/.clap',
          '/usr/lib/clap',
        ],
      };

    default:
      return { vst3: [], au: [], clap: [] };
  }
}

/**
 * Expand home directory (~) in path
 */
export function expandHomePath(path: string): string {
  if (path.startsWith('~')) {
    // In browser environment, we can't easily get home directory
    // This would need to be handled by Electron/Tauri native layer
    return path;
  }
  return path;
}

/**
 * Extract filename from path
 */
export function getFilename(path: string): string {
  return path.split(/[/\\]/).pop() || path;
}

/**
 * Get file extension
 */
export function getExtension(path: string): string {
  const filename = getFilename(path);
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()! : '';
}

/**
 * Infer plugin category from name
 * Uses heuristics to guess the plugin type
 */
export function inferCategory(name: string): PluginCategory {
  const lower = name.toLowerCase();

  // EQ
  if (
    lower.includes('eq') ||
    lower.includes('equalizer') ||
    lower.includes('frequency')
  ) {
    return 'eq';
  }

  // Compressor
  if (
    lower.includes('comp') ||
    lower.includes('compress') ||
    lower.includes('dynamics') ||
    lower.includes('leveler')
  ) {
    return 'compressor';
  }

  // Limiter
  if (lower.includes('limit') || lower.includes('maximizer')) {
    return 'limiter';
  }

  // Reverb
  if (lower.includes('reverb') || lower.includes('verb')) {
    return 'reverb';
  }

  // Delay
  if (lower.includes('delay') || lower.includes('echo')) {
    return 'delay';
  }

  // Chorus
  if (lower.includes('chorus')) {
    return 'chorus';
  }

  // Flanger
  if (lower.includes('flange')) {
    return 'flanger';
  }

  // Phaser
  if (lower.includes('phaser') || lower.includes('phase')) {
    return 'phaser';
  }

  // Distortion
  if (
    lower.includes('distortion') ||
    lower.includes('overdrive') ||
    lower.includes('fuzz')
  ) {
    return 'distortion';
  }

  // Saturation
  if (
    lower.includes('saturation') ||
    lower.includes('saturator') ||
    lower.includes('tape') ||
    lower.includes('tube')
  ) {
    return 'saturation';
  }

  // Gate
  if (lower.includes('gate') || lower.includes('noise gate')) {
    return 'gate';
  }

  // Expander
  if (lower.includes('expander') || lower.includes('expand')) {
    return 'expander';
  }

  // Multiband
  if (lower.includes('multiband') || lower.includes('multi-band')) {
    return 'multiband';
  }

  // De-esser
  if (lower.includes('de-ess') || lower.includes('deess')) {
    return 'deesser';
  }

  // Stereo Imager
  if (
    lower.includes('stereo') ||
    lower.includes('width') ||
    lower.includes('imaging')
  ) {
    return 'stereo-imager';
  }

  // Harmonic Exciter
  if (lower.includes('exciter') || lower.includes('enhancer')) {
    return 'harmonic-exciter';
  }

  // Transient Shaper
  if (lower.includes('transient')) {
    return 'transient-shaper';
  }

  // Analyzer
  if (
    lower.includes('analyzer') ||
    lower.includes('meter') ||
    lower.includes('spectrum')
  ) {
    return 'analyzer';
  }

  // Default to utility
  return 'utility';
}

/**
 * Infer processing type from category
 */
export function inferProcessingType(category: PluginCategory): ProcessingType {
  switch (category) {
    case 'eq':
      return 'frequency';

    case 'compressor':
    case 'limiter':
    case 'gate':
    case 'expander':
    case 'multiband':
    case 'deesser':
    case 'transient-shaper':
      return 'dynamics';

    case 'reverb':
    case 'delay':
    case 'stereo-imager':
      return 'spatial';

    case 'distortion':
    case 'saturation':
    case 'harmonic-exciter':
      return 'harmonic';

    case 'chorus':
    case 'flanger':
    case 'phaser':
      return 'modulation';

    default:
      return 'utility';
  }
}

/**
 * Infer use cases from category and name
 */
export function inferUseCases(name: string, category: PluginCategory): UseCase[] {
  const lower = name.toLowerCase();
  const useCases: UseCase[] = [];

  // Check for specific mentions
  if (lower.includes('vocal')) useCases.push('vocal');
  if (lower.includes('drum')) useCases.push('drums');
  if (lower.includes('bass')) useCases.push('bass');
  if (lower.includes('guitar')) useCases.push('guitar');
  if (lower.includes('master')) useCases.push('mastering');

  // If no specific mentions, infer from category
  if (useCases.length === 0) {
    switch (category) {
      case 'deesser':
        useCases.push('vocal');
        break;

      case 'limiter':
      case 'multiband':
        useCases.push('mastering', 'mixing');
        break;

      case 'reverb':
      case 'delay':
        useCases.push('vocal', 'guitar', 'keys', 'drums');
        break;

      case 'compressor':
      case 'eq':
        useCases.push('mixing', 'mastering');
        break;

      case 'distortion':
      case 'saturation':
        useCases.push('creative', 'mixing');
        break;

      default:
        useCases.push('mixing');
    }
  }

  return useCases;
}

/**
 * Estimate CPU load based on plugin type and features
 * This is a rough heuristic - actual load varies by implementation
 */
export function estimateCPULoad(
  category: PluginCategory,
  hasGUI: boolean = true
): CPULoad {
  // High CPU plugins
  if (
    category === 'reverb' ||
    category === 'multiband' ||
    category === 'analyzer' ||
    category === 'harmonic-exciter'
  ) {
    return 'high';
  }

  // Medium CPU plugins
  if (
    category === 'compressor' ||
    category === 'eq' ||
    category === 'delay' ||
    category === 'chorus' ||
    category === 'flanger' ||
    category === 'phaser' ||
    category === 'transient-shaper'
  ) {
    return 'medium';
  }

  // Low CPU plugins
  if (
    category === 'gate' ||
    category === 'utility' ||
    category === 'limiter' ||
    category === 'deesser'
  ) {
    return 'low';
  }

  // Default
  return 'medium';
}

/**
 * Validate plugin metadata
 * Returns array of validation errors (empty if valid)
 */
export function validatePluginMetadata(plugin: Partial<PluginMetadata>): string[] {
  const errors: string[] = [];

  if (!plugin.id) errors.push('Missing plugin ID');
  if (!plugin.name) errors.push('Missing plugin name');
  if (!plugin.vendor) errors.push('Missing vendor name');
  if (!plugin.format) errors.push('Missing plugin format');
  if (!plugin.path) errors.push('Missing file path');
  if (!plugin.category) errors.push('Missing category');

  if (plugin.inputs !== undefined && plugin.inputs < 0) {
    errors.push('Invalid input count');
  }

  if (plugin.outputs !== undefined && plugin.outputs < 0) {
    errors.push('Invalid output count');
  }

  return errors;
}

/**
 * Generate unique plugin ID from metadata
 * Format: vendor-name-format-version
 */
export function generatePluginId(
  vendor: string,
  name: string,
  format: string,
  version: string
): string {
  const sanitize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  return `${sanitize(vendor)}-${sanitize(name)}-${format}-${sanitize(version)}`;
}

/**
 * Parse plugin version string
 * Handles various version formats: "1.0", "v1.0.0", "1.0.0-beta", etc.
 */
export function parseVersion(versionString: string): {
  major: number;
  minor: number;
  patch: number;
  label?: string;
} {
  // Remove 'v' prefix if present
  const cleaned = versionString.replace(/^v/i, '');

  // Split by dots and hyphens
  const parts = cleaned.split(/[.-]/);

  const major = parseInt(parts[0]) || 0;
  const minor = parseInt(parts[1]) || 0;
  const patch = parseInt(parts[2]) || 0;

  // Check for label (alpha, beta, rc, etc.)
  const labelMatch = cleaned.match(/-(alpha|beta|rc|dev)/i);
  const label = labelMatch ? labelMatch[1].toLowerCase() : undefined;

  return { major, minor, patch, label };
}

/**
 * Compare two version strings
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const version1 = parseVersion(v1);
  const version2 = parseVersion(v2);

  if (version1.major !== version2.major) {
    return version1.major > version2.major ? 1 : -1;
  }

  if (version1.minor !== version2.minor) {
    return version1.minor > version2.minor ? 1 : -1;
  }

  if (version1.patch !== version2.patch) {
    return version1.patch > version2.patch ? 1 : -1;
  }

  return 0;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Check if a file path is valid
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.trim().length === 0) return false;

  // Check for invalid characters (varies by platform)
  const invalidChars = getPlatform() === 'windows' ? /[<>"|?*]/ : /\0/;
  if (invalidChars.test(path)) return false;

  return true;
}

/**
 * Sanitize plugin name for display
 * Removes version numbers, vendor names in parentheses, etc.
 */
export function sanitizePluginName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // Remove parentheses
    .replace(/\[.*?\]/g, '') // Remove brackets
    .replace(/v?\d+\.\d+(\.\d+)?/g, '') // Remove version numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Create default parameter object
 */
export function createDefaultParameter(
  id: string,
  name: string,
  min: number = 0,
  max: number = 1,
  defaultValue: number = 0.5
): PluginParameter {
  return {
    id,
    name,
    label: name.substring(0, 8),
    min,
    max,
    default: defaultValue,
    type: 'continuous',
    automatable: true,
    curve: 'linear',
    precision: 2,
  };
}

/**
 * Create default preset object
 */
export function createDefaultPreset(
  name: string,
  parameters: Record<string, number>
): PluginPreset {
  return {
    id: `preset-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    isFactory: false,
    parameters,
  };
}
