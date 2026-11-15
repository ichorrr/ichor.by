import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ENCRYPTED_PREFIX = 'enc:v1:';
let cachedSecret;
let cachedKey;

const encryptionKey = () => {
  const secret = process.env.CHAT_MESSAGE_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('CHAT_MESSAGE_ENCRYPTION_KEY must be configured with a random secret of at least 32 characters.');
  }
  if (secret !== cachedSecret) {
    cachedSecret = secret;
    cachedKey = scryptSync(secret, 'ichor.by:chat-message-encryption:v1', 32);
  }
  return cachedKey;
};

export const assertMessageEncryptionConfigured = () => {
  encryptionKey();
};

export const encryptMessageText = value => {
  if (typeof value !== 'string' || value.length === 0) return value;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENCRYPTED_PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${ciphertext.toString('base64url')}`;
};

export const decryptMessageText = value => {
  if (typeof value !== 'string' || !value.startsWith(ENCRYPTED_PREFIX)) return value;
  const [, version, ivValue, tagValue, ciphertextValue] = value.split(':');
  if (version !== 'v1' || !ivValue || !tagValue || ciphertextValue === undefined) {
    throw new Error('Stored chat message has an invalid encrypted format.');
  }
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, 'base64url')),
    decipher.final()
  ]).toString('utf8');
};

export const isEncryptedMessageText = value => (
  typeof value === 'string' && value.startsWith(ENCRYPTED_PREFIX)
);
