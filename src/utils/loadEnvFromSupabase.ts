/**
 * Load Environment from Supabase at Startup
 * 
 * This module is imported BEFORE dotenv to load environment variables
 * from Supabase instead of .env file.
 * 
 * Security Benefits:
 * - Secrets never sent through chat
 * - Only 3 bootstrap keys needed in environment
 * - All other variables loaded from encrypted Supabase storage
 * 
 * Required Bootstrap Keys (must be in process.env):
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 * - SECRETS_ENCRYPTION_KEY
 */

import { loadEnvFromSupabase } from './supabaseEnvLoader';

export async function initializeEnvironment(): Promise<void> {
  console.log('🔐 Initializing secure environment from Supabase...\n');
  
  // Check for required bootstrap keys
  const requiredKeys = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SECRETS_ENCRYPTION_KEY'];
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️  Warning: Missing bootstrap keys:', missingKeys.join(', '));
    console.warn('   Falling back to .env file (less secure)');
    return;
  }
  
  console.log('✅ Bootstrap keys found');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log(`   SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY?.substring(0, 20)}...`);
  console.log(`   SECRETS_ENCRYPTION_KEY: ${process.env.SECRETS_ENCRYPTION_KEY?.substring(0, 10)}...`);
  
  // Load environment from Supabase
  const result = await loadEnvFromSupabase({
    loadSecrets: true,
    override: false, // Don't override existing env vars
    merge: true,
  });
  
  if (!result.success) {
    console.error('\n❌ Failed to load environment from Supabase');
    console.error('   Errors:', result.errors);
    console.warn('   Falling back to .env file');
    return;
  }
  
  console.log('\n✅ Environment loaded from Supabase successfully!');
  console.log(`   Configs loaded: ${result.configsLoaded}`);
  console.log(`   Secrets decrypted: ${result.secretsLoaded}`);
  console.log('   🔒 All secrets are encrypted in Supabase');
  console.log('   🚫 No secrets sent through chat!\n');
}

/**
 * Synchronous wrapper for environment initialization
 * Use this at the top of your entry point
 */
export function loadEnvFromSupabaseSync(): void {
  // Check if we should use Supabase
  if (process.env.USE_SUPABASE !== 'true') {
    return;
  }
  
  // Run async initialization
  initializeEnvironment().catch((error) => {
    console.error('❌ Error initializing environment:', error.message);
    console.warn('   Falling back to .env file');
  });
}
