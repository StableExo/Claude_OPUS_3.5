#!/usr/bin/env node
/**
 * Wallet Balance Checker for Base Network
 * 
 * Checks if wallet has sufficient ETH for gas on Base network
 * Provides funding recommendations and estimates transaction capacity
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
const BASE_CHAIN_ID = 8453;
const AVG_GAS_PER_TX = 0.000001; // Average gas cost per transaction on Base
const ETH_PRICE_USD = 2700; // Approximate ETH price

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

async function checkWalletBalance() {
  console.log(colorize('\n═══════════════════════════════════════════════════', 'cyan'));
  console.log(colorize('    WALLET BALANCE CHECKER - BASE NETWORK', 'bright'));
  console.log(colorize('═══════════════════════════════════════════════════\n', 'cyan'));

  try {
    // Validate environment variables
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL || process.env.BASE_RPC_URL_BACKUP || 'https://mainnet.base.org';

    if (!privateKey || privateKey === '0xYOUR_PRIVATE_KEY_HERE_64_HEX_CHARACTERS_REQUIRED') {
      console.log(colorize('❌ ERROR: WALLET_PRIVATE_KEY not configured in .env', 'red'));
      console.log(colorize('\nPlease set your wallet private key in .env file:', 'yellow'));
      console.log('   WALLET_PRIVATE_KEY=0x...\n');
      process.exit(1);
    }

    // Create provider and wallet
    console.log(colorize('🔌 Connecting to Base Network...', 'blue'));
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Verify network
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== BASE_CHAIN_ID) {
      console.log(colorize(`⚠️  WARNING: Connected to chain ${network.chainId}, expected Base (8453)`, 'yellow'));
    } else {
      console.log(colorize('✅ Connected to Base Network (Chain ID: 8453)', 'green'));
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Get wallet info
    const address = wallet.address;
    const balance = await provider.getBalance(address);
    const balanceEth = parseFloat(ethers.formatEther(balance));
    const balanceUsd = balanceEth * ETH_PRICE_USD;
    const estimatedTxs = Math.floor(balanceEth / AVG_GAS_PER_TX);

    // Display wallet information
    console.log(colorize('\n📊 WALLET INFORMATION', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`Address:     ${colorize(address, 'bright')}`);
    console.log(`Balance:     ${colorize(balanceEth.toFixed(6) + ' ETH', 'bright')}`);
    console.log(`USD Value:   ${colorize('$' + balanceUsd.toFixed(2) + ' USD', 'bright')} (approx @ $${ETH_PRICE_USD}/ETH)`);
    console.log(`Capacity:    ${colorize(estimatedTxs.toLocaleString() + ' transactions', 'bright')} (estimated)`);

    // Funding status
    console.log(colorize('\n💰 FUNDING STATUS', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));

    if (balanceEth === 0) {
      console.log(colorize('❌ INSUFFICIENT FUNDS', 'red'));
      console.log(colorize('   Wallet has ZERO balance on Base network', 'red'));
      console.log(colorize('\n📋 REQUIRED ACTIONS:', 'yellow'));
      console.log('   1. Fund wallet with at least 0.001 ETH on Base network');
      console.log('   2. See WALLET_FUNDING_GUIDE.md for instructions');
      console.log('   3. Re-run this script after funding');
      console.log(colorize('\n💡 TIP: Base has very cheap gas (~$0.003/tx)', 'yellow'));
    } else if (balanceEth < 0.001) {
      console.log(colorize('⚠️  LOW BALANCE', 'yellow'));
      console.log(colorize(`   ${balanceEth.toFixed(6)} ETH is below recommended minimum`, 'yellow'));
      console.log(colorize('\n📋 RECOMMENDATIONS:', 'yellow'));
      console.log('   • Minimum: 0.001 ETH for 3-5 days of operation');
      console.log('   • Recommended: 0.01 ETH for 3-4 weeks');
      console.log('   • Optimal: 0.03 ETH for 2-3 months');
      console.log(colorize('\n✅ Can proceed with limited operation', 'green'));
    } else if (balanceEth < 0.01) {
      console.log(colorize('✅ ADEQUATE FUNDING', 'green'));
      console.log(`   ${balanceEth.toFixed(6)} ETH is sufficient for operation`);
      console.log(colorize('\n📊 ESTIMATED RUNTIME:', 'cyan'));
      const days = Math.floor(estimatedTxs / 20); // Assuming 20 tx/day
      console.log(`   ~${days} days at 20 transactions/day`);
      console.log(colorize('\n💡 SUGGESTION: Consider adding 0.01 ETH for extended operation', 'yellow'));
    } else {
      console.log(colorize('✅ EXCELLENT FUNDING', 'green'));
      console.log(`   ${balanceEth.toFixed(6)} ETH provides extended operation capacity`);
      console.log(colorize('\n📊 ESTIMATED RUNTIME:', 'cyan'));
      const months = Math.floor(estimatedTxs / 600); // Assuming 20 tx/day
      console.log(`   ~${months} months at 20 transactions/day`);
      console.log(colorize('\n✅ Ready for autonomous long-term operation!', 'green'));
    }

    // Gas price check
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || 0n;
    const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice, 'gwei'));
    
    console.log(colorize('\n⛽ CURRENT GAS PRICES', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));
    console.log(`Gas Price:   ${colorize(gasPriceGwei.toFixed(4) + ' Gwei', 'bright')}`);
    console.log(`Est. TX Cost: ${colorize(AVG_GAS_PER_TX.toFixed(6) + ' ETH', 'bright')} (~$${(AVG_GAS_PER_TX * ETH_PRICE_USD).toFixed(3)})`);

    // Operation readiness
    console.log(colorize('\n🚀 OPERATION READINESS', 'cyan'));
    console.log(colorize('─────────────────────────────────────────────────\n', 'cyan'));

    const checks = [
      { name: 'Wallet Configured', pass: true },
      { name: 'Network Connected', pass: Number(network.chainId) === BASE_CHAIN_ID },
      { name: 'Sufficient Gas', pass: balanceEth >= 0.001 },
      { name: 'Optimal Balance', pass: balanceEth >= 0.01 },
    ];

    checks.forEach(check => {
      const symbol = check.pass ? '✅' : '❌';
      const color = check.pass ? 'green' : 'red';
      console.log(`${symbol} ${colorize(check.name, color)}`);
    });

    const allPassed = checks.filter(c => c.name !== 'Optimal Balance').every(c => c.pass);
    
    console.log(colorize('\n═══════════════════════════════════════════════════', 'cyan'));
    if (allPassed) {
      console.log(colorize('✅ READY TO LAUNCH Phase 1 Action 2!', 'green'));
      console.log(colorize('\nNext steps:', 'cyan'));
      console.log('   node --import tsx scripts/implementation/phase1-action2-base-launch.ts');
    } else {
      console.log(colorize('⚠️  NOT READY - See recommendations above', 'yellow'));
      console.log(colorize('\nNext steps:', 'cyan'));
      console.log('   1. Review WALLET_FUNDING_GUIDE.md');
      console.log('   2. Fund wallet on Base network');
      console.log('   3. Re-run this script');
    }
    console.log(colorize('═══════════════════════════════════════════════════\n', 'cyan'));

  } catch (error) {
    console.log(colorize('\n❌ ERROR:', 'red'));
    if (error instanceof Error) {
      console.log(colorize(error.message, 'red'));
      if (error.message.includes('could not detect network')) {
        console.log(colorize('\n💡 TIP: Check your RPC endpoint in .env (BASE_RPC_URL)', 'yellow'));
      }
    }
    process.exit(1);
  }
}

// Run the check
checkWalletBalance().catch(error => {
  console.error(colorize('\n❌ Unexpected error:', 'red'), error);
  process.exit(1);
});
