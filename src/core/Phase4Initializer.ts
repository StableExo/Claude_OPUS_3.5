/**
 * Phase 4 Initializer
 *
 * Responsible for initializing and wiring Phase 4 components:
 * - Swarm intelligence (parallel voting & consensus)
 * - Treasury management (profit rotation & multi-sig)
 * - Provenance tracking (on-chain decision records)
 * - Red-team dashboard (security monitoring)
 * - MEV fuzzer (security testing)
 *
 * Phase 4 represents production-grade infrastructure for autonomous operation.
 */

import { logger } from '../utils/logger';
import { Phase4Config } from '../config/phase4.config';
import { JsonRpcProvider, Wallet } from 'ethers';

// Swarm Components
import { SwarmCoordinator, SwarmConfig, createProductionSwarm } from '../swarm/SwarmCoordinator';
import { SwarmScaler, ScalerConfig, createProductionSwarmScaler } from '../swarm/SwarmScaler';

// Treasury Components
import {
  TreasuryRotation,
  TreasuryConfig,
  createProductionTreasury,
} from '../treasury/TreasuryRotation';
import {
  MultiSigTreasury,
  MultiSigConfig,
  createProductionMultiSig,
} from '../treasury/MultiSigTreasury';

// Provenance
import {
  DecisionProvenance,
  ProvenanceConfig,
  createProductionProvenance,
} from '../provenance/DecisionProvenance';

/**
 * Phase 4 Components Container
 */
export interface Phase4Components {
  // Swarm Intelligence
  swarmCoordinator?: SwarmCoordinator;
  swarmScaler?: SwarmScaler;

  // Treasury Management
  treasuryRotation?: TreasuryRotation;
  multiSigTreasury?: MultiSigTreasury;

  // Provenance
  decisionProvenance?: DecisionProvenance;

  // Status flags
  swarmEnabled: boolean;
  treasuryEnabled: boolean;
  provenanceEnabled: boolean;
  redteamEnabled: boolean;
  fuzzerEnabled: boolean;
}

/**
 * Initialize Phase 4 components based on configuration
 */
export async function initializePhase4Components(
  config: Phase4Config,
  provider?: JsonRpcProvider,
  wallet?: Wallet
): Promise<Phase4Components> {
  logger.info('[Phase4] Initializing Phase 4 components...');

  const components: Phase4Components = {
    swarmEnabled: false,
    treasuryEnabled: false,
    provenanceEnabled: false,
    redteamEnabled: false,
    fuzzerEnabled: false,
  };

  try {
    // Initialize Swarm Intelligence
    if (config.swarm.enabled) {
      logger.info('[Phase4] Initializing Swarm Intelligence...');

      try {
        const swarmConfig: SwarmConfig = {
          minInstances: config.swarm.minInstances,
          maxInstances: config.swarm.maxInstances,
          consensusThreshold: config.swarm.consensusThreshold,
          quorumThreshold: config.swarm.quorumThreshold,
          votingTimeout: config.swarm.votingTimeout,
          enableEthicsVeto: config.swarm.enableEthicsVeto,
        };

        components.swarmCoordinator = createProductionSwarm(swarmConfig);

        const scalerConfig: ScalerConfig = {
          minNodes: config.swarm.minInstances,
          maxNodes: config.swarm.maxInstances,
          scaleUpThreshold: 0.8, // Scale up at 80% capacity
          scaleDownThreshold: 0.3, // Scale down at 30% capacity
          cooldownPeriod: 300000, // 5 minutes between scaling actions
        };

        components.swarmScaler = createProductionSwarmScaler(scalerConfig);

        components.swarmEnabled = true;
        logger.info('[Phase4] ✓ Swarm Intelligence initialized');
        logger.info(
          `[Phase4]   Instances: ${config.swarm.minInstances}-${config.swarm.maxInstances}`
        );
        logger.info(
          `[Phase4]   Consensus: ${(config.swarm.consensusThreshold * 100).toFixed(0)}%`
        );
      } catch (error) {
        logger.error(`[Phase4] Failed to initialize Swarm Intelligence: ${error}`);
      }
    } else {
      logger.info('[Phase4] Swarm Intelligence: Disabled (single-instance mode)');
    }

    // Initialize Treasury Management
    if (config.treasury.enabled) {
      logger.info('[Phase4] Initializing Treasury Management...');

      if (!provider || !wallet) {
        logger.warn(
          '[Phase4] Treasury enabled but provider/wallet not available - treasury features disabled'
        );
      } else {
        try {
          // Initialize Treasury Rotation
          const treasuryConfig: TreasuryConfig = {
            stagingAddress: config.treasury.stagingAddress!,
            operationsAddress: config.treasury.operationsAddress,
            reserveAddress: config.treasury.reserveAddress,
            minRotationAmount: config.treasury.minRotationAmount,
            targetRotationPercentage: config.treasury.targetRotationPercentage,
            rotationInterval: config.treasury.rotationInterval,
            enableAutoRotation: config.treasury.enableAutoRotation,
            proofRetentionDays: config.treasury.proofRetentionDays,
          };

          components.treasuryRotation = await createProductionTreasury(
            treasuryConfig,
            provider,
            wallet
          );

          // Initialize Multi-Sig Treasury (if configured)
          if (process.env.MULTI_SIG_ADDRESS && process.env.MULTI_SIG_THRESHOLD) {
            const multiSigConfig: MultiSigConfig = {
              multiSigAddress: process.env.MULTI_SIG_ADDRESS,
              threshold: parseInt(process.env.MULTI_SIG_THRESHOLD),
              signers: [], // TODO: Load from env or config
              rotationPolicy: {
                enableRotation: true,
                rotationInterval: 2592000000, // 30 days
                minSignersToRotate: 1,
              },
            };

            components.multiSigTreasury = createProductionMultiSig(
              multiSigConfig,
              provider,
              wallet
            );

            logger.info('[Phase4] ✓ Multi-Sig Treasury initialized');
          }

          components.treasuryEnabled = true;
          logger.info('[Phase4] ✓ Treasury Management initialized');
          logger.info(
            `[Phase4]   Rotation: ${config.treasury.targetRotationPercentage}% every ${config.treasury.rotationInterval / 60000}min`
          );
          logger.info(`[Phase4]   Staging: ${config.treasury.stagingAddress}`);
        } catch (error) {
          logger.error(`[Phase4] Failed to initialize Treasury Management: ${error}`);
        }
      }
    } else {
      logger.info('[Phase4] Treasury Management: Disabled');
    }

    // Initialize Provenance Tracking
    if (config.provenance.enabled) {
      logger.info('[Phase4] Initializing Provenance Tracking...');

      try {
        const provenanceConfig: ProvenanceConfig = {
          enableOnChainAnchoring: config.provenance.enableOnChainAnchoring,
          anchoringInterval: config.provenance.anchoringInterval,
          merkleTreeDepth: config.provenance.merkleTreeDepth,
          compressionEnabled: config.provenance.compressionEnabled,
          retentionPeriod: config.provenance.retentionPeriod,
          storageBackend: 'file', // Can be 'file', 'ipfs', 'arweave'
        };

        components.decisionProvenance = createProductionProvenance(provenanceConfig, provider);

        components.provenanceEnabled = true;
        logger.info('[Phase4] ✓ Provenance Tracking initialized');
        logger.info(
          `[Phase4]   On-chain: ${config.provenance.enableOnChainAnchoring ? 'YES' : 'NO'}`
        );
        logger.info(`[Phase4]   Retention: ${config.provenance.retentionPeriod} days`);
      } catch (error) {
        logger.error(`[Phase4] Failed to initialize Provenance Tracking: ${error}`);
      }
    } else {
      logger.info('[Phase4] Provenance Tracking: Disabled');
    }

    // Initialize Red-team Dashboard
    if (config.redteam.enabled) {
      logger.info('[Phase4] Initializing Red-team Dashboard...');
      logger.info(`[Phase4]   Port: ${config.redteam.port}`);
      logger.info(`[Phase4]   Auth: ${config.redteam.authEnabled ? 'ENABLED' : 'DISABLED'}`);
      logger.warn(
        '[Phase4]   Red-team dashboard initialization deferred (starts separately on port ' +
          config.redteam.port +
          ')'
      );
      components.redteamEnabled = true;
    }

    // Initialize MEV Fuzzer
    if (config.fuzzer.enabled) {
      logger.info('[Phase4] MEV Fuzzer: Testing tool enabled');
      logger.warn('[Phase4]   Fuzzer should only be used in testing environments');
      components.fuzzerEnabled = true;
    }

    logger.info('[Phase4] Phase 4 initialization complete');

    return components;
  } catch (error) {
    logger.error(`[Phase4] Error during Phase 4 initialization: ${error}`);
    throw error;
  }
}

/**
 * Shutdown Phase 4 components gracefully
 */
export async function shutdownPhase4Components(components: Phase4Components): Promise<void> {
  logger.info('[Phase4] Shutting down Phase 4 components...');

  // Shutdown Swarm
  if (components.swarmCoordinator) {
    try {
      await components.swarmCoordinator.shutdown();
      logger.info('[Phase4] ✓ Swarm Coordinator shut down');
    } catch (error) {
      logger.error(`[Phase4] Error shutting down Swarm Coordinator: ${error}`);
    }
  }

  if (components.swarmScaler) {
    try {
      await components.swarmScaler.stop();
      logger.info('[Phase4] ✓ Swarm Scaler shut down');
    } catch (error) {
      logger.error(`[Phase4] Error shutting down Swarm Scaler: ${error}`);
    }
  }

  // Shutdown Treasury
  if (components.treasuryRotation) {
    try {
      await components.treasuryRotation.stop();
      logger.info('[Phase4] ✓ Treasury Rotation shut down');
    } catch (error) {
      logger.error(`[Phase4] Error shutting down Treasury Rotation: ${error}`);
    }
  }

  if (components.multiSigTreasury) {
    try {
      // Multi-sig doesn't have active processes to shutdown
      logger.info('[Phase4] ✓ Multi-Sig Treasury cleaned up');
    } catch (error) {
      logger.error(`[Phase4] Error cleaning up Multi-Sig Treasury: ${error}`);
    }
  }

  // Shutdown Provenance
  if (components.decisionProvenance) {
    try {
      await components.decisionProvenance.close();
      logger.info('[Phase4] ✓ Provenance Tracking shut down');
    } catch (error) {
      logger.error(`[Phase4] Error shutting down Provenance Tracking: ${error}`);
    }
  }

  logger.info('[Phase4] Phase 4 shutdown complete');
}

/**
 * Get Phase 4 status for monitoring/logging
 */
export function getPhase4Status(components: Phase4Components): {
  swarm: { enabled: boolean; instances?: number; consensus?: number };
  treasury: { enabled: boolean; autoRotation?: boolean };
  provenance: { enabled: boolean; onChain?: boolean };
  redteam: { enabled: boolean };
  fuzzer: { enabled: boolean };
} {
  return {
    swarm: {
      enabled: components.swarmEnabled,
      instances: components.swarmCoordinator?.getStats().totalVotes,
      consensus: components.swarmCoordinator?.getConsensusThreshold(),
    },
    treasury: {
      enabled: components.treasuryEnabled,
      autoRotation: components.treasuryRotation?.isAutoRotationEnabled(),
    },
    provenance: {
      enabled: components.provenanceEnabled,
      onChain: components.decisionProvenance?.isOnChainAnchoringEnabled(),
    },
    redteam: {
      enabled: components.redteamEnabled,
    },
    fuzzer: {
      enabled: components.fuzzerEnabled,
    },
  };
}
