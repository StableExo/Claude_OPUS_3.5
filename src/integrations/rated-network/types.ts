/**
 * Rated Network API Types
 * 
 * Type definitions for the Rated Network API v0
 * Documentation: https://docs.rated.network/rated-api
 */

/**
 * API Response wrapper
 */
export interface RatedAPIResponse<T> {
  data: T;
  page?: {
    from: number;
    size: number;
    granularity?: string;
  };
}

/**
 * Operator Effectiveness Data
 * GET /v0/eth/operators/{operator}/effectiveness
 */
export interface OperatorEffectiveness {
  validatorIndex?: number;
  operatorId: string;
  operatorName?: string;
  timeWindow: string; // ISO 8601 date
  avgInclusionDelay: number;
  attesterEffectiveness: number; // 0-1
  proposerEffectiveness: number; // 0-1
  validatorEffectiveness: number; // 0-1
  consensusRewards: string; // Wei
  executionRewards: string; // Wei
  mevRewards?: string; // Wei
  totalRewards: string; // Wei
  proposedBlocks: number;
  missedBlocks: number;
  attestations: number;
  missedAttestations: number;
  slashings: number;
}

/**
 * Validator Effectiveness Data
 */
export interface ValidatorEffectiveness {
  validatorIndex: number;
  pubkey: string;
  timeWindow: string;
  attesterEffectiveness: number;
  proposerEffectiveness: number;
  validatorEffectiveness: number;
  consensusRewards: string;
  executionRewards: string;
  mevRewards?: string;
  totalRewards: string;
  uptime: number; // 0-1
  slashings: number;
}

/**
 * Network Statistics
 */
export interface NetworkStatistics {
  network: string;
  timeWindow: string;
  activeValidators: number;
  totalStake: string; // Wei
  avgValidatorBalance: string; // Wei
  avgEffectiveness: number;
  totalRewards: string; // Wei
  slashingEvents: number;
}

/**
 * MEV Relay Data
 */
export interface MEVRelayData {
  id: string;
  name: string;
  timeWindow: string;
  blocksRelayed: number;
  connectedValidators: number;
  uptime: number; // 0-1
  avgLatency?: number; // milliseconds
  successRate: number; // 0-1
  totalValue: string; // Wei
}

/**
 * Block Builder Performance
 */
export interface BuilderPerformance {
  id: string;
  name: string;
  timeWindow: string;
  blocksBuilt: number;
  marketShare: number; // 0-1
  avgBlockValue: string; // Wei
  totalValue: string; // Wei
  uniqueValidators: number;
  efficiency: number; // blocks per validator
  reliability: number; // 0-1
}

/**
 * Staking Pool Data
 */
export interface StakingPoolData {
  id: string;
  name: string;
  timeWindow: string;
  validatorCount: number;
  totalStake: string; // Wei
  apr: number; // Annual percentage rate
  avgEffectiveness: number;
  attestationRate: number;
  proposalRate: number;
  slashingCount: number;
  operators: string[];
}

/**
 * Slashing Event
 */
export interface SlashingEvent {
  id: string;
  validatorIndex: number;
  pubkey: string;
  epoch: number;
  slot: number;
  timestamp: string; // ISO 8601
  reason: 'attestation' | 'proposal' | 'sync_committee';
  amount: string; // Wei slashed
  pool?: string;
  operator?: string;
}

/**
 * Validator Summary
 */
export interface ValidatorSummary {
  validatorIndex: number;
  pubkey: string;
  status: 'active' | 'pending' | 'exited' | 'slashed';
  balance: string; // Wei
  effectivenessScore: number;
  lifetimeRewards: string; // Wei
  operator?: string;
  pool?: string;
  activationEpoch: number;
  exitEpoch?: number;
}

/**
 * API Request Options
 */
export interface RatedAPIOptions {
  network?: 'mainnet' | 'goerli' | 'sepolia';
  from?: string; // ISO 8601 date or epoch/slot number
  to?: string; // ISO 8601 date or epoch/slot number
  size?: number; // Page size (default: 100)
  granularity?: 'hour' | 'day' | 'week' | 'month';
  filterBy?: string;
  idType?: 'validator_index' | 'pubkey' | 'deposit_address' | 'withdrawal_address' | 'entity_name';
}

/**
 * API Client Configuration
 */
export interface RatedNetworkConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
  rateLimit?: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
}

/**
 * Error response from Rated API
 */
export interface RatedAPIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version?: string;
  uptime?: number;
}

/**
 * Operator Summary
 */
export interface OperatorSummary {
  operatorId: string;
  operatorName: string;
  validatorCount: number;
  totalStake: string; // Wei
  avgEffectiveness: number;
  marketShare: number; // 0-1
  pools: string[];
}

/**
 * Percentile Statistics
 */
export interface PercentileStats {
  p10: number;
  p25: number;
  p50: number; // median
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

/**
 * Effectiveness Percentiles
 */
export interface EffectivenessPercentiles {
  timeWindow: string;
  network: string;
  attesterEffectiveness: PercentileStats;
  proposerEffectiveness: PercentileStats;
  validatorEffectiveness: PercentileStats;
}
