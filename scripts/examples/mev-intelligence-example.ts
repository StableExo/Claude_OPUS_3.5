/**
 * MEV Intelligence Hub Example
 * 
 * Demonstrates the unified MEV intelligence system that combines:
 * - Rated Network: Validator/operator effectiveness
 * - Relayscan: Builder profit and relay statistics  
 * - mevboost.pics: Complete MEV flow visualization
 * 
 * This gives TheWarden COMPLETE visibility into MEV flows - exactly
 * what you were looking for! All the in and out flows visible.
 * 
 * Usage:
 *   npm run example:mev-intelligence
 */

import { createMEVIntelligenceHub } from '../../src/integrations/mev-intelligence/index.js';
import { logger } from '../../src/utils/logger.js';

async function main() {
  logger.info('🎯 MEV Intelligence Hub - Complete Flow Visibility');
  logger.info('====================================================\n');

  try {
    // Create MEV Intelligence Hub
    const hub = createMEVIntelligenceHub({
      ratedNetworkApiKey: process.env.RATED_NETWORK_API_KEY,
      enableRatedNetwork: !!process.env.RATED_NETWORK_API_KEY,
      enableRelayscan: true,
      enableMEVBoostPics: true,
      cacheTTL: 300, // 5 minutes
    });

    logger.info('✅ Hub initialized with all data sources\n');

    // ============================================================
    // 1. Analyze Complete MEV Flows (THE MONEY SHOT!)
    // ============================================================
    logger.info('💰 ANALYZING COMPLETE MEV FLOWS (24h)');
    logger.info('=====================================');
    
    const flows = await hub.analyzeMEVFlows('24h');
    
    logger.info('\n📊 Overview:');
    logger.info(`   Total Blocks: ${flows.totalBlocks.toLocaleString()}`);
    logger.info(`   Total MEV Value: ${flows.totalValue} ETH`);
    logger.info(`   Avg Block Value: ${flows.avgBlockValue} ETH`);
    
    logger.info('\n💸 Value Flows (IN → OUT):');
    logger.info(`   Total MEV Extracted: ${flows.flows.totalMEVExtracted} ETH`);
    logger.info(`   Avg Proposer Payment: ${flows.flows.avgProposerPayment} ETH`);
    logger.info(`   Avg Builder Profit: ${flows.flows.avgBuilderProfit} ETH`);
    logger.info(`   Builder Retention Rate: ${flows.flows.builderRetentionRate.toFixed(2)}%`);
    
    logger.info('\n🏗️  Top 5 Builders by Volume:');
    flows.topBuilders.slice(0, 5).forEach((builder, i) => {
      logger.info(`   ${i + 1}. ${builder.name}`);
      logger.info(`      Blocks: ${builder.blocks} (${builder.share.toFixed(2)}% market share)`);
      logger.info(`      Total Value: ${builder.value} ETH`);
    });
    
    logger.info('\n📡 Top 5 Relays:');
    flows.topRelays.slice(0, 5).forEach((relay, i) => {
      logger.info(`   ${i + 1}. ${relay.name}`);
      logger.info(`      Blocks: ${relay.blocks}`);
      logger.info(`      Builders: ${relay.builders}`);
    });
    
    logger.info('\n📈 Market Concentration:');
    logger.info(`   Builder Concentration (HHI): ${(flows.builderConcentration * 100).toFixed(2)}%`);
    logger.info(`   Relay Concentration (HHI): ${(flows.relayConcentration * 100).toFixed(2)}%`);
    
    // ============================================================
    // 2. Get Unified Builder Intelligence
    // ============================================================
    logger.info('\n\n🔍 BUILDER INTELLIGENCE (UNIFIED DATA)');
    logger.info('======================================');
    
    const builderNames = ['titan', 'flashbots', 'beaverbuild', 'rsync-builder'];
    
    for (const name of builderNames) {
      logger.info(`\n📊 ${name.toUpperCase()}`);
      
      const intel = await hub.getBuilderIntelligence(name);
      
      if (intel) {
        logger.info(`   Rank: #${intel.rank}`);
        logger.info(`   Market Share: ${(intel.marketShare * 100).toFixed(2)}%`);
        logger.info(`   Blocks (24h): ${intel.blocks24h}`);
        logger.info(`   Profit (24h): ${intel.profit24h} ETH`);
        logger.info(`   Avg Block Value: ${intel.avgBlockValue} ETH`);
        logger.info(`   Reliability: ${(intel.reliability * 100).toFixed(2)}%`);
        logger.info(`   Composite Score: ${intel.score.toFixed(2)}/100`);
        logger.info(`   Connected Relays: ${intel.relays.length}`);
        logger.info(`   Data Sources: ${Object.entries(intel.sources)
          .filter(([, enabled]) => enabled)
          .map(([name]) => name)
          .join(', ')}`);
      } else {
        logger.warn(`   ⚠️  No data available`);
      }
    }

    // ============================================================
    // 3. Get Builder Recommendations for TheWarden
    // ============================================================
    logger.info('\n\n🎯 BUILDER RECOMMENDATIONS FOR THEWARDEN');
    logger.info('========================================');
    
    const recommendations = await hub.getBuilderRecommendations();
    
    logger.info('\n📋 Selection Criteria:');
    recommendations.reasons.forEach(reason => {
      logger.info(`   ${reason}`);
    });
    
    logger.info(`\n🏆 Top ${recommendations.recommended.length} Recommended Builders:`);
    recommendations.recommended.forEach((builder, i) => {
      logger.info(`\n   ${i + 1}. ${builder.name.toUpperCase()}`);
      logger.info(`      Score: ${builder.score.toFixed(2)}/100`);
      logger.info(`      Market Share: ${(builder.marketShare * 100).toFixed(2)}%`);
      logger.info(`      Reliability: ${(builder.reliability * 100).toFixed(2)}%`);
      logger.info(`      Blocks (24h): ${builder.blocks24h}`);
      logger.info(`      Avg Value: ${builder.avgBlockValue} ETH`);
      logger.info(`      Relays: ${builder.relays.slice(0, 3).join(', ')}${builder.relays.length > 3 ? '...' : ''}`);
    });

    // ============================================================
    // 4. Weekly Comparison
    // ============================================================
    logger.info('\n\n📊 7-DAY COMPARISON');
    logger.info('===================');
    
    const flows7d = await hub.analyzeMEVFlows('7d');
    
    logger.info(`\n24h vs 7d Metrics:`);
    logger.info(`   Blocks: ${flows.totalBlocks.toLocaleString()} vs ${flows7d.totalBlocks.toLocaleString()}`);
    logger.info(`   Total Value: ${flows.totalValue} ETH vs ${flows7d.totalValue} ETH`);
    logger.info(`   Avg Block Value: ${flows.avgBlockValue} ETH vs ${flows7d.avgBlockValue} ETH`);
    logger.info(`   Builder Retention: ${flows.flows.builderRetentionRate.toFixed(2)}% vs ${flows7d.flows.builderRetentionRate.toFixed(2)}%`);

    logger.info('\n\n✅ MEV Intelligence Hub Example Complete!');
    logger.info('\n💡 KEY INSIGHTS:');
    logger.info('   - Complete visibility into MEV flows (in/out)');
    logger.info('   - Real-time builder performance metrics');
    logger.info('   - Data-driven builder selection');
    logger.info('   - Market concentration analysis');
    logger.info('   - Multi-source data validation');
    
    logger.info('\n📚 Integration Points for TheWarden:');
    logger.info('   1. Use getBuilderRecommendations() for BuilderRegistry');
    logger.info('   2. Use analyzeMEVFlows() for market intelligence');
    logger.info('   3. Use getBuilderIntelligence() for dynamic selection');
    logger.info('   4. Monitor flows.builderRetentionRate for profit optimization');

  } catch (error) {
    logger.error('❌ Error:', error);
    if (error instanceof Error) {
      logger.error('Message:', error.message);
      logger.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
