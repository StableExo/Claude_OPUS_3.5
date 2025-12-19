#!/usr/bin/env node
/**
 * Validation Script for Contract Verification Files
 * 
 * This script validates that the flattened contracts and constructor arguments
 * are properly formatted before attempting BaseScan verification.
 * 
 * It checks:
 * - Files exist
 * - Source files start with proper Solidity code (not bytecode)
 * - Constructor args are properly formatted hex strings
 * - No common mistakes that would cause verification errors
 * 
 * Usage:
 *   npm run verify:validate
 *   node --import tsx scripts/verification/validate-verification-files.ts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ContractValidation {
  name: string;
  flattenedFile: string;
  constructorArgsFile: string;
  result: ValidationResult;
}

/**
 * Validate that a source file contains Solidity code, not bytecode
 */
function validateSourceFile(filePath: string, contractName: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  const content = readFileSync(filePath, 'utf8');

  // Check for mixed line endings (CRLF + LF)
  const hasCRLF = content.includes('\r\n');
  const hasCR = content.includes('\r');
  if (hasCRLF || hasCR) {
    result.warnings.push('File contains Windows-style (CRLF) or Mac-style (CR) line endings');
    result.warnings.push('Consider normalizing to Unix-style (LF) line endings for better compatibility');
    result.warnings.push('Run: tr -d "\\r" < file.sol > file_fixed.sol');
  }

  // Check minimum length
  if (content.length < 1000) {
    result.valid = false;
    result.errors.push(`File is too short (${content.length} chars). Expected at least 1000 characters.`);
  }

  // Check for proper Solidity headers
  const hasFlattenerComment = content.includes('// Sources flattened with hardhat') || 
                               content.includes('// SPDX-License-Identifier:');
  const hasPragma = /pragma\s+solidity/i.test(content);

  if (!hasFlattenerComment && !hasPragma) {
    result.valid = false;
    result.errors.push('File does not appear to be flattened Solidity source code');
    result.errors.push('Expected to find: "// Sources flattened with hardhat" or "pragma solidity"');
  }

  // Check that it doesn't start with hex/bytecode (common error)
  const startsWithHex = /^[0-9a-fA-F]{40,}/.test(content.trim());
  if (startsWithHex) {
    result.valid = false;
    result.errors.push('❌ CRITICAL ERROR: File starts with hexadecimal bytecode, not Solidity source!');
    result.errors.push('This file appears to contain constructor arguments or bytecode.');
    result.errors.push(`Make sure you're using ${contractName}_flattened.sol, not ${contractName}_constructor_args.txt`);
  }

  // Check for contract definition
  const hasContract = /contract\s+\w+/i.test(content);
  if (!hasContract) {
    result.warnings.push('No contract definition found in file');
  }

  // Provide helpful info
  const firstLine = content.split('\n')[0].trim();
  console.log(`   First line: "${firstLine.substring(0, 80)}${firstLine.length > 80 ? '...' : ''}"`);

  return result;
}

/**
 * Validate constructor arguments file
 */
function validateConstructorArgs(filePath: string): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  if (!existsSync(filePath)) {
    result.valid = false;
    result.errors.push(`File not found: ${filePath}`);
    return result;
  }

  const content = readFileSync(filePath, 'utf8').trim();

  // Check that it's a hex string
  const isHex = /^[0-9a-fA-F]+$/.test(content);
  if (!isHex) {
    result.valid = false;
    result.errors.push('Constructor arguments must be a hexadecimal string (0-9, a-f, A-F only)');
    result.errors.push('No spaces, newlines, or "0x" prefix');
  }

  // Check length - should be a multiple of 64 (32 bytes per argument)
  if (content.length % 64 !== 0) {
    result.warnings.push(`Constructor args length (${content.length}) is not a multiple of 64`);
    result.warnings.push('Each ABI-encoded argument should be 64 hex characters (32 bytes)');
  }

  // Check for newlines
  if (content.includes('\n') || content.includes('\r')) {
    result.errors.push('Constructor arguments contain newlines - should be a single line');
  }

  // Check for spaces
  if (content.includes(' ')) {
    result.errors.push('Constructor arguments contain spaces - remove all whitespace');
  }

  // Check for 0x prefix
  if (content.startsWith('0x')) {
    result.errors.push('Constructor arguments should NOT start with "0x" - remove the prefix');
  }

  // Check that it's not Solidity code
  if (content.includes('pragma') || content.includes('contract') || content.includes('function')) {
    result.valid = false;
    result.errors.push('❌ CRITICAL ERROR: This file contains Solidity source code, not constructor arguments!');
    result.errors.push('Constructor arguments should be a hex string starting with "0000000000000000..."');
  }

  console.log(`   Length: ${content.length} chars (${content.length / 64} arguments)`);
  console.log(`   Preview: ${content.substring(0, 80)}...`);

  return result;
}

/**
 * Validate a contract's verification files
 */
function validateContract(
  name: string,
  flattenedFile: string,
  constructorArgsFile: string
): ContractValidation {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🔍 Validating ${name}`);
  console.log(`${'═'.repeat(70)}\n`);

  const verificationDir = join(process.cwd(), 'verification');
  const flattenedPath = join(verificationDir, flattenedFile);
  const argsPath = join(verificationDir, constructorArgsFile);

  console.log(`📄 Source File: ${flattenedFile}`);
  const sourceResult = validateSourceFile(flattenedPath, name);

  console.log(`\n📋 Constructor Args: ${constructorArgsFile}`);
  const argsResult = validateConstructorArgs(argsPath);

  // Combine results
  const combinedResult: ValidationResult = {
    valid: sourceResult.valid && argsResult.valid,
    errors: [...sourceResult.errors, ...argsResult.errors],
    warnings: [...sourceResult.warnings, ...argsResult.warnings],
  };

  return {
    name,
    flattenedFile,
    constructorArgsFile,
    result: combinedResult,
  };
}

/**
 * Print validation results
 */
function printResults(validations: ContractValidation[]): boolean {
  console.log(`\n${'═'.repeat(70)}`);
  console.log('📊 VALIDATION SUMMARY');
  console.log(`${'═'.repeat(70)}\n`);

  let allValid = true;

  for (const validation of validations) {
    const { name, result } = validation;
    const status = result.valid ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${name}`);

    if (result.errors.length > 0) {
      allValid = false;
      console.log('\n  Errors:');
      result.errors.forEach(error => console.log(`    ❌ ${error}`));
    }

    if (result.warnings.length > 0) {
      console.log('\n  Warnings:');
      result.warnings.forEach(warning => console.log(`    ⚠️  ${warning}`));
    }

    console.log();
  }

  return allValid;
}

/**
 * Print usage instructions
 */
function printInstructions(allValid: boolean) {
  if (allValid) {
    console.log(`${'═'.repeat(70)}`);
    console.log('✅ All validation checks passed!');
    console.log(`${'═'.repeat(70)}\n`);

    console.log('📝 Next Steps:\n');
    console.log('1. Read the verification guide:');
    console.log('   verification/IMPORTANT_READ_FIRST.md\n');
    console.log('2. Choose a verification method:');
    console.log('   • Gist (Easiest):  npm run verify:upload-gist');
    console.log('   • Foundry:         npm run verify:foundry');
    console.log('   • Manual:          Follow verification/README.md\n');
    console.log('⚠️  IMPORTANT: When verifying manually:');
    console.log('   • Paste flattened.sol into SOURCE CODE field');
    console.log('   • Paste constructor_args.txt into CONSTRUCTOR ARGUMENTS field');
    console.log('   • DO NOT mix them up!\n');
  } else {
    console.log(`${'═'.repeat(70)}`);
    console.log('❌ Validation failed!');
    console.log(`${'═'.repeat(70)}\n`);

    console.log('🔧 How to fix:\n');
    console.log('1. Regenerate verification files:');
    console.log('   npm run verify:autonomous\n');
    console.log('2. Check that hardhat.config.ts has correct compiler settings\n');
    console.log('3. Ensure contracts exist in ./contracts/ directory\n');
    console.log('4. Run this validation again after fixing\n');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║     Contract Verification Files Validator                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  // Validate both contracts
  const validations = [
    validateContract(
      'FlashSwapV2',
      'FlashSwapV2_flattened.sol',
      'FlashSwapV2_constructor_args.txt'
    ),
    validateContract(
      'FlashSwapV3',
      'FlashSwapV3_flattened.sol',
      'FlashSwapV3_constructor_args.txt'
    ),
  ];

  // Print results
  const allValid = printResults(validations);

  // Print instructions
  printInstructions(allValid);

  // Exit with appropriate code
  process.exit(allValid ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { validateSourceFile, validateConstructorArgs, validateContract };
