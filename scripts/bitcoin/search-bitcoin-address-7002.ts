#!/usr/bin/env node --import tsx
/**
 * Bitcoin Address Search - 7,002 BTC from 2011
 * 
 * This script searches for a Bitcoin address that held exactly 7,002 BTC
 * based on transaction records from 2011.
 * 
 * Strategy:
 * 1. Search for known large Bitcoin addresses from 2011
 * 2. Query blockchain APIs for addresses with ~7,002 BTC balance
 * 3. Check historical transaction data from 2011
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

interface AddressInfo {
  address: string;
  balance: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  firstSeen?: string;
  lastSeen?: string;
}

interface SearchResult {
  address: string;
  balance: number;
  balanceBTC: number;
  totalReceived: number;
  totalSent: number;
  txCount: number;
  firstTxDate?: string;
  source: string;
  matchReason: string;
}

class BitcoinAddressSearcher {
  private results: SearchResult[] = [];
  private readonly targetBalance = 7002; // 7,002 BTC
  private readonly targetYear = 2011;
  
  /**
   * Known large Bitcoin addresses from early Bitcoin history
   * These are famous addresses that may have held significant amounts in 2011
   */
  private readonly knownEarlyAddresses = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block address (Satoshi)
    '12cbQLTFMXRnSzktFkuoG3eHoMeFtpTu3S', // Known early large address
    '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX', // Early miner address
    '1HQ3Go3ggs8pFnXuHVHRytPCq5fGG8Hbhx', // Known early address
    '1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF', // Known early address
    '1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC', // Known early address
    '1AC4fMwgY8j9onSbXEWeH6Zan8QGMSdmtA', // Known early address
    '1JArS6jzE3AJ9sZ3aFij1BmTcpFGgN86hA', // Known early address
    '1DkyBEKt5S2GDtv7aQw6rQepAvnsRyHoYM', // Known early address
  ];
  
  /**
   * Sleep utility for rate limiting
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Fetch address information from blockchain.info
   */
  async fetchAddressFromBlockchainInfo(address: string): Promise<AddressInfo | null> {
    try {
      const url = `https://blockchain.info/address/${address}?format=json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`   ⚠️ Failed to fetch ${address} from blockchain.info`);
        return null;
      }
      
      const data = await response.json();
      
      return {
        address: data.address,
        balance: data.final_balance || 0,
        totalReceived: data.total_received || 0,
        totalSent: data.total_sent || 0,
        txCount: data.n_tx || 0,
      };
    } catch (error) {
      console.log(`   ❌ Error fetching ${address}:`, (error as Error).message);
      return null;
    }
  }
  
  /**
   * Fetch address information from mempool.space
   */
  async fetchAddressFromMempool(address: string): Promise<AddressInfo | null> {
    try {
      const url = `https://mempool.space/api/address/${address}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`   ⚠️ Failed to fetch ${address} from mempool.space`);
        return null;
      }
      
      const data = await response.json();
      
      return {
        address: data.address,
        balance: data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum || 0,
        totalReceived: data.chain_stats?.funded_txo_sum || 0,
        totalSent: data.chain_stats?.spent_txo_sum || 0,
        txCount: data.chain_stats?.tx_count || 0,
      };
    } catch (error) {
      console.log(`   ❌ Error fetching ${address}:`, (error as Error).message);
      return null;
    }
  }
  
  /**
   * Check if an address matches our search criteria
   */
  private checkMatch(info: AddressInfo, source: string): SearchResult | null {
    const balanceBTC = info.balance / 1e8; // Convert satoshis to BTC
    const totalReceivedBTC = info.totalReceived / 1e8;
    
    // Check for exact or close match to 7,002 BTC
    const tolerance = 10; // Allow ±10 BTC tolerance
    
    let matchReason = '';
    
    // Check current balance
    if (Math.abs(balanceBTC - this.targetBalance) <= tolerance) {
      matchReason = `Current balance: ${balanceBTC.toFixed(2)} BTC (target: ${this.targetBalance} BTC)`;
    }
    // Check total received (in case funds were moved)
    else if (Math.abs(totalReceivedBTC - this.targetBalance) <= tolerance) {
      matchReason = `Total received: ${totalReceivedBTC.toFixed(2)} BTC (target: ${this.targetBalance} BTC)`;
    }
    // Check for partial match (within 100 BTC)
    else if (Math.abs(balanceBTC - this.targetBalance) <= 100) {
      matchReason = `Close match - Balance: ${balanceBTC.toFixed(2)} BTC (±100 BTC tolerance)`;
    }
    // Check for significant amount (>1000 BTC) as it might be related
    else if (balanceBTC > 1000 || totalReceivedBTC > 1000) {
      matchReason = `Large address - Balance: ${balanceBTC.toFixed(2)} BTC, Received: ${totalReceivedBTC.toFixed(2)} BTC`;
    } else {
      return null; // No match
    }
    
    return {
      address: info.address,
      balance: info.balance,
      balanceBTC,
      totalReceived: info.totalReceived,
      totalSent: info.totalSent,
      txCount: info.txCount,
      source,
      matchReason,
    };
  }
  
  /**
   * Search known early addresses
   */
  async searchKnownAddresses(): Promise<void> {
    console.log('\n🔍 Searching known early Bitcoin addresses...\n');
    
    for (const address of this.knownEarlyAddresses) {
      console.log(`📍 Checking address: ${address}`);
      
      // Try blockchain.info first
      let info = await this.fetchAddressFromBlockchainInfo(address);
      await this.sleep(1000); // Rate limiting
      
      // If blockchain.info fails, try mempool.space
      if (!info) {
        info = await this.fetchAddressFromMempool(address);
        await this.sleep(1000);
      }
      
      if (info) {
        const match = this.checkMatch(info, 'Known Early Addresses');
        if (match) {
          console.log(`   ✅ MATCH FOUND!`);
          console.log(`   ${match.matchReason}`);
          this.results.push(match);
        } else {
          console.log(`   ℹ️ Balance: ${(info.balance / 1e8).toFixed(4)} BTC`);
        }
      }
    }
  }
  
  /**
   * Search for the famous "7,002 BTC" address
   * This is likely referring to a specific well-known Bitcoin address from 2011
   */
  async searchFamousAddress(): Promise<void> {
    console.log('\n🔍 Searching for famous 7,002 BTC address from 2011...\n');
    
    // Some famous addresses that may have held large amounts in 2011
    const famousAddresses = [
      // Mt. Gox related addresses
      '1MtGoxUb8T4BPANZkLvECCN1hGNQNPDQK3',
      '1FfmbHfnpaZjKFvyi1okTjJJusN455paPH',
      // Early Bitcoin Foundation addresses
      '1BtcyRUBwLv9AU1fCyyn4pkLjZ99ogdr7b',
      // Known early whale addresses
      '1933phfhK3ZgFQNLGSDXvqCn32k2buXY8a',
      '12tkqA9xSoowkzoERHMWNKsTey55YEBqkv',
      // Addresses from 2011 era
      '1BoatSLRHtKNngkdXEeobR76b53LETtpyT',
    ];
    
    for (const address of famousAddresses) {
      console.log(`📍 Checking famous address: ${address}`);
      
      let info = await this.fetchAddressFromBlockchainInfo(address);
      await this.sleep(1500); // More conservative rate limiting
      
      if (!info) {
        info = await this.fetchAddressFromMempool(address);
        await this.sleep(1500);
      }
      
      if (info) {
        const match = this.checkMatch(info, 'Famous Historical Addresses');
        if (match) {
          console.log(`   ✅ POTENTIAL MATCH!`);
          console.log(`   ${match.matchReason}`);
          this.results.push(match);
        } else {
          const balanceBTC = info.balance / 1e8;
          const receivedBTC = info.totalReceived / 1e8;
          console.log(`   Balance: ${balanceBTC.toFixed(4)} BTC, Received: ${receivedBTC.toFixed(4)} BTC`);
        }
      }
    }
  }
  
  /**
   * Generate report
   */
  generateReport(): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('   BITCOIN ADDRESS SEARCH - 7,002 BTC FROM 2011');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Search Date: ${new Date().toISOString()}`);
    lines.push(`Target: Address with 7,002 BTC from 2011`);
    lines.push(`Results Found: ${this.results.length}`);
    lines.push('');
    
    if (this.results.length === 0) {
      lines.push('❌ No exact matches found in the searched addresses.');
      lines.push('');
      lines.push('NOTES:');
      lines.push('• The search focused on known early Bitcoin addresses');
      lines.push('• Many addresses from 2011 have changed balances over time');
      lines.push('• The specific address may require transaction history analysis');
      lines.push('• Consider searching blockchain explorers with specific filters');
    } else {
      lines.push('═══════════════════════════════════════════════════════════════════');
      lines.push('   SEARCH RESULTS');
      lines.push('═══════════════════════════════════════════════════════════════════');
      lines.push('');
      
      this.results.forEach((result, idx) => {
        lines.push(`Result #${idx + 1}:`);
        lines.push(`   Address: ${result.address}`);
        lines.push(`   Current Balance: ${result.balanceBTC.toFixed(8)} BTC`);
        lines.push(`   Total Received: ${(result.totalReceived / 1e8).toFixed(8)} BTC`);
        lines.push(`   Total Sent: ${(result.totalSent / 1e8).toFixed(8)} BTC`);
        lines.push(`   Transactions: ${result.txCount}`);
        lines.push(`   Source: ${result.source}`);
        lines.push(`   Match Reason: ${result.matchReason}`);
        lines.push('');
        lines.push(`   🔗 View on blockchain.info: https://blockchain.info/address/${result.address}`);
        lines.push(`   🔗 View on mempool.space: https://mempool.space/address/${result.address}`);
        lines.push('');
        lines.push('─────────────────────────────────────────────────────────────────');
        lines.push('');
      });
    }
    
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('   ADDITIONAL INFORMATION');
    lines.push('═══════════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('If searching for a specific address with exactly 7,002 BTC from 2011:');
    lines.push('');
    lines.push('1. Check major Bitcoin puzzle addresses');
    lines.push('2. Review early Bitcoin mining pools from 2011');
    lines.push('3. Search for famous Bitcoin heists/events from 2011');
    lines.push('4. Check addresses associated with Mt. Gox (operational in 2011)');
    lines.push('5. Look for addresses in early Bitcoin forums/documentation');
    lines.push('');
    lines.push('The exact amount of 7,002 BTC suggests this might be:');
    lines.push('• A specific puzzle or challenge address');
    lines.push('• Part of a known Bitcoin historical event');
    lines.push('• An early exchange cold wallet');
    lines.push('• A reward or bounty address');
    lines.push('');
    
    return lines.join('\n');
  }
  
  /**
   * Save report to file
   */
  saveReport(report: string): string {
    const filename = `bitcoin-address-search-7002-${Date.now()}.txt`;
    const filepath = join('data', filename);
    
    writeFileSync(filepath, report, 'utf-8');
    
    return filepath;
  }
  
  /**
   * Main search function
   */
  async run(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('   🔍 BITCOIN ADDRESS SEARCH - 7,002 BTC FROM 2011');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Starting search for Bitcoin address with 7,002 BTC from 2011...');
    console.log('');
    
    try {
      // Search known early addresses
      await this.searchKnownAddresses();
      
      // Search famous addresses
      await this.searchFamousAddress();
      
      // Generate and save report
      console.log('\n📊 Generating report...');
      const report = this.generateReport();
      
      console.log('\n' + report);
      
      const filepath = this.saveReport(report);
      console.log(`\n✅ Report saved to: ${filepath}\n`);
      
      // Also save JSON version
      const jsonFilepath = filepath.replace('.txt', '.json');
      writeFileSync(jsonFilepath, JSON.stringify({
        searchDate: new Date().toISOString(),
        targetBalance: this.targetBalance,
        targetYear: this.targetYear,
        resultsCount: this.results.length,
        results: this.results,
      }, null, 2));
      
      console.log(`📊 JSON data saved to: ${jsonFilepath}\n`);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }
}

// Run the searcher
if (import.meta.url === `file://${process.argv[1]}`) {
  const searcher = new BitcoinAddressSearcher();
  searcher.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { BitcoinAddressSearcher };
