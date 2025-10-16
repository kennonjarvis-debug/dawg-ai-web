/**
 * DAWG AI Plugin Database
 *
 * IndexedDB-based storage for plugin metadata with fast lookups
 * and efficient caching.
 */

import type {
  PluginMetadata,
  PluginCategory,
  PluginFormat,
  PluginDatabase as IPluginDatabase,
} from '../types';

const DB_NAME = 'dawg-plugin-db';
const DB_VERSION = 1;
const STORE_NAME = 'plugins';

/**
 * Plugin Database Implementation
 * Manages plugin metadata storage and retrieval using IndexedDB
 */
export class PluginDatabase implements IPluginDatabase {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  // In-memory indexes for fast lookups
  public plugins: PluginMetadata[] = [];
  public byId: Map<string, PluginMetadata> = new Map();
  public byCategory: Map<PluginCategory, PluginMetadata[]> = new Map();
  public byVendor: Map<string, PluginMetadata[]> = new Map();
  public byFormat: Map<PluginFormat, PluginMetadata[]> = new Map();

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open plugin database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.loadAll().then(resolve).catch(reject);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

          // Create indexes for fast lookups
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('vendor', 'vendor', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('format', 'format', { unique: false });
          store.createIndex('path', 'path', { unique: true });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get plugin by ID
   */
  async getPlugin(id: string): Promise<PluginMetadata> {
    // Try memory cache first
    const cached = this.byId.get(id);
    if (cached) {
      return cached;
    }

    // Fallback to IndexedDB
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as PluginMetadata);
        } else {
          reject(new Error(`Plugin not found: ${id}`));
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get plugin: ${id}`));
      };
    });
  }

  /**
   * Search plugins by name
   */
  async searchPlugins(query: string): Promise<PluginMetadata[]> {
    await this.ensureInitialized();

    const lowerQuery = query.toLowerCase();

    return this.plugins.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(lowerQuery) ||
        plugin.vendor.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get plugins by category
   */
  async getPluginsByCategory(category: PluginCategory): Promise<PluginMetadata[]> {
    await this.ensureInitialized();
    return this.byCategory.get(category) || [];
  }

  /**
   * Get plugins by vendor
   */
  async getPluginsByVendor(vendor: string): Promise<PluginMetadata[]> {
    await this.ensureInitialized();
    return this.byVendor.get(vendor) || [];
  }

  /**
   * Get plugins by format
   */
  async getPluginsByFormat(format: PluginFormat): Promise<PluginMetadata[]> {
    await this.ensureInitialized();
    return this.byFormat.get(format) || [];
  }

  /**
   * Add a plugin to the database
   */
  async addPlugin(plugin: PluginMetadata): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(plugin);

      request.onsuccess = () => {
        // Update in-memory indexes
        this.addToIndexes(plugin);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to add plugin: ${plugin.name}`));
      };
    });
  }

  /**
   * Update a plugin in the database
   */
  async updatePlugin(id: string, updates: Partial<PluginMetadata>): Promise<void> {
    await this.ensureInitialized();

    const existing = await this.getPlugin(id);
    const updated = { ...existing, ...updates };

    return this.addPlugin(updated);
  }

  /**
   * Remove a plugin from the database
   */
  async removePlugin(id: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        // Update in-memory indexes
        this.removeFromIndexes(id);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to remove plugin: ${id}`));
      };
    });
  }

  /**
   * Save all plugins (bulk operation)
   */
  async saveAll(plugins: PluginMetadata[]): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      let completed = 0;
      let hasError = false;

      for (const plugin of plugins) {
        const request = store.put(plugin);

        request.onsuccess = () => {
          completed++;
          if (completed === plugins.length && !hasError) {
            // Rebuild all indexes
            this.rebuildIndexes();
            resolve();
          }
        };

        request.onerror = () => {
          hasError = true;
          reject(new Error(`Failed to save plugin: ${plugin.name}`));
        };
      }

      if (plugins.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Load all plugins from database
   */
  async loadAll(): Promise<PluginMetadata[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        this.plugins = request.result as PluginMetadata[];
        this.rebuildIndexes();
        resolve(this.plugins);
      };

      request.onerror = () => {
        reject(new Error('Failed to load plugins'));
      };
    });
  }

  /**
   * Clear all plugins from database
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        this.plugins = [];
        this.byId.clear();
        this.byCategory.clear();
        this.byVendor.clear();
        this.byFormat.clear();
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear database'));
      };
    });
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    total: number;
    byFormat: Record<PluginFormat, number>;
    byCategory: Record<PluginCategory, number>;
    byVendor: Record<string, number>;
  }> {
    await this.ensureInitialized();

    const byFormat: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byVendor: Record<string, number> = {};

    for (const plugin of this.plugins) {
      byFormat[plugin.format] = (byFormat[plugin.format] || 0) + 1;
      byCategory[plugin.category] = (byCategory[plugin.category] || 0) + 1;
      byVendor[plugin.vendor] = (byVendor[plugin.vendor] || 0) + 1;
    }

    return {
      total: this.plugins.length,
      byFormat: byFormat as Record<PluginFormat, number>,
      byCategory: byCategory as Record<PluginCategory, number>,
      byVendor,
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Private: Ensure database is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Private: Add plugin to in-memory indexes
   */
  private addToIndexes(plugin: PluginMetadata): void {
    // Add to main list if not already there
    if (!this.byId.has(plugin.id)) {
      this.plugins.push(plugin);
    } else {
      // Update existing entry
      const index = this.plugins.findIndex((p) => p.id === plugin.id);
      if (index !== -1) {
        this.plugins[index] = plugin;
      }
    }

    // Update byId
    this.byId.set(plugin.id, plugin);

    // Update byCategory
    if (!this.byCategory.has(plugin.category)) {
      this.byCategory.set(plugin.category, []);
    }
    const categoryPlugins = this.byCategory.get(plugin.category)!;
    const catIndex = categoryPlugins.findIndex((p) => p.id === plugin.id);
    if (catIndex === -1) {
      categoryPlugins.push(plugin);
    } else {
      categoryPlugins[catIndex] = plugin;
    }

    // Update byVendor
    if (!this.byVendor.has(plugin.vendor)) {
      this.byVendor.set(plugin.vendor, []);
    }
    const vendorPlugins = this.byVendor.get(plugin.vendor)!;
    const vendorIndex = vendorPlugins.findIndex((p) => p.id === plugin.id);
    if (vendorIndex === -1) {
      vendorPlugins.push(plugin);
    } else {
      vendorPlugins[vendorIndex] = plugin;
    }

    // Update byFormat
    if (!this.byFormat.has(plugin.format)) {
      this.byFormat.set(plugin.format, []);
    }
    const formatPlugins = this.byFormat.get(plugin.format)!;
    const formatIndex = formatPlugins.findIndex((p) => p.id === plugin.id);
    if (formatIndex === -1) {
      formatPlugins.push(plugin);
    } else {
      formatPlugins[formatIndex] = plugin;
    }
  }

  /**
   * Private: Remove plugin from in-memory indexes
   */
  private removeFromIndexes(id: string): void {
    const plugin = this.byId.get(id);
    if (!plugin) return;

    // Remove from main list
    this.plugins = this.plugins.filter((p) => p.id !== id);

    // Remove from byId
    this.byId.delete(id);

    // Remove from byCategory
    const categoryPlugins = this.byCategory.get(plugin.category);
    if (categoryPlugins) {
      this.byCategory.set(
        plugin.category,
        categoryPlugins.filter((p) => p.id !== id)
      );
    }

    // Remove from byVendor
    const vendorPlugins = this.byVendor.get(plugin.vendor);
    if (vendorPlugins) {
      this.byVendor.set(
        plugin.vendor,
        vendorPlugins.filter((p) => p.id !== id)
      );
    }

    // Remove from byFormat
    const formatPlugins = this.byFormat.get(plugin.format);
    if (formatPlugins) {
      this.byFormat.set(
        plugin.format,
        formatPlugins.filter((p) => p.id !== id)
      );
    }
  }

  /**
   * Private: Rebuild all in-memory indexes
   */
  private rebuildIndexes(): void {
    this.byId.clear();
    this.byCategory.clear();
    this.byVendor.clear();
    this.byFormat.clear();

    for (const plugin of this.plugins) {
      // byId
      this.byId.set(plugin.id, plugin);

      // byCategory
      if (!this.byCategory.has(plugin.category)) {
        this.byCategory.set(plugin.category, []);
      }
      this.byCategory.get(plugin.category)!.push(plugin);

      // byVendor
      if (!this.byVendor.has(plugin.vendor)) {
        this.byVendor.set(plugin.vendor, []);
      }
      this.byVendor.get(plugin.vendor)!.push(plugin);

      // byFormat
      if (!this.byFormat.has(plugin.format)) {
        this.byFormat.set(plugin.format, []);
      }
      this.byFormat.get(plugin.format)!.push(plugin);
    }
  }
}

/**
 * Singleton instance
 */
let instance: PluginDatabase | null = null;

/**
 * Get the plugin database instance
 */
export function getPluginDatabase(): PluginDatabase {
  if (!instance) {
    instance = new PluginDatabase();
  }
  return instance;
}
