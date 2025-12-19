/**
 * Unified MEV Intelligence Hub
 * 
 * Combines data from multiple MEV analytics sources to provide
 * comprehensive intelligence for TheWarden's builder/relay selection.
 * 
 * Data Sources:
 * - Rated Network: Validator/operator effectiveness and performance
 * - Relayscan: Real-time builder profit and relay statistics
 * - mevboost.pics: Complete MEV flow visualization and analytics
 * 
 * This gives TheWarden visibility into:
 * - Builder profitability and market share
 * - Relay health and performance
 * - Validator effectiveness
 * - Complete MEV value flows (in/out)
 * - Historical trends and patterns
 */

import { createRatedNetworkClient, RatedNetworkClient } from '../rated-network/index.js';
import { createRelayscanClient, RelayscanClient } from '../relayscan/RelayscanClient.js';
import { createMEVBoostPicsClient, MEVBoostPicsClient } from '../mevboost-pics/MEVBoostPicsClient.js';
import { logger } from '../../utils/logger.js';

/**
 * Unified builder intelligence
 */
export interface UnifiedBuilderIntelligence {
  name: string;
  pubkey: string;
  
  // Market metrics
  marketShare: number; // 0-1
  rank: number;
  
  // Performance metrics (24h)
  blocks24h: number;
  profit24h: string; // ETH
  avgBlockValue: string; // ETH
  
  // Performance metrics (7d)
  blocks7d: number;
  profit7d: string; // ETH
  
  // Quality metrics
  effectiveness: number; // 0-1 (from Rated Network)
  reliability: number; // 0-1
  uptime: number; // 0-1
  
  // Network
  relays: string[];
  
  // Composite score (0-100)
  score: number;
  
  // Data sources
  sources: {
    ratedNetwork: boolean;
    relayscan: boolean;
    mevboostPics: boolean;
  };
  
  lastUpdated: Date;
}

/**
 * MEV flow analysis - THE COMPLETE PICTURE
 */
export interface MEVFlowAnalysis {
  timeWindow: '24h' | '7d';
  
  // Aggregate metrics
  totalBlocks: number;
  totalValue: string; // ETH
  avgBlockValue: string; // ETH
  
  // Top performers
  topBuilders: Array<{
    name: string;
    blocks: number;
    value: string; // ETH
    share: number; // percentage
  }>;
  
  topRelays: Array<{
    name: string;
    blocks: number;
    builders: number;
  }>;
  
  // Flow analysis - IN/OUT visibility
  builderConcentration: number; // 0-1 (Herfindahl index)
  relayConcentration: number; // 0-1
  
  // Value flow breakdown
  flows: {
    totalMEVExtracted: string; // Total MEV value (ETH)
    avgProposerPayment: string; // Avg paid to validators (ETH)
    avgBuilderProfit: string; // Avg builder profit (ETH)
    builderRetentionRate: number; // % of MEV kept by builders
  };
  
  // Trends
  trends: {
    blockCount: 'increasing' | 'stable' | 'decreasing';
    avgValue: 'increasing' | 'stable' | 'decreasing';
  };
  
  timestamp: Date;
}

/**
 * Configuration for MEV Intelligence Hub
 */
export interface MEVIntelligenceConfig {
  ratedNetworkApiKey?: string;
  enableRatedNetwork?: boolean;
  enableRelayscan?: boolean;
  enableMEVBoostPics?: boolean;
  cacheTTL?: number; // seconds
}

/**
 * MEV Intelligence Hub - Complete MEV Flow Visibility
 */
export class MEVIntelligenceHub {
  private ratedClient?: RatedNetworkClient;
  private relayscanClient: RelayscanClient;
  private mevboostClient: MEVBoostPicsClient;
  private config: MEVIntelligenceConfig;

  constructor(config: MEVIntelligenceConfig = {}) {
    this.config = {
      enableRatedNetwork: config.enableRatedNetwork ?? false,
      enableRelayscan: config.enableRelayscan ?? true,
      enableMEVBoostPics: config.enableMEVBoostPics ?? true,
      cacheTTL: config.cacheTTL ?? 300, // 5 minutes
      ...config,
    };

    // Initialize clients with guaranteed cacheTTL value
    const cacheTTL = this.config.cacheTTL!; // We just set it above so it's guaranteed to be defined
    
    if (this.config.enableRatedNetwork && this.config.ratedNetworkApiKey) {
      this.ratedClient = createRatedNetworkClient(this.config.ratedNetworkApiKey, {
        cache: { enabled: true, ttl: cacheTTL },
      });
    }

    this.relayscanClient = createRelayscanClient({
      cache: { enabled: true, ttl: cacheTTL },
    });

    this.mevboostClient = createMEVBoostPicsClient({
      cache: { enabled: true, ttl: cacheTTL },
    });

    logger.info('🎯 MEV Intelligence Hub initialized with complete flow visibility');
  }

  /**
   * Get unified builder intelligence
   */
  async getBuilderIntelligence(builderName: string): Promise<UnifiedBuilderIntelligence | null> {
    try {
      const sources = {
        ratedNetwork: false,
        relayscan: false,
        mevboostPics: false,
      };

      let data: Partial<UnifiedBuilderIntelligence> = {
        name: builderName,
        sources,
        lastUpdated: new Date(),
      };

      // Fetch from Relayscan (primary source for profit/market data)
      if (this.config.enableRelayscan) {
        try {
          const relayscan24h = await this.relayscanClient.getBuilder(builderName, '24h');
          const relayscan7d = await this.relayscanClient.getBuilder(builderName, '7d');
          
          if (relayscan24h) {
            data = {
              ...data,
              pubkey: relayscan24h.pubkey,
              blocks24h: relayscan24h.blocks24h,
              profit24h: relayscan24h.profit24h,
              blocks7d: relayscan7d?.blocks7d || 0,
              profit7d: relayscan7d?.profit7d || '0',
              avgBlockValue: relayscan24h.avgBlockValue,
              marketShare: relayscan24h.marketShare,
              rank: relayscan24h.rank,
              relays: relayscan24h.relays,
            };
            sources.relayscan = true;
          }
        } catch (error) {
          logger.debug(`Relayscan data not available for ${builderName}`);
        }
      }

      // Fetch from mevboost.pics (complete flow data)
      if (this.config.enableMEVBoostPics) {
        try {
          const mevboost = await this.mevboostClient.getBuilder(builderName);
          
          if (mevboost) {
            data = {
              ...data,
              pubkey: data.pubkey || mevboost.pubkey,
              relays: data.relays || mevboost.relays,
            };
            sources.mevboostPics = true;
          }
        } catch (error) {
          logger.debug(`mevboost.pics data not available for ${builderName}`);
        }
      }

      // Fetch from Rated Network (effectiveness/quality metrics)
      if (this.config.enableRatedNetwork && this.ratedClient) {
        try {
          const operatorEffectiveness = await this.ratedClient.getOperatorEffectiveness(
            builderName.toLowerCase(),
            { network: 'mainnet', granularity: 'day', size: 1 }
          );
          
          if (operatorEffectiveness && operatorEffectiveness.length > 0) {
            const latest = operatorEffectiveness[0];
            data = {
              ...data,
              effectiveness: latest.proposerEffectiveness,
              uptime: latest.proposedBlocks / (latest.proposedBlocks + latest.missedBlocks),
            };
            sources.ratedNetwork = true;
          }
        } catch (error) {
          logger.debug(`Rated Network data not available for ${builderName}`);
        }
      }

      // Calculate derived metrics
      if (data.blocks24h !== undefined) {
        data.reliability = this.calculateReliability(data);
        data.score = this.calculateBuilderScore(data);
      }

      // Return null if no data was found
      if (!sources.relayscan && !sources.mevboostPics && !sources.ratedNetwork) {
        return null;
      }

      return data as UnifiedBuilderIntelligence;
    } catch (error) {
      logger.error(`Error fetching builder intelligence for ${builderName}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  /**
   * Analyze complete MEV flows - IN/OUT visibility
   * This is what makes mevboost.pics special - complete flow tracking!
   */
  async analyzeMEVFlows(timeWindow: '24h' | '7d' = '24h'): Promise<MEVFlowAnalysis> {
    try {
      logger.info(`🔍 Analyzing complete MEV flows for ${timeWindow}...`);

      // Get data from all sources
      const [relayscanOverview, relayscanBuilders, mevboostLatest] = await Promise.all([
        this.relayscanClient.getOverview(),
        this.relayscanClient.getBuilderSummaries(timeWindow),
        this.mevboostClient.getLatestStats(),
      ]);

      // Calculate top performers
      const topBuilders = relayscanBuilders.slice(0, 10).map(b => ({
        name: b.name,
        blocks: timeWindow === '24h' ? b.blocks24h : b.blocks7d,
        value: timeWindow === '24h' ? b.profit24h : b.profit7d,
        share: b.marketShare * 100,
      }));

      // Calculate concentration (Herfindahl index)
      const builderConcentration = this.calculateHerfindahlIndex(
        relayscanBuilders.map(b => b.marketShare)
      );

      // Calculate MEV flow breakdown
      const totalMEV = parseFloat(relayscanOverview.totalValue);
      const totalProfit = relayscanBuilders.reduce(
        (sum, b) => sum + parseFloat(timeWindow === '24h' ? b.profit24h : b.profit7d),
        0
      );
      const builderRetentionRate = totalMEV > 0 ? (totalProfit / totalMEV) : 0;

      const flows = {
        totalMEVExtracted: relayscanOverview.totalValue,
        avgProposerPayment: (totalMEV - totalProfit > 0 
          ? ((totalMEV - totalProfit) / relayscanOverview.totalBlocks).toFixed(6)
          : '0'),
        avgBuilderProfit: (totalProfit / relayscanOverview.totalBlocks).toFixed(6),
        builderRetentionRate: builderRetentionRate * 100, // percentage
      };

      const analysis: MEVFlowAnalysis = {
        timeWindow,
        totalBlocks: relayscanOverview.totalBlocks,
        totalValue: relayscanOverview.totalValue,
        avgBlockValue: relayscanOverview.avgBlockValue,
        topBuilders,
        topRelays: mevboostLatest.relays.slice(0, 10).map(r => ({
          name: r.name,
          blocks: r.blocks,
          builders: r.builders,
        })),
        builderConcentration,
        relayConcentration: 0.5, // Simplified - would calculate from actual relay data
        flows,
        trends: {
          blockCount: 'stable',
          avgValue: 'stable',
        },
        timestamp: new Date(),
      };

      logger.info(`✅ MEV Flow Analysis Complete:`);
      logger.info(`   Total MEV Extracted: ${flows.totalMEVExtracted} ETH`);
      logger.info(`   Builder Retention: ${flows.builderRetentionRate.toFixed(2)}%`);
      logger.info(`   Market Concentration: ${(builderConcentration * 100).toFixed(2)}%`);

      return analysis;
    } catch (error) {
      logger.error('Error analyzing MEV flows:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Get builder recommendations for TheWarden
   */
  async getBuilderRecommendations(): Promise<{
    recommended: UnifiedBuilderIntelligence[];
    reasons: string[];
  }> {
    const allBuilders = await this.getAllBuilders();
    
    // Filter for high-quality builders
    const recommended = allBuilders.filter(b => 
      b.score >= 70 &&
      b.reliability >= 0.95 &&
      b.marketShare >= 0.05 && // At least 5% market share
      b.blocks24h > 10 // Active builder
    );

    const reasons = [
      `✅ Selected ${recommended.length} builders with score ≥ 70`,
      `✅ Filtered for reliability ≥ 95%`,
      `✅ Required market share ≥ 5%`,
      `✅ Required active participation (>10 blocks/24h)`,
    ];

    logger.info('🎯 Builder Recommendations:');
    reasons.forEach(r => logger.info(`   ${r}`));

    return {
      recommended: recommended.slice(0, 5), // Top 5
      reasons,
    };
  }

  /**
   * Get all builders with unified intelligence
   */
  private async getAllBuilders(): Promise<UnifiedBuilderIntelligence[]> {
    const builders: UnifiedBuilderIntelligence[] = [];
    
    try {
      const relayscanBuilders = await this.relayscanClient.getBuilderSummaries('24h');
      
      for (const builder of relayscanBuilders) {
        const intelligence = await this.getBuilderIntelligence(builder.name);
        if (intelligence) {
          builders.push(intelligence);
        }
      }
    } catch (error) {
      logger.error('Error fetching all builders:', error instanceof Error ? error.message : String(error));
    }
    
    return builders.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate builder reliability score (0-1)
   */
  private calculateReliability(builder: Partial<UnifiedBuilderIntelligence>): number {
    let score = 0;
    let factors = 0;

    if (builder.uptime !== undefined) {
      score += builder.uptime;
      factors++;
    }

    if (builder.effectiveness !== undefined) {
      score += builder.effectiveness;
      factors++;
    }

    if (builder.blocks24h && builder.blocks7d) {
      score += 1.0;
      factors++;
    }

    return factors > 0 ? score / factors : 0.9;
  }

  /**
   * Calculate composite builder score (0-100)
   */
  private calculateBuilderScore(builder: Partial<UnifiedBuilderIntelligence>): number {
    const weights = {
      marketShare: 0.3,
      reliability: 0.25,
      profitability: 0.25,
      effectiveness: 0.2,
    };

    let score = 0;

    if (builder.marketShare !== undefined) {
      score += (builder.marketShare * 100) * weights.marketShare;
    }

    if (builder.reliability !== undefined) {
      score += (builder.reliability * 100) * weights.reliability;
    }

    if (builder.avgBlockValue) {
      const avgValue = parseFloat(builder.avgBlockValue);
      const normalized = Math.min(avgValue / 0.05, 1);
      score += (normalized * 100) * weights.profitability;
    }

    if (builder.effectiveness !== undefined) {
      score += (builder.effectiveness * 100) * weights.effectiveness;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate Herfindahl-Hirschman Index (market concentration)
   */
  private calculateHerfindahlIndex(shares: number[]): number {
    return shares.reduce((sum, share) => sum + share * share, 0);
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.ratedClient?.clearCache();
    this.relayscanClient.clearCache();
    this.mevboostClient.clearCache();
  }
}

/**
 * Create a configured MEV Intelligence Hub
 */
export function createMEVIntelligenceHub(config?: MEVIntelligenceConfig): MEVIntelligenceHub {
  return new MEVIntelligenceHub(config);
}
