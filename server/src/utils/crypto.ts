import { createCipheriv, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

const rawKey = Buffer.from(env.DATA_ENCRYPTION_KEY, 'base64');

if (rawKey.length !== 32) {
  throw new Error(
    'DATA_ENCRYPTION_KEY debe contener 32 bytes en base64 (44 caracteres). Regenerala con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
  );
}

const KEY = rawKey;

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

export function encryptText(plain: string): EncryptedPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const data = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64')
  };
}

export function encryptJson(value: unknown): EncryptedPayload {
  return encryptText(JSON.stringify(value));
}