#!/usr/bin/env node
/**
 * Sync Environment Configuration to Supabase
 * 
 * This script syncs the .env file to Supabase so TheWarden can access
 * configuration across sessions without relying on local files.
 * 
 * Features:
 * - Uploads all environment variables to Supabase
 * - Encrypts sensitive values (API keys, secrets, passwords)
 * - Categorizes variables for better organization
 * - Provides backup and restore functionality
 * 
 * Usage:
 *   npm run env:sync              # Sync .env to Supabase
 *   npm run env:restore           # Restore .env from Supabase
 *   npm run env:backup            # Create timestamped backup
 *   npm run env:list              # List all stored configs
 */

import { SupabaseEnvStorage } from '../../src/services/SupabaseEnvStorage';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

const ENV_FILE_PATH = join(process.cwd(), '.env');
const ENV_BACKUP_DIR = join(process.cwd(), '.memory/environment/backups');

// Load .env file if it exists (needed for restore and other commands)
if (existsSync(ENV_FILE_PATH)) {
  dotenv.config({ path: ENV_FILE_PATH });
}

// Categorize environment variables
const CATEGORIES = {
  SECRET: ['KEY', 'SECRET', 'PASSWORD', 'PRIVATE', 'TOKEN', 'AUTH', 'CREDENTIAL'],
  API: ['API_KEY', 'API_URL', 'ENDPOINT'],
  DATABASE: ['DATABASE', 'POSTGRES', 'REDIS', 'SUPABASE', 'TIMESCALEDB'],
  BLOCKCHAIN: ['RPC', 'CHAIN', 'WALLET', 'CONTRACT', 'ETHERSCAN', 'INFURA', 'ALCHEMY'],
  SERVICE: ['PORT', 'HOST', 'URL', '_ENABLED'],
  FEATURE_FLAG: ['ENABLE_', 'DISABLE_', 'USE_'],
};

function categorizeVariable(key: string): 'api_key' | 'private_key' | 'password' | 'token' | 'credential' | string {
  const upperKey = key.toUpperCase();
  
  // Check if it's a secret (should be encrypted)
  for (const secretPattern of CATEGORIES.SECRET) {
    if (upperKey.includes(secretPattern)) {
      if (upperKey.includes('PRIVATE_KEY')) return 'private_key';
      if (upperKey.includes('PASSWORD')) return 'password';
      if (upperKey.includes('TOKEN')) return 'token';
      if (upperKey.includes('API_KEY')) return 'api_key';
      return 'credential';
    }
  }
  
  // Check other categories
  if (CATEGORIES.API.some(p => upperKey.includes(p))) return 'api';
  if (CATEGORIES.DATABASE.some(p => upperKey.includes(p))) return 'database';
  if (CATEGORIES.BLOCKCHAIN.some(p => upperKey.includes(p))) return 'blockchain';
  if (CATEGORIES.SERVICE.some(p => upperKey.includes(p))) return 'service';
  if (CATEGORIES.FEATURE_FLAG.some(p => upperKey.includes(p))) return 'feature_flag';
  
  return 'string';
}

function isSecret(key: string): boolean {
  const upperKey = key.toUpperCase();
  return CATEGORIES.SECRET.some(pattern => upperKey.includes(pattern));
}

async function syncToSupabase() {
  console.log('🔄 Syncing .env to Supabase...\n');
  
  // Check if .env exists
  if (!existsSync(ENV_FILE_PATH)) {
    console.error('❌ Error: .env file not found!');
    console.log('   Expected location:', ENV_FILE_PATH);
    process.exit(1);
  }
  
  // Load .env file
  const envConfig = dotenv.config({ path: ENV_FILE_PATH });
  if (envConfig.error) {
    console.error('❌ Error loading .env file:', envConfig.error.message);
    process.exit(1);
  }
  
  // Initialize Supabase storage
  const storage = new SupabaseEnvStorage({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
    encryptionKey: process.env.SECRETS_ENCRYPTION_KEY,
  });
  
  console.log('✅ Connected to Supabase');
  console.log('📊 Processing environment variables...\n');
  
  let configCount = 0;
  let secretCount = 0;
  let errorCount = 0;
  
  const envVars = envConfig.parsed || {};
  const totalVars = Object.keys(envVars).length;
  
  for (const [key, value] of Object.entries(envVars)) {
    try {
      const category = categorizeVariable(key);
      const isSecretVar = isSecret(key);
      
      if (isSecretVar) {
        // Store as encrypted secret
        await storage.setSecret(key, value, undefined, {
          category: category as any,
          description: `Auto-synced from .env - ${new Date().toISOString()}`,
        });
        secretCount++;
        console.log(`🔐 Stored secret: ${key} (${category})`);
      } else {
        // Store as regular config
        await storage.setConfig(key, value, {
          category: category as any,
          description: `Auto-synced from .env - ${new Date().toISOString()}`,
          value_type: inferValueType(value),
        });
        configCount++;
        console.log(`📝 Stored config: ${key} (${category})`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error storing ${key}:`, error instanceof Error ? error.message : String(error));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Sync Complete!\n');
  console.log(`📊 Statistics:`);
  console.log(`   Total variables:     ${totalVars}`);
  console.log(`   Configs stored:      ${configCount}`);
  console.log(`   Secrets stored:      ${secretCount}`);
  console.log(`   Errors:              ${errorCount}`);
  console.log('='.repeat(60));
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some variables failed to sync. Check errors above.');
    process.exit(1);
  }
}

async function restoreFromSupabase() {
  console.log('🔄 Restoring .env from Supabase...\n');
  
  const storage = new SupabaseEnvStorage({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
    encryptionKey: process.env.SECRETS_ENCRYPTION_KEY,
  });
  
  console.log('✅ Connected to Supabase');
  console.log('📥 Downloading environment variables...\n');
  
  // Export to .env format
  const envContent = await storage.exportToEnvFormat();
  
  // Backup existing .env if it exists
  if (existsSync(ENV_FILE_PATH)) {
    const backupPath = `${ENV_FILE_PATH}.backup.${Date.now()}`;
    const currentEnv = readFileSync(ENV_FILE_PATH, 'utf-8');
    writeFileSync(backupPath, currentEnv);
    console.log(`💾 Backed up existing .env to: ${backupPath}\n`);
  }
  
  // Write new .env
  writeFileSync(ENV_FILE_PATH, envContent);
  
  console.log('✅ .env file restored successfully!');
  console.log('📍 Location:', ENV_FILE_PATH);
  console.log('\n⚠️  Remember to restart any running processes to pick up the new configuration.');
}

async function createBackup() {
  console.log('💾 Creating backup of environment configuration...\n');
  
  if (!existsSync(ENV_FILE_PATH)) {
    console.error('❌ Error: .env file not found!');
    process.exit(1);
  }
  
  // Create backup directory if it doesn't exist
  const fs = await import('fs/promises');
  await fs.mkdir(ENV_BACKUP_DIR, { recursive: true });
  
  // Create timestamped backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(ENV_BACKUP_DIR, `env_backup_${timestamp}.env`);
  
  const envContent = readFileSync(ENV_FILE_PATH, 'utf-8');
  writeFileSync(backupPath, envContent);
  
  console.log('✅ Backup created successfully!');
  console.log('📍 Location:', backupPath);
  
  // Also sync to Supabase for cloud backup
  const storage = new SupabaseEnvStorage({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
    encryptionKey: process.env.SECRETS_ENCRYPTION_KEY,
  });
  
  console.log('\n🔄 Syncing backup to Supabase...');
  await syncToSupabase();
}

async function listConfigs() {
  console.log('📋 Listing environment configuration from Supabase...\n');
  
  const storage = new SupabaseEnvStorage({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
    encryptionKey: process.env.SECRETS_ENCRYPTION_KEY,
  });
  
  console.log('✅ Connected to Supabase\n');
  
  // Get all configs
  const configs = await storage.getAllConfigs();
  const secrets = await storage.getAllSecrets();
  
  console.log('📝 Non-Sensitive Configurations:');
  console.log('='.repeat(60));
  
  const configsByCategory: Record<string, typeof configs> = {};
  for (const config of configs) {
    const cat = config.category || 'other';
    if (!configsByCategory[cat]) configsByCategory[cat] = [];
    configsByCategory[cat].push(config);
  }
  
  for (const [category, items] of Object.entries(configsByCategory)) {
    console.log(`\n${category.toUpperCase()}:`);
    for (const item of items) {
      console.log(`  ${item.config_name} = ${item.config_value.substring(0, 50)}${item.config_value.length > 50 ? '...' : ''}`);
    }
  }
  
  console.log('\n\n🔐 Secrets (Encrypted):');
  console.log('='.repeat(60));
  
  const secretsByCategory: Record<string, typeof secrets> = {};
  for (const secret of secrets) {
    const cat = secret.category || 'other';
    if (!secretsByCategory[cat]) secretsByCategory[cat] = [];
    secretsByCategory[cat].push(secret);
  }
  
  for (const [category, items] of Object.entries(secretsByCategory)) {
    console.log(`\n${category.toUpperCase()}:`);
    for (const item of items) {
      console.log(`  ${item.secret_name} = [ENCRYPTED]`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Total: ${configs.length} configs, ${secrets.length} secrets`);
  console.log('='.repeat(60));
}

function inferValueType(value: string): 'string' | 'number' | 'boolean' | 'json' | 'url' {
  if (value === 'true' || value === 'false') return 'boolean';
  if (value.trim() !== '' && !isNaN(Number(value)) && !isNaN(parseFloat(value))) return 'number';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('wss://')) return 'url';
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      JSON.parse(value);
      return 'json';
    } catch {
      return 'string';
    }
  }
  return 'string';
}

// Main execution
const command = process.argv[2] || 'sync';

(async () => {
  try {
    switch (command) {
      case 'sync':
        await syncToSupabase();
        break;
      case 'restore':
        await restoreFromSupabase();
        break;
      case 'backup':
        await createBackup();
        break;
      case 'list':
        await listConfigs();
        break;
      default:
        console.log('Usage: npm run env:sync [command]');
        console.log('\nCommands:');
        console.log('  sync     - Sync .env to Supabase (default)');
        console.log('  restore  - Restore .env from Supabase');
        console.log('  backup   - Create timestamped backup');
        console.log('  list     - List all stored configs');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
})();
