#!/usr/bin/env node

/**
 * Wallet & Multi-Sig Setup Verification Tool
 *
 * Comprehensive verification of:
 * 1. Primary wallet private key
 * 2. Second address configuration
 * 3. Multi-sig setup (if configured)
 * 4. Connection to blockchain
 * 5. Wallet balances
 */

import dotenv from 'dotenv';
dotenv.config();

import { Wallet, JsonRpcProvider, formatEther, isAddress } from 'ethers';

interface VerificationResult {
  section: string;
  checks: {
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
    message: string;
    details?: string;
  }[];
}

const results: VerificationResult[] = [];

function printSection(title: string) {
  console.log('\n' + '═'.repeat(80));
  console.log(`  ${title}`);
  console.log('═'.repeat(80) + '\n');
}

function printCheck(
  icon: string,
  name: string,
  message: string,
  details?: string
) {
  console.log(`${icon} ${name}: ${message}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

async function main() {
  console.log('\n' + '█'.repeat(80));
  console.log('  WALLET & MULTI-SIG SETUP VERIFICATION');
  console.log('█'.repeat(80));

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1: Primary Wallet Private Key
  // ═══════════════════════════════════════════════════════════════
  printSection('1. PRIMARY WALLET VERIFICATION');

  const section1: VerificationResult = {
    section: 'Primary Wallet',
    checks: [],
  };

  const privateKey = process.env.WALLET_PRIVATE_KEY;
  let isPlaceholder = false;

  if (!privateKey) {
    section1.checks.push({
      name: 'Private Key Exists',
      status: 'FAIL',
      message: 'WALLET_PRIVATE_KEY not found in .env',
      details: 'Add WALLET_PRIVATE_KEY=0x... to your .env file',
    });
    printCheck('❌', 'Private Key Exists', 'NOT FOUND');
  } else {
    section1.checks.push({
      name: 'Private Key Exists',
      status: 'PASS',
      message: 'Found in .env',
    });
    printCheck('✅', 'Private Key Exists', 'Found in .env');

    // Check format
    const hasPrefix = privateKey.startsWith('0x');
    const keyWithoutPrefix = hasPrefix ? privateKey.slice(2) : privateKey;
    const length = keyWithoutPrefix.length;
    const isHex = /^[0-9a-fA-F]+$/.test(keyWithoutPrefix);
    isPlaceholder =
      privateKey.includes('YOUR') || privateKey.includes('PRIVATE_KEY_HERE');

    if (isPlaceholder) {
      section1.checks.push({
        name: 'Key Format',
        status: 'FAIL',
        message: 'Still contains placeholder text',
        details: 'Replace with actual private key',
      });
      printCheck('❌', 'Key Format', 'PLACEHOLDER DETECTED');
    } else if (length !== 64) {
      section1.checks.push({
        name: 'Key Format',
        status: 'FAIL',
        message: `Invalid length: ${length} (must be 64)`,
      });
      printCheck('❌', 'Key Format', `Invalid length: ${length} (must be 64)`);
    } else if (!isHex) {
      section1.checks.push({
        name: 'Key Format',
        status: 'FAIL',
        message: 'Contains invalid hex characters',
      });
      printCheck('❌', 'Key Format', 'Contains invalid hex characters');
    } else {
      section1.checks.push({
        name: 'Key Format',
        status: 'PASS',
        message: `Valid (64 hex chars, ${hasPrefix ? 'with' : 'without'} 0x prefix)`,
      });
      printCheck(
        '✅',
        'Key Format',
        `Valid (64 hex chars, ${hasPrefix ? 'with' : 'without'} 0x prefix)`
      );

      // Try to create wallet
      try {
        const wallet = new Wallet(privateKey);
        section1.checks.push({
          name: 'Wallet Creation',
          status: 'PASS',
          message: `Address: ${wallet.address}`,
          details: `Key preview: ${privateKey.substring(0, 8)}...${privateKey.substring(privateKey.length - 4)}`,
        });
        printCheck('✅', 'Wallet Creation', `Address: ${wallet.address}`);
        console.log(
          `   Key preview: ${privateKey.substring(0, 8)}...${privateKey.substring(privateKey.length - 4)}`
        );
      } catch (error) {
        section1.checks.push({
          name: 'Wallet Creation',
          status: 'FAIL',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        printCheck(
          '❌',
          'Wallet Creation',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  results.push(section1);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2: Second Address (for Multi-Sig)
  // ═══════════════════════════════════════════════════════════════
  printSection('2. SECOND ADDRESS VERIFICATION (Multi-Sig Owner)');

  const section2: VerificationResult = {
    section: 'Second Address',
    checks: [],
  };

  const secondAddress = process.env.MULTI_SIG_SECOND_ADDRESS || process.env.SECOND_ADDRESS;

  if (!secondAddress) {
    section2.checks.push({
      name: 'Second Address',
      status: 'WARN',
      message: 'Not configured',
      details:
        'Add MULTI_SIG_SECOND_ADDRESS=0x... to .env if using multi-sig',
    });
    printCheck(
      '⚠️ ',
      'Second Address',
      'Not configured (optional for multi-sig)'
    );
  } else {
    section2.checks.push({
      name: 'Second Address Exists',
      status: 'PASS',
      message: 'Found in .env',
    });
    printCheck('✅', 'Second Address Exists', 'Found in .env');

    // Validate address format
    if (isAddress(secondAddress)) {
      section2.checks.push({
        name: 'Address Format',
        status: 'PASS',
        message: `Valid: ${secondAddress}`,
      });
      printCheck('✅', 'Address Format', `Valid: ${secondAddress}`);

      // Check if it's different from primary wallet
      if (privateKey && !isPlaceholder) {
        try {
          const wallet = new Wallet(privateKey);
          if (wallet.address.toLowerCase() === secondAddress.toLowerCase()) {
            section2.checks.push({
              name: 'Address Uniqueness',
              status: 'FAIL',
              message: 'Same as primary wallet address',
              details: 'Second address should be different for multi-sig',
            });
            printCheck(
              '❌',
              'Address Uniqueness',
              'Same as primary wallet (should be different)'
            );
          } else {
            section2.checks.push({
              name: 'Address Uniqueness',
              status: 'PASS',
              message: 'Different from primary wallet',
            });
            printCheck('✅', 'Address Uniqueness', 'Different from primary wallet');
          }
        } catch (_error) {
          // Skip if wallet creation failed
        }
      }
    } else {
      section2.checks.push({
        name: 'Address Format',
        status: 'FAIL',
        message: `Invalid Ethereum address: ${secondAddress}`,
      });
      printCheck('❌', 'Address Format', `Invalid: ${secondAddress}`);
    }
  }

  results.push(section2);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3: Multi-Sig Configuration
  // ═══════════════════════════════════════════════════════════════
  printSection('3. MULTI-SIG CONFIGURATION');

  const section3: VerificationResult = {
    section: 'Multi-Sig Config',
    checks: [],
  };

  const multiSigAddress = process.env.MULTI_SIG_ADDRESS;
  const multiSigThreshold = process.env.MULTI_SIG_THRESHOLD;

  if (!multiSigAddress && !multiSigThreshold) {
    section3.checks.push({
      name: 'Multi-Sig Config',
      status: 'SKIP',
      message: 'Not configured (optional feature)',
    });
    printCheck('⏭️ ', 'Multi-Sig Config', 'Not configured (optional)');
  } else {
    if (multiSigAddress) {
      if (isAddress(multiSigAddress)) {
        section3.checks.push({
          name: 'Multi-Sig Address',
          status: 'PASS',
          message: `Valid: ${multiSigAddress}`,
        });
        printCheck('✅', 'Multi-Sig Address', `Valid: ${multiSigAddress}`);
      } else {
        section3.checks.push({
          name: 'Multi-Sig Address',
          status: 'FAIL',
          message: `Invalid: ${multiSigAddress}`,
        });
        printCheck('❌', 'Multi-Sig Address', `Invalid: ${multiSigAddress}`);
      }
    } else {
      section3.checks.push({
        name: 'Multi-Sig Address',
        status: 'WARN',
        message: 'Not set',
      });
      printCheck('⚠️ ', 'Multi-Sig Address', 'Not set');
    }

    if (multiSigThreshold) {
      const threshold = parseInt(multiSigThreshold);
      if (isNaN(threshold) || threshold < 1) {
        section3.checks.push({
          name: 'Threshold',
          status: 'FAIL',
          message: `Invalid: ${multiSigThreshold} (must be >= 1)`,
        });
        printCheck(
          '❌',
          'Threshold',
          `Invalid: ${multiSigThreshold} (must be >= 1)`
        );
      } else {
        section3.checks.push({
          name: 'Threshold',
          status: 'PASS',
          message: `${threshold} signature(s) required`,
        });
        printCheck('✅', 'Threshold', `${threshold} signature(s) required`);
      }
    } else {
      section3.checks.push({
        name: 'Threshold',
        status: 'WARN',
        message: 'Not set (will use default)',
      });
      printCheck('⚠️ ', 'Threshold', 'Not set (will use default)');
    }
  }

  results.push(section3);

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4: Blockchain Connection & Balances
  // ═══════════════════════════════════════════════════════════════
  printSection('4. BLOCKCHAIN CONNECTION & BALANCES');

  const section4: VerificationResult = {
    section: 'Blockchain',
    checks: [],
  };

  const chainId = process.env.CHAIN_ID || '8453'; // Default to Base
  const rpcUrl =
    process.env.BASE_RPC_URL ||
    process.env.ETHEREUM_RPC_URL ||
    process.env.RPC_URL;

  if (!rpcUrl) {
    section4.checks.push({
      name: 'RPC URL',
      status: 'FAIL',
      message: 'No RPC URL configured',
      details: 'Add BASE_RPC_URL or RPC_URL to .env',
    });
    printCheck('❌', 'RPC URL', 'Not configured');
  } else {
    section4.checks.push({
      name: 'RPC URL',
      status: 'PASS',
      message: 'Configured',
      details: rpcUrl.substring(0, 50) + (rpcUrl.length > 50 ? '...' : ''),
    });
    printCheck('✅', 'RPC URL', 'Configured');
    console.log(`   ${rpcUrl.substring(0, 60)}${rpcUrl.length > 60 ? '...' : ''}`);

    try {
      const provider = new JsonRpcProvider(rpcUrl);
      const network = await provider.getNetwork();

      section4.checks.push({
        name: 'RPC Connection',
        status: 'PASS',
        message: `Connected to Chain ID: ${network.chainId}`,
      });
      printCheck('✅', 'RPC Connection', `Connected to Chain ID: ${network.chainId}`);

      // Check if chain ID matches
      if (network.chainId.toString() === chainId) {
        section4.checks.push({
          name: 'Chain ID Match',
          status: 'PASS',
          message: `Matches configured CHAIN_ID=${chainId}`,
        });
        printCheck('✅', 'Chain ID Match', `Matches configured CHAIN_ID=${chainId}`);
      } else {
        section4.checks.push({
          name: 'Chain ID Match',
          status: 'WARN',
          message: `RPC=${network.chainId}, configured=${chainId}`,
          details: 'Update CHAIN_ID or RPC_URL to match',
        });
        printCheck(
          '⚠️ ',
          'Chain ID Match',
          `RPC=${network.chainId}, configured=${chainId}`
        );
      }

      // Check primary wallet balance
      if (privateKey && !isPlaceholder) {
        try {
          const wallet = new Wallet(privateKey);
          const balance = await provider.getBalance(wallet.address);
          const balanceEth = formatEther(balance);

          if (balance === 0n) {
            section4.checks.push({
              name: 'Primary Wallet Balance',
              status: 'WARN',
              message: `${balanceEth} ETH`,
              details: 'Wallet has no funds. Add some ETH to pay for gas.',
            });
            printCheck('⚠️ ', 'Primary Wallet Balance', `${balanceEth} ETH (no funds)`);
          } else {
            section4.checks.push({
              name: 'Primary Wallet Balance',
              status: 'PASS',
              message: `${balanceEth} ETH`,
            });
            printCheck('✅', 'Primary Wallet Balance', `${balanceEth} ETH`);
          }
        } catch (error) {
          section4.checks.push({
            name: 'Primary Wallet Balance',
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          printCheck(
            '❌',
            'Primary Wallet Balance',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Check second address balance
      if (secondAddress && isAddress(secondAddress)) {
        try {
          const balance = await provider.getBalance(secondAddress);
          const balanceEth = formatEther(balance);

          section4.checks.push({
            name: 'Second Address Balance',
            status: balance === 0n ? 'WARN' : 'PASS',
            message: `${balanceEth} ETH`,
          });
          printCheck(
            balance === 0n ? '⚠️ ' : '✅',
            'Second Address Balance',
            `${balanceEth} ETH${balance === 0n ? ' (no funds)' : ''}`
          );
        } catch (error) {
          section4.checks.push({
            name: 'Second Address Balance',
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          printCheck(
            '❌',
            'Second Address Balance',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      // Check multi-sig address balance
      if (multiSigAddress && isAddress(multiSigAddress)) {
        try {
          const balance = await provider.getBalance(multiSigAddress);
          const balanceEth = formatEther(balance);

          section4.checks.push({
            name: 'Multi-Sig Address Balance',
            status: 'PASS',
            message: `${balanceEth} ETH`,
          });
          printCheck('✅', 'Multi-Sig Address Balance', `${balanceEth} ETH`);
        } catch (error) {
          section4.checks.push({
            name: 'Multi-Sig Address Balance',
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          printCheck(
            '❌',
            'Multi-Sig Address Balance',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    } catch (error) {
      section4.checks.push({
        name: 'RPC Connection',
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Connection failed',
      });
      printCheck(
        '❌',
        'RPC Connection',
        error instanceof Error ? error.message : 'Connection failed'
      );
    }
  }

  results.push(section4);

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  printSection('VERIFICATION SUMMARY');

  let totalChecks = 0;
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  let skipped = 0;

  results.forEach((section) => {
    section.checks.forEach((check) => {
      totalChecks++;
      if (check.status === 'PASS') passed++;
      else if (check.status === 'FAIL') failed++;
      else if (check.status === 'WARN') warnings++;
      else if (check.status === 'SKIP') skipped++;
    });
  });

  console.log(`Total Checks: ${totalChecks}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log();

  if (failed > 0) {
    console.log('❌ SETUP INCOMPLETE - Please fix the failed checks above');
    console.log();
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  SETUP COMPLETE WITH WARNINGS - Review warnings above');
    console.log();
    process.exit(0);
  } else {
    console.log('✅ ALL CHECKS PASSED - Setup is ready!');
    console.log();
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n❌ Verification failed with error:');
  console.error(error);
  process.exit(1);
});
