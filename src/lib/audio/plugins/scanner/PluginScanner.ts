/**
 * DAWG AI Plugin Scanner
 *
 * Main scanner class that coordinates scanning of all plugin formats
 * and manages the plugin database.
 */

import type {
  PluginMetadata,
  PluginScanResult,
  PluginScanError,
} from '../types';
import { PluginDatabase } from '../database/PluginDatabase';
import { VST3Scanner } from './VST3Scanner';
import { AUScanner } from './AUScanner';
import { CLAPScanner } from './CLAPScanner';
import { getPluginPaths, getPlatform } from './utils';

export interface ScanOptions {
  /** Directories to scan (overrides defaults) */
  paths?: {
    vst3?: string[];
    au?: string[];
    clap?: string[];
  };

  /** Plugin formats to scan */
  formats?: ('vst3' | 'au' | 'clap')[];

  /** Force rescan even if plugin is already in database */
  forceRescan?: boolean;

  /** Progress callback */
  onProgress?: (current: number, total: number, plugin: string) => void;

  /** Error callback */
  onError?: (error: PluginScanError) => void;
}

/**
 * Main Plugin Scanner
 * Coordinates scanning across all plugin formats
 */
export class PluginScanner {
  private db: PluginDatabase;
  private vst3Scanner: VST3Scanner;
  private auScanner: AUScanner;
  private clapScanner: CLAPScanner;
  private isScanning: boolean = false;
  private abortController: AbortController | null = null;

  constructor(db?: PluginDatabase) {
    this.db = db || new PluginDatabase();
    this.vst3Scanner = new VST3Scanner();
    this.auScanner = new AUScanner();
    this.clapScanner = new CLAPScanner();
  }

  /**
   * Scan for all plugins
   */
  async scanAll(options: ScanOptions = {}): Promise<PluginScanResult> {
    if (this.isScanning) {
      throw new Error('Scan already in progress');
    }

    this.isScanning = true;
    this.abortController = new AbortController();

    const startTime = Date.now();
    const errors: PluginScanError[] = [];
    let pluginsFound = 0;
    let pluginsLoaded = 0;

    try {
      // Initialize database
      await this.db.init();

      // Determine which formats to scan
      const formats = options.formats || ['vst3', 'au', 'clap'];
      const platform = getPlatform();

      // Skip AU on non-macOS platforms
      const formatsToScan = formats.filter((format) => {
        if (format === 'au' && platform !== 'macos') {
          return false;
        }
        return true;
      });

      // Get paths to scan
      const paths = options.paths || getPluginPaths();

      // Scan each format
      const allPlugins: PluginMetadata[] = [];

      for (const format of formatsToScan) {
        if (this.abortController.signal.aborted) {
          break;
        }

        try {
          const formatPaths = paths[format] || [];
          let formatPlugins: PluginMetadata[] = [];

          switch (format) {
            case 'vst3':
              formatPlugins = await this.vst3Scanner.scan(formatPaths, {
                onProgress: options.onProgress,
                onError: options.onError,
                signal: this.abortController.signal,
              });
              break;

            case 'au':
              formatPlugins = await this.auScanner.scan(formatPaths, {
                onProgress: options.onProgress,
                onError: options.onError,
                signal: this.abortController.signal,
              });
              break;

            case 'clap':
              formatPlugins = await this.clapScanner.scan(formatPaths, {
                onProgress: options.onProgress,
                onError: options.onError,
                signal: this.abortController.signal,
              });
              break;
          }

          pluginsFound += formatPlugins.length;
          allPlugins.push(...formatPlugins);
        } catch (error) {
          const scanError: PluginScanError = {
            path: format,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date(),
          };
          errors.push(scanError);
          if (options.onError) {
            options.onError(scanError);
          }
        }
      }

      // Save plugins to database
      if (allPlugins.length > 0) {
        if (options.forceRescan) {
          // Clear existing database and save new plugins
          await this.db.clear();
          await this.db.saveAll(allPlugins);
          pluginsLoaded = allPlugins.length;
        } else {
          // Merge with existing plugins
          for (const plugin of allPlugins) {
            try {
              const existing = await this.db.getPlugin(plugin.id).catch(() => null);

              if (existing) {
                // Update if newer version
                if (plugin.version > existing.version) {
                  await this.db.updatePlugin(plugin.id, plugin);
                  pluginsLoaded++;
                }
              } else {
                // Add new plugin
                await this.db.addPlugin(plugin);
                pluginsLoaded++;
              }
            } catch (error) {
              const scanError: PluginScanError = {
                path: plugin.path,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date(),
              };
              errors.push(scanError);
            }
          }
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: errors.length === 0,
        pluginsFound,
        pluginsLoaded,
        errors,
        duration,
        timestamp: new Date(),
      };
    } finally {
      this.isScanning = false;
      this.abortController = null;
    }
  }

  /**
   * Scan specific format
   */
  async scanFormat(
    format: 'vst3' | 'au' | 'clap',
    paths?: string[],
    options: ScanOptions = {}
  ): Promise<PluginScanResult> {
    return this.scanAll({
      ...options,
      formats: [format],
      paths: paths ? { [format]: paths } : undefined,
    });
  }

  /**
   * Scan specific directory
   */
  async scanDirectory(
    path: string,
    format: 'vst3' | 'au' | 'clap'
  ): Promise<PluginMetadata[]> {
    await this.db.init();

    switch (format) {
      case 'vst3':
        return this.vst3Scanner.scan([path]);
      case 'au':
        return this.auScanner.scan([path]);
      case 'clap':
        return this.clapScanner.scan([path]);
    }
  }

  /**
   * Rescan a specific plugin
   */
  async rescanPlugin(path: string): Promise<PluginMetadata | null> {
    await this.db.init();

    // Determine format from extension
    const extension = path.split('.').pop()?.toLowerCase();

    let plugin: PluginMetadata | null = null;

    if (extension === 'vst3') {
      const plugins = await this.vst3Scanner.scan([path]);
      plugin = plugins[0] || null;
    } else if (extension === 'component') {
      const plugins = await this.auScanner.scan([path]);
      plugin = plugins[0] || null;
    } else if (extension === 'clap') {
      const plugins = await this.clapScanner.scan([path]);
      plugin = plugins[0] || null;
    }

    if (plugin) {
      await this.db.addPlugin(plugin);
    }

    return plugin;
  }

  /**
   * Verify a plugin still exists and is valid
   */
  async verifyPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = await this.db.getPlugin(pluginId);

      // In a real implementation, we would check if the file exists
      // and try to load it to verify it's still valid
      // For now, we just check if it's in the database
      return plugin.isValid;
    } catch {
      return false;
    }
  }

  /**
   * Remove invalid or missing plugins from database
   */
  async cleanupDatabase(): Promise<number> {
    await this.db.init();

    const plugins = await this.db.loadAll();
    let removed = 0;

    for (const plugin of plugins) {
      // In a real implementation, we would check if the file exists
      // For now, we just remove plugins marked as invalid
      if (!plugin.isValid) {
        await this.db.removePlugin(plugin.id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get scan statistics
   */
  async getStats() {
    await this.db.init();
    return this.db.getStats();
  }

  /**
   * Check if a scan is currently in progress
   */
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Abort the current scan
   */
  abortScan(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Get the plugin database
   */
  getDatabase(): PluginDatabase {
    return this.db;
  }
}

/**
 * Singleton instance
 */
let instance: PluginScanner | null = null;

/**
 * Get the plugin scanner instance
 */
export function getPluginScanner(): PluginScanner {
  if (!instance) {
    instance = new PluginScanner();
  }
  return instance;
}
