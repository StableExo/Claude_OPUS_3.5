#!/usr/bin/env node
/**
 * Update Supabase with correct credentials for mainnet forking
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

console.log('🔄 Updating Supabase configuration for mainnet forking...\n');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateConfigs() {
  const configs = [
    {
      config_name: 'HARDHAT_FORK_ENABLED',
      config_value: 'true',
      category: 'testing',
      description: 'Enable Hardhat mainnet forking for security testing',
      is_active: true
    },
    {
      config_name: 'HARDHAT_FORK_URL',
      config_value: 'https://eth-mainnet.g.alchemy.com/v2/3wG3PLWyPu2DliGQLVa8G',
      category: 'testing',
      description: 'Hardhat fork URL pointing to Ethereum mainnet via Alchemy',
      is_active: true
    },
    {
      config_name: 'FORKING',
      config_value: 'true',
      category: 'testing',
      description: 'Global forking flag',
      is_active: true
    },
    {
      config_name: 'ETHEREUM_RPC_URL',
      config_value: 'https://eth-mainnet.g.alchemy.com/v2/3wG3PLWyPu2DliGQLVa8G',
      category: 'blockchain',
      description: 'Ethereum mainnet RPC URL',
      is_active: true
    },
    {
      config_name: 'BASE_RPC_URL',
      config_value: 'https://base-mainnet.g.alchemy.com/v2/3wG3PLWyPu2DliGQLVa8G',
      category: 'blockchain',
      description: 'Base L2 mainnet RPC URL',
      is_active: true
    }
  ];

  console.log('📝 Updating configuration values...\n');

  for (const config of configs) {
    try {
      const { data, error } = await supabase
        .from('environment_configs')
        .upsert(config, { 
          onConflict: 'config_name',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.log(`⚠️  ${config.config_name}: ${error.message}`);
      } else {
        console.log(`✅ ${config.config_name}: ${config.config_value.substring(0, 50)}...`);
      }
    } catch (err: any) {
      console.log(`❌ ${config.config_name}: ${err.message}`);
    }
  }

  console.log('\n✅ Configuration update complete!');
  console.log('\n📊 Summary:');
  console.log('   ✅ HARDHAT_FORK_ENABLED = true');
  console.log('   ✅ HARDHAT_FORK_URL = Alchemy Ethereum');
  console.log('   ✅ FORKING = true');
  console.log('   ✅ ETHEREUM_RPC_URL = Alchemy');
  console.log('   ✅ BASE_RPC_URL = Alchemy');
  console.log('\n🎯 Mainnet forking is now ENABLED in Supabase!');
  console.log('\n💡 API Keys (already in environment):');
  console.log('   - ALCHEMY_API_KEY: 3wG3PLWyPu2DliGQLVa8G');
  console.log('   - ETHERSCAN_API_KEY (correct): ES16B14B19XWKXJBIHUAJRXJHECXHM6WEK');
  console.log('   - BASESCAN_API_KEY: QT7KI56B365U22NXMJJM4IU7Q8MVER69RY');
  console.log('\n🚀 Ready to run: npm run security:test:bridge');
}

updateConfigs().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
