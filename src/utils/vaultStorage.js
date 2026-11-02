/**
 * Health Data Vault — IndexedDB Storage Layer
 *
 * Stores encrypted blobs with searchable metadata.
 * Metadata is encrypted separately (filenames, tags, dates).
 * Decryption happens on-demand when user views a document.
 */

const DB_NAME = 'HealthVault';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save an encrypted document to the vault
 */
export async function saveDocument(doc) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({
      id: doc.id || Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: doc.name,          // encrypted
      category: doc.category,   // plaintext for sorting
      type: doc.type,           // 'lab_report' | 'prescription' | 'imaging' | 'genetic' | 'vaccination' | 'other'
      mimeType: doc.mimeType,
      size: doc.size,
      encrypted: doc.encrypted, // base64 encrypted blob
      iv: doc.iv,              // base64
      salt: doc.salt,          // base64
      tags: doc.tags || [],
      createdAt: doc.createdAt || new Date().toISOString(),
      expiresAt: doc.expiresAt || null,
      thumbnail: doc.thumbnail || null, // encrypted small thumbnail
      notes: doc.notes || '',  // encrypted
      shared: false,
    });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get all documents (metadata only, content is encrypted)
 */
export async function getAllDocuments() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get documents by category
 */
export async function getDocumentsByCategory(category) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('category');
    const req = index.getAll(category);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get a single document by ID
 */
export async function getDocument(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Delete a document
 */
export async function deleteDocument(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

/**
 * Search documents by tag
 */
export async function searchByTags(tags) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('tags');
    const results = [];
    let processed = 0;
    tags.forEach((tag) => {
      const req = index.getAll(tag);
      req.onsuccess = () => {
        results.push(...req.result);
        processed++;
        if (processed === tags.length) {
          const unique = results.filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
          resolve(unique);
        }
      };
    });
    tx.oncomplete = () => db.close();
  });
}

/**
 * Get vault statistics
 */
export async function getVaultStats() {
  const docs = await getAllDocuments();
  const categories = {};
  let totalSize = 0;
  docs.forEach((d) => {
    categories[d.category] = (categories[d.category] || 0) + 1;
    totalSize += d.size || 0;
  });
  return {
    total: docs.length,
    categories,
    totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 10) / 10,
  };
}

/**
 * Update document sharing status
 */
export async function setShareStatus(id, shared, shareToken = null, shareExpiry = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const doc = getReq.result;
      if (!doc) { resolve(false); return; }
      doc.shared = shared;
      if (shareToken) doc.shareToken = shareToken;
      if (shareExpiry) doc.shareExpiry = shareExpiry;
      const putReq = store.put(doc);
      putReq.onsuccess = () => resolve(true);
    };
    tx.oncomplete = () => db.close();
  });
}

