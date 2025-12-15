/**
 * Builder Data Adapter for Rated Network
 * 
 * Adapts Rated Network API data to TheWarden's BuilderRegistry format
 * Enhances builder selection with real-time performance metrics
 */

import { RatedNetworkClient } from './RatedNetworkClient.js';
import { OperatorEffectiveness, OperatorSummary } from './types.js';
import { logger } from '../../utils/logger.js';

export interface EnhancedBuilderMetadata {
  marketShare: number; // 0-1
  blocksBuilt24h: number;
  avgBlockValue: string; // ETH
  uptime: number; // 0-1
  performance: {
    efficiency: number; // Blocks/validator ratio
    consistency: number; // Standard deviation of performance
    reliability: number; // Uptime * success rate
    effectiveness: number; // From Rated Network
  };
  lastUpdated: Date;
}

/**
 * Map of builder names to their Rated Network operator IDs
 * These need to be discovered from the Rated Network API or documentation
 */
const BUILDER_TO_OPERATOR_MAP: Record<string, string> = {
  'titan': 'titan',
  'flashbots': 'flashbots',
  'buildernet': 'buildernet',
  'bloxroute': 'bloxroute',
  'rsync-builder': 'rsync',
  'beaverbuild': 'beaver',
  'builder0x69': 'builder0x69',
  // Add more mappings as needed
};

/**
 * Adapter for enhancing builder data with Rated Network metrics
 */
export class BuilderDataAdapter {
  private client: RatedNetworkClient;
  private cache: Map<string, EnhancedBuilderMetadata> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(client: RatedNetworkClient) {
    this.client = client;
  }

  /**
   * Get enhanced builder metadata from Rated Network
   */
  async getBuilderMetadata(builderName: string): Promise<EnhancedBuilderMetadata | null> {
    try {
      // Check cache first
      const cached = this.cache.get(builderName);
      if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
        return cached;
      }

      // Map builder name to operator ID
      const operatorId = BUILDER_TO_OPERATOR_MAP[builderName.toLowerCase()];
      if (!operatorId) {
        logger.debug(`No Rated Network operator mapping for builder: ${builderName}`);
        return null;
      }

      // Fetch operator effectiveness data (last 24 hours)
      const effectiveness = await this.client.getOperatorEffectiveness(operatorId, {
        network: 'mainnet',
        granularity: 'day',
        size: 1, // Get latest day only
      });

      if (!effectiveness || effectiveness.length === 0) {
        logger.debug(`No effectiveness data found for operator: ${operatorId}`);
        return null;
      }

      const latestData = effectiveness[0];

      // Fetch operator summary for additional metadata
      const summary = await this.client.getOperatorSummary(operatorId, {
        network: 'mainnet',
      });

      // Calculate enhanced metrics
      const metadata: EnhancedBuilderMetadata = {
        marketShare: summary.marketShare || 0,
        blocksBuilt24h: latestData.proposedBlocks,
        avgBlockValue: this.calculateAvgBlockValue(latestData),
        uptime: this.calculateUptime(latestData),
        performance: {
          efficiency: summary.validatorCount > 0 
            ? latestData.proposedBlocks / summary.validatorCount 
            : 0,
          consistency: this.calculateConsistency(latestData),
          reliability: this.calculateReliability(latestData),
          effectiveness: latestData.proposerEffectiveness,
        },
        lastUpdated: new Date(),
      };

      // Update cache
      this.cache.set(builderName, metadata);

      logger.info(`Updated builder metadata for ${builderName}:`, {
        marketShare: (metadata.marketShare * 100).toFixed(2) + '%',
        blocksBuilt24h: metadata.blocksBuilt24h,
        effectiveness: (metadata.performance.effectiveness * 100).toFixed(2) + '%',
      });

      return metadata;
    } catch (error) {
      logger.error(`Error fetching builder metadata for ${builderName}:`, error);
      return null;
    }
  }

  /**
   * Update builder registry with latest data from Rated Network
   */
  async updateAllBuilders(builderNames: string[]): Promise<Map<string, EnhancedBuilderMetadata>> {
    const results = new Map<string, EnhancedBuilderMetadata>();

    for (const builderName of builderNames) {
      const metadata = await this.getBuilderMetadata(builderName);
      if (metadata) {
        results.set(builderName, metadata);
      }
    }

    return results;
  }

  /**
   * Get builder performance rankings
   */
  async getBuilderRankings(builderNames: string[]): Promise<Array<{
    name: string;
    score: number;
    metadata: EnhancedBuilderMetadata;
  }>> {
    const results = await this.updateAllBuilders(builderNames);
    
    return Array.from(results.entries())
      .map(([name, metadata]) => ({
        name,
        score: this.calculateBuilderScore(metadata),
        metadata,
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate a composite builder score (0-100)
   */
  private calculateBuilderScore(metadata: EnhancedBuilderMetadata): number {
    const weights = {
      marketShare: 0.25,
      effectiveness: 0.35,
      reliability: 0.25,
      efficiency: 0.15,
    };

    const score = 
      metadata.marketShare * 100 * weights.marketShare +
      metadata.performance.effectiveness * 100 * weights.effectiveness +
      metadata.performance.reliability * 100 * weights.reliability +
      Math.min(metadata.performance.efficiency * 10, 100) * weights.efficiency;

    return Math.min(100, score);
  }

  /**
   * Calculate average block value in ETH
   */
  private calculateAvgBlockValue(data: OperatorEffectiveness): string {
    const totalBlocks = data.proposedBlocks;
    if (totalBlocks === 0) return '0';

    // Convert Wei to ETH
    const totalRewards = BigInt(data.totalRewards);
    const avgWei = totalRewards / BigInt(totalBlocks);
    const avgEth = Number(avgWei) / 1e18;

    return avgEth.toFixed(6);
  }

  /**
   * Calculate uptime (successful blocks / total expected blocks)
   */
  private calculateUptime(data: OperatorEffectiveness): number {
    const total = data.proposedBlocks + data.missedBlocks;
    if (total === 0) return 1.0;
    return data.proposedBlocks / total;
  }

  /**
   * Calculate consistency score (inverse of variance)
   * Higher is better (more consistent)
   */
  private calculateConsistency(data: OperatorEffectiveness): number {
    // Use proposer effectiveness as a proxy for consistency
    // In a full implementation, this would analyze variance over time
    return data.proposerEffectiveness;
  }

  /**
   * Calculate reliability (combines uptime and effectiveness)
   */
  private calculateReliability(data: OperatorEffectiveness): number {
    const uptime = this.calculateUptime(data);
    return uptime * data.proposerEffectiveness;
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    builders: string[];
  } {
    return {
      size: this.cache.size,
      builders: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Create a configured builder data adapter
 */
export function createBuilderDataAdapter(client: RatedNetworkClient): BuilderDataAdapter {
  return new BuilderDataAdapter(client);
}
