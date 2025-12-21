#!/usr/bin/env node
/**
 * Attacker Address Analyzer
 * 
 * Analyzes the address that stole ETH from TheWarden wallet
 * Provides insights into attacker behavior and transaction patterns
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration
const ATTACKER_ADDRESS = '0xac49c575454b9cb91890a89bef3589a270ad2ad1';
const BASE_CHAIN_ID = 8453;

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

async function analyzeAttacker() {
  console.log(colorize('\n═══════════════════════════════════════════════════', 'red'));
  console.log(colorize('    🚨 ATTACKER ADDRESS ANALYSIS', 'bright'));
  console.log(colorize('═══════════════════════════════════════════════════\n', 'red'));

  try {
    const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_RPC_URL_BACKUP || 'https://mainnet.base.org';
    
    console.log(colorize('🔌 Connecting to Base Network...', 'blue'));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify network
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      console.log(colorize(`⚠️  WARNING: Connected to chain ${network.chainId}, expected Base (8453)`, 'yellow'));
    } else {
      console.log(colorize('✅ Connected to Base Network (Chain ID: 8453)\n', 'green'));
    }

    // Attacker Information
    console.log(colorize('👤 ATTACKER INFORMATION', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`Address:     ${colorize(ATTACKER_ADDRESS, 'red')}`);
    console.log(`BaseScan:    ${colorize(`https://basescan.org/address/${ATTACKER_ADDRESS}`, 'blue')}`);

    // Get attacker's balance
    const balance = await provider.getBalance(ATTACKER_ADDRESS);
    const balanceEth = parseFloat(ethers.formatEther(balance));
    const balanceUsd = balanceEth * 2700; // Approximate

    console.log(colorize('\n💰 ATTACKER CURRENT BALANCE', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`Balance:     ${colorize(balanceEth.toFixed(6) + ' ETH', 'bright')}`);
    console.log(`USD Value:   ${colorize('$' + balanceUsd.toFixed(2) + ' USD', 'bright')} (approx)`);

    if (balanceEth === 0) {
      console.log(colorize('\n⚠️  Attacker wallet is now empty (funds moved)', 'yellow'));
    } else if (balanceEth > 0) {
      console.log(colorize('\n⚠️  Attacker still has funds in this address', 'yellow'));
    }

    // Get transaction count
    const txCount = await provider.getTransactionCount(ATTACKER_ADDRESS);
    console.log(colorize('\n📊 TRANSACTION ACTIVITY', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`Total TXs:   ${colorize(txCount.toString(), 'bright')} transactions`);

    if (txCount === 0) {
      console.log(colorize('⚠️  New address with no outgoing transactions', 'yellow'));
    } else if (txCount < 10) {
      console.log(colorize('⚠️  Low activity address (possibly burner wallet)', 'yellow'));
    } else {
      console.log(colorize('⚠️  Active address with multiple transactions', 'yellow'));
    }

    // Analysis
    console.log(colorize('\n🔍 BEHAVIORAL ANALYSIS', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));

    const analysis = [];

    if (balanceEth === 0 && txCount > 0) {
      analysis.push('• Funds already moved (likely to another address or mixer)');
      analysis.push('• Attacker has exfiltrated stolen funds');
    } else if (balanceEth > 0) {
      analysis.push('• Funds still in attacker wallet');
      analysis.push('• May still be planning next move');
    }

    if (txCount < 5) {
      analysis.push('• Low transaction count suggests burner wallet');
      analysis.push('• May be part of larger operation');
    } else {
      analysis.push('• Higher transaction count suggests active wallet');
      analysis.push('• May be identifiable through transaction patterns');
    }

    analysis.forEach(line => console.log(colorize(line, 'yellow')));

    // Next Steps
    console.log(colorize('\n🎯 RECOMMENDED ACTIONS', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));

    console.log(colorize('1. Investigation:', 'bright'));
    console.log('   • Visit BaseScan link above');
    console.log('   • Review all transactions to/from this address');
    console.log('   • Check if address is flagged by BaseScan');
    console.log('   • Trace where stolen funds were sent');

    console.log(colorize('\n2. Security:', 'bright'));
    console.log('   • Generate NEW wallet immediately');
    console.log('   • Do NOT reuse compromised private key');
    console.log('   • Review how private key was exposed');
    console.log('   • Implement Supabase Vault for secrets');

    console.log(colorize('\n3. Recovery:', 'bright'));
    console.log('   • Update .env with new wallet');
    console.log('   • Fund new wallet (start with 0.001 ETH test)');
    console.log('   • Monitor new wallet closely for 24 hours');
    console.log('   • If secure, add operational funds');

    console.log(colorize('\n4. Prevention:', 'bright'));
    console.log('   • Use hardware wallet for production');
    console.log('   • Enable multi-sig for larger amounts');
    console.log('   • Set up real-time balance alerts');
    console.log('   • Rotate keys regularly');

    // Victim Wallet Check
    if (process.env.WALLET_PRIVATE_KEY && process.env.WALLET_PRIVATE_KEY !== '0xYOUR_PRIVATE_KEY_HERE_64_HEX_CHARACTERS_REQUIRED') {
      console.log(colorize('\n⚠️  VICTIM WALLET STATUS', 'red'));
      console.log(colorize('─────────────────────────────────────────────────\n', 'red'));
      
      const victimWallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
      const victimBalance = await provider.getBalance(victimWallet.address);
      const victimBalanceEth = parseFloat(ethers.formatEther(victimBalance));

      console.log(`Victim Address:  ${colorize(victimWallet.address, 'yellow')}`);
      console.log(`Current Balance: ${colorize(victimBalanceEth.toFixed(6) + ' ETH', 'bright')}`);

      if (victimBalanceEth === 0) {
        console.log(colorize('\n❌ CONFIRMED: Wallet is completely drained', 'red'));
        console.log(colorize('\n🚨 CRITICAL: Generate new wallet immediately!', 'red'));
        console.log(colorize('   This private key is PERMANENTLY COMPROMISED', 'red'));
        console.log(colorize('   DO NOT add more funds to this address', 'red'));
      } else {
        console.log(colorize('\n⚠️  Wallet still has some balance', 'yellow'));
        console.log(colorize('   Consider if this wallet is still secure', 'yellow'));
      }
    }

    // Links
    console.log(colorize('\n🔗 USEFUL LINKS', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`BaseScan (Attacker): ${colorize(`https://basescan.org/address/${ATTACKER_ADDRESS}`, 'blue')}`);
    console.log(`Transaction History:  ${colorize(`https://basescan.org/txs?a=${ATTACKER_ADDRESS}`, 'blue')}`);
    console.log(`Internal TXs:        ${colorize(`https://basescan.org/txsInternal?a=${ATTACKER_ADDRESS}`, 'blue')}`);
    console.log(`Token Transfers:     ${colorize(`https://basescan.org/tokentxns?a=${ATTACKER_ADDRESS}`, 'blue')}`);

    console.log(colorize('\n═══════════════════════════════════════════════════', 'red'));
    console.log(colorize('⚠️  SECURITY INCIDENT CONFIRMED', 'red'));
    console.log(colorize('\nNext steps:', 'cyan'));
    console.log('   1. Review SECURITY_INCIDENT_REPORT.md');
    console.log('   2. Generate new secure wallet');
    console.log('   3. Update configuration');
    console.log('   4. Fund new wallet (test with 0.001 ETH first)');
    console.log(colorize('═══════════════════════════════════════════════════\n', 'red'));

  } catch (error) {
    console.log(colorize('\n❌ ERROR:', 'red'));
    if (error instanceof Error) {
      console.log(colorize(error.message, 'red'));
    }
    process.exit(1);
  }
}

// Run the analysis
analyzeAttacker().catch(error => {
  console.error(colorize('\n❌ Unexpected error:', 'red'), error);
  process.exit(1);
});
