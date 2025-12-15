/**
 * Builder Endpoint Registry
 * 
 * Registry of known MEV-Boost builders and their relay endpoints.
 * Based on current market data from mevboost.pics and relayscan.io.
 */

import {
  BuilderName,
  BuilderEndpoint,
  BuilderCapability,
} from './types';

/**
 * Titan Builder endpoint configuration
 */
export const TITAN_BUILDER: BuilderEndpoint = {
  name: BuilderName.TITAN,
  displayName: 'Titan Builder',
  relayUrl: 'https://rpc.titanbuilder.xyz',
  fallbackUrls: [
    'https://relay.titanbuilder.xyz',
  ],
  marketShare: 0.5085, // ~50.85% market share (December 2024, relayscan.io)
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.PARALLEL_MERGING,
    BuilderCapability.BUNDLE_SIMULATION,
  ],
  isActive: true,
  priority: 100, // Highest priority (largest market share)
  metadata: {
    description: 'Dominant Ethereum MEV builder with 40-50% market share',
    features: ['Parallel bundle merging', 'Rust-based', 'Own relay'],
    exclusiveOrderFlow: ['Banana Gun'],
  },
};

/**
 * BuilderNet endpoint configuration
 */
export const BUILDERNET_BUILDER: BuilderEndpoint = {
  name: BuilderName.BUILDERNET,
  displayName: 'BuilderNet',
  relayUrl: 'https://relay.buildernet.org',
  fallbackUrls: [
    'https://api.buildernet.org',
  ],
  marketShare: 0.2984, // ~29.84% market share (December 2024, relayscan.io)
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.BUNDLE_SIMULATION,
  ],
  isActive: true,
  priority: 85,
  metadata: {
    description: 'Intelligence-focused MEV builder with advanced analytics',
    features: ['MEV intelligence layer', 'Builder analytics', 'Optimization algorithms'],
  },
};

/**
 * Flashbots Builder endpoint configuration
 */
export const FLASHBOTS_BUILDER: BuilderEndpoint = {
  name: BuilderName.FLASHBOTS,
  displayName: 'Flashbots Builder',
  relayUrl: 'https://relay.flashbots.net',
  fallbackUrls: [
    'https://relay-sepolia.flashbots.net', // Testnet
  ],
  marketShare: 0.1613, // ~16.13% market share (BuilderNet Flashbots, December 2024, relayscan.io)
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.MEV_SHARE,
    BuilderCapability.BUNDLE_SIMULATION,
    BuilderCapability.BUNDLE_CANCELLATION,
  ],
  isActive: true,
  priority: 80,
  metadata: {
    description: 'Original MEV-Boost builder by Flashbots',
    features: ['MEV-Share', 'Bundle simulation', 'Established reputation'],
  },
};

/**
 * bloXroute Builder endpoint configuration
 */
export const BLOXROUTE_BUILDER: BuilderEndpoint = {
  name: BuilderName.BLOXROUTE,
  displayName: 'bloXroute Builder',
  relayUrl: 'https://mev.api.bloxroute.com',
  fallbackUrls: [
    'https://relay.bloxroute.max-profit.blxrbdn.com',
  ],
  marketShare: 0.15, // ~15% average market share
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.BUNDLE_SIMULATION,
  ],
  isActive: true,
  priority: 80,
  metadata: {
    description: 'bloXroute MEV builder with BDN network',
    features: ['Blockchain Distribution Network', 'Global infrastructure'],
  },
};

/**
 * Beaver Builder endpoint configuration
 */
export const BEAVER_BUILDER: BuilderEndpoint = {
  name: BuilderName.BEAVER,
  displayName: 'Beaver Builder',
  relayUrl: 'https://relay.beaverbuild.org',
  fallbackUrls: [],
  marketShare: 0.05, // ~5% market share
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
  ],
  isActive: true,
  priority: 70,
  metadata: {
    description: 'Independent MEV builder',
  },
};

/**
 * Rsync Builder endpoint configuration
 */
export const RSYNC_BUILDER: BuilderEndpoint = {
  name: BuilderName.RSYNC,
  displayName: 'Rsync Builder',
  relayUrl: 'https://rsync-builder.xyz', // Updated based on awesome-block-builders
  fallbackUrls: [],
  marketShare: 0.10, // ~10% estimated (described as "one of most dominant" in research)
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.BUNDLE_CANCELLATION,
    BuilderCapability.BUNDLE_SIMULATION,
  ],
  isActive: true,
  priority: 75, // High priority due to dominance and advanced features
  metadata: {
    description: 'Dominant MEV builder with advanced bundle API (atomic bundles, UUID cancellation, refund control)',
    features: ['60% private order flow', 'Atomic bundles', 'UUID cancellation', 'Refund distribution control'],
  },
};

/**
 * Quasar Builder endpoint configuration
 * NOTE: Relay endpoint is placeholder - needs verification from quasar.win documentation
 * Marked inactive until endpoint is confirmed and tested
 */
export const QUASAR_BUILDER: BuilderEndpoint = {
  name: BuilderName.QUASAR,
  displayName: 'Quasar Builder',
  relayUrl: 'https://relay.quasar.win', // PLACEHOLDER - needs verification
  fallbackUrls: [],
  marketShare: 0.1608, // ~16.08% market share (December 2024, relayscan.io)
  capabilities: [
    BuilderCapability.STANDARD_BUNDLES,
    BuilderCapability.BUNDLE_SIMULATION,
  ],
  isActive: false, // Inactive until relay endpoint verified and tested
  priority: 80, // Same tier as Flashbots (16% market share)
  metadata: {
    description: 'Major MEV builder competing for #3 spot with Flashbots',
    features: ['Consistent market presence', 'High market share'],
  },
};

/**
 * All registered builder endpoints
 */
export const ALL_BUILDERS: BuilderEndpoint[] = [
  TITAN_BUILDER,
  BUILDERNET_BUILDER,
  FLASHBOTS_BUILDER,
  BLOXROUTE_BUILDER,
  BEAVER_BUILDER,
  RSYNC_BUILDER,
  QUASAR_BUILDER,
];

/**
 * Top 4 builders by market share (cover ~95% of blocks)
 */
export const TOP_4_BUILDERS: BuilderEndpoint[] = [
  TITAN_BUILDER,      // 50.85% (rank #1)
  BUILDERNET_BUILDER, // 29.84% (rank #2)
  FLASHBOTS_BUILDER,  // 16.13% (rank #3)
  QUASAR_BUILDER,     // 16.08% (rank #4) - INACTIVE until endpoint verified
];

/**
 * Top 3 active builders (exclude Quasar until endpoint verified)
 */
export const TOP_3_BUILDERS: BuilderEndpoint[] = [
  TITAN_BUILDER,      // 50.85% (rank #1)
  BUILDERNET_BUILDER, // 29.84% (rank #2)
  FLASHBOTS_BUILDER,  // 16.13% (rank #3)
];

/**
 * Builder registry with lookup by name
 */
export class BuilderRegistry {
  private builders: Map<BuilderName, BuilderEndpoint>;

  constructor(builders: BuilderEndpoint[] = ALL_BUILDERS) {
    this.builders = new Map(builders.map((b) => [b.name, b]));
  }

  /**
   * Get builder by name
   */
  getBuilder(name: BuilderName): BuilderEndpoint | undefined {
    return this.builders.get(name);
  }

  /**
   * Get all active builders
   */
  getActiveBuilders(): BuilderEndpoint[] {
    return Array.from(this.builders.values()).filter((b) => b.isActive);
  }

  /**
   * Get top N builders by market share
   */
  getTopBuilders(n: number): BuilderEndpoint[] {
    return Array.from(this.builders.values())
      .filter((b) => b.isActive)
      .sort((a, b) => b.marketShare - a.marketShare)
      .slice(0, n);
  }

  /**
   * Get builders sorted by priority
   */
  getBuildersByPriority(): BuilderEndpoint[] {
    return Array.from(this.builders.values())
      .filter((b) => b.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get total market share of given builders
   */
  getTotalMarketShare(builders: BuilderEndpoint[]): number {
    return builders.reduce((sum, b) => sum + b.marketShare, 0);
  }

  /**
   * Register or update a builder
   */
  registerBuilder(builder: BuilderEndpoint): void {
    this.builders.set(builder.name, builder);
  }

  /**
   * Deactivate a builder
   */
  deactivateBuilder(name: BuilderName): void {
    const builder = this.builders.get(name);
    if (builder) {
      builder.isActive = false;
    }
  }

  /**
   * Reactivate a builder
   */
  reactivateBuilder(name: BuilderName): void {
    const builder = this.builders.get(name);
    if (builder) {
      builder.isActive = true;
    }
  }

  /**
   * Get all builder names
   */
  getAllBuilderNames(): BuilderName[] {
    return Array.from(this.builders.keys());
  }

  /**
   * Check if builder exists
   */
  hasBuilder(name: BuilderName): boolean {
    return this.builders.has(name);
  }

  /**
   * Get builder count
   */
  getBuilderCount(): number {
    return this.builders.size;
  }

  /**
   * Get active builder count
   */
  getActiveBuilderCount(): number {
    return this.getActiveBuilders().length;
  }
}

/**
 * Default builder registry instance
 */
export const defaultBuilderRegistry = new BuilderRegistry();
