import crypto from 'crypto';
import { env } from './env';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  try {
    const key = Buffer.from(env.ENCRYPTION_KEY, 'base64');
    if (key.length !== 32) {
      throw new Error(`Encryption key must be 32 bytes, got ${key.length}`);
    }
    return key;
  } catch (error: any) {
    throw new Error(`Invalid ENCRYPTION_KEY: ${error.message}. Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
  }
}

/**
 * Encrypt sensitive data (like GitHub tokens)
 */
export function encrypt(text: string): string {
  const KEY = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  const KEY = getEncryptionKey();
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format — expected iv:authTag:data');
  }

  const [ivHex, authTagHex, encrypted] = parts;

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted text format — missing component');
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    throw new Error('Failed to decrypt token — the encryption key may have changed');
  }
}

/**
 * Generate a random token for webhook secrets
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Verify HMAC signature (for webhook validation)
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
