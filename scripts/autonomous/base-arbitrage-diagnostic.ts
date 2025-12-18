/**
 * Base Network Arbitrage Diagnostic
 * 
 * Comprehensive assessment of current state and readiness
 * for autonomous money-making on Base network
 */

import { JsonRpcProvider, formatEther, formatUnits } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

interface DiagnosticResult {
  category: string;
  status: 'READY' | 'MISSING' | 'NEEDS_CONFIG' | 'ERROR';
  message: string;
  action?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

class BaseArbitrageDiagnostic {
  private results: DiagnosticResult[] = [];
  
  async run(): Promise<void> {
    console.log('=== Base Network Arbitrage Diagnostic ===\n');
    console.log('Checking readiness for first profitable trade...\n');
    
    // 1. Environment Configuration
    await this.checkEnvironment();
    
    // 2. Network Connectivity
    await this.checkNetworkConnectivity();
    
    // 3. Contract Deployment
    await this.checkContracts();
    
    // 4. Pool Configuration
    await this.checkPools();
    
    // 5. Wallet & Funds
    await this.checkWallet();
    
    // 6. Code Infrastructure
    await this.checkCodeInfrastructure();
    
    // 7. Print Summary
    this.printSummary();
    
    // 8. Generate Action Plan
    this.generateActionPlan();
  }
  
  private async checkEnvironment(): Promise<void> {
    console.log('📋 Checking Environment Configuration...\n');
    
    const envPath = path.join(process.cwd(), '.env');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    // Check if .env exists
    if (!fs.existsSync(envPath)) {
      this.results.push({
        category: 'Environment',
        status: 'MISSING',
        message: '.env file does not exist',
        action: `Copy .env.example to .env and configure: cp .env.example .env`,
        priority: 'CRITICAL'
      });
    } else {
      this.results.push({
        category: 'Environment',
        status: 'READY',
        message: '.env file exists',
        priority: 'LOW'
      });
      
      // Check key environment variables
      const requiredVars = [
        'BASE_RPC_URL',
        'WALLET_PRIVATE_KEY',
        'FLASHSWAP_V2_ADDRESS',
        'CHAIN_ID'
      ];
      
      for (const varName of requiredVars) {
        const value = process.env[varName];
        if (!value || value.includes('YOUR_') || value.includes('0xYOUR')) {
          this.results.push({
            category: 'Environment',
            status: 'NEEDS_CONFIG',
            message: `${varName} is not configured`,
            action: `Set ${varName} in .env file`,
            priority: 'CRITICAL'
          });
        } else {
          const maskedValue = varName.includes('KEY') || varName.includes('PRIVATE')
            ? '***REDACTED***'
            : value.substring(0, 20) + '...';
          this.results.push({
            category: 'Environment',
            status: 'READY',
            message: `${varName} is configured: ${maskedValue}`,
            priority: 'LOW'
          });
        }
      }
    }
  }
  
  private async checkNetworkConnectivity(): Promise<void> {
    console.log('\n🌐 Checking Network Connectivity...\n');
    
    const rpcUrl = process.env.BASE_RPC_URL;
    
    if (!rpcUrl || rpcUrl.includes('YOUR_')) {
      this.results.push({
        category: 'Network',
        status: 'NEEDS_CONFIG',
        message: 'BASE_RPC_URL not configured',
        action: 'Get RPC URL from Alchemy, Infura, or use public endpoint',
        priority: 'CRITICAL'
      });
      return;
    }
    
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      
      // Test connection
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getFeeData();
      
      this.results.push({
        category: 'Network',
        status: 'READY',
        message: `Connected to Base (Chain ID: ${network.chainId}, Block: ${blockNumber})`,
        priority: 'LOW'
      });
      
      this.results.push({
        category: 'Network',
        status: 'READY',
        message: `Gas Price: ${formatUnits(gasPrice.gasPrice || 0n, 'gwei')} Gwei (Base is cheap! 🎉)`,
        priority: 'LOW'
      });
      
      if (Number(network.chainId) !== 8453) {
        this.results.push({
          category: 'Network',
          status: 'ERROR',
          message: `Wrong network! Expected Base (8453), got ${network.chainId}`,
          action: 'Update BASE_RPC_URL to point to Base mainnet',
          priority: 'CRITICAL'
        });
      }
      
    } catch (error: any) {
      this.results.push({
        category: 'Network',
        status: 'ERROR',
        message: `Cannot connect to Base network: ${error.message}`,
        action: 'Check RPC URL and network connectivity',
        priority: 'CRITICAL'
      });
    }
  }
  
  private async checkContracts(): Promise<void> {
    console.log('\n📜 Checking Smart Contracts...\n');
    
    const flashSwapAddress = process.env.FLASHSWAP_V2_ADDRESS;
    const rpcUrl = process.env.BASE_RPC_URL;
    
    if (!flashSwapAddress || flashSwapAddress.includes('YOUR_')) {
      this.results.push({
        category: 'Contracts',
        status: 'MISSING',
        message: 'FlashSwapV2 contract not deployed',
        action: 'Deploy contract using: npm run deploy:flashswapv2',
        priority: 'CRITICAL'
      });
      return;
    }
    
    if (!rpcUrl || rpcUrl.includes('YOUR_')) {
      return; // Already reported in network check
    }
    
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const code = await provider.getCode(flashSwapAddress);
      
      if (code === '0x') {
        this.results.push({
          category: 'Contracts',
          status: 'ERROR',
          message: `No contract found at ${flashSwapAddress}`,
          action: 'Redeploy FlashSwapV2 contract',
          priority: 'CRITICAL'
        });
      } else {
        this.results.push({
          category: 'Contracts',
          status: 'READY',
          message: `FlashSwapV2 deployed at ${flashSwapAddress}`,
          priority: 'LOW'
        });
      }
    } catch (error: any) {
      this.results.push({
        category: 'Contracts',
        status: 'ERROR',
        message: `Error checking contract: ${error.message}`,
        priority: 'HIGH'
      });
    }
  }
  
  private async checkPools(): Promise<void> {
    console.log('\n💧 Checking Pool Configuration...\n');
    
    const configPath = path.join(process.cwd(), 'configs/strategies/base_weth_usdc.json');
    
    if (!fs.existsSync(configPath)) {
      this.results.push({
        category: 'Pools',
        status: 'MISSING',
        message: 'Pool configuration file not found',
        priority: 'HIGH'
      });
      return;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const pools = config.targetPools || [];
    
    this.results.push({
      category: 'Pools',
      status: 'READY',
      message: `${pools.length} pools configured (${pools.map((p: any) => p.dex).join(', ')})`,
      priority: 'LOW'
    });
    
    // Check pool addresses are real
    const rpcUrl = process.env.BASE_RPC_URL;
    if (rpcUrl && !rpcUrl.includes('YOUR_')) {
      try {
        const provider = new JsonRpcProvider(rpcUrl);
        
        for (const pool of pools.slice(0, 3)) { // Check first 3
          const code = await provider.getCode(pool.address);
          if (code === '0x') {
            this.results.push({
              category: 'Pools',
              status: 'ERROR',
              message: `Pool ${pool.name} has no contract at ${pool.address}`,
              priority: 'HIGH'
            });
          } else {
            this.results.push({
              category: 'Pools',
              status: 'READY',
              message: `✓ ${pool.name} verified on-chain`,
              priority: 'LOW'
            });
          }
        }
      } catch (error: any) {
        console.log(`  Warning: Could not verify pools: ${error.message}`);
      }
    }
  }
  
  private async checkWallet(): Promise<void> {
    console.log('\n💰 Checking Wallet & Funds...\n');
    
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.BASE_RPC_URL;
    
    if (!privateKey || privateKey.includes('YOUR_')) {
      this.results.push({
        category: 'Wallet',
        status: 'NEEDS_CONFIG',
        message: 'Wallet private key not configured',
        action: 'Set WALLET_PRIVATE_KEY in .env',
        priority: 'CRITICAL'
      });
      return;
    }
    
    if (!rpcUrl || rpcUrl.includes('YOUR_')) {
      return;
    }
    
    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const wallet = new (await import('ethers')).Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);
      const balanceEth = parseFloat(formatEther(balance));
      
      this.results.push({
        category: 'Wallet',
        status: 'READY',
        message: `Wallet: ${wallet.address}`,
        priority: 'LOW'
      });
      
      if (balanceEth === 0) {
        this.results.push({
          category: 'Wallet',
          status: 'MISSING',
          message: 'Wallet has ZERO balance - need gas funds!',
          action: 'Send ETH to wallet on Base network (bridge from Ethereum or use exchange)',
          priority: 'CRITICAL'
        });
      } else if (balanceEth < 0.01) {
        this.results.push({
          category: 'Wallet',
          status: 'NEEDS_CONFIG',
          message: `Low balance: ${balanceEth.toFixed(6)} ETH (recommend 0.1+ ETH for safety)`,
          action: 'Add more funds for gas and execution',
          priority: 'HIGH'
        });
      } else {
        this.results.push({
          category: 'Wallet',
          status: 'READY',
          message: `Balance: ${balanceEth.toFixed(6)} ETH ✅`,
          priority: 'LOW'
        });
      }
      
    } catch (error: any) {
      this.results.push({
        category: 'Wallet',
        status: 'ERROR',
        message: `Error checking wallet: ${error.message}`,
        priority: 'CRITICAL'
      });
    }
  }
  
  private async checkCodeInfrastructure(): Promise<void> {
    console.log('\n🏗️ Checking Code Infrastructure...\n');
    
    const criticalFiles = [
      'src/services/BaseArbitrageRunner.ts',
      'src/arbitrage/engines/SpatialArbEngine.ts',
      'src/arbitrage/engines/TriangularArbEngine.ts',
      'src/services/FlashLoanExecutor.ts',
      'src/services/MultiDexPathBuilder.ts',
      'src/services/PoolDataFetcher.ts',
      'contracts/FlashSwapV2.sol'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.results.push({
          category: 'Code',
          status: 'READY',
          message: `✓ ${file}`,
          priority: 'LOW'
        });
      } else {
        this.results.push({
          category: 'Code',
          status: 'MISSING',
          message: `Missing: ${file}`,
          priority: 'HIGH'
        });
      }
    }
  }
  
  private printSummary(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(80) + '\n');
    
    const byStatus = {
      READY: this.results.filter(r => r.status === 'READY'),
      MISSING: this.results.filter(r => r.status === 'MISSING'),
      NEEDS_CONFIG: this.results.filter(r => r.status === 'NEEDS_CONFIG'),
      ERROR: this.results.filter(r => r.status === 'ERROR')
    };
    
    console.log(`✅ READY:        ${byStatus.READY.length} items`);
    console.log(`⚠️  NEEDS CONFIG: ${byStatus.NEEDS_CONFIG.length} items`);
    console.log(`❌ MISSING:      ${byStatus.MISSING.length} items`);
    console.log(`🔥 ERRORS:       ${byStatus.ERROR.length} items`);
    console.log('');
    
    // Show critical issues
    const criticalIssues = this.results.filter(
      r => r.priority === 'CRITICAL' && r.status !== 'READY'
    );
    
    if (criticalIssues.length > 0) {
      console.log('🚨 CRITICAL ISSUES (Must fix before going live):');
      console.log('─'.repeat(80));
      criticalIssues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.category}] ${issue.message}`);
        if (issue.action) {
          console.log(`   → ACTION: ${issue.action}`);
        }
        console.log('');
      });
    }
    
    // Overall readiness
    const readinessScore = (byStatus.READY.length / this.results.length) * 100;
    console.log('─'.repeat(80));
    console.log(`\n📈 Overall Readiness: ${readinessScore.toFixed(1)}%`);
    
    if (criticalIssues.length === 0 && byStatus.ERROR.length === 0) {
      console.log('\n🎉 SYSTEM READY FOR TESTING! 🎉');
      console.log('Next step: Run test on Base Sepolia testnet first');
    } else {
      console.log('\n⚠️  NOT READY - Fix critical issues above first');
    }
  }
  
  private generateActionPlan(): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 ACTION PLAN - Fastest Path to First Profitable Trade');
    console.log('='.repeat(80) + '\n');
    
    const criticalActions = this.results
      .filter(r => r.action && r.priority === 'CRITICAL')
      .map(r => r.action);
    
    const highActions = this.results
      .filter(r => r.action && r.priority === 'HIGH')
      .map(r => r.action);
    
    if (criticalActions.length > 0) {
      console.log('Step 1: Fix Critical Issues\n');
      criticalActions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
      console.log('');
    }
    
    if (highActions.length > 0) {
      console.log('Step 2: Address High Priority Items\n');
      highActions.forEach((action, i) => {
        console.log(`  ${i + 1}. ${action}`);
      });
      console.log('');
    }
    
    console.log('Step 3: Test on Base Sepolia Testnet\n');
    console.log('  1. Get testnet ETH from faucet');
    console.log('  2. Deploy contract to testnet');
    console.log('  3. Run: npm run dev (with DRY_RUN=true)');
    console.log('  4. Monitor logs for 10 cycles');
    console.log('');
    
    console.log('Step 4: Deploy to Base Mainnet (When Ready)\n');
    console.log('  1. Deploy FlashSwapV2 to mainnet');
    console.log('  2. Start with minimum thresholds (0.001 ETH profit)');
    console.log('  3. Enable all safety features');
    console.log('  4. Monitor closely for first 24 hours');
    console.log('');
    
    console.log('Estimated time to first trade: 2-4 hours (if all setup complete)\n');
  }
}

// Run diagnostic
async function main() {
  const diagnostic = new BaseArbitrageDiagnostic();
  await diagnostic.run();
}

main().catch(console.error);
