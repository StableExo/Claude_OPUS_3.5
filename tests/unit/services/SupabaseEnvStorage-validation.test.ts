import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SupabaseEnvStorage } from '../../../src/services/SupabaseEnvStorage.js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: {}, error: null })),
        })),
      })),
    })),
  })),
}));

describe('SupabaseEnvStorage encryption key validation', () => {
  const validUrl = 'https://test.supabase.co';
  const validKey = 'test-anon-key';
  const validEncryptionKey = 'a'.repeat(64); // Valid 64-char hex key

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid encryption key', () => {
    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: validEncryptionKey,
      });
    }).not.toThrow();
  });

  it('should throw error for invalid encryption key length', () => {
    const invalidKey = 'a'.repeat(32); // Only 32 chars, should be 64

    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: invalidKey,
      });
    }).toThrow(/Invalid SECRETS_ENCRYPTION_KEY.*must be exactly 64 hex characters/);
  });

  it('should throw error for non-hex encryption key', () => {
    const invalidKey = 'z'.repeat(64); // Valid length but not hex

    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: invalidKey,
      });
    }).toThrow(/Invalid SECRETS_ENCRYPTION_KEY.*must contain only hexadecimal characters/);
  });

  it('should accept encryption key with whitespace (gets trimmed)', () => {
    const keyWithWhitespace = `  ${validEncryptionKey}  `;

    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: keyWithWhitespace,
      });
    }).not.toThrow();
  });

  it('should work without encryption key', () => {
    // Should not throw when no encryption key is provided
    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
      });
    }).not.toThrow();
  });

  it('should throw error with helpful message', () => {
    const invalidKey = 'short';

    try {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: invalidKey,
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error instanceof Error).toBe(true);
      const message = (error as Error).message;
      expect(message).toContain('Invalid SECRETS_ENCRYPTION_KEY');
      expect(message).toContain('Generate a valid key');
      expect(message).toContain('crypto');
    }
  });

  it('should validate real encryption key from production', () => {
    // Real production key format
    const realKey = 'aa42e55372a0730f908fb690faf55d78fb6d48c47bba786868c250c377b2a117';

    expect(() => {
      new SupabaseEnvStorage({
        supabaseUrl: validUrl,
        supabaseKey: validKey,
        encryptionKey: realKey,
      });
    }).not.toThrow();
  });
});
