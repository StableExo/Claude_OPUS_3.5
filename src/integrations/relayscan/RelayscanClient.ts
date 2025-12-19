/**
 * Relayscan API Client
 * 
 * Client for accessing Flashbots Relayscan data
 * Source: https://github.com/flashbots/relayscan
 * API: https://relayscan.io
 */

import {
  RelayscanConfig,
  BuilderProfit,
  RelayStats,
  OverviewStats,
  TimeWindow,
  BuilderSummary,
  RelayPerformance,
} from './types.js';

/**
 * Simple cache for API responses
 */
class RelayscanCache<T> {
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
 * Relayscan API Client
 */
export class RelayscanClient {
  private readonly config: Required<RelayscanConfig>;
  private readonly cache: RelayscanCache<any>;

  constructor(config?: RelayscanConfig) {
    this.config = {
      baseUrl: config?.baseUrl || 'https://www.relayscan.io',
      timeout: config?.timeout || 30000,
      cache: config?.cache || { enabled: true, ttl: 300 }, // 5 minutes default
    };

    this.cache = new RelayscanCache();
  }

  /**
   * Make an API request
   */
  private async request<T>(endpoint: string): Promise<T> {
    const cacheKey = endpoint;

    // Check cache
    if (this.config.cache.enabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as T;
      }
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'TheWarden-Relayscan/1.0',
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

      return data as T;
    } catch (error) {
      clearTimeout(timeout);
      if ((error as any).name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * Get builder profit data
   * https://www.relayscan.io/builder-profit/json?t={timeWindow}
   */
  async getBuilderProfit(timeWindow: TimeWindow = '24h'): Promise<BuilderProfit[]> {
    return this.request<BuilderProfit[]>(`/builder-profit/json?t=${timeWindow}`);
  }

  /**
   * Get overview statistics
   * https://www.relayscan.io/overview/json
   */
  async getOverview(): Promise<OverviewStats> {
    return this.request<OverviewStats>('/overview/json');
  }

  /**
   * Get builder summaries with rankings
   */
  async getBuilderSummaries(timeWindow: TimeWindow = '24h'): Promise<BuilderSummary[]> {
    const profits = await this.getBuilderProfit(timeWindow);
    const overview = await this.getOverview();

    // Calculate total blocks for market share
    const totalBlocks = profits.reduce((sum, p) => sum + p.blocks, 0);

    // Transform to BuilderSummary format with rankings
    const summaries: BuilderSummary[] = profits.map((profit, index) => ({
      name: profit.builder,
      pubkey: profit.builderPubkey,
      blocks24h: timeWindow === '24h' ? profit.blocks : 0,
      blocks7d: timeWindow === '7d' ? profit.blocks : 0,
      profit24h: timeWindow === '24h' ? profit.profit : '0',
      profit7d: timeWindow === '7d' ? profit.profit : '0',
      avgBlockValue: profit.avgProfit,
      marketShare: totalBlocks > 0 ? profit.blocks / totalBlocks : 0,
      relays: profit.relays || [],
      rank: index + 1,
    }));

    // Sort by blocks (descending)
    return summaries.sort((a, b) => {
      const blocksA = timeWindow === '24h' ? a.blocks24h : a.blocks7d;
      const blocksB = timeWindow === '24h' ? b.blocks24h : b.blocks7d;
      return blocksB - blocksA;
    });
  }

  /**
   * Get builder by name or pubkey
   */
  async getBuilder(identifier: string, timeWindow: TimeWindow = '24h'): Promise<BuilderSummary | null> {
    const summaries = await this.getBuilderSummaries(timeWindow);
    return summaries.find(
      s => s.name.toLowerCase() === identifier.toLowerCase() ||
           s.pubkey.toLowerCase() === identifier.toLowerCase()
    ) || null;
  }

  /**
   * Get top N builders by block count
   */
  async getTopBuilders(count: number = 10, timeWindow: TimeWindow = '24h'): Promise<BuilderSummary[]> {
    const summaries = await this.getBuilderSummaries(timeWindow);
    return summaries.slice(0, count);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a configured Relayscan client
 */
export function createRelayscanClient(config?: RelayscanConfig): RelayscanClient {
  return new RelayscanClient(config);
}
