import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, Toggle, AlertBanner, Divider } from '../components/UI';
import { setLanguage, getLanguage, getSupportedLanguages, t } from '../utils/i18n';
import { setLowBandwidthMode, isLowBandwidthMode, registerSW, isOnline, getSyncQueueInfo, processSyncQueue } from '../utils/offline';

// SAMPLE CONTENT for rural health info (works offline)
const RURAL_HEALTH_TIPS = [
  { icon: '💧', title: 'Safe Drinking Water', content: 'Boil water for 10 minutes before drinking. Store in clean covered containers. Add 2 drops of chlorine per liter if unsure.' },
  { icon: '🦟', title: 'Mosquito Prevention', content: 'Sleep under mosquito nets. Remove standing water in old tires, pots, and coconut shells. Use neem oil as natural repellent.' },
  { icon: '🌡️', title: 'Fever Care', content: 'Rest, drink plenty of water, use a wet cloth on forehead. Take paracetamol if available. See ASHA worker if fever persists >3 days.' },
  { icon: '🤒', title: 'Dengue Warning Signs', content: 'High fever + severe headache + pain behind eyes + joint pain + rash. Go to PHC/CHC immediately for NS1 test. Avoid aspirin/ibuprofen.' },
  { icon: '🍚', title: 'Nutrition During Illness', content: 'Eat rice gruel (kanji/ganji), moong dal khichdi, ripe bananas, coconut water. Avoid fried and spicy foods.' },
  { icon: '💊', title: 'Medicine Safety', content: 'Always finish the full course of antibiotics. Do not share medicines. Check expiry date. Store in cool dry place.' },
  { icon: '🧼', title: 'Hand Washing', content: 'Wash hands with soap and water for 20 seconds: before eating, after using toilet, after coughing/sneezing.' },
  { icon: '🏥', title: 'When to Visit PHC', content: 'Fever >3 days, difficulty breathing, blood in stool/urine, severe abdominal pain, unconsciousness, animal bite.' },
];

const ASHA_CONTACTS = [
  { name: 'ASHA Worker — Sector A', phone: '+91 98765 43210', area: 'Village 1-5 km radius' },
  { name: 'PHC — Primary Health Centre', phone: '+91 87654 32109', area: 'Open 8am-4pm, Emergency 24/7' },
  { name: '108 Emergency Services', phone: '108', area: 'Free ambulance — call for any emergency' },
];

export default function RuralMode() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [offlineStatus, setOfflineStatus] = useState(isOnline());
  const [lowBw, setLowBw] = useState(isLowBandwidthMode());
  const [syncInfo, setSyncInfo] = useState({ pending: 0, estimatedKB: 0 });
  const [showSmsMode, setShowSmsMode] = useState(false);

  useEffect(() => {
    setSyncInfo(getSyncQueueInfo());
    const interval = setInterval(() => {
      setOfflineStatus(isOnline());
      setSyncInfo(getSyncQueueInfo());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Register service worker for full offline
  useEffect(() => {
    registerSW();
  }, []);

  const handleLanguageChange = (code) => {
    setLanguage(code);
    setCurrentLang(code);
  };

  const handleToggleLowBw = () => {
    const newVal = !lowBw;
    setLowBw(newVal);
    setLowBandwidthMode(newVal);
  };

  const handleSync = async () => {
    const result = await processSyncQueue();
    alert(`🔄 Sync complete!\nSynced: ${result.synced} items\nPending: ${result.remaining} items`);
    setSyncInfo(getSyncQueueInfo());
  };

  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'health-tips', label: '💚 Health Tips' },
    { id: 'contacts', label: '📞 Contacts' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>🌾 Rural Health Mode</div>
          <Badge color={offlineStatus ? 'green' : 'red'}>
            {offlineStatus ? '🟢 Online' : '🔴 Offline'}
          </Badge>
          {syncInfo.pending > 0 && (
            <Badge color="amber">⏳ {syncInfo.pending} pending sync</Badge>
          )}
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Simplified health tools for rural India. Works offline. Available in 5 Indian languages.
        </div>
      </div>

      {/* Quick status bar */}
      <Grid cols={4} gap={10} style={{ marginBottom: 16 }}>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--green)' }}>{offlineStatus ? '🟢' : '🔴'}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{offlineStatus ? 'Connected' : 'Offline'}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--blue)' }}>🌐</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{currentLang.toUpperCase()}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--amber)' }}>{lowBw ? '📶' : '📡'}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{lowBw ? 'Low BW' : 'Normal'}</div>
        </Card>
        <Card style={{ padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 20, color: 'var(--purple)' }}>{syncInfo.pending > 0 ? '⏳' : '✅'}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>{syncInfo.pending > 0 ? `${syncInfo.pending} pending` : 'Synced'}</div>
        </Card>
      </Grid>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            background: activeTab === tab.id ? 'var(--green-dim)' : 'var(--bg3)',
            border: activeTab === tab.id ? '1px solid var(--green)' : '1px solid var(--border)',
            color: activeTab === tab.id ? 'var(--green)' : 'var(--text2)',
            fontFamily: 'inherit', fontWeight: activeTab === tab.id ? 600 : 400,
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'home' && (
        <div>
          {/* Large, simplified dashboard */}
          <Card style={{ marginBottom: 16, textAlign: 'center', padding: 30, background: 'var(--bg3)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>HealthAI Rural</div>
            <div style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 8 }}>
              {currentLang === 'hi' ? 'आपका स्वास्थ्य सहायक' :
               currentLang === 'kn' ? 'ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ' :
               currentLang === 'ta' ? 'உங்கள் சுகாதார உதவியாளர்' :
               'Your Health Assistant'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
              <Btn variant="outline" onClick={() => setActiveTab('health-tips')} style={{ fontSize: 14, padding: '12px 24px' }}>
                💚 Health Tips
              </Btn>
              <Btn variant="outline" onClick={() => setActiveTab('contacts')} style={{ fontSize: 14, padding: '12px 24px' }}>
                📞 Emergency Contacts
              </Btn>
              <Btn variant="outline" onClick={() => setShowSmsMode(true)} style={{ fontSize: 14, padding: '12px 24px' }}>
                💬 SMS Mode
              </Btn>
            </div>
          </Card>

          <Grid cols={2} gap={14}>
            <Card style={{ padding: 16 }}>
              <SectionTitle>🌡️ Check Symptoms</SectionTitle>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>
                Describe your symptoms in simple words and get basic health guidance. Works completely offline.
              </div>
              <Btn onClick={() => alert('Symptom Check (Rural): Enter your symptoms in the text field. AI will give basic triage advice.')}
                style={{ width: '100%', fontSize: 13 }}>
                Start Symptom Check
              </Btn>
            </Card>
            <Card style={{ padding: 16 }}>
              <SectionTitle>💊 Medicine Information</SectionTitle>
              <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>
                Learn about common medicines: what they're for, dosage, and safety. Information in simple language.
              </div>
              <Btn onClick={() => alert('Medicine Guide: Paracetamol — fever/pain, ORS — dehydration, Albendazole — deworming, Iron+Folic — anaemia')}
                style={{ width: '100%', fontSize: 13 }}>
                View Medicine Guide
              </Btn>
            </Card>
          </Grid>
        </div>
      )}

      {activeTab === 'health-tips' && (
        <Grid cols={2} gap={14}>
          {RURAL_HEALTH_TIPS.map((tip, i) => (
            <Card key={i} style={{ padding: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{tip.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{tip.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{tip.content}</div>
            </Card>
          ))}
        </Grid>
      )}

      {activeTab === 'contacts' && (
        <div>
          <AlertBanner type="red">
            <strong>Emergency: 108</strong> — Free ambulance service available 24/7. Call immediately for any medical emergency.
          </AlertBanner>
          <Grid cols={2} gap={14}>
            {ASHA_CONTACTS.map((c, i) => (
              <Card key={i} style={{
                padding: 16,
                border: c.name.includes('108') ? '2px solid var(--red)' : '1px solid var(--border)',
                background: c.name.includes('108') ? 'var(--red-dim)' : 'var(--card)',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.name.includes('108') ? 'var(--red)' : 'var(--green)' }}>
                  {c.phone}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{c.area}</div>
              </Card>
            ))}
          </Grid>
        </div>
      )}

      {activeTab === 'settings' && (
        <Grid cols={2} gap={14}>
          <Card>
            <SectionTitle>🌐 Language</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {getSupportedLanguages().map(lang => (
                <div key={lang.code} onClick={() => handleLanguageChange(lang.code)} style={{
                  padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                  background: currentLang === lang.code ? 'var(--green-dim)' : 'var(--bg3)',
                  border: `1px solid ${currentLang === lang.code ? 'var(--green)' : 'var(--border)'}`,
                  color: currentLang === lang.code ? 'var(--green)' : 'var(--text)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span>{lang.native}</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{lang.name}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>📶 Connection</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Low Bandwidth Mode</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>No images, compact text, faster loading</div>
              </div>
              <Toggle checked={lowBw} onChange={handleToggleLowBw} />
            </div>
            <Divider />
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Sync Queue</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                {syncInfo.pending > 0
                  ? `${syncInfo.pending} action(s) pending sync (~${syncInfo.estimatedKB} KB)`
                  : 'All data synced ✅'}
              </div>
            </div>
            <Btn onClick={handleSync} disabled={syncInfo.pending === 0} style={{ width: '100%', fontSize: 13 }}>
              {syncInfo.pending > 0 ? `🔄 Sync ${syncInfo.pending} items` : '✅ All synced'}
            </Btn>
            <Divider />
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Offline Status</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {offlineStatus
                ? '✅ Connected to internet. All features available.'
                : '🔴 Offline. Core health tips and emergency contacts still work.'}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>
              Last sync: {syncInfo.lastSync ? new Date(syncInfo.lastSync).toLocaleString() : 'Never'}
            </div>
          </Card>
        </Grid>
      )}

      {/* SMS Mode Modal */}
      {showSmsMode && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', padding: 20,
        }} onClick={() => setShowSmsMode(false)}>
          <Card style={{ maxWidth: 400, width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
            <SectionTitle>💬 SMS Health Mode</SectionTitle>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
              Send an SMS to get health information without internet access.
              Works on any phone, including basic feature phones.
            </div>
            <div style={{
              background: 'var(--bg3)', borderRadius: 8, padding: 16,
              fontFamily: 'monospace', fontSize: 14, marginBottom: 14,
              border: '1px solid var(--border)',
            }}>
              Type: <strong>HEALTH</strong> {'<your message>'} to <strong>+91 98765 43210</strong>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
              Examples:<br />
              "HEALTH fever 2 days"<br />
              "HEALTH medicine paracetamol"<br />
              "HEALTH nearest PHC"<br />
              "HEALTH dengue symptoms"
            </div>
            <Btn onClick={() => setShowSmsMode(false)} style={{ width: '100%' }}>
              Close
            </Btn>
          </Card>
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 16, padding: 12, background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        🌾 Rural Health Mode — Designed for limited connectivity areas in India.
        All core features work offline. Available in 5 Indian languages.
        In partnership with ASHA worker network.
      </div>
    </div>
  );
}

