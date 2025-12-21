#!/usr/bin/env node
/**
 * Etherscan API Examples
 * 
 * Demonstrates usage of the Etherscan SDK
 */

import { createEtherscanClient } from '../../src/intelligence/etherscan';

// Example addresses for demonstration
const VITALIK_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const USDC_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

async function runExamples() {
  console.log('🔍 Etherscan API Examples\n');
  
  // Check for API key
  if (!process.env.ETHERSCAN_API_KEY) {
    console.error('❌ ETHERSCAN_API_KEY not found in environment');
    console.log('  Add to .env: ETHERSCAN_API_KEY=your_key_here');
    process.exit(1);
  }

  const client = createEtherscanClient({
    apiKey: process.env.ETHERSCAN_API_KEY!,
    chain: 'ethereum'
  });

  try {
    // Example 1: Get Account Balance
    console.log('📊 Example 1: Account Balance');
    console.log('================================');
    const balance = await client.account.getBalance(VITALIK_ADDRESS);
    const ethBalance = (Number(balance) / 1e18).toFixed(4);
    console.log(`Vitalik's balance: ${ethBalance} ETH`);
    console.log(`Raw wei: ${balance}\n`);

    // Example 2: Get Recent Transactions
    console.log('📜 Example 2: Recent Transactions');
    console.log('==================================');
    const txs = await client.account.getTransactions(VITALIK_ADDRESS, {
      page: 1,
      offset: 5,
      sort: 'desc'
    });
    console.log(`Found ${txs.length} recent transactions:`);
    txs.slice(0, 3).forEach((tx: any, i: number) => {
      console.log(`  ${i + 1}. Hash: ${tx.hash.slice(0, 20)}...`);
      console.log(`     Block: ${tx.blockNumber}`);
      console.log(`     Value: ${(Number(tx.value) / 1e18).toFixed(4)} ETH\n`);
    });

    // Example 3: Get Contract ABI
    console.log('📋 Example 3: Contract ABI');
    console.log('===========================');
    const abi = await client.contract.getABI(UNISWAP_V3_ROUTER);
    const parsedAbi = JSON.parse(abi);
    console.log(`Uniswap V3 Router ABI:`);
    console.log(`  Functions: ${parsedAbi.filter((item: any) => item.type === 'function').length}`);
    console.log(`  Events: ${parsedAbi.filter((item: any) => item.type === 'event').length}`);
    console.log(`  Sample function: ${parsedAbi.find((item: any) => item.type === 'function')?.name}\n`);

    // Example 4: Check Contract Verification
    console.log('✅ Example 4: Contract Verification');
    console.log('====================================');
    const sourceCode = await client.contract.getSourceCode(USDC_CONTRACT);
    const contractInfo = sourceCode[0];
    console.log(`USDC Contract Info:`);
    console.log(`  Name: ${contractInfo.ContractName}`);
    console.log(`  Compiler: ${contractInfo.CompilerVersion}`);
    console.log(`  Optimization: ${contractInfo.OptimizationUsed === '1' ? 'Yes' : 'No'}`);
    console.log(`  License: ${contractInfo.LicenseType}`);
    console.log(`  Verified: ${contractInfo.SourceCode ? '✅ Yes' : '❌ No'}\n`);

    // Example 5: Gas Oracle
    console.log('⛽ Example 5: Gas Prices');
    console.log('========================');
    const gasOracle = await client.gas.getOracle();
    console.log(`Current gas recommendations:`);
    console.log(`  🐌 Safe/Slow: ${gasOracle.SafeGasPrice} gwei`);
    console.log(`  🚶 Normal: ${gasOracle.ProposeGasPrice} gwei`);
    console.log(`  🏃 Fast: ${gasOracle.FastGasPrice} gwei`);
    console.log(`  📊 Base Fee: ${gasOracle.suggestBaseFee} gwei\n`);

    // Example 6: ETH Price
    console.log('💰 Example 6: ETH Price');
    console.log('=======================');
    const price = await client.stats.getEthPrice();
    console.log(`Current ETH price:`);
    console.log(`  USD: $${Number(price.ethusd).toLocaleString()}`);
    console.log(`  BTC: ₿${price.ethbtc}\n`);

    // Example 7: Token Holders
    console.log('👥 Example 7: Token Holders');
    console.log('============================');
    const holders = await client.token.getHolders(USDC_CONTRACT, 1, 5);
    console.log(`Top USDC holders:`);
    holders.forEach((holder: any, i: number) => {
      const balance = (Number(holder.TokenHolderQuantity) / 1e6).toLocaleString();
      console.log(`  ${i + 1}. ${holder.TokenHolderAddress.slice(0, 10)}...`);
      console.log(`     Balance: ${balance} USDC\n`);
    });

    // Example 8: Latest Block
    console.log('🔢 Example 8: Latest Block');
    console.log('===========================');
    const blockNumber = await client.proxy.eth_blockNumber();
    const blockNumberDec = parseInt(blockNumber, 16);
    console.log(`Latest block: ${blockNumberDec.toLocaleString()}`);
    console.log(`Hex: ${blockNumber}\n`);

    console.log('✅ All examples completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Error running examples:', error.message);
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Make sure your ETHERSCAN_API_KEY is correct');
    } else if (error.message.includes('rate limit')) {
      console.log('\n💡 Rate limit exceeded - wait a moment and try again');
    }
    process.exit(1);
  }
}

// Run examples
runExamples().catch(console.error);
