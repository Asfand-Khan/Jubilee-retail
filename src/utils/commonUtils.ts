import crypto from 'crypto';

export const generateRandomString = (length: number) => {
  const bytes = Math.ceil(length / 2); // 2 hex chars per byte
  return crypto.randomBytes(bytes).toString('hex').slice(0, length);
}