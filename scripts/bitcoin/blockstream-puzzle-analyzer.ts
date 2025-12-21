#!/usr/bin/env node --import tsx

/**
 * Blockstream Puzzle Autonomous Analyzer
 * 
 * Analyzes ECDSA signatures from https://blockstream.com/puzzle/
 * to identify and explain unusual mathematical properties.
 * 
 * The Blockstream puzzle presents Bitcoin ECDSA signatures with 
 * interesting patterns like:
 * - All zeros or all ones
 * - Hex patterns like "deadbeef"
 * - Unusual r/s value combinations
 * - Edge cases in secp256k1 curve operations
 */

import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

interface SignatureBlock {
  address: string;
  message: string;
  publicKey: string;
  signature: string;
}

interface AnalysisResult {
  block: SignatureBlock;
  isValid: boolean;
  patterns: string[];
  mathematicalProperties: string[];
  explanation: string;
  curiosityScore: number;
}

/**
 * Real signature blocks from Blockstream puzzle
 * Retrieved from https://blockstream.com/puzzle/ on December 21, 2025
 * These are valid signatures in old Bitcoin Armory style
 */
const EXAMPLE_SIGNATURE_BLOCKS: SignatureBlock[] = [
  {
    address: "13yaSqGNDzt1mNW4vrKM9CvD46cTavNabF",
    message: "There is nothing too shocking about this signature",
    publicKey: "02000000000005689111130e588a12ecda87b2dc5585c6c6ba66a412fa0cce65bc",
    signature: "ffffffff077b7209dc866fbfa0d2bf67a0c696afffe57a822e2ba90059a2cc7abb998becb4e427650e282522bf9576524665301b807c0e3194cf1e6c795a0cf7"
  },
  {
    address: "1MkanKef93F1iNLKvyijrbbW2k5VaXzDvA",
    message: "Nor this, given a bit of algebra.",
    publicKey: "03742088316dacf400cea17fdea1dba3bc1e1f58ac0f852fd85545b0ba7ebaee79",
    signature: "100000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000001000000000000000000000000"
  },
  {
    address: "13see6qjfupx1YWgRefwEkccZeM8QGTAiJ",
    message: "But can you explain this one?",
    publicKey: "0200000000000000000000003b78ce563f89a0ed9414f5aa28ad0d96d6795f9c63",
    signature: "deadbeef2f4a23b0f1954100b76bcb720f7b2ddc4a446dc06b8ffc4e143286e1e441f5f1583f300022ad3d134413a212581bcd36c20c7840d15b4d6b8e8f177f"
  }
];

class BlockstreamPuzzleAnalyzer {
  private results: AnalysisResult[] = [];

  /**
   * Parse signature hex into r and s components
   */
  parseSignature(sigHex: string): { r: Buffer; s: Buffer } {
    const sig = Buffer.from(sigHex, 'hex');
    
    // ECDSA signatures are typically r || s
    // For secp256k1, both r and s are 32 bytes (256 bits)
    const midpoint = Math.floor(sig.length / 2);
    
    return {
      r: sig.slice(0, midpoint),
      s: sig.slice(midpoint)
    };
  }

  /**
   * Detect unusual patterns in hex strings
   */
  detectPatterns(hex: string): string[] {
    const patterns: string[] = [];
    
    // Check for common patterns
    if (/^0+$/.test(hex)) {
      patterns.push('ALL_ZEROS');
    }
    if (/^f+$/i.test(hex)) {
      patterns.push('ALL_ONES');
    }
    if (/deadbeef/i.test(hex)) {
      patterns.push('DEADBEEF_PATTERN');
    }
    if (/cafebabe/i.test(hex)) {
      patterns.push('CAFEBABE_PATTERN');
    }
    if (/^00+[1-9a-f]/i.test(hex)) {
      patterns.push('LEADING_ZEROS');
    }
    if (/^(ff)+[0-9a-e]/i.test(hex)) {
      patterns.push('LEADING_ONES');
    }
    
    // Check for repeating patterns
    const groups = hex.match(/(.+)\1+/);
    if (groups) {
      patterns.push(`REPEATING_${groups[1].toUpperCase()}`);
    }
    
    // Check for sequential patterns
    if (/012345678|123456789|abcdef/i.test(hex)) {
      patterns.push('SEQUENTIAL_PATTERN');
    }
    
    return patterns;
  }

  /**
   * Analyze mathematical properties of signature components
   */
  analyzeMathematicalProperties(r: Buffer, s: Buffer): string[] {
    const properties: string[] = [];
    
    // Convert to BigInts for mathematical analysis
    const rBigInt = BigInt('0x' + r.toString('hex'));
    const sBigInt = BigInt('0x' + s.toString('hex'));
    
    // secp256k1 curve order
    const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
    
    // Check if r or s equals curve order
    if (rBigInt === n) {
      properties.push('R_EQUALS_CURVE_ORDER');
    }
    if (sBigInt === n) {
      properties.push('S_EQUALS_CURVE_ORDER');
    }
    
    // Check if r or s is very small
    if (rBigInt < 256n) {
      properties.push(`R_VERY_SMALL_${rBigInt.toString()}`);
    }
    if (sBigInt < 256n) {
      properties.push(`S_VERY_SMALL_${sBigInt.toString()}`);
    }
    
    // Check if r or s is very large (close to n)
    if (n - rBigInt < 256n) {
      properties.push(`R_VERY_LARGE_${(n - rBigInt).toString()}_FROM_N`);
    }
    if (n - sBigInt < 256n) {
      properties.push(`S_VERY_LARGE_${(n - sBigInt).toString()}_FROM_N`);
    }
    
    // Check if r = s
    if (rBigInt === sBigInt) {
      properties.push('R_EQUALS_S');
    }
    
    // Check if r or s is a power of 2
    const isPowerOfTwo = (n: bigint) => n > 0n && (n & (n - 1n)) === 0n;
    if (isPowerOfTwo(rBigInt)) {
      properties.push('R_POWER_OF_TWO');
    }
    if (isPowerOfTwo(sBigInt)) {
      properties.push('S_POWER_OF_TWO');
    }
    
    return properties;
  }

  /**
   * Verify ECDSA signature
   */
  verifySignature(block: SignatureBlock): boolean {
    try {
      const pubKey = Buffer.from(block.publicKey, 'hex');
      const signature = Buffer.from(block.signature, 'hex');
      
      // Hash the message using Bitcoin Armory style
      // sha256(sha256('Bitcoin Signed Message:\n' + message))
      const prefix = 'Bitcoin Signed Message:\n';
      const fullMessage = prefix + block.message;
      const messageHash = createHash('sha256')
        .update(createHash('sha256').update(fullMessage).digest())
        .digest();
      
      // Verify using tiny-secp256k1
      return ecc.verify(messageHash, pubKey, signature);
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate explanation for the signature's unusual properties
   */
  generateExplanation(
    patterns: string[], 
    properties: string[], 
    isValid: boolean
  ): string {
    const explanations: string[] = [];
    
    if (!isValid) {
      explanations.push('⚠️ SIGNATURE IS INVALID - This signature does not verify correctly.');
    } else {
      explanations.push('✅ SIGNATURE IS VALID - This signature verifies correctly.');
    }
    
    if (patterns.includes('ALL_ZEROS')) {
      explanations.push('🔍 ALL ZEROS: The signature (or component) is all zeros, which is mathematically impossible for a valid random ECDSA signature. This was likely crafted specially.');
    }
    
    if (patterns.includes('ALL_ONES')) {
      explanations.push('🔍 ALL ONES: The signature contains all F values (all 1s in binary), suggesting a maximum value was deliberately chosen.');
    }
    
    if (patterns.includes('DEADBEEF_PATTERN')) {
      explanations.push('🔍 DEADBEEF: This hex pattern is a well-known meme in computer science (0xDEADBEEF). Its presence indicates deliberate crafting of the signature or key.');
    }
    
    if (patterns.includes('CAFEBABE_PATTERN')) {
      explanations.push('🔍 CAFEBABE: Another famous hex pattern (0xCAFEBABE, used in Java class files). This signature was clearly constructed for demonstration purposes.');
    }
    
    if (properties.includes('R_EQUALS_S')) {
      explanations.push('🧮 R = S: Both signature components are equal, which is statistically impossible in random signing. This indicates a specially chosen private key or nonce.');
    }
    
    if (properties.some(p => p.startsWith('R_VERY_SMALL') || p.startsWith('S_VERY_SMALL'))) {
      explanations.push('🧮 VERY SMALL VALUES: Having very small r or s values indicates a specially chosen nonce k during signing. This could be a weak signing implementation or deliberate construction.');
    }
    
    if (properties.some(p => p.includes('POWER_OF_TWO'))) {
      explanations.push('🧮 POWER OF TWO: Having signature components as powers of 2 is extremely unlikely in random signing, suggesting special construction.');
    }
    
    if (properties.some(p => p.includes('CURVE_ORDER'))) {
      explanations.push('🧮 CURVE ORDER: Having r or s equal to the curve order n is a boundary condition that should never occur in proper signing.');
    }
    
    if (explanations.length === 1) {
      explanations.push('🤔 This signature appears normal at first glance, but may have subtle mathematical properties worth investigating further.');
    }
    
    return explanations.join('\n\n');
  }

  /**
   * Calculate curiosity score (0-100) based on how interesting the signature is
   */
  calculateCuriosityScore(patterns: string[], properties: string[]): number {
    let score = 0;
    
    // Base score for any patterns
    score += patterns.length * 15;
    score += properties.length * 10;
    
    // Bonus points for particularly interesting patterns
    if (patterns.includes('ALL_ZEROS') || patterns.includes('ALL_ONES')) {
      score += 30;
    }
    if (patterns.includes('DEADBEEF_PATTERN') || patterns.includes('CAFEBABE_PATTERN')) {
      score += 25;
    }
    if (properties.includes('R_EQUALS_S')) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Analyze a single signature block
   */
  analyzeBlock(block: SignatureBlock): AnalysisResult {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Analyzing signature for address: ${block.address}`);
    console.log(`Message: "${block.message}"`);
    console.log(`${'='.repeat(70)}\n`);
    
    // Parse signature
    const { r, s } = this.parseSignature(block.signature);
    
    // Detect patterns
    const sigPatterns = this.detectPatterns(block.signature);
    const pubKeyPatterns = this.detectPatterns(block.publicKey);
    const rPatterns = this.detectPatterns(r.toString('hex'));
    const sPatterns = this.detectPatterns(s.toString('hex'));
    
    const allPatterns = [
      ...sigPatterns.map(p => `SIG_${p}`),
      ...pubKeyPatterns.map(p => `PUBKEY_${p}`),
      ...rPatterns.map(p => `R_${p}`),
      ...sPatterns.map(p => `S_${p}`)
    ];
    
    // Analyze mathematical properties
    const mathProps = this.analyzeMathematicalProperties(r, s);
    
    // Verify signature
    const isValid = this.verifySignature(block);
    
    // Generate explanation
    const explanation = this.generateExplanation(allPatterns, mathProps, isValid);
    
    // Calculate curiosity score
    const curiosityScore = this.calculateCuriosityScore(allPatterns, mathProps);
    
    const result: AnalysisResult = {
      block,
      isValid,
      patterns: allPatterns,
      mathematicalProperties: mathProps,
      explanation,
      curiosityScore
    };
    
    this.results.push(result);
    
    return result;
  }

  /**
   * Print analysis results
   */
  printResult(result: AnalysisResult): void {
    console.log('📊 ANALYSIS RESULTS:\n');
    console.log(`Validity: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Curiosity Score: ${result.curiosityScore}/100 ${'⭐'.repeat(Math.ceil(result.curiosityScore / 20))}`);
    
    if (result.patterns.length > 0) {
      console.log(`\n🔍 Patterns Detected:`);
      result.patterns.forEach(p => console.log(`   • ${p}`));
    }
    
    if (result.mathematicalProperties.length > 0) {
      console.log(`\n🧮 Mathematical Properties:`);
      result.mathematicalProperties.forEach(p => console.log(`   • ${p}`));
    }
    
    console.log(`\n📝 EXPLANATION:\n`);
    console.log(result.explanation);
    console.log('\n');
  }

  /**
   * Save results to file
   */
  saveResults(): void {
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      totalAnalyzed: this.results.length,
      results: this.results,
      summary: {
        averageCuriosityScore: this.results.reduce((sum, r) => sum + r.curiosityScore, 0) / this.results.length,
        validSignatures: this.results.filter(r => r.isValid).length,
        invalidSignatures: this.results.filter(r => !r.isValid).length,
        totalPatterns: this.results.reduce((sum, r) => sum + r.patterns.length, 0),
        totalProperties: this.results.reduce((sum, r) => sum + r.mathematicalProperties.length, 0)
      }
    };
    
    const filename = `data/blockstream-puzzle-analysis-${Date.now()}.json`;
    writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Results saved to: ${filename}\n`);
  }

  /**
   * Main analysis function
   */
  async run(): Promise<void> {
    console.log('🔐 Blockstream Puzzle Autonomous Analyzer');
    console.log('=' .repeat(70));
    console.log('Analyzing ECDSA signatures for unusual mathematical properties\n');
    
    // Analyze example blocks
    for (const block of EXAMPLE_SIGNATURE_BLOCKS) {
      const result = this.analyzeBlock(block);
      this.printResult(result);
    }
    
    // Save results
    this.saveResults();
    
    console.log('✅ Analysis complete!\n');
    console.log('To add more signature blocks from https://blockstream.com/puzzle/:');
    console.log('1. Visit the website and copy the signature blocks');
    console.log('2. Add them to the EXAMPLE_SIGNATURE_BLOCKS array in this script');
    console.log('3. Run the script again to analyze them\n');
  }
}

// Run the analyzer
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new BlockstreamPuzzleAnalyzer();
  analyzer.run().catch(console.error);
}

export { BlockstreamPuzzleAnalyzer, SignatureBlock, AnalysisResult };
