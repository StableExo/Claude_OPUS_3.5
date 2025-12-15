/**
 * MEVBoost.pics API Types
 * 
 * Type definitions for the mevboost.pics data API
 * Source: https://github.com/Nerolation/mevboost.pics
 * API: https://mevboost.pics
 */

/**
 * Builder data from mevboost.pics
 */
export interface MEVBoostBuilder {
  name: string;
  pubkey: string;
  blocks: number;
  totalValue: string; // ETH
  avgBlockValue: string; // ETH
  relays: string[];
}

/**
 * Relay data from mevboost.pics
 */
export interface MEVBoostRelay {
  name: string;
  url: string;
  blocks: number;
  builders: number;
  totalValue: string; // ETH
}

/**
 * Block data from mevboost.pics
 */
export interface MEVBoostBlock {
  slot: number;
  blockNumber: number;
  builder: string;
  builderPubkey: string;
  relay: string;
  value: string; // ETH
  proposerFee: string; // ETH
  timestamp: number;
}

/**
 * Historic data summary
 */
export interface MEVBoostHistoricData {
  blocks: MEVBoostBlock[];
  totalBlocks: number;
  totalValue: string; // ETH
  uniqueBuilders: number;
  uniqueRelays: number;
}

/**
 * Latest stats
 */
export interface MEVBoostLatestStats {
  latestSlot: number;
  latestBlock: number;
  builders: MEVBoostBuilder[];
  relays: MEVBoostRelay[];
  last24h: {
    blocks: number;
    totalValue: string; // ETH
    avgBlockValue: string; // ETH
  };
}

/**
 * API configuration
 */
export interface MEVBoostConfig {
  baseUrl?: string;
  timeout?: number;
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}
