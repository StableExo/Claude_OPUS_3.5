/**
 * Rated Network API Client
 * 
 * TypeScript client for the Rated Network API v0
 * Documentation: https://docs.rated.network/rated-api
 * 
 * Features:
 * - Bearer token authentication
 * - Automatic retry with exponential backoff
 * - Response caching
 * - Rate limiting
 * - Type-safe interfaces
 */

import {
  RatedNetworkConfig,
  RatedAPIOptions,
  RatedAPIResponse,
  RatedAPIError,
  OperatorEffectiveness,
  ValidatorEffectiveness,
  NetworkStatistics,
  MEVRelayData,
  BuilderPerformance,
  StakingPoolData,
  SlashingEvent,
  ValidatorSummary,
  OperatorSummary,
  EffectivenessPercentiles,
  HealthCheckResponse,
} from './types.js';

/**
 * Simple in-memory cache
 */
class SimpleCache<T> {
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
 * Rate limiter using token bucket algorithm
 */
class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.lastRefill = Date.now();
    this.refillRate = requestsPerSecond;
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = (1 - this.tokens) / this.refillRate * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this.tokens = 0;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + timePassed * this.refillRate
    );
    this.lastRefill = now;
  }
}

/**
 * Rated Network API Client
 */
export class RatedNetworkClient {
  private readonly config: Required<RatedNetworkConfig>;
  private readonly cache: SimpleCache<any>;
  private readonly rateLimiter: RateLimiter;

  constructor(config: RatedNetworkConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.rated.network',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      cache: config.cache || { enabled: true, ttl: 300 },
      rateLimit: config.rateLimit || { requestsPerSecond: 10, requestsPerMinute: 600 },
      apiKey: config.apiKey,
    };

    this.cache = new SimpleCache();
    this.rateLimiter = new RateLimiter(this.config.rateLimit.requestsPerSecond);
  }

  /**
   * Make an authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RatedAPIOptions = {}
  ): Promise<RatedAPIResponse<T>> {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Check cache
    if (this.config.cache.enabled) {
      const cached = this.cache.get<RatedAPIResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Rate limiting
    await this.rateLimiter.acquire();

    // Build URL with query parameters
    const url = this.buildUrl(endpoint, options);

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await this.makeRequest<T>(url);
        
        // Cache successful response
        if (this.config.cache.enabled) {
          this.cache.set(cacheKey, response, this.config.cache.ttl);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          if (statusCode >= 400 && statusCode < 500) {
            throw error;
          }
        }

        // Exponential backoff
        if (attempt < this.config.retryAttempts - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(url: string): Promise<RatedAPIResponse<T>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TheWarden-RatedClient/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error: RatedAPIError = await response.json().catch(() => ({
          error: 'HTTP Error',
          message: response.statusText,
          statusCode: response.status,
        }));
        
        const apiError = new Error(error.message) as any;
        apiError.statusCode = error.statusCode;
        apiError.details = error.details;
        throw apiError;
      }

      const data = await response.json();
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
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, options: RatedAPIOptions): string {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    if (options.network) url.searchParams.set('network', options.network);
    if (options.from) url.searchParams.set('from', options.from);
    if (options.to) url.searchParams.set('to', options.to);
    if (options.size) url.searchParams.set('size', options.size.toString());
    if (options.granularity) url.searchParams.set('granularity', options.granularity);
    if (options.filterBy) url.searchParams.set('filterBy', options.filterBy);
    if (options.idType) url.searchParams.set('idType', options.idType);

    return url.toString();
  }

  // ===================================================================
  // PUBLIC API METHODS
  // ===================================================================

  /**
   * Get operator effectiveness data
   * GET /v0/eth/operators/{operator}/effectiveness
   */
  async getOperatorEffectiveness(
    operatorId: string,
    options?: RatedAPIOptions
  ): Promise<OperatorEffectiveness[]> {
    const response = await this.request<OperatorEffectiveness[]>(
      `/v0/eth/operators/${operatorId}/effectiveness`,
      options
    );
    return response.data;
  }

  /**
   * Get validator effectiveness data
   * GET /v0/eth/validators/{validator}/effectiveness
   */
  async getValidatorEffectiveness(
    validatorId: string,
    options?: RatedAPIOptions
  ): Promise<ValidatorEffectiveness[]> {
    const response = await this.request<ValidatorEffectiveness[]>(
      `/v0/eth/validators/${validatorId}/effectiveness`,
      options
    );
    return response.data;
  }

  /**
   * Get network statistics
   * GET /v0/eth/network/stats
   */
  async getNetworkStatistics(
    options?: RatedAPIOptions
  ): Promise<NetworkStatistics> {
    const response = await this.request<NetworkStatistics>(
      `/v0/eth/network/stats`,
      options
    );
    return response.data;
  }

  /**
   * Get all operators
   * GET /v0/eth/operators
   */
  async getOperators(
    options?: RatedAPIOptions
  ): Promise<OperatorSummary[]> {
    const response = await this.request<OperatorSummary[]>(
      `/v0/eth/operators`,
      options
    );
    return response.data;
  }

  /**
   * Get operator summary
   * GET /v0/eth/operators/{operator}
   */
  async getOperatorSummary(
    operatorId: string,
    options?: RatedAPIOptions
  ): Promise<OperatorSummary> {
    const response = await this.request<OperatorSummary>(
      `/v0/eth/operators/${operatorId}`,
      options
    );
    return response.data;
  }

  /**
   * Get effectiveness percentiles
   * GET /v0/eth/operators/percentiles
   */
  async getEffectivenessPercentiles(
    options?: RatedAPIOptions
  ): Promise<EffectivenessPercentiles> {
    const response = await this.request<EffectivenessPercentiles>(
      `/v0/eth/operators/percentiles`,
      options
    );
    return response.data;
  }

  /**
   * Get validator summary
   * GET /v0/eth/validators/{validator}
   */
  async getValidatorSummary(
    validatorId: string,
    options?: RatedAPIOptions
  ): Promise<ValidatorSummary> {
    const response = await this.request<ValidatorSummary>(
      `/v0/eth/validators/${validatorId}`,
      options
    );
    return response.data;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Health check (if available)
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    try {
      const response = await this.request<HealthCheckResponse>('/health');
      return response.data;
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

/**
 * Create a configured Rated Network client instance
 */
export function createRatedNetworkClient(apiKey: string, config?: Partial<RatedNetworkConfig>): RatedNetworkClient {
  return new RatedNetworkClient({
    apiKey,
    ...config,
  });
}
