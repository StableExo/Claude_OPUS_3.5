/**
 * Phase 4 Configuration - Production Infrastructure & Governance
 *
 * Configuration for Phase 4 components including:
 * - Swarm intelligence (parallel voting & consensus)
 * - Treasury management (profit rotation & multi-sig)
 * - Provenance tracking (on-chain decision records)
 * - Red-team dashboard (security monitoring)
 * - MEV fuzzer (security testing)
 *
 * Phase 4 represents production-grade infrastructure for autonomous operation.
 */

export interface Phase4Config {
  swarm: {
    minInstances: number;
    maxInstances: number;
    consensusThreshold: number; // 0.0-1.0
    quorumThreshold: number; // 0.0-1.0
    votingTimeout: number; // milliseconds
    enableEthicsVeto: boolean;
    enabled: boolean;
  };

  treasury: {
    minRotationAmount: number; // ETH
    rotationInterval: number; // milliseconds
    targetRotationPercentage: number; // 0-100
    enableAutoRotation: boolean;
    proofRetentionDays: number;
    stagingAddress?: string;
    operationsAddress?: string;
    reserveAddress?: string;
    enabled: boolean;
  };

  provenance: {
    enableOnChainAnchoring: boolean;
    anchoringInterval: number; // milliseconds
    merkleTreeDepth: number;
    compressionEnabled: boolean;
    retentionPeriod: number; // days
    enabled: boolean;
  };

  redteam: {
    port: number;
    corsOrigin: string;
    maxHistorySize: number;
    metricsWindow: number; // milliseconds
    authEnabled: boolean;
    authToken?: string;
    enabled: boolean;
  };

  fuzzer: {
    scenariosPerRun: number;
    maxConcurrent: number;
    timeout: number; // milliseconds
    enableAllAttacks: boolean;
    enabled: boolean;
  };
}

/**
 * Default Phase 4 Configuration
 *
 * Production-ready settings for Phase 4 components. Can be overridden via
 * environment variables.
 */
export const defaultPhase4Config: Phase4Config = {
  swarm: {
    minInstances: 3,
    maxInstances: 5,
    consensusThreshold: 0.7, // 70% agreement required
    quorumThreshold: 0.6, // 60% participation required
    votingTimeout: 5000, // 5 seconds
    enableEthicsVeto: true,
    enabled: false, // Disabled by default for single-instance deployments
  },

  treasury: {
    minRotationAmount: 0.01, // 0.01 ETH minimum
    rotationInterval: 3600000, // 1 hour
    targetRotationPercentage: 70, // 70% of profits to debt reduction
    enableAutoRotation: true,
    proofRetentionDays: 365, // 1 year
    enabled: false, // Enabled when treasury addresses configured
  },

  provenance: {
    enableOnChainAnchoring: false, // Expensive, enable for production
    anchoringInterval: 86400000, // 24 hours
    merkleTreeDepth: 16,
    compressionEnabled: true,
    retentionPeriod: 365, // 1 year
    enabled: true, // Always track decisions, even if not anchoring on-chain
  },

  redteam: {
    port: 3001,
    corsOrigin: '*',
    maxHistorySize: 10000,
    metricsWindow: 60000, // 1 minute
    authEnabled: false, // Enable for production
    enabled: false, // Optional security monitoring dashboard
  },

  fuzzer: {
    scenariosPerRun: 100,
    maxConcurrent: 10,
    timeout: 5000, // 5 seconds per scenario
    enableAllAttacks: true,
    enabled: false, // Testing tool, not for production
  },
};

/**
 * Load Phase 4 configuration from environment variables
 */
export function loadPhase4Config(): Phase4Config {
  return {
    swarm: {
      minInstances: parseInt(process.env.SWARM_MIN_INSTANCES || '3'),
      maxInstances: parseInt(process.env.SWARM_MAX_INSTANCES || '5'),
      consensusThreshold: parseFloat(process.env.SWARM_CONSENSUS_THRESHOLD || '0.7'),
      quorumThreshold: parseFloat(process.env.SWARM_QUORUM_THRESHOLD || '0.6'),
      votingTimeout: parseInt(process.env.SWARM_VOTING_TIMEOUT_MS || '5000'),
      enableEthicsVeto: process.env.SWARM_ENABLE_ETHICS_VETO !== 'false',
      enabled: process.env.SWARM_ENABLED === 'true',
    },

    treasury: {
      minRotationAmount: parseFloat(process.env.TREASURY_MIN_ROTATION_AMOUNT || '0.01'),
      rotationInterval: parseInt(process.env.TREASURY_ROTATION_INTERVAL_MS || '3600000'),
      targetRotationPercentage: parseInt(
        process.env.TREASURY_TARGET_ROTATION_PERCENTAGE || '70'
      ),
      enableAutoRotation: process.env.TREASURY_ENABLE_AUTO_ROTATION !== 'false',
      proofRetentionDays: parseInt(process.env.TREASURY_PROOF_RETENTION_DAYS || '365'),
      stagingAddress: process.env.TREASURY_STAGING_ADDRESS,
      operationsAddress: process.env.OPERATIONS_ADDRESS,
      reserveAddress: process.env.RESERVE_ADDRESS,
      enabled:
        process.env.TREASURY_ENABLED === 'true' ||
        (!!process.env.TREASURY_STAGING_ADDRESS && !!process.env.OPERATIONS_ADDRESS),
    },

    provenance: {
      enableOnChainAnchoring: process.env.PROVENANCE_ENABLE_ONCHAIN === 'true',
      anchoringInterval: parseInt(process.env.PROVENANCE_ANCHORING_INTERVAL_MS || '86400000'),
      merkleTreeDepth: parseInt(process.env.PROVENANCE_MERKLE_DEPTH || '16'),
      compressionEnabled: process.env.PROVENANCE_COMPRESSION !== 'false',
      retentionPeriod: parseInt(process.env.PROVENANCE_RETENTION_DAYS || '365'),
      enabled: process.env.PROVENANCE_ENABLED !== 'false', // Enabled by default
    },

    redteam: {
      port: parseInt(process.env.REDTEAM_PORT || '3001'),
      corsOrigin: process.env.REDTEAM_CORS_ORIGIN || '*',
      maxHistorySize: parseInt(process.env.REDTEAM_MAX_HISTORY_SIZE || '10000'),
      metricsWindow: parseInt(process.env.REDTEAM_METRICS_WINDOW_MS || '60000'),
      authEnabled: process.env.REDTEAM_AUTH_ENABLED === 'true',
      authToken: process.env.REDTEAM_AUTH_TOKEN,
      enabled: process.env.REDTEAM_ENABLED === 'true',
    },

    fuzzer: {
      scenariosPerRun: parseInt(process.env.FUZZER_SCENARIOS_PER_RUN || '100'),
      maxConcurrent: parseInt(process.env.FUZZER_MAX_CONCURRENT || '10'),
      timeout: parseInt(process.env.FUZZER_TIMEOUT_MS || '5000'),
      enableAllAttacks: process.env.FUZZER_ENABLE_ALL_ATTACKS !== 'false',
      enabled: process.env.FUZZER_ENABLED === 'true',
    },
  };
}

/**
 * Validate Phase 4 configuration
 */
export function validatePhase4Config(
  config: Phase4Config
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Swarm validation
  if (config.swarm.enabled) {
    if (config.swarm.minInstances < 2) {
      errors.push('Swarm requires at least 2 instances');
    }
    if (config.swarm.maxInstances < config.swarm.minInstances) {
      errors.push('Max instances must be >= min instances');
    }
    if (config.swarm.consensusThreshold < 0.5 || config.swarm.consensusThreshold > 1.0) {
      errors.push('Consensus threshold must be between 0.5 and 1.0');
    }
  }

  // Treasury validation
  if (config.treasury.enabled) {
    if (!config.treasury.stagingAddress) {
      errors.push('Treasury enabled but TREASURY_STAGING_ADDRESS not configured');
    }
    if (!config.treasury.operationsAddress) {
      warnings.push('OPERATIONS_ADDRESS not configured - profits will accumulate in staging');
    }
    if (config.treasury.targetRotationPercentage < 0 || config.treasury.targetRotationPercentage > 100) {
      errors.push('Target rotation percentage must be between 0 and 100');
    }
  }

  // Provenance validation
  if (config.provenance.enableOnChainAnchoring) {
    warnings.push('On-chain anchoring enabled - this will incur gas costs');
  }

  // Red-team validation
  if (config.redteam.enabled && !config.redteam.authEnabled) {
    warnings.push('Red-team dashboard enabled without authentication');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get Phase 4 configuration summary for logging
 */
export function getPhase4ConfigSummary(config: Phase4Config): string {
  const lines: string[] = [];

  lines.push('Phase 4 Configuration Summary:');
  lines.push('');

  // Swarm
  lines.push(`Swarm Intelligence: ${config.swarm.enabled ? 'ENABLED' : 'DISABLED'}`);
  if (config.swarm.enabled) {
    lines.push(`  Instances: ${config.swarm.minInstances}-${config.swarm.maxInstances}`);
    lines.push(`  Consensus: ${(config.swarm.consensusThreshold * 100).toFixed(0)}%`);
    lines.push(`  Quorum: ${(config.swarm.quorumThreshold * 100).toFixed(0)}%`);
  }
  lines.push('');

  // Treasury
  lines.push(`Treasury Management: ${config.treasury.enabled ? 'ENABLED' : 'DISABLED'}`);
  if (config.treasury.enabled) {
    lines.push(`  Rotation: ${config.treasury.targetRotationPercentage}% every ${config.treasury.rotationInterval / 60000}min`);
    lines.push(`  Min amount: ${config.treasury.minRotationAmount} ETH`);
  }
  lines.push('');

  // Provenance
  lines.push(`Provenance Tracking: ${config.provenance.enabled ? 'ENABLED' : 'DISABLED'}`);
  if (config.provenance.enabled) {
    lines.push(`  On-chain: ${config.provenance.enableOnChainAnchoring ? 'YES' : 'NO'}`);
    lines.push(`  Retention: ${config.provenance.retentionPeriod} days`);
  }
  lines.push('');

  // Red-team
  lines.push(`Red-team Dashboard: ${config.redteam.enabled ? 'ENABLED' : 'DISABLED'}`);
  if (config.redteam.enabled) {
    lines.push(`  Port: ${config.redteam.port}`);
    lines.push(`  Auth: ${config.redteam.authEnabled ? 'ENABLED' : 'DISABLED'}`);
  }
  lines.push('');

  // Fuzzer
  lines.push(`MEV Fuzzer: ${config.fuzzer.enabled ? 'ENABLED' : 'DISABLED'}`);

  return lines.join('\n');
}
