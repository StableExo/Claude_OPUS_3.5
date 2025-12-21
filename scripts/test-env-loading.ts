#!/usr/bin/env node
/**
 * Test Environment Loading from Supabase
 * 
 * This script tests that the AI agent can successfully load
 * environment variables from Supabase using the bootstrap keys.
 */

import { initializeEnvironment } from '../src/utils/loadEnvFromSupabase';

async function testEnvironmentLoading() {
  console.log('🧪 Testing Environment Loading from Supabase\n');
  console.log('=' .repeat(80));
  
  // Check bootstrap keys
  console.log('\n1️⃣ Checking Bootstrap Keys:');
  const hasSupabaseUrl = !!process.env.SUPABASE_URL;
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_KEY;
  const hasEncryptionKey = !!process.env.SECRETS_ENCRYPTION_KEY;
  
  console.log(`   SUPABASE_URL:            ${hasSupabaseUrl ? '✅' : '❌'}`);
  console.log(`   SUPABASE_SERVICE_KEY:    ${hasSupabaseKey ? '✅' : '❌'}`);
  console.log(`   SECRETS_ENCRYPTION_KEY:  ${hasEncryptionKey ? '✅' : '❌'}`);
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('\n❌ Missing required bootstrap keys!');
    console.log('   Cannot load environment from Supabase.');
    process.exit(1);
  }
  
  if (!hasEncryptionKey) {
    console.log('\n⚠️  Warning: SECRETS_ENCRYPTION_KEY not found');
    console.log('   Will load configs but cannot decrypt secrets.');
  }
  
  // Test environment loading
  console.log('\n2️⃣ Loading Environment from Supabase:');
  
  try {
    await initializeEnvironment();
    
    // Check if some key variables are loaded
    console.log('\n3️⃣ Verifying Loaded Variables:');
    
    const testVars = [
      'NODE_ENV',
      'CHAIN_ID',
      'WALLET_PRIVATE_KEY',
      'BASE_RPC_URL',
      'ALCHEMY_API_KEY',
    ];
    
    let loadedCount = 0;
    for (const varName of testVars) {
      const isLoaded = !!process.env[varName];
      console.log(`   ${varName.padEnd(25)} ${isLoaded ? '✅' : '❌'}`);
      if (isLoaded) loadedCount++;
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 Test Results:');
    console.log('='.repeat(80));
    console.log(`✅ Variables tested:      ${testVars.length}`);
    console.log(`✅ Variables loaded:      ${loadedCount}`);
    console.log(`📈 Success rate:          ${Math.round((loadedCount / testVars.length) * 100)}%`);
    
    if (loadedCount === testVars.length) {
      console.log('\n🎉 SUCCESS! All test variables loaded from Supabase!');
      console.log('   Environment loading is working correctly.');
      process.exit(0);
    } else if (loadedCount > 0) {
      console.log('\n⚠️  PARTIAL SUCCESS: Some variables loaded.');
      console.log('   Check if all variables are in Supabase.');
      process.exit(0);
    } else {
      console.log('\n❌ FAILURE: No variables loaded from Supabase.');
      console.log('   Check Supabase connection and data.');
      process.exit(1);
    }
    
  } catch (error) {
    console.log('\n❌ ERROR Loading Environment:');
    console.log(`   ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the test
testEnvironmentLoading();
