/**
 * Health Data Vault — Zero-Knowledge Encryption Engine
 *
 * AES-256-GCM with PBKDF2 key derivation (600k iterations)
 * Everything is encrypted BEFORE leaving the device.
 *
 * Usage:
 *   const { encrypted, iv, salt } = await encrypt(data, passphrase);
 *   const decrypted = await decrypt(encrypted, passphrase, iv, salt);
 */

const ITERATIONS = 600000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

function str2ab(str) {
  return new TextEncoder().encode(str);
}

function ab2str(ab) {
  return new TextDecoder().decode(ab);
}

function ab2hex(ab) {
  return Array.from(new Uint8Array(ab))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hex2ab(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function base64ToArrayBuffer(base64) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function deriveKey(passphrase, salt) {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    str2ab(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data with a passphrase
 * @param {string|ArrayBuffer} data - Data to encrypt
 * @param {string} passphrase - User's passphrase
 * @returns {{ encrypted: string, iv: string, salt: string }} Base64-encoded
 */
export async function encrypt(data, passphrase) {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const dataBuffer = typeof data === 'string' ? str2ab(data) : data;
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
}

/**
 * Decrypt data with a passphrase
 * @param {string} encryptedB64 - Base64-encoded encrypted data
 * @param {string} passphrase - User's passphrase
 * @param {string} ivB64 - Base64-encoded IV
 * @param {string} saltB64 - Base64-encoded salt
 * @returns {string} Decrypted string
 */
export async function decrypt(encryptedB64, passphrase, ivB64, saltB64) {
  const salt = new Uint8Array(base64ToArrayBuffer(saltB64));
  const iv = new Uint8Array(base64ToArrayBuffer(ivB64));
  const encrypted = base64ToArrayBuffer(encryptedB64);
  const key = await deriveKey(passphrase, salt);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return ab2str(decrypted);
}

/**
 * Generate a random share token
 */
export function generateShareToken() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('');
}

/**
 * Hash a string (for passphrase verification without storing it)
 */
export async function hashPassphrase(passphrase) {
  const hash = await window.crypto.subtle.digest('SHA-256', str2ab(passphrase));
  return ab2hex(hash);
}

/**
 * Verify passphrase against stored hash
 */
export async function verifyPassphrase(passphrase, storedHash) {
  const hash = await hashPassphrase(passphrase);
  return hash === storedHash;
}

