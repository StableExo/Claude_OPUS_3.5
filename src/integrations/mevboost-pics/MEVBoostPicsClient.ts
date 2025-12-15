/**
 * MEVBoost.pics API Client
 * 
 * Client for accessing mevboost.pics data
 * Source: https://github.com/Nerolation/mevboost.pics
 * API: https://mevboost.pics/data
 */

import {
  MEVBoostConfig,
  MEVBoostBuilder,
  MEVBoostRelay,
  MEVBoostBlock,
  MEVBoostLatestStats,
  MEVBoostHistoricData,
} from './types.js';

/**
 * Simple cache for API responses
 */
class MEVBoostCache<T> {
  private cache = new Map<string, { data: T; expires: number }>();

  set(key: string, data: T, ttl: number): void {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expires });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * MEVBoost.pics API Client
 */
export class MEVBoostPicsClient {
  private readonly config: Required<MEVBoostConfig>;
  private readonly cache: MEVBoostCache<any>;

  constructor(config?: MEVBoostConfig) {
    this.config = {
      baseUrl: config?.baseUrl || 'https://mevboost.pics',
      timeout: config?.timeout || 30000,
      cache: config?.cache || { enabled: true, ttl: 300 }, // 5 minutes default
    };

    this.cache = new MEVBoostCache();
  }

  /**
   * Make an API request
   */
  private async request<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;

    // Check cache
    if (this.config.cache.enabled) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'TheWarden-MEVBoost/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      if (this.config.cache.enabled) {
        this.cache.set(cacheKey, data, this.config.cache.ttl);
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);
      if ((error as any).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Get latest statistics
   * https://mevboost.pics/data/latest.json
   */
  async getLatestStats(): Promise<MEVBoostLatestStats> {
    return this.request<MEVBoostLatestStats>('/data/latest.json');
  }

  /**
   * Get builder statistics
   * https://mevboost.pics/data/builders.json
   */
  async getBuilders(): Promise<MEVBoostBuilder[]> {
    return this.request<MEVBoostBuilder[]>('/data/builders.json');
  }

  /**
   * Get relay statistics
   * https://mevboost.pics/data/relays.json
   */
  async getRelays(): Promise<MEVBoostRelay[]> {
    return this.request<MEVBoostRelay[]>('/data/relays.json');
  }

  /**
   * Get historic data
   * https://mevboost.pics/data/historic.json
   */
  async getHistoricData(): Promise<MEVBoostHistoricData> {
    return this.request<MEVBoostHistoricData>('/data/historic.json');
  }

  /**
   * Get builder by name or pubkey
   */
  async getBuilder(identifier: string): Promise<MEVBoostBuilder | null> {
    const builders = await this.getBuilders();
    return builders.find(
      b => b.name.toLowerCase() === identifier.toLowerCase() ||
           b.pubkey.toLowerCase() === identifier.toLowerCase()
    ) || null;
  }

  /**
   * Get relay by name or URL
   */
  async getRelay(identifier: string): Promise<MEVBoostRelay | null> {
    const relays = await this.getRelays();
    return relays.find(
      r => r.name.toLowerCase() === identifier.toLowerCase() ||
           r.url.toLowerCase().includes(identifier.toLowerCase())
    ) || null;
  }

  /**
   * Get top N builders by block count
   */
  async getTopBuilders(count: number = 10): Promise<MEVBoostBuilder[]> {
    const builders = await this.getBuilders();
    return builders
      .sort((a, b) => b.blocks - a.blocks)
      .slice(0, count);
  }

  /**
   * Get top N relays by block count
   */
  async getTopRelays(count: number = 10): Promise<MEVBoostRelay[]> {
    const relays = await this.getRelays();
    return relays
      .sort((a, b) => b.blocks - a.blocks)
      .slice(0, count);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a configured MEVBoost.pics client
 */
export function createMEVBoostPicsClient(config?: MEVBoostConfig): MEVBoostPicsClient {
  return new MEVBoostPicsClient(config);
}
