#!/usr/bin/env node
/**
 * Deep investigation of the Ethereum contract
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = '0x84db6eE82b7Cf3b47E8F19270abdE5718B936670';
const ETHEREUM_RPC = process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/3wG3PLWyPu2DliGQLVa8G';

async function investigate() {
  console.log('🔍 Deep Investigation of Contract\n');
  console.log('═══════════════════════════════════════════════════\n');
  
  const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC);
  
  // Get more details
  const code = await provider.getCode(CONTRACT_ADDRESS);
  const balance = await provider.getBalance(CONTRACT_ADDRESS);
  
  console.log('📍 Contract Address:', CONTRACT_ADDRESS);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH (~$71k+ locked)');
  console.log('📦 Code Length:', code.length, 'bytes');
  console.log('🔗 Etherscan:', `https://etherscan.io/address/${CONTRACT_ADDRESS}`);
  
  // Analyze bytecode patterns
  console.log('\n🔬 Bytecode Analysis:');
  if (code.includes('1967')) {
    console.log('  ✅ Possible EIP-1967 proxy pattern detected');
  }
  if (code.includes('a9059cbb')) {
    console.log('  ✅ Contains transfer() selector - might be token-related');
  }
  if (code.includes('70a08231')) {
    console.log('  ✅ Contains balanceOf() selector');
  }
  
  // Try common ERC20 function calls
  console.log('\n🧪 Testing Common Function Signatures:');
  
  const tests = [
    { name: 'totalSupply()', selector: '0x18160ddd' },
    { name: 'balanceOf(address)', selector: '0x70a08231' },
    { name: 'decimals()', selector: '0x313ce567' },
    { name: 'symbol()', selector: '0x95d89b41' },
    { name: 'name()', selector: '0x06fdde03' },
  ];
  
  for (const test of tests) {
    try {
      const result = await provider.call({
        to: CONTRACT_ADDRESS,
        data: test.selector + '0'.repeat(64)
      });
      
      if (result !== '0x' && result.length > 2) {
        console.log(`  ✅ ${test.name}: ${result.substring(0, 66)}...`);
        
        // Try to decode
        if (test.name === 'totalSupply()' || test.name === 'balanceOf(address)') {
          const decoded = ethers.toBigInt(result);
          console.log(`     Decoded: ${decoded.toString()}`);
        } else if (test.name === 'decimals()') {
          const decimals = parseInt(result, 16);
          console.log(`     Decimals: ${decimals}`);
        } else if (test.name === 'symbol()' || test.name === 'name()') {
          try {
            const text = ethers.toUtf8String(result);
            console.log(`     Text: ${text}`);
          } catch {
            console.log(`     (Unable to decode as string)`);
          }
        }
      }
    } catch (e: any) {
      console.log(`  ❌ ${test.name}: ${e.message.substring(0, 50)}`);
    }
  }
  
  // Get recent activity
  console.log('\n📊 Recent Activity:');
  try {
    const currentBlock = await provider.getBlockNumber();
    console.log(`  Current block: ${currentBlock.toLocaleString()}`);
    
    // Note: We can't easily get transaction count without archive node
    console.log('  (Transaction history requires archive node or Etherscan API)');
  } catch (e) {
    console.log('  ❌ Could not fetch block info');
  }
  
  console.log('\n💡 Next Steps:');
  console.log('  1. Visit Etherscan link above to see contract details');
  console.log('  2. Check if it\'s a token, bridge, or other contract type');
  console.log('  3. Look for "Read Contract" tab to see functions');
  console.log('  4. Check "Events" tab for recent activity');
  console.log('  5. See if there\'s a Base deployment by the same team');
  
  console.log('\n🌉 Cross-Chain Options:');
  console.log('  ❌ No contract on Base at same address');
  console.log('  💡 Would need to use Ethereum RPC to interact');
  console.log('  💡 OR use official Base bridge if it\'s an asset');
  console.log('  💡 OR check if protocol has a Base deployment');
}

investigate().catch(console.error);
