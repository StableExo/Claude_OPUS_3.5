# SECRETS_ENCRYPTION_KEY Validation

## Overview

TheWarden now includes comprehensive validation for the `SECRETS_ENCRYPTION_KEY` environment variable to ensure it's correctly configured before attempting encryption/decryption operations.

## Quick Verification

To verify your encryption key is correct:

```bash
npm run verify:encryption-key
# or
npm run check:encryption-key
```

## What Gets Validated

The validation checks ensure your `SECRETS_ENCRYPTION_KEY`:

1. ✅ **Exists** - The key is set in your environment
2. ✅ **Correct Length** - Exactly 64 hex characters (32 bytes)
3. ✅ **Valid Format** - Contains only hexadecimal characters (0-9, a-f, A-F)
4. ✅ **Works** - Can successfully encrypt and decrypt test data

## Successful Validation

When the key is valid, you'll see:

```
✅ SUCCESS! SECRETS_ENCRYPTION_KEY is valid and working correctly.

The key can:
  ✓ Encrypt sensitive data
  ✓ Decrypt encrypted secrets
  ✓ Be used with Supabase environment storage
```

## Failed Validation

If validation fails, you'll receive specific error messages:

### Missing Key
```
❌ SECRETS_ENCRYPTION_KEY is NOT set in environment
```

### Invalid Length
```
❌ SECRETS_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes), got X characters
```

### Invalid Format
```
❌ SECRETS_ENCRYPTION_KEY must contain only hexadecimal characters (0-9, a-f, A-F)
```

## Generating a Valid Key

To generate a new valid encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string, for example:
```
aa42e55372a0730f908fb690faf55d78fb6d48c47bba786868c250c377b2a117
```

## Setting Up the Key

### Local Development (.env file)

Add to your `.env` file:
```bash
SECRETS_ENCRYPTION_KEY=your-64-char-hex-key-here
```

### GitHub Actions (Repository Secrets)

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SECRETS_ENCRYPTION_KEY`
5. Value: Your 64-character hex key
6. Click **Add secret**

### Environment Variables (Direct)

```bash
export SECRETS_ENCRYPTION_KEY=your-64-char-hex-key-here
```

## Integration Points

The validation is automatically integrated into:

1. **SupabaseEnvStorage** - Validates key at initialization
2. **Verification Script** - Standalone validation tool
3. **Unit Tests** - Comprehensive test coverage

## Error Handling

If an invalid key is provided to `SupabaseEnvStorage`, it will throw a descriptive error:

```
Error: Invalid SECRETS_ENCRYPTION_KEY: SECRETS_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes), got 32 characters. Generate a valid key with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Usage

### Validate Programmatically

```typescript
import { validateSecretsEncryptionKey } from './src/utils/validateEncryptionKey';

const result = validateSecretsEncryptionKey();

if (result.isValid) {
  console.log('Key is valid!');
} else {
  console.error('Validation errors:', result.errors);
}
```

### Require Valid Key (Throws on Invalid)

```typescript
import { requireValidEncryptionKey } from './src/utils/validateEncryptionKey';

try {
  requireValidEncryptionKey();
  // Key is valid, continue
} catch (error) {
  // Handle invalid key
  console.error(error.message);
}
```

### Format Validation Result

```typescript
import { formatValidationResult } from './src/utils/validateEncryptionKey';

const result = validateSecretsEncryptionKey();
console.log(formatValidationResult(result));
```

## Security Notes

- The key is trimmed automatically to handle whitespace
- Only the first 10 characters are displayed in output for security
- The validation includes a real encryption/decryption test to ensure functionality
- Invalid keys are caught early before any operations fail

## Testing

Run the validation tests:

```bash
npx vitest run tests/unit/utils/validateEncryptionKey.test.ts
```

All 16 tests should pass, covering:
- Missing keys
- Empty keys
- Short/long keys
- Invalid characters
- Valid keys
- Encryption/decryption functionality

## Troubleshooting

### Key appears correct but validation fails

- Check for hidden whitespace (the validator trims it automatically)
- Ensure you're using lowercase hex characters or uppercase (both work)
- Verify the key is exactly 64 characters long

### "Cannot find module" error

Make sure dependencies are installed:
```bash
npm install
```

### Different key in different environments

The validator uses `process.env.SECRETS_ENCRYPTION_KEY`, which comes from:
1. `.env` file (local development)
2. GitHub Secrets (CI/CD)
3. Environment variables (production)

Ensure the key is consistent across all environments.

## Implementation Details

The validation utility is located at:
- **Utility**: `src/utils/validateEncryptionKey.ts`
- **Script**: `scripts/verify-secrets-encryption-key.ts`
- **Tests**: `tests/unit/utils/validateEncryptionKey.test.ts`

Encryption/decryption follows the same algorithm used in `SupabaseEnvStorage`:
- Algorithm: AES-256-CBC
- Key: First 32 bytes of the provided key
- IV: 16 random bytes per encryption

## Repository Environment

The key should already be configured in your repository environment. This validation ensures it's accessible and correctly formatted when needed for:
- Supabase environment storage
- Secret encryption/decryption
- Secure configuration management
