/**
 * Rated Network Integration Example
 * 
 * Demonstrates how to use the Rated Network API client to fetch
 * validator, operator, and builder performance metrics.
 * 
 * Usage:
 *   node --import tsx scripts/examples/rated-network-example.ts
 */

import { 
  createRatedNetworkClient, 
  createBuilderDataAdapter 
} from '../../src/integrations/rated-network/index.js';
import { logger } from '../../src/utils/logger.js';

/**
 * Main example function
 */
async function main() {
  logger.info('🚀 Rated Network API Integration Example');
  logger.info('==========================================\n');

  // Check for API key
  const apiKey = process.env.RATED_NETWORK_API_KEY;
  if (!apiKey || apiKey === 'your_rated_network_api_key_here') {
    logger.error('❌ RATED_NETWORK_API_KEY not set in environment');
    logger.info('Get your API key from: https://console.rated.network/');
    logger.info('Then add it to your .env file');
    process.exit(1);
  }

  try {
    // ============================================================
    // 1. Create Rated Network Client
    // ============================================================
    logger.info('📡 Creating Rated Network client...');
    const client = createRatedNetworkClient(apiKey, {
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
      },
      rateLimit: {
        requestsPerSecond: 10,
        requestsPerMinute: 600,
      },
    });

    logger.info('✅ Client created successfully\n');

    // ============================================================
    // 2. Get Network Statistics
    // ============================================================
    logger.info('📊 Fetching network statistics...');
    const networkStats = await client.getNetworkStatistics({
      network: 'mainnet',
    });

    logger.info('Network Statistics:');
    logger.info(`  Active Validators: ${networkStats.activeValidators.toLocaleString()}`);
    logger.info(`  Total Stake: ${(BigInt(networkStats.totalStake) / BigInt(1e18)).toString()} ETH`);
    logger.info(`  Average Effectiveness: ${(networkStats.avgEffectiveness * 100).toFixed(2)}%`);
    logger.info(`  Slashing Events: ${networkStats.slashingEvents}\n`);

    // ============================================================
    // 3. Get Operator Effectiveness (Flashbots example)
    // ============================================================
    logger.info('🔍 Fetching operator effectiveness (Flashbots)...');
    try {
      const flashbotsData = await client.getOperatorEffectiveness('flashbots', {
        network: 'mainnet',
        granularity: 'day',
        size: 7, // Last 7 days
      });

      if (flashbotsData && flashbotsData.length > 0) {
        logger.info('Flashbots Operator Performance (Last 7 days):');
        flashbotsData.forEach((day, index) => {
          logger.info(`  Day ${index + 1} (${day.timeWindow}):`);
          logger.info(`    Proposer Effectiveness: ${(day.proposerEffectiveness * 100).toFixed(2)}%`);
          logger.info(`    Blocks Proposed: ${day.proposedBlocks}`);
          logger.info(`    Blocks Missed: ${day.missedBlocks}`);
          logger.info(`    Total Rewards: ${(BigInt(day.totalRewards) / BigInt(1e18)).toString()} ETH`);
        });
        logger.info('');
      }
    } catch (error) {
      logger.warn('⚠️  Could not fetch Flashbots data (operator may not exist or name may be different)');
      logger.debug('Error:', error);
      logger.info('');
    }

    // ============================================================
    // 4. Get All Operators
    // ============================================================
    logger.info('📋 Fetching top operators...');
    const operators = await client.getOperators({
      network: 'mainnet',
      size: 10, // Top 10
    });

    if (operators && operators.length > 0) {
      logger.info(`Top ${operators.length} Operators by Validator Count:`);
      operators
        .sort((a, b) => b.validatorCount - a.validatorCount)
        .slice(0, 10)
        .forEach((op, index) => {
          logger.info(`  ${index + 1}. ${op.operatorName || op.operatorId}:`);
          logger.info(`     Validators: ${op.validatorCount.toLocaleString()}`);
          logger.info(`     Market Share: ${(op.marketShare * 100).toFixed(2)}%`);
          logger.info(`     Avg Effectiveness: ${(op.avgEffectiveness * 100).toFixed(2)}%`);
        });
      logger.info('');
    }

    // ============================================================
    // 5. Get Effectiveness Percentiles
    // ============================================================
    logger.info('📈 Fetching effectiveness percentiles...');
    const percentiles = await client.getEffectivenessPercentiles({
      network: 'mainnet',
    });

    logger.info('Network-wide Effectiveness Percentiles:');
    logger.info('  Validator Effectiveness:');
    logger.info(`    P50 (Median): ${(percentiles.validatorEffectiveness.p50 * 100).toFixed(2)}%`);
    logger.info(`    P75: ${(percentiles.validatorEffectiveness.p75 * 100).toFixed(2)}%`);
    logger.info(`    P90: ${(percentiles.validatorEffectiveness.p90 * 100).toFixed(2)}%`);
    logger.info(`    P99: ${(percentiles.validatorEffectiveness.p99 * 100).toFixed(2)}%`);
    logger.info('');

    // ============================================================
    // 6. Builder Data Adapter Example
    // ============================================================
    logger.info('🏗️  Creating Builder Data Adapter...');
    const adapter = createBuilderDataAdapter(client);

    // Try to get builder metadata for known builders
    const knownBuilders = ['flashbots', 'titan', 'buildernet', 'bloxroute'];
    logger.info(`\n📊 Fetching builder metadata for: ${knownBuilders.join(', ')}...`);

    const builderRankings = await adapter.getBuilderRankings(knownBuilders);

    if (builderRankings.length > 0) {
      logger.info('\nBuilder Performance Rankings:');
      builderRankings.forEach((builder, index) => {
        logger.info(`\n  ${index + 1}. ${builder.name.toUpperCase()}`);
        logger.info(`     Overall Score: ${builder.score.toFixed(2)}/100`);
        logger.info(`     Market Share: ${(builder.metadata.marketShare * 100).toFixed(2)}%`);
        logger.info(`     Blocks Built (24h): ${builder.metadata.blocksBuilt24h}`);
        logger.info(`     Avg Block Value: ${builder.metadata.avgBlockValue} ETH`);
        logger.info(`     Uptime: ${(builder.metadata.uptime * 100).toFixed(2)}%`);
        logger.info(`     Effectiveness: ${(builder.metadata.performance.effectiveness * 100).toFixed(2)}%`);
        logger.info(`     Reliability: ${(builder.metadata.performance.reliability * 100).toFixed(2)}%`);
      });
    } else {
      logger.info('  No builder data found. Builders may need to be mapped to operator IDs.');
      logger.info('  Check BuilderDataAdapter.ts BUILDER_TO_OPERATOR_MAP for mappings.');
    }

    // ============================================================
    // 7. Cache Statistics
    // ============================================================
    logger.info('\n💾 Cache Statistics:');
    const cacheStats = adapter.getCacheStats();
    logger.info(`  Cached Builders: ${cacheStats.size}`);
    if (cacheStats.builders.length > 0) {
      logger.info(`  Builders in Cache: ${cacheStats.builders.join(', ')}`);
    }

    logger.info('\n✅ Example completed successfully!');
    logger.info('\n📚 For more information, see:');
    logger.info('   - docs/integrations/RATED_NETWORK_INTEGRATION.md');
    logger.info('   - src/integrations/rated-network/README.md');

  } catch (error) {
    logger.error('❌ Error:', error);
    if (error instanceof Error) {
      logger.error('Message:', error.message);
      if ('statusCode' in error) {
        logger.error('Status Code:', (error as any).statusCode);
      }
    }
    process.exit(1);
  }
}

// Run the example
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
