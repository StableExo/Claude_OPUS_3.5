/**
 * Utility to validate SECRETS_ENCRYPTION_KEY
 * 
 * Validates that the encryption key:
 * - Exists in the environment
 * - Is exactly 64 hex characters (32 bytes)
 * - Can successfully encrypt and decrypt test data
 */

import * as crypto from 'crypto';

export interface EncryptionKeyValidationResult {
  isValid: boolean;
  exists: boolean;
  hasCorrectLength: boolean;
  isHexString: boolean;
  canEncryptDecrypt: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate the SECRETS_ENCRYPTION_KEY environment variable
 */
export function validateSecretsEncryptionKey(key?: string): EncryptionKeyValidationResult {
  const result: EncryptionKeyValidationResult = {
    isValid: false,
    exists: false,
    hasCorrectLength: false,
    isHexString: false,
    canEncryptDecrypt: false,
    errors: [],
    warnings: [],
  };

  const rawKey = key || process.env.SECRETS_ENCRYPTION_KEY;

  // Check if key exists
  if (!rawKey || rawKey.trim() === '') {
    result.errors.push('SECRETS_ENCRYPTION_KEY is not set in environment');
    return result;
  }
  result.exists = true;

  // Trim whitespace
  const encryptionKey = rawKey.trim();

  // Check if key has correct length (64 hex chars = 32 bytes)
  if (encryptionKey.length !== 64) {
    result.errors.push(
      `SECRETS_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes), got ${encryptionKey.length} characters`
    );
    result.warnings.push(
      'Generate a valid key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  } else {
    result.hasCorrectLength = true;
  }

  // Check if key is a valid hex string
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(encryptionKey)) {
    result.errors.push('SECRETS_ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)');
  } else {
    result.isHexString = true;
  }

  // Test encryption and decryption if key looks valid
  if (result.exists && result.hasCorrectLength && result.isHexString) {
    try {
      const testData = 'test-encryption-validation-' + Date.now();
      const encrypted = testEncrypt(testData, encryptionKey);
      const decrypted = testDecrypt(encrypted, encryptionKey);

      if (decrypted === testData) {
        result.canEncryptDecrypt = true;
      } else {
        result.errors.push('Encryption/decryption test failed: decrypted data does not match original');
      }
    } catch (error) {
      result.errors.push(
        `Encryption/decryption test failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Set overall validity
  result.isValid = result.exists && result.hasCorrectLength && result.isHexString && result.canEncryptDecrypt;

  return result;
}

/**
 * Test encryption function (matches SupabaseEnvStorage implementation)
 * 
 * Note: This uses the first 32 characters of the key as UTF-8, not hex conversion.
 * This matches the current SupabaseEnvStorage.encrypt() implementation.
 * While the key is expected to be 64 hex characters, the implementation
 * treats it as a UTF-8 string and uses slice(0, 32) for the cipher key.
 */
function testEncrypt(text: string, key: string): string {
  const algorithm = 'aes-256-cbc';
  const keyBuffer = Buffer.from(key.slice(0, 32), 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Test decryption function (matches SupabaseEnvStorage implementation)
 * 
 * Note: This uses the first 32 characters of the key as UTF-8, not hex conversion.
 * This matches the current SupabaseEnvStorage.decrypt() implementation.
 */
function testDecrypt(encryptedText: string, key: string): string {
  const algorithm = 'aes-256-cbc';
  const keyBuffer = Buffer.from(key.slice(0, 32), 'utf8');
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Format validation result as a human-readable string
 */
export function formatValidationResult(result: EncryptionKeyValidationResult): string {
  const lines: string[] = [];
  
  lines.push('SECRETS_ENCRYPTION_KEY Validation:');
  lines.push('='.repeat(80));
  lines.push('');
  
  lines.push(`✓ Key exists:              ${result.exists ? '✅ Yes' : '❌ No'}`);
  lines.push(`✓ Correct length (64):     ${result.hasCorrectLength ? '✅ Yes' : '❌ No'}`);
  lines.push(`✓ Valid hex string:        ${result.isHexString ? '✅ Yes' : '❌ No'}`);
  lines.push(`✓ Can encrypt/decrypt:     ${result.canEncryptDecrypt ? '✅ Yes' : '❌ No'}`);
  lines.push('');
  lines.push(`Overall Status:            ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (result.errors.length > 0) {
    lines.push('');
    lines.push('❌ Errors:');
    result.errors.forEach(error => lines.push(`   • ${error}`));
  }
  
  if (result.warnings.length > 0) {
    lines.push('');
    lines.push('⚠️  Warnings:');
    result.warnings.forEach(warning => lines.push(`   • ${warning}`));
  }
  
  lines.push('');
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

/**
 * Throw an error if the encryption key is invalid
 */
export function requireValidEncryptionKey(key?: string): void {
  const result = validateSecretsEncryptionKey(key);
  
  if (!result.isValid) {
    const message = [
      'Invalid SECRETS_ENCRYPTION_KEY:',
      '',
      ...result.errors,
      '',
      'To generate a valid key, run:',
      '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      '',
      'Then set it in your .env file:',
      '  SECRETS_ENCRYPTION_KEY=<generated-key>',
    ].join('\n');
    
    throw new Error(message);
  }
}
