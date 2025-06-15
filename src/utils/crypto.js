// utils/crypto.js
import { config } from 'dotenv';
config();

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.CRYPTO_KEY.padEnd(32, '0').slice(0, 32); // 32 bytes
const IV = Buffer.alloc(16, 0); // Vetor de inicialização fixo

export function encrypt(text) {
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

export function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, IV);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}
