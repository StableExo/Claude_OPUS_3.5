/**
 * Relayscan API Types
 * 
 * Type definitions for the Flashbots Relayscan API
 * Source: https://github.com/flashbots/relayscan
 * API: https://relayscan.io
 */

/**
 * Time window for data queries
 */
export type TimeWindow = '24h' | '7d' | '30d' | 'all';

/**
 * Builder profit data from Relayscan
 */
export interface BuilderProfit {
  builder: string;
  builderPubkey: string;
  blocks: number;
  profit: string; // ETH
  avgProfit: string; // ETH per block
  relays: string[];
  timestamp?: string;
}

/**
 * Relay statistics
 */
export interface RelayStats {
  relay: string;
  url: string;
  blocks: number;
  uniqueBuilders: number;
  totalValue: string; // ETH
  avgBlockValue: string; // ETH
  uptime: number; // percentage
  latestSlot: number;
  timestamp?: string;
}

/**
 * Overview statistics
 */
export interface OverviewStats {
  totalBlocks: number;
  totalValue: string; // ETH
  uniqueBuilders: number;
  uniqueRelays: number;
  avgBlockValue: string; // ETH
  timestamp: string;
}

/**
 * Bid data from the bid archive
 */
export interface BidData {
  slot: number;
  builderPubkey: string;
  bidValue: string; // Wei
  bidTimestamp: number;
  relay: string;
  blockHash: string;
  parentHash: string;
  feeRecipient: string;
  optimisticSubmission?: boolean;
}

/**
 * Builder summary
 */
export interface BuilderSummary {
  name: string;
  pubkey: string;
  blocks24h: number;
  blocks7d: number;
  profit24h: string; // ETH
  profit7d: string; // ETH
  avgBlockValue: string; // ETH
  marketShare: number; // 0-1
  relays: string[];
  rank: number;
}

/**
 * Relay performance data
 */
export interface RelayPerformance {
  name: string;
  url: string;
  blocks24h: number;
  blocks7d: number;
  builders24h: number;
  totalValue24h: string; // ETH
  totalValue7d: string; // ETH
  uptime: number; // 0-1
  avgLatency?: number; // ms
  reliability: number; // 0-1
}

/**
 * API configuration
 */
export interface RelayscanConfig {
  baseUrl?: string;
  timeout?: number;
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}

/**
 * Builder ranking criteria
 */
export interface BuilderRankingCriteria {
  profitWeight: number; // 0-1
  blocksWeight: number; // 0-1
  reliabilityWeight: number; // 0-1
  marketShareWeight: number; // 0-1
}
