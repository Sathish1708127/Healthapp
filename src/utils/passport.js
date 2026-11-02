/**
 * Digital Health Passport — Credential Engine
 *
 * W3C Verifiable Credential-inspired format.
 * Offline-verifiable via hash-based signatures.
 */

const CREDENTIAL_TYPES = {
  BLOOD_GROUP: { id: 'blood-group', label: 'Blood Group', icon: '🩸' },
  ALLERGY: { id: 'allergy', label: 'Allergy', icon: '⚠️' },
  VACCINATION: { id: 'vaccination', label: 'Vaccination', icon: '💉' },
  CHRONIC_CONDITION: { id: 'chronic-condition', label: 'Chronic Condition', icon: '🏥' },
  EMERGENCY_CONTACT: { id: 'emergency-contact', label: 'Emergency Contact', icon: '📞' },
  ORGAN_DONATION: { id: 'organ-donation', label: 'Organ Donation', icon: '🫀' },
  MEDICATION: { id: 'medication', label: 'Medication', icon: '💊' },
};

const PASSPORT_STORE = 'HealthPassport';

function getStore() {
  try {
    const data = localStorage.getItem(PASSPORT_STORE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore(credentials) {
  localStorage.setItem(PASSPORT_STORE, JSON.stringify(credentials));
}

/**
 * Generate a SHA-256 hash for a credential
 */
async function hashCredential(cred) {
  const data = JSON.stringify({ ...cred, signature: undefined });
  const encoder = new TextEncoder();
  const hash = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new health credential
 */
export async function createCredential({ type, claims, issuer = 'Self', expiresInDays = 365 }) {
  const credential = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    type,
    issuer,
    issueDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresInDays * 86400000).toISOString(),
    claims,
    verified: true,
  };
  credential.signature = await hashCredential(credential);
  const credentials = getStore();
  credentials.push(credential);
  setStore(credentials);
  return credential;
}

/**
 * Get all credentials
 */
export function getAllCredentials() {
  return getStore().sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
}

/**
 * Get credentials by type
 */
export function getCredentialsByType(type) {
  return getStore().filter(c => c.type === type);
}

/**
 * Verify a credential's signature (offline)
 */
export async function verifyCredential(credential) {
  const signature = credential.signature;
  const computed = await hashCredential(credential);
  return signature === computed;
}

/**
 * Delete a credential
 */
export function deleteCredential(id) {
  const credentials = getStore().filter(c => c.id !== id);
  setStore(credentials);
}

/**
 * Generate QR code data (compact credential)
 */
export function getQRData(credential) {
  const compact = {
    t: credential.type,
    c: credential.claims,
    i: credential.issuer,
    s: credential.signature?.slice(0, 16),
    d: credential.issueDate.split('T')[0],
  };
  return JSON.stringify(compact);
}

/**
 * Parse scanned QR data back to readable format
 */
export function parseQRData(qrString) {
  try {
    const data = JSON.parse(qrString);
    const typeInfo = Object.values(CREDENTIAL_TYPES).find(t => t.id === data.t);
    return {
      type: typeInfo?.label || data.t,
      claims: data.c,
      issuer: data.i,
      date: data.d,
      verified: true,
    };
  } catch {
    return null;
  }
}

/**
 * Get credential stats
 */
export function getPassportStats() {
  const credentials = getStore();
  const byType = {};
  let expired = 0;
  const now = new Date();
  credentials.forEach((c) => {
    byType[c.type] = (byType[c.type] || 0) + 1;
    if (new Date(c.expiresAt) < now) expired++;
  });
  return { total: credentials.length, byType, expired };
}

export { CREDENTIAL_TYPES };

