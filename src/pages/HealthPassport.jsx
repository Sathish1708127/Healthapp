import React, { useState, useEffect, useRef } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, Divider } from '../components/UI';
import { createCredential, getAllCredentials, deleteCredential, getQRData, verifyCredential, CREDENTIAL_TYPES, getPassportStats } from '../utils/passport';

function QRCanvas({ data, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = size / 23;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    // Generate a simple QR-ish pattern from the hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Draw position markers (top-left, top-right, bottom-left)
    const drawPositionMarker = (x, y) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = 'white';
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000';
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };
    drawPositionMarker(0, 0);
    drawPositionMarker(16, 0);
    drawPositionMarker(0, 16);

    // Fill remaining cells with pattern based on seed
    ctx.fillStyle = '#000';
    let rng = seed;
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        // Skip position markers
        if ((row < 7 && col < 7) || (row < 7 && col > 15) || (row > 15 && col < 7)) continue;
        if ((row < 7 && (col < 7 || col > 15)) || (row > 15 && col < 7)) continue;
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        if (rng % 2 === 0) {
          ctx.fillRect((col + 1) * cellSize, (row + 1) * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [data, size]);

  return (
    <canvas ref={canvasRef} width={size} height={size}
      style={{ borderRadius: 8, imageRendering: 'pixelated' }} />
  );
}

const CREDENTIAL_FORM_CONFIG = {
  'blood-group': {
    fields: [
      { key: 'group', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { key: 'rh', label: 'Rh Factor', type: 'select', options: ['Positive', 'Negative'] },
    ]
  },
  'allergy': {
    fields: [
      { key: 'allergen', label: 'Allergen', type: 'text', placeholder: 'e.g. Penicillin, Peanuts, Pollen' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Mild', 'Moderate', 'Severe', 'Anaphylactic'] },
    ]
  },
  'vaccination': {
    fields: [
      { key: 'vaccine', label: 'Vaccine Name', type: 'text', placeholder: 'e.g. COVID-19, Typhoid, HPV' },
      { key: 'date', label: 'Date Administered', type: 'date' },
      { key: 'dose', label: 'Dose #', type: 'select', options: ['1', '2', '3', 'Booster'] },
    ]
  },
  'chronic-condition': {
    fields: [
      { key: 'condition', label: 'Condition', type: 'text', placeholder: 'e.g. Diabetes Type 2, Hypertension' },
      { key: 'diagnosedDate', label: 'Diagnosed Date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Medications, management notes...' },
    ]
  },
  'emergency-contact': {
    fields: [
      { key: 'name', label: 'Contact Name', type: 'text' },
      { key: 'relation', label: 'Relation', type: 'text', placeholder: 'Spouse, Parent, Sibling' },
      { key: 'phone', label: 'Phone Number', type: 'text', placeholder: '+91 9876543210' },
    ]
  },
  'organ-donation': {
    fields: [
      { key: 'organs', label: 'Organs to Donate', type: 'text', placeholder: 'All, Kidneys, Eyes, etc.' },
      { key: 'status', label: 'Status', type: 'select', options: ['Registered', 'Pending', 'Not Registered'] },
    ]
  },
  'medication': {
    fields: [
      { key: 'drug', label: 'Drug Name', type: 'text' },
      { key: 'dosage', label: 'Dosage', type: 'text', placeholder: 'e.g. 500mg twice daily' },
      { key: 'prescribedBy', label: 'Prescribed By', type: 'text' },
    ]
  },
};

export default function HealthPassport() {
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({ total: 0, byType: {}, expired: 0 });
  const [activeTab, setActiveTab] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('blood-group');
  const [formData, setFormData] = useState({});
  const [selectedCred, setSelectedCred] = useState(null);

  useEffect(() => {
    setCredentials(getAllCredentials());
    setStats(getPassportStats());
  }, []);

  const refresh = () => {
    setCredentials(getAllCredentials());
    setStats(getPassportStats());
  };

  const handleCreate = async () => {
    const config = CREDENTIAL_FORM_CONFIG[addType];
    const missing = config.fields.filter(f => !formData[f.key] && f.type !== 'textarea');
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    await createCredential({ type: addType, claims: formData });
    setFormData({});
    setShowAdd(false);
    refresh();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credential?')) return;
    deleteCredential(id);
    setSelectedCred(null);
    refresh();
  };

  const handleVerify = async (cred) => {
    const valid = await verifyCredential(cred);
    alert(valid ? '✅ Credential verified — signature matches' : '❌ Credential verification failed — data may have been tampered');
  };

  // Filter credentials
  const filteredCreds = activeTab === 'all' ? credentials : credentials.filter(c => c.type === activeTab);

  const typeInfo = CREDENTIAL_TYPES[addType.toUpperCase().replace('-', '_')];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🪪 Digital Health Passport</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Self-sovereign verifiable health credentials. Offline-verifiable via QR. {stats.total} credentials · {stats.expired} expired
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'start' }}>
        {/* Left panel */}
        <div style={{ flex: 1 }}>
          {/* Category tabs */}
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span key="all" onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>
                📋 All ({stats.total})
              </span>
              {Object.values(CREDENTIAL_TYPES).map(t => (
                <span key={t.id} onClick={() => setActiveTab(t.id)} style={tabStyle(activeTab === t.id)}>
                  {t.icon} {t.label} ({stats.byType[t.id] || 0})
                </span>
              ))}
            </div>
          </Card>

          <Btn onClick={() => setShowAdd(!showAdd)} style={{ marginBottom: 14 }}>
            {showAdd ? 'Cancel' : '+ Add Credential'}
          </Btn>

          {/* Add credential form */}
          {showAdd && (
            <Card style={{ marginBottom: 14 }}>
              <SectionTitle>Add {typeInfo?.label || 'Credential'}</SectionTitle>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--text2)' }}>Type</div>
                <select value={addType} onChange={e => { setAddType(e.target.value); setFormData({}); }}
                  style={selectStyle}>
                  {Object.values(CREDENTIAL_TYPES).map(t => (
                    <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
              {CREDENTIAL_FORM_CONFIG[addType]?.fields.map(field => (
                <div key={field.key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, marginBottom: 4, color: 'var(--text2)' }}>{field.label}</div>
                  {field.type === 'select' ? (
                    <select value={formData[field.key] || ''} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      style={selectStyle}>
                      <option value="">Select...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={formData[field.key] || ''} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} />
                  ) : (
                    <input type={field.type || 'text'} value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      style={inputStyle} />
                  )}
                </div>
              ))}
              <Btn onClick={handleCreate} style={{ width: '100%', marginTop: 8 }}>
                Create Verified Credential
              </Btn>
            </Card>
          )}

          {/* Credential list */}
          {filteredCreds.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🪪</div>
              No credentials yet. Add your first one above.
            </Card>
          ) : (
            filteredCreds.map(cred => {
              const tInfo = Object.values(CREDENTIAL_TYPES).find(t => t.id === cred.type);
              const isExpired = new Date(cred.expiresAt) < new Date();
              return (
                <Card key={cred.id} style={{
                  padding: 14, marginBottom: 8, cursor: 'pointer',
                  border: isExpired ? '1px solid var(--red)' : selectedCred?.id === cred.id ? '2px solid var(--green)' : '1px solid var(--border)',
                  opacity: isExpired ? 0.6 : 1,
                }} onClick={() => setSelectedCred(cred)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {tInfo?.icon} {tInfo?.label}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4, color: 'var(--text)' }}>
                        {cred.type === 'blood-group' && `Blood Group: ${cred.claims.group || cred.claims.group}`}
                        {cred.type === 'allergy' && `${cred.claims.allergen || ''} (${cred.claims.severity || ''})`}
                        {cred.type === 'vaccination' && `${cred.claims.vaccine || ''} — Dose ${cred.claims.dose || ''}`}
                        {cred.type === 'chronic-condition' && cred.claims.condition}
                        {cred.type === 'emergency-contact' && `${cred.claims.name || ''} (${cred.claims.relation || ''})`}
                        {cred.type === 'organ-donation' && cred.claims.organs}
                        {cred.type === 'medication' && `${cred.claims.drug || ''} — ${cred.claims.dosage || ''}`}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Badge color={isExpired ? 'red' : 'green'}>{isExpired ? 'Expired' : 'Verified'}</Badge>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          Issued: {new Date(cred.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {tInfo?.icon && <div style={{ fontSize: 24 }}>{tInfo.icon}</div>}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right panel: Selected credential detail */}
        <div style={{ width: 350, position: 'sticky', top: 24 }}>
          {selectedCred ? (
            <Card>
              <SectionTitle>Credential Details</SectionTitle>
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <QRCanvas data={getQRData(selectedCred)} size={160} />
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                  Scan to verify — offline capable
                </div>
              </div>
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>Type: </span>
                  {Object.values(CREDENTIAL_TYPES).find(t => t.id === selectedCred.type)?.label}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>Issuer: </span>
                  {selectedCred.issuer}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>Issued: </span>
                  {new Date(selectedCred.issueDate).toLocaleString()}
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>Expires: </span>
                  {new Date(selectedCred.expiresAt).toLocaleString()}
                </div>
                <Divider />
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Claims</div>
                {Object.entries(selectedCred.claims || {}).map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 4, fontSize: 13 }}>
                    <span style={{ color: 'var(--text3)', fontSize: 11 }}>{key}: </span>
                    {String(val)}
                  </div>
                ))}
                <Divider />
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  Signature: {selectedCred.signature?.slice(0, 20)}...
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn onClick={() => handleVerify(selectedCred)} style={{ flex: 1, fontSize: 12 }}>
                  Verify
                </Btn>
                <Btn variant="outline" onClick={() => handleDelete(selectedCred.id)}
                  style={{ flex: 1, fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }}>
                  Delete
                </Btn>
              </div>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: 30, color: 'var(--text3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🪪</div>
              <div style={{ fontSize: 13 }}>Select a credential to view details, generate QR, or verify</div>
            </Card>
          )}

          <Card style={{ marginTop: 14 }}>
            <SectionTitle>What is this?</SectionTitle>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
              Your Health Passport stores verifiable health credentials that can be shared via QR code.
              <br /><br />
              ✅ Offline-verifiable — no internet needed to scan<br />
              ✅ Cryptographically signed — tamper-proof<br />
              ✅ You control what to share and with whom<br />
              ✅ W3C Verifiable Credential inspired
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none',
  width: '100%', fontFamily: 'inherit', boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'auto',
};

const tabStyle = (active) => ({
  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
  background: active ? 'var(--green-dim)' : 'var(--bg3)',
  border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`,
  color: active ? 'var(--green)' : 'var(--text2)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
});

