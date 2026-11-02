import React, { useState, useEffect, useCallback } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, Divider, Tag } from '../components/UI';
import { useNotification } from '../components/NotificationContext';
import { saveDocument, getAllDocuments, deleteDocument, getVaultStats, setShareStatus } from '../utils/vaultStorage';
import { encrypt, decrypt, generateShareToken } from '../utils/encryption';

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📁' },
  { id: 'lab_report', label: 'Lab Reports', icon: '🔬' },
  { id: 'prescription', label: 'Prescriptions', icon: '💊' },
  { id: 'imaging', label: 'Imaging', icon: '🩻' },
  { id: 'genetic', label: 'Genetic', icon: '🧬' },
  { id: 'vaccination', label: 'Vaccination', icon: '💉' },
  { id: 'other', label: 'Other', icon: '📄' },
];

const CATEGORY_COLORS = {
  lab_report: 'blue',
  prescription: 'green',
  imaging: 'purple',
  genetic: 'red',
  vaccination: 'teal',
  other: 'amber',
};

export default function HealthVault() {
  const { showToast, showModal } = useNotification();
  const [locked, setLocked] = useState(true);
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [vaultHash, setVaultHash] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [stats, setStats] = useState({ total: 0, categories: {}, totalSizeMB: 0 });
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [decryptingPass, setDecryptingPass] = useState('');

  // Check if vault is set up
  useEffect(() => {
    const hash = localStorage.getItem('healthai_vault_hash');
    if (hash) {
      setVaultHash(hash);
      setSetupMode(false);
    } else {
      setSetupMode(true);
    }
  }, []);

  const loadDocuments = useCallback(async () => {
    const docs = await getAllDocuments();
    setDocuments(docs);
    setStats(await getVaultStats());
  }, []);

  useEffect(() => {
    if (!locked) {
      loadDocuments();
    }
  }, [locked, loadDocuments]);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredDocs(documents);
    } else {
      setFilteredDocs(documents.filter(d => d.category === activeCategory));
    }
  }, [documents, activeCategory]);

  // Set up vault (first-time)
  const handleSetup = async () => {
    if (passphrase.length < 8) { showToast('Passphrase must be at least 8 characters', 'warning'); return; }
    if (passphrase !== passphraseConfirm) { showToast('Passphrases do not match', 'error'); return; }
    const hash = await import('../utils/encryption').then(m => m.hashPassphrase(passphrase));
    localStorage.setItem('healthai_vault_hash', hash);
    setVaultHash(hash);
    setSetupMode(false);
    setLocked(false);
  };

  // Unlock vault
  const handleUnlock = async () => {
    const { verifyPassphrase } = await import('../utils/encryption');
    const valid = await verifyPassphrase(passphrase, vaultHash);
    if (valid) {
      setLocked(false);
      setPassphrase('');
    } else {
      showToast('Incorrect passphrase. Access denied.', 'error');
    }
  };

  // Upload & encrypt a document
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const { encrypted, iv, salt } = await encrypt(text, passphrase);
      const category = file.type.includes('image') ? 'imaging' : 
        file.name.toLowerCase().includes('prescription') ? 'prescription' :
        file.name.toLowerCase().includes('lab') || file.name.toLowerCase().includes('report') ? 'lab_report' : 'other';
      await saveDocument({
        name: file.name,
        category,
        type: category,
        mimeType: file.type,
        size: file.size,
        encrypted,
        iv,
        salt,
        tags: [category],
      });
      await loadDocuments();
      setShowUpload(false);
    } catch (err) {
      showToast('Encryption failed: ' + err.message, 'error');
    }
    setUploading(false);
  };

  // Decrypt & view a document
  const handleViewDoc = async (doc) => {
    try {
      const decrypted = await decrypt(doc.encrypted, passphrase, doc.iv, doc.salt);
      setSelectedDoc({ ...doc, decryptedContent: decrypted });
    } catch {
      showToast('Decryption failed. Please verify your passphrase.', 'error');
    }
  };

  // Share a document (generate share token)
  const handleShare = async (doc) => {
    const token = generateShareToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await setShareStatus(doc.id, true, token, expiry);
    const shareLink = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(shareLink);
    showToast('Secure doctor share link copied to clipboard! (Expires in 24 hours)', 'success', 4000);
    await loadDocuments();
  };

  // Delete document
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document permanently?')) return;
    await deleteDocument(id);
    await loadDocuments();
    setSelectedDoc(null);
  };

  if (setupMode) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto' }}>
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
          <SectionTitle>Set Up Your Health Vault</SectionTitle>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20, lineHeight: 1.6 }}>
            Your documents are encrypted with <strong>AES-256-GCM</strong> on your device.
            Nothing is stored in plaintext. Choose a strong passphrase you won't forget.
          </div>
          <input type="password" placeholder="Passphrase (min 8 chars)" value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            style={inputStyle} />
          <input type="password" placeholder="Confirm passphrase" value={passphraseConfirm}
            onChange={e => setPassphraseConfirm(e.target.value)}
            style={{ ...inputStyle, marginTop: 10 }} />
          <Btn onClick={handleSetup} style={{ width: '100%', marginTop: 16 }}>Create Vault</Btn>
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
            ⚠️ If you lose your passphrase, your data cannot be recovered.
          </div>
        </Card>
      </div>
    );
  }

  if (locked) {
    return (
      <div style={{ maxWidth: 450, margin: '80px auto' }}>
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <SectionTitle>Health Vault — Locked</SectionTitle>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
            Enter your passphrase to access your encrypted health documents.
          </div>
          <input type="password" placeholder="Vault passphrase" value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            style={inputStyle} />
          <Btn onClick={handleUnlock} style={{ width: '100%', marginTop: 12 }}>Unlock Vault</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🔐 Health Data Vault</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Zero-knowledge encrypted storage. You hold the keys. {stats.total} documents · {stats.totalSizeMB} MB
        </div>
      </div>

      {/* Stats bar */}
      <Grid cols={4} gap={12} style={{ marginBottom: 20 }}>
        <Card style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--blue)' }}>{stats.total}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Total Documents</div>
        </Card>
        {Object.entries(stats.categories || {}).slice(0, 3).map(([cat, count]) => {
          const catInfo = CATEGORIES.find(c => c.id === cat);
          return (
            <Card key={cat} style={{ padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{catInfo?.label || cat}</div>
            </Card>
          );
        })}
      </Grid>

      <div style={{ display: 'flex', gap: 20, alignItems: 'start' }}>
        {/* Left: Category filter + doc list */}
        <div style={{ flex: 1 }}>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <span key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  background: activeCategory === cat.id ? 'var(--green-dim)' : 'var(--bg3)',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--green)' : 'var(--border)'}`,
                  color: activeCategory === cat.id ? 'var(--green)' : 'var(--text2)',
                }}>{cat.icon} {cat.label}</span>
              ))}
            </div>
          </Card>

          {/* Search */}
          <input placeholder="Search documents..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ ...inputStyle, marginBottom: 14, width: '100%' }} />

          {/* Upload button */}
          <Btn onClick={() => setShowUpload(!showUpload)} style={{ marginBottom: 14 }}>
            {showUpload ? 'Cancel' : '+ Upload Document'}
          </Btn>

          {showUpload && (
            <Card style={{ marginBottom: 14, padding: 20, textAlign: 'center', border: '2px dashed var(--border2)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                File is encrypted on-device before storage
              </div>
              <input type="file" onChange={handleFileUpload} disabled={uploading}
                style={{ fontSize: 12 }} />
              {uploading && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>Encrypting & saving...</div>}
            </Card>
          )}

          {/* Document list */}
          {filteredDocs.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              No documents in this category. Upload your first document.
            </Card>
          ) : (
            filteredDocs.map(doc => (
              <Card key={doc.id} style={{ padding: 14, marginBottom: 8, cursor: 'pointer' }}
                onClick={() => handleViewDoc(doc)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>📄 {doc.name}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                      <Badge color={CATEGORY_COLORS[doc.category] || 'blue'}>
                        {CATEGORIES.find(c => c.id === doc.category)?.label || doc.category}
                      </Badge>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--green)' }}>🔒 Encrypted</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Btn variant="outline" onClick={() => handleShare(doc)} style={{ padding: '4px 10px', fontSize: 11 }}>
                      Share
                    </Btn>
                    <Btn variant="outline" onClick={() => handleDelete(doc.id)}
                      style={{ padding: '4px 10px', fontSize: 11, color: 'var(--red)', borderColor: 'var(--red)' }}>
                      🗑️
                    </Btn>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right: Document viewer */}
        <div style={{ width: 380, position: 'sticky', top: 24 }}>
          {selectedDoc ? (
            <Card>
              <SectionTitle>📄 {selectedDoc.name}</SectionTitle>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
                {new Date(selectedDoc.createdAt).toLocaleString()} · {selectedDoc.mimeType}
              </div>
              <div style={{
                background: 'var(--bg3)', borderRadius: 8, padding: 16,
                maxHeight: 400, overflow: 'auto', fontSize: 12, whiteSpace: 'pre-wrap',
                fontFamily: 'monospace', border: '1px solid var(--border)',
              }}>
                {selectedDoc.decryptedContent || 'Decrypting...'}
              </div>
              <Btn variant="outline" onClick={() => setSelectedDoc(null)}
                style={{ marginTop: 10, width: '100%', fontSize: 12 }}>
                Close
              </Btn>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: 30, color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 13 }}>Click a document to view its decrypted content</div>
            </Card>
          )}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 10, background: 'var(--amber-dim)', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        🔒 <strong>Zero-Knowledge:</strong> All documents are encrypted with AES-256-GCM using your passphrase.
        The encryption happens on YOUR device before any data is stored. Even if someone accesses the database,
        they cannot read your files. You alone hold the keys.
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none',
  width: '100%', fontFamily: 'inherit', boxSizing: 'border-box',
};

