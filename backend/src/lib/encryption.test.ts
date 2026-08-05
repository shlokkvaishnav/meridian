import { describe, it, expect, beforeAll } from 'vitest';

// ENCRYPTION_KEY must be set before src/lib/env.ts (imported transitively by
// encryption.ts) evaluates its module-level schema check.
beforeAll(() => {
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  process.env.DATABASE_URL = 'postgresql://localhost/test';
});

describe('encrypt/decrypt', () => {
  it('round-trips a plaintext token', async () => {
    const { encrypt, decrypt } = await import('./encryption');
    const token = 'ghp_exampleGitHubTokenValue1234567890';
    const encrypted = encrypt(token);
    expect(decrypt(encrypted)).toBe(token);
  });

  it('produces different ciphertext for the same input each time (random IV)', async () => {
    const { encrypt } = await import('./encryption');
    const a = encrypt('same-input');
    const b = encrypt('same-input');
    expect(a).not.toBe(b);
  });

  it('stores iv:authTag:data as three hex-ish segments', async () => {
    const { encrypt } = await import('./encryption');
    const parts = encrypt('token').split(':');
    expect(parts).toHaveLength(3);
  });

  it('throws on a tampered ciphertext (auth tag mismatch)', async () => {
    const { encrypt, decrypt } = await import('./encryption');
    const encrypted = encrypt('token');
    const [iv, authTag, data] = encrypted.split(':');
    const tampered = `${iv}:${authTag}:${data.slice(0, -2)}ff`;
    expect(() => decrypt(tampered)).toThrow();
  });

  it('throws on a malformed encrypted string', async () => {
    const { decrypt } = await import('./encryption');
    expect(() => decrypt('not-the-right-format')).toThrow();
  });
});

describe('hash', () => {
  it('is deterministic for the same input', async () => {
    const { hash } = await import('./encryption');
    expect(hash('same')).toBe(hash('same'));
  });

  it('differs for different input', async () => {
    const { hash } = await import('./encryption');
    expect(hash('a')).not.toBe(hash('b'));
  });
});

describe('verifySignature', () => {
  it('accepts a signature computed with the matching secret', async () => {
    const { verifySignature } = await import('./encryption');
    const crypto = await import('crypto');
    const payload = '{"event":"pull_request"}';
    const secret = 'webhook-secret';
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expect(verifySignature(payload, signature, secret)).toBe(true);
  });

  it('rejects a signature computed with the wrong secret', async () => {
    const { verifySignature } = await import('./encryption');
    const crypto = await import('crypto');
    const payload = '{"event":"pull_request"}';
    const wrongSignature = crypto.createHmac('sha256', 'wrong-secret').update(payload).digest('hex');
    expect(verifySignature(payload, wrongSignature, 'webhook-secret')).toBe(false);
  });
});
