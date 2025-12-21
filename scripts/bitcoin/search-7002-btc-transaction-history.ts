#!/usr/bin/env node --import tsx
/**
 * Search for Bitcoin Address with 7,002 BTC from 2011 - Transaction History Analysis
 * 
 * This script analyzes transaction history from 2011 to find an address that
 * received or held exactly 7,002 BTC during that period.
 * 
 * Strategy:
 * 1. Search for transactions from 2011 with outputs of ~7,002 BTC
 * 2. Check well-known addresses for their balance in 2011
 * 3. Look for specific patterns (7002 BTC is a very specific amount)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface TransactionOutput {
  address: string;
  value: number;
  valueBTC: number;
}

interface HistoricalBalance {
  address: string;
  date: string;
  block: number;
  balance: number;
  balanceBTC: number;
  txHash?: string;
}

class Bitcoin7002Searcher {
  private readonly targetBTC = 7002;
  private readonly targetYear = 2011;
  private findings: HistoricalBalance[] = [];
  
  /**
   * Well-known Bitcoin addresses that existed in 2011
   * Some of these are famous "whale" addresses or early mining addresses
   */
  private readonly historicalAddresses = [
    // The famous address that contained exactly 7,002 BTC
    // This might be the address we're looking for
    '12cbQLTFMXRnSzktFkuoG3eHoMeFtpTu3S', // Known early mining address
    '1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF', // Large BTC holder (~80k BTC)
    '1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC', // Another large holder (~54k BTC)
    
    // BitcoinTalk forum famous addresses from 2011
    '1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1', // First transaction to use OP_CHECKMULTISIG
    '1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp', // SatoshiDice address (started 2012 but might have 2011 txs)
    
    // Known Bitcoin puzzle or challenge addresses
    '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH', // Bitcoin puzzle address
    '1CUNEBjYrCn2y1SdiUMohaKUi4wpP326Lb', // Another puzzle address
    
    // Early Bitcoin developers' known addresses
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Satoshi's genesis address
  ];
  
  /**
   * Sleep utility
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Fetch transaction details from blockchain API
   */
  async fetchTransaction(txHash: string): Promise<any> {
    try {
      const url = `https://blockchain.info/rawtx/${txHash}?format=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.log(`   ⚠️ Error fetching tx ${txHash.substring(0, 16)}...`);
      return null;
    }
  }
  
  /**
   * Get address transactions for a specific time period
   */
  async getAddressTransactions(address: string, startTime: number, endTime: number): Promise<any[]> {
    try {
      console.log(`   📍 Fetching transactions for ${address}...`);
      
      const url = `https://blockchain.info/address/${address}?format=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`   ⚠️ Failed to fetch address data`);
        return [];
      }
      
      const data = await response.json();
      
      // Filter transactions from 2011
      const txsFrom2011 = (data.txs || []).filter((tx: any) => {
        return tx.time >= startTime && tx.time <= endTime;
      });
      
      console.log(`   ✓ Found ${txsFrom2011.length} transactions from 2011`);
      
      return txsFrom2011;
    } catch (error) {
      console.log(`   ❌ Error: ${(error as Error).message}`);
      return [];
    }
  }
  
  /**
   * Calculate balance at specific point in time
   */
  calculateBalanceAtTime(txs: any[], targetTime: number): number {
    let balance = 0;
    
    for (const tx of txs) {
      if (tx.time > targetTime) continue;
      
      // Add received
      for (const out of tx.out || []) {
        balance += out.value || 0;
      }
      
      // Subtract spent
      for (const input of tx.inputs || []) {
        if (input.prev_out) {
          balance -= input.prev_out.value || 0;
        }
      }
    }
    
    return balance;
  }
  
  /**
   * Search for the exact 7,002 BTC pattern in transaction outputs
   */
  async searchTransactionOutputs(tx: any): Promise<TransactionOutput[]> {
    const matches: TransactionOutput[] = [];
    const targetSatoshis = this.targetBTC * 1e8;
    const tolerance = 1e8; // 1 BTC tolerance
    
    for (const out of tx.out || []) {
      const valueSatoshis = out.value || 0;
      const valueBTC = valueSatoshis / 1e8;
      
      // Check if this output is close to 7,002 BTC
      if (Math.abs(valueSatoshis - targetSatoshis) <= tolerance) {
        matches.push({
          address: out.addr || 'unknown',
          value: valueSatoshis,
          valueBTC: valueBTC,
        });
      }
    }
    
    return matches;
  }
  
  /**
   * Main search through historical addresses
   */
  async searchHistoricalAddresses(): Promise<void> {
    console.log('\n🔍 Searching historical addresses from 2011...\n');
    
    // 2011 timestamp range: January 1, 2011 to December 31, 2011
    const startTime = new Date('2011-01-01').getTime() / 1000;
    const endTime = new Date('2011-12-31 23:59:59').getTime() / 1000;
    
    for (const address of this.historicalAddresses) {
      console.log(`\n📍 Analyzing address: ${address}`);
      
      try {
        // Get all transactions
        const txs = await this.getAddressTransactions(address, startTime, endTime);
        await this.sleep(2000); // Rate limiting
        
        if (txs.length === 0) {
          console.log(`   ℹ️ No transactions from 2011`);
          continue;
        }
        
        // Check each transaction for 7,002 BTC outputs
        for (const tx of txs) {
          const matches = await this.searchTransactionOutputs(tx);
          
          for (const match of matches) {
            console.log(`   ✅ FOUND MATCH IN TRANSACTION!`);
            console.log(`   Transaction: ${tx.hash}`);
            console.log(`   Date: ${new Date(tx.time * 1000).toISOString()}`);
            console.log(`   Address: ${match.address}`);
            console.log(`   Amount: ${match.valueBTC.toFixed(8)} BTC`);
            
            this.findings.push({
              address: match.address,
              date: new Date(tx.time * 1000).toISOString(),
              block: tx.block_height || 0,
              balance: match.value,
              balanceBTC: match.valueBTC,
              txHash: tx.hash,
            });
          }
        }
        
        // Calculate balance at end of 2011
        const balance = this.calculateBalanceAtTime(txs, endTime);
        const balanceBTC = balance / 1e8;
        
        // Check if balance at end of 2011 was close to 7,002 BTC
        if (Math.abs(balanceBTC - this.targetBTC) <= 100) {
          console.log(`   📊 Balance at end of 2011: ${balanceBTC.toFixed(2)} BTC`);
          
          if (Math.abs(balanceBTC - this.targetBTC) <= 10) {
            console.log(`   🎯 VERY CLOSE MATCH!`);
            
            this.findings.push({
              address,
              date: '2011-12-31',
              block: 0,
              balance,
              balanceBTC,
            });
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error processing address: ${(error as Error).message}`);
      }
    }
  }
  
  /**
   * Search for the specific famous address
   * Based on Bitcoin history, there might be a well-known address with exactly 7,002 BTC
   */
  async searchFamousExactMatch(): Promise<void> {
    console.log('\n🎯 Searching for famous 7,002 BTC address...\n');
    
    // The exact amount 7,002 suggests this might be:
    // 1. Part of a Bitcoin puzzle or challenge
    // 2. A specific historical transaction
    // 3. Related to early Bitcoin events
    
    console.log('📝 Note: The specific amount of 7,002 BTC is very precise.');
    console.log('   This suggests it might be:');
    console.log('   • Part of the Bitcoin puzzle addresses');
    console.log('   • A well-documented historical transaction');
    console.log('   • Related to early Bitcoin mining pools');
    console.log('   • An exchange wallet from 2011');
    console.log('');
    
    // Check if it's related to the Bitcoin puzzle
    const puzzleAddresses = [
      '1BgGZ9tcN4rm9KBzDn7KprQz87SZ26SAMH', // Puzzle #1
      '1CUNEBjYrCn2y1SdiUMohaKUi4wpP326Lb', // Puzzle #2
      '19ZewH8Kk1PDbSNdJ97FP4EiCjTRaZMZQA', // Puzzle #3
      // These are Bitcoin puzzle transaction addresses that hold specific amounts
    ];
    
    for (const address of puzzleAddresses) {
      console.log(`📍 Checking puzzle address: ${address}`);
      
      try {
        const url = `https://blockchain.info/address/${address}?format=json`;
        const response = await fetch(url);
        await this.sleep(2000);
        
        if (response.ok) {
          const data = await response.json();
          const balanceBTC = (data.final_balance || 0) / 1e8;
          const receivedBTC = (data.total_received || 0) / 1e8;
          
          console.log(`   Balance: ${balanceBTC.toFixed(4)} BTC`);
          console.log(`   Total Received: ${receivedBTC.toFixed(4)} BTC`);
          
          // Check if it ever held 7,002 BTC
          if (Math.abs(receivedBTC - this.targetBTC) <= 10) {
            console.log(`   🎯 MATCH FOUND!`);
            this.findings.push({
              address,
              date: 'Historical',
              block: 0,
              balance: data.final_balance,
              balanceBTC,
            });
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Could not check address`);
      }
    }
  }
  
  /**
   * Generate comprehensive report
   */
  generateReport(): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('   BITCOIN ADDRESS SEARCH - 7,002 BTC FROM 2011');
    lines.push('   Transaction History Analysis');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Search Date: ${new Date().toISOString()}`);
    lines.push(`Target: Address with exactly 7,002 BTC from 2011`);
    lines.push(`Search Method: Transaction history analysis`);
    lines.push(`Findings: ${this.findings.length}`);
    lines.push('');
    
    if (this.findings.length > 0) {
      lines.push('═══════════════════════════════════════════════════════════════════');
      lines.push('   FINDINGS');
      lines.push('═══════════════════════════════════════════════════════════════════');
      lines.push('');
      
      this.findings.forEach((finding, idx) => {
        lines.push(`Finding #${idx + 1}:`);
        lines.push(`   Address: ${finding.address}`);
        lines.push(`   Date: ${finding.date}`);
        lines.push(`   Amount: ${finding.balanceBTC.toFixed(8)} BTC`);
        if (finding.txHash) {
          lines.push(`   Transaction: ${finding.txHash}`);
        }
        if (finding.block) {
          lines.push(`   Block: ${finding.block}`);
        }
        lines.push('');
        lines.push(`   🔗 View on blockchain.info: https://blockchain.info/address/${finding.address}`);
        lines.push(`   🔗 View on mempool.space: https://mempool.space/address/${finding.address}`);
        if (finding.txHash) {
          lines.push(`   🔗 View transaction: https://blockchain.info/tx/${finding.txHash}`);
        }
        lines.push('');
        lines.push('─────────────────────────────────────────────────────────────────');
        lines.push('');
      });
    } else {
      lines.push('❌ No exact matches found in the analyzed addresses.');
      lines.push('');
      lines.push('POSSIBLE EXPLANATIONS:');
      lines.push('• The address may not be in the list of known historical addresses');
      lines.push('• The transaction might be in a block not yet analyzed');
      lines.push('• API rate limiting may have prevented full analysis');
      lines.push('• The exact amount might have changed due to fees or splits');
      lines.push('');
    }
    
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('   CONTEXT: BITCOIN IN 2011');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('In 2011, Bitcoin was still relatively new:');
    lines.push('• Bitcoin price ranged from $0.30 to $30 during 2011');
    lines.push('• 7,002 BTC in 2011 was worth $2,100 - $210,000 USD');
    lines.push('• Early mining pools were common (Slush, Deepbit, etc.)');
    lines.push('• Mt. Gox was the dominant exchange');
    lines.push('• Many early adopters were accumulating BTC');
    lines.push('');
    lines.push('The specific amount of 7,002 BTC suggests:');
    lines.push('• Could be a mining pool payout');
    lines.push('• Early investor accumulation');
    lines.push('• Exchange cold storage wallet');
    lines.push('• Part of a known Bitcoin puzzle or challenge');
    lines.push('');
    
    return lines.join('\n');
  }
  
  /**
   * Save report
   */
  saveReport(report: string): string {
    const filename = `bitcoin-7002-history-search-${Date.now()}.txt`;
    const filepath = join('data', filename);
    
    writeFileSync(filepath, report, 'utf-8');
    
    return filepath;
  }
  
  /**
   * Main execution
   */
  async run(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('   🔍 BITCOIN 7,002 BTC SEARCH - 2011 TRANSACTION HISTORY');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Analyzing Bitcoin blockchain for address with 7,002 BTC from 2011...');
    console.log('This may take several minutes due to API rate limiting...');
    console.log('');
    
    try {
      // Search historical addresses
      await this.searchHistoricalAddresses();
      
      // Search famous addresses
      await this.searchFamousExactMatch();
      
      // Generate report
      console.log('\n📊 Generating report...\n');
      const report = this.generateReport();
      
      console.log(report);
      
      const filepath = this.saveReport(report);
      console.log(`\n✅ Report saved to: ${filepath}\n`);
      
      // Save JSON
      const jsonPath = filepath.replace('.txt', '.json');
      writeFileSync(jsonPath, JSON.stringify({
        searchDate: new Date().toISOString(),
        targetBTC: this.targetBTC,
        targetYear: this.targetYear,
        findingsCount: this.findings.length,
        findings: this.findings,
      }, null, 2));
      
      console.log(`📊 JSON data saved to: ${jsonPath}\n`);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
  const searcher = new Bitcoin7002Searcher();
  searcher.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { Bitcoin7002Searcher };
