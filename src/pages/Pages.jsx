import React, { useState } from 'react';
import { Card, SectionTitle, Badge, AlertBanner, ProgressBar, Btn, Grid, Divider, Tag, Toggle } from '../components/UI';
import { useNotification } from '../components/NotificationContext';

// ─── SKIN ANALYSER ──────────────────────────────────────────────────────────
export function SkinAnalyser() {
  const [results, setResults] = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const { showToast } = useNotification();

  const simulateAnalysis = () => {
    setAnalysing(true);
    setTimeout(() => {
      setResults([
        { label: 'Eczema / Contact Dermatitis', pct: 68, color: 'var(--amber)' },
        { label: 'Psoriasis', pct: 18, color: 'var(--blue)' },
        { label: 'Fungal Infection', pct: 9, color: 'var(--purple)' },
        { label: 'Melanoma risk', pct: 5, color: 'var(--green)' },
      ]);
      setAnalysing(false);
    }, 1500);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Skin & Rash Analyser</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>CNN-based analysis (EfficientNet/ResNet) — 200+ skin conditions, ~90% accuracy</div>
      </div>
      <Grid cols={2} gap={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Upload Photo</SectionTitle>
            <div onClick={simulateAnalysis} style={{
              border: '2px dashed var(--border2)', borderRadius: 12, padding: 40, textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📸</div>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>{analysing ? 'Analysing...' : 'Click to upload or drag & drop'}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Supports: rash, lesion, discolouration, wound photos</div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Tag>JPEG/PNG</Tag><Tag>Max 10MB</Tag><Tag>Local processing</Tag><Tag>GDPR compliant</Tag>
              </div>
            </div>
          </Card>
          <Card>
            <SectionTitle>Eye Scan AI</SectionTitle>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Detect via selfie-style eye photo</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>Anaemia (pale conjunctiva) · Jaundice (yellow sclera) · Diabetic retinopathy risk · Hypertension signs</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              <Badge color="teal">Anaemia detection</Badge>
              <Badge color="amber">Jaundice screening</Badge>
              <Badge color="red">Retinal risk</Badge>
            </div>
            <Btn variant="outline" onClick={() => showToast('Eye scan demo: No anaemia detected. No jaundice signs. (Guidance only)', 'success', 3500)} style={{ marginTop: 12, width: '100%', fontSize: 12 }}>Scan eye photo →</Btn>
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Analysis Results</SectionTitle>
            {results ? (
              <>
                {results.map(r => <ProgressBar key={r.label} label={r.label} sublabel={r.pct + '%'} value={r.pct} color={r.color} />)}
                <div style={{ marginTop: 12, padding: 10, background: 'var(--amber-dim)', borderRadius: 8, border: '1px solid rgba(255,184,79,0.2)', fontSize: 12, color: 'var(--text2)' }}>
                  <strong style={{ color: 'var(--amber)' }}>Recommendation:</strong> Likely eczema. Apply fragrance-free moisturiser, avoid identified triggers. See a dermatologist if it persists over 2 weeks.
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>⚠️ AI analysis only. ~73% confidence. Consult a dermatologist for confirmed diagnosis.</div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text3)', fontSize: 13 }}>Upload a photo to see AI analysis results</div>
            )}
          </Card>
          <Card>
            <SectionTitle>Conditions Detectable</SectionTitle>
            <Grid cols={2} gap={8}>
              {['🔴 Eczema & dermatitis','🟠 Psoriasis','🟡 Fungal infections','🟢 Ringworm','🟣 Mpox screening','🔵 Melanoma risk'].map(c => (
                <div key={c} style={{ padding: 8, background: 'var(--bg3)', borderRadius: 6, fontSize: 12, border: '1px solid var(--border)' }}>{c}</div>
              ))}
            </Grid>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>Trained on HAM10000 + DermNet + ISIC datasets. 85-92% accuracy.</div>
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ─── OUTBREAK ALERTS ────────────────────────────────────────────────────────
export function OutbreakAlerts() {
  const outbreaks = [
    { dist: 18, name: 'Dengue Fever', loc: 'HSR Layout, Bengaluru', cases: '↑ 47 new cases this week', level: 'High', color: 'red', active: true },
    { dist: 32, name: 'Chikungunya', loc: 'Whitefield, Bengaluru', cases: '↑ 23 new cases this week', level: 'Med', color: 'amber' },
    { dist: 45, name: 'COVID XEC Variant', loc: 'Electronic City, Bengaluru', cases: '↑ 12 new cases this week', level: 'Low', color: 'blue' },
    { dist: 78, name: 'Typhoid', loc: 'Mysore district', cases: '↑ 8 new cases', level: 'Low', color: 'green' },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Geo-based Disease Alerts</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Live WHO/CDC/IDSP feeds mapped to your location — Bengaluru, India</div>
      </div>
      <AlertBanner type="red">
        <strong>Active outbreak within 50km detected.</strong> Preemptive symptom watch mode is now active. Monitor for early dengue signs: fever, severe headache, pain behind eyes, muscle/joint pain.
      </AlertBanner>
      <Grid cols={2} gap={20}>
        <Card>
          <SectionTitle>Outbreaks Near You</SectionTitle>
          {outbreaks.map(o => (
            <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ textAlign: 'center', minWidth: 50 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: o.active ? 'var(--red)' : 'var(--amber)' }}>{o.dist}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>km</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{o.name}</span>
                  {o.active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-anim 1.5s ease-in-out infinite' }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{o.loc}</div>
                <div style={{ fontSize: 11, color: 'var(--red)' }}>{o.cases}</div>
              </div>
              <Badge color={o.color}>{o.level}</Badge>
            </div>
          ))}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Dengue Precautions — Active Now</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                { bg: 'var(--red-dim)', icon: '🦟', text: 'Use mosquito repellent (DEET/picaridin) — especially dawn/dusk' },
                { bg: 'var(--bg3)', icon: '💧', text: 'Eliminate standing water around your home weekly' },
                { bg: 'var(--bg3)', icon: '🌡️', text: 'Monitor for fever above 101°F — check daily' },
                { bg: 'var(--bg3)', icon: '💊', text: 'Avoid aspirin/NSAIDs if fever develops — use paracetamol only' },
                { bg: 'var(--amber-dim)', icon: '🏥', text: 'If platelet count drops or rash appears — go to ER immediately' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, borderRadius: 6, background: p.bg }}>
                  <span>{p.icon}</span><span>{p.text}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle>Data Sources</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {['WHO Disease Outbreak News', 'IDSP India API', 'BBMP Health', 'Geofencing (50km)', 'CDC Global Alerts'].map(s => <Tag key={s}>{s}</Tag>)}
            </div>
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ─── VITALS MONITOR ─────────────────────────────────────────────────────────
export function VitalsMonitor() {
  const vitals = [
    { icon: '💓', val: '72', unit: 'bpm', label: 'Heart Rate', trend: '↔ Normal range 60-100', trendColor: 'var(--green)' },
    { icon: '🫁', val: '98', unit: '%', label: 'SpO2', trend: '↑ Excellent (>96%)', trendColor: 'var(--blue)' },
    { icon: '🌡️', val: '98.4', unit: '°F', label: 'Temperature', trend: 'Normal', trendColor: 'var(--green)' },
    { icon: '🩺', val: '118', unit: '/76', label: 'Blood Pressure', trend: 'Normal range', trendColor: 'var(--green)' },
    { icon: '📊', val: '58', unit: 'ms', label: 'HRV', trend: '↑ Good recovery', trendColor: 'var(--green)' },
    { icon: '😴', val: '6.8', unit: 'h', label: 'Sleep', trend: '↓ Below 7h target', trendColor: 'var(--amber)' },
  ];
  const valColors = ['var(--green)', 'var(--blue)', 'var(--amber)', 'var(--purple)', 'var(--teal)', 'var(--amber)'];
  const chartData = [60, 75, 65, 80, 70, 55, 72];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Vitals Monitor</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Synced from wearables: Apple Watch, Fitbit, Samsung Galaxy Watch</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {vitals.map((v, i) => (
          <div key={v.label} style={{ padding: 16, background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{v.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-1px', color: valColors[i] }}>
              {v.val}<span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 2 }}>{v.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{v.label}</div>
            <div style={{ fontSize: 11, marginTop: 6, color: v.trendColor }}>{v.trend}</div>
          </div>
        ))}
      </div>
      <Grid cols={2} gap={20}>
        <Card>
          <SectionTitle>Heart Rate — Last 7 Days</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, padding: '0 2px' }}>
            {chartData.map((h, i) => (
              <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: h > 75 ? 'var(--amber)' : 'var(--green)', opacity: 0.7, height: `${h}%` }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </Card>
        <Card>
          <SectionTitle>Anomaly Detection</SectionTitle>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>AI detects patterns that precede illness by 1-3 days</div>
          {[
            { label: 'AFib risk', status: 'Normal', color: 'green' },
            { label: 'Pre-fever HRV drop', status: 'Not detected', color: 'green' },
            { label: 'Sleep quality decline', status: 'Watch', color: 'amber' },
          ].map(a => (
            <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 8, background: a.color === 'amber' ? 'var(--amber-dim)' : 'var(--bg3)', border: a.color === 'amber' ? '1px solid rgba(255,184,79,0.2)' : '1px solid var(--border)' }}>
              <span style={{ fontSize: 13 }}>{a.label}</span>
              <Badge color={a.color}>{a.status}</Badge>
            </div>
          ))}
        </Card>
      </Grid>
    </div>
  );
}

// ─── SYMPTOM JOURNAL ────────────────────────────────────────────────────────
export function SymptomJournal() {
  const [selected, setSelected] = useState([]);
  const symptoms = ['Fever','Headache','Fatigue','Cough','Sore throat','Nausea','Body ache','Dizziness','Loss of appetite','Rash'];
  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const [severity, setSeverity] = useState(2);
  const { showToast } = useNotification();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Symptom Journal</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Daily tracking — AI monitors trend (improving / plateau / worsening)</div>
      </div>
      <Grid cols={2} gap={20}>
        <Card>
          <SectionTitle>Log Today's Symptoms</SectionTitle>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Common symptoms</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {symptoms.map(s => (
                <span key={s} onClick={() => toggle(s)} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  background: selected.includes(s) ? 'var(--green-dim)' : 'var(--bg3)',
                  border: `1px solid ${selected.includes(s) ? 'var(--green)' : 'var(--border)'}`,
                  color: selected.includes(s) ? 'var(--green)' : 'var(--text2)',
                }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>
              Overall severity: <span style={{ color: severity > 6 ? 'var(--red)' : severity > 3 ? 'var(--amber)' : 'var(--green)' }}>{severity}/10</span>
            </div>
            <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(Number(e.target.value))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, marginBottom: 8, fontWeight: 500 }}>Notes</div>
            <textarea style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', fontSize: 13.5, color: 'var(--text)', outline: 'none', resize: 'none', fontFamily: 'inherit' }} rows={3} placeholder="Any additional details..." />
          </div>
          <Btn onClick={() => showToast('Symptoms logged successfully! AI is monitoring your trend.', 'success')} style={{ width: '100%' }}>Log symptoms</Btn>
        </Card>
        <Card>
          <SectionTitle>Recent Log</SectionTitle>
          {[
            { date: 'Apr 6', day: 'Today', symptoms: [{ label: 'Headache', color: 'amber' }, { label: 'Fatigue', color: 'amber' }], sev: 4 },
            { date: 'Apr 5', day: 'Yesterday', symptoms: [{ label: 'Headache', color: 'amber' }, { label: 'Dry throat', color: 'blue' }], sev: 3 },
            { date: 'Apr 3', day: '2 days ago', symptoms: [{ label: 'Fever', color: 'red' }, { label: 'Body ache', color: 'amber' }, { label: 'Fatigue', color: 'amber' }], sev: 7 },
          ].map(log => (
            <div key={log.date} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 50, textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{log.date}</div>
                <div>{log.day}</div>
              </div>
              <div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {log.symptoms.map(s => <Badge key={s.label} color={s.color}>{s.label}</Badge>)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>Severity: {log.sev}/10</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 12, background: 'var(--green-dim)', borderRadius: 8, border: '1px solid rgba(16,217,152,0.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 4 }}>AI Trend Analysis</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>📈 Symptoms improving over 3 days. Fever resolved. Headache reducing in severity. Continue monitoring for 2 more days.</div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}

// ─── TREATMENT GUIDE ────────────────────────────────────────────────────────
export function TreatmentGuide({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('home');
  const { showToast } = useNotification();
  const tabs = [{ id: 'home', label: 'Home Care' }, { id: 'exercise', label: 'Exercise & Rest' }, { id: 'medicine', label: 'Medicine Guide' }, { id: 'escalation', label: 'Escalation' }];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Treatment & Care Guide</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>AI-generated care plans. References WHO/NHS/CDC guidelines.</div>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '9px 16px', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit',
            color: activeTab === t.id ? 'var(--green)' : 'var(--text3)',
            borderBottom: `2px solid ${activeTab === t.id ? 'var(--green)' : 'transparent'}`, transition: 'all 0.15s'
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'home' && (
        <Grid cols={2} gap={16}>
          <Card><SectionTitle>Rest & Hydration</SectionTitle><div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)' }}>💤 7-9 hours sleep per night<br/>💧 2.5-3L water daily (increase with fever)<br/>🛌 Avoid strenuous activity while symptomatic<br/>🌡️ Monitor temperature every 6 hours</div></Card>
          <Card><SectionTitle>Diet Recommendations</SectionTitle><div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text2)' }}>✅ Foods to eat: rice gruel, bananas, toast, yogurt<br/>✅ Hydrating fruits: watermelon, cucumber, coconut water<br/>❌ Avoid: fried foods, alcohol, caffeine<br/>❌ Avoid: heavy spicy meals while symptomatic</div></Card>
          <Card><SectionTitle>OTC Medicine Guidance</SectionTitle><div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>💊 Paracetamol 500mg: for fever/pain (max 4g/day)<br/>🚫 Avoid aspirin/ibuprofen if dengue suspected<br/>💊 ORS: for dehydration replacement</div><div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>Not a prescription. Consult pharmacist for your specific situation.</div></Card>
          <Card><SectionTitle>Drug Interaction Checker</SectionTitle><textarea style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: 'var(--text)', outline: 'none', resize: 'none', fontFamily: 'inherit', marginBottom: 8 }} rows={3} placeholder="e.g. Metformin 500mg, Amlodipine 5mg..." /><Btn variant="outline" onClick={() => showToast('Safe: No dangerous interactions found for standard dengue care medications.', 'success')} style={{ width: '100%', fontSize: 12 }}>Check interactions →</Btn></Card>
        </Grid>
      )}
      {activeTab === 'exercise' && (
        <Grid cols={2} gap={16}>
          <Card><SectionTitle>Movement Prescriptions</SectionTitle><div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>🧘 Gentle yoga/stretching: 10-15 min<br/>🚶 Short walks when fever-free: 5-10 min<br/>🫁 Deep breathing exercises: 4-7-8 technique<br/>❌ No cardio or weight training while symptomatic</div></Card>
          <Card><SectionTitle>Breathing Exercises (4-7-8)</SectionTitle><div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>1. Inhale slowly for 4 seconds<br/>2. Hold breath for 7 seconds<br/>3. Exhale slowly for 8 seconds<br/>4. Repeat 4 cycles, 3x daily</div><Btn onClick={() => showToast('Starting 4-7-8 guided breathing timer: Inhale slowly (4s)...', 'info', 4000)} style={{ marginTop: 12, width: '100%', fontSize: 12 }}>Start guided breathing</Btn></Card>
        </Grid>
      )}
      {activeTab === 'medicine' && (
        <>
          <AlertBanner type="amber">All medication guidance references WHO/NHS clinical guidelines. Informational only — consult a doctor before starting any treatment.</AlertBanner>
          <Grid cols={2} gap={16}>
            <Card><SectionTitle>Safe Dosage Reference</SectionTitle><div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>Paracetamol: 500-1000mg every 6h (max 4g/day)<br/>Cetirizine (allergy): 10mg once daily<br/>ORS: 200-400ml after each loose stool<br/>Vitamin C: 500-1000mg daily for immune support</div></Card>
            <Card><SectionTitle>What NOT to Take</SectionTitle><div style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.8 }}>🚫 Aspirin (increases bleeding risk in dengue)<br/>🚫 Ibuprofen (avoid with dengue/liver conditions)<br/>🚫 Antibiotics without prescription<br/>🚫 Steroids without specialist advice</div></Card>
          </Grid>
        </>
      )}
      {activeTab === 'escalation' && (
        <>
          <AlertBanner type="red"><strong>Seek emergency care immediately</strong> for: chest pain, difficulty breathing, severe vomiting, blood in urine/stool, severe abdominal pain, altered consciousness.</AlertBanner>
          <Grid cols={2} gap={16}>
            <Card><SectionTitle>When to See a Doctor (Soon)</SectionTitle><div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>• Fever persisting over 3 days<br/>• Symptoms worsening after initial improvement<br/>• Platelet count drops (tested)<br/>• No improvement after 5 days<br/>• Skin rash with fever appearing</div><Btn variant="outline" onClick={() => onNavigate('report')} style={{ marginTop: 12, width: '100%', fontSize: 12 }}>Generate shareable report →</Btn></Card>
            <Card><SectionTitle>Nearest Facilities</SectionTitle>
              {[['🏥 Manipal Hospital', '2.3km', 'Emergency: 24/7'], ['🏥 Narayana Health', '4.1km', 'Infectious disease specialist'], ['🩺 Apollo Clinic', '1.2km', 'GP available, telemedicine: Yes']].map(([name, dist, note]) => (
                <div key={name} style={{ padding: 8, background: 'var(--bg3)', borderRadius: 6, marginBottom: 8, fontSize: 13 }}>{name} — {dist}<br/><span style={{ fontSize: 11, color: 'var(--text2)' }}>{note}</span></div>
              ))}
            </Card>
          </Grid>
        </>
      )}
    </div>
  );
}

// ─── NUTRITION ──────────────────────────────────────────────────────────────
export function NutritionPlan() {
  const [water, setWater] = useState(1.8);
  const { showToast } = useNotification();
  const gaps = [
    { label: 'Vitamin D', note: 'Low — 18 ng/mL', val: 30, color: 'var(--red)' },
    { label: 'Iron / Ferritin', note: 'Borderline', val: 45, color: 'var(--amber)' },
    { label: 'Vitamin B12', note: 'Normal', val: 75, color: 'var(--green)' },
    { label: 'Omega-3', note: 'Low intake', val: 25, color: 'var(--red)' },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Nutrition Plan</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Condition-specific, localised to Indian/regional cuisine.</div>
      </div>
      <Grid cols={2} gap={20}>
        <Card>
          <SectionTitle>This Week's Meal Plan</SectionTitle>
          {[
            { day: 'MONDAY (Today)', active: true, meals: 'Breakfast: Idli with sambar (light on spice) + coconut water\nLunch: Rice + dal + boiled vegetables + curd\nDinner: Ragi porridge + soft-boiled eggs\nSnack: Banana + pomegranate' },
            { day: 'TUESDAY', active: false, meals: 'Upma + moong dal khichdi + fruit bowl + buttermilk' },
            { day: 'WEDNESDAY', active: false, meals: 'Poha + vegetable soup + curd rice + papaya' },
          ].map(m => (
            <div key={m.day} style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8, opacity: m.active ? 1 : 0.7 }}>
              <div style={{ fontSize: 12, color: m.active ? 'var(--green)' : 'var(--text3)', fontWeight: 600 }}>{m.day}</div>
              <div style={{ fontSize: 13, marginTop: m.active ? 6 : 4, color: m.active ? 'var(--text)' : 'var(--text2)', whiteSpace: 'pre-line' }}>{m.meals}</div>
            </div>
          ))}
          <Btn variant="outline" onClick={() => showToast('Full 7-day personalized meal plan generated and ready for offline use.', 'success')} style={{ width: '100%', fontSize: 12 }}>Download full 7-day plan →</Btn>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Nutritional Gaps Detected</SectionTitle>
            {gaps.map(g => <ProgressBar key={g.label} label={g.label} sublabel={g.note} value={g.val} color={g.color} />)}
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text3)' }}>Based on dietary history + symptom patterns. Get blood tests to confirm.</div>
          </Card>
          <Card>
            <SectionTitle>Hydration Tracker</SectionTitle>
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--blue)' }}>{water.toFixed(1)} <span style={{ fontSize: 16, color: 'var(--text3)' }}>/ 3L</span></div>
              <ProgressBar value={water} max={3} color="var(--blue)" />
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{(3 - water).toFixed(1)}L more to reach daily target</div>
            </div>
            <Btn variant="outline" onClick={() => setWater(w => Math.min(3, +(w + 0.25).toFixed(2)))} style={{ width: '100%', fontSize: 12 }}>+ Log 250ml water</Btn>
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ─── HEALTH REPORT ──────────────────────────────────────────────────────────
export function HealthReport() {
  const { showToast } = useNotification();
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Health Report</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Shareable PDF report — auto-generated from symptom history + AI assessment + vitals</div>
      </div>
      <Grid cols={2} gap={20}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionTitle style={{ margin: 0 }}>Report Preview</SectionTitle>
            <Badge color="green">Up to date</Badge>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, background: 'var(--bg3)' }}>
            <div style={{ textAlign: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>HEALTH SUMMARY REPORT</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Sathish S · April 6, 2026 · Bengaluru, India</div>
            </div>
            {[
              { title: 'CHIEF COMPLAINTS', content: 'Headache (3 days), Fatigue (3 days), Prior fever (resolved). Dengue outbreak proximity noted — 18km.' },
              { title: 'AI ASSESSMENT', content: 'Probable: Post-viral fatigue (moderate confidence). Dengue screening recommended given local outbreak.' },
              { title: 'VITALS (WEARABLE)', content: 'HR: 72bpm · SpO2: 98% · Temp: 98.4°F · BP: 118/76 · Sleep: 6.8h' },
              { title: 'RECOMMENDED NEXT STEPS', content: '1. CBC + dengue NS1 test\n2. Follow home care protocol\n3. Return in 48h if symptoms worsen' },
            ].map(s => (
              <div key={s.title} style={{ marginTop: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{s.content}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <Btn onClick={() => showToast('Compiling clinical summary into encrypted PDF report...', 'info')} style={{ flex: 1 }}>Download PDF</Btn>
            <Btn variant="outline" onClick={() => showToast('Secure, revocable doctor share link copied to clipboard!', 'success')} style={{ flex: 1 }}>Share with doctor</Btn>
          </div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Crowd Symptom Heatmap</SectionTitle>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Anonymised opt-in symptom reporting — real-time disease cluster maps</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, fontSize: 11 }}>
              {[
                { area: 'HSR Layout', level: 'High', style: { background: 'rgba(255,90,106,0.3)', color: 'var(--red)' } },
                { area: 'Koramangala', level: 'Med', style: { background: 'rgba(255,184,79,0.2)', color: 'var(--amber)' } },
                { area: 'JP Nagar', level: 'Low', style: { background: 'rgba(16,217,152,0.1)', color: 'var(--green)' } },
                { area: 'Whitefield', level: 'Med', style: { background: 'rgba(255,184,79,0.15)', color: 'var(--amber)' } },
                { area: 'Indiranagar', level: 'Low', style: { background: 'rgba(16,217,152,0.1)', color: 'var(--green)' } },
                { area: 'Malleshwaram', level: 'Low', style: { background: 'rgba(16,217,152,0.1)', color: 'var(--green)' } },
              ].map(h => (
                <div key={h.area} style={{ padding: 8, borderRadius: 6, textAlign: 'center', ...h.style }}>{h.area}<br/><strong>{h.level}</strong></div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>Data from 2,847 opt-in users in Bengaluru. Anonymised. DISHA compliant.</div>
          </Card>
          <Card>
            <SectionTitle>Telemedicine</SectionTitle>
            {[
              { name: 'Dr. Priya K — General Physician', avail: 'Available now', availColor: 'var(--green)' },
              { name: 'Dr. Ramesh N — Infectious Disease', avail: 'Available: 4pm today', availColor: 'var(--text3)' },
            ].map(d => (
              <div key={d.name} style={{ padding: 10, background: 'var(--bg3)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div><div style={{ fontSize: 11, color: d.availColor }}>{d.avail}</div></div>
                <Btn onClick={() => showToast(`Initiating tele-consultation with ${d.name}...`, 'info')} style={{ padding: '6px 12px', fontSize: 11 }}>Book</Btn>
              </div>
            ))}
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ─── FAMILY PROFILES ────────────────────────────────────────────────────────
export function FamilyProfiles() {
  const { showToast } = useNotification();
  const members = [
    { initial: 'S', name: 'Sathish (You)', age: 'Age 22 · Male', status: 'Active', color: 'green', last: 'Last check: Today', score: 'Score: 80/100', active: true },
    { initial: 'M', name: 'Mother', age: 'Age 52 · Female', status: 'Monitor', color: 'amber', last: 'Last check: Yesterday', score: 'Hypertension watch', bgGrad: 'linear-gradient(135deg, #ff9a9e, #fad0c4)' },
    { initial: 'F', name: 'Father', age: 'Age 56 · Male', status: 'Good', color: 'green', last: 'Last check: 2 days ago', score: 'Score: 74/100', bgGrad: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)' },
  ];
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Family Profiles</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Manage health for elderly parents and children. Caregiver alerts.</div>
      </div>
      <Grid cols={3} gap={16} style={{ marginBottom: 20 }}>
        {members.map(m => (
          <Card key={m.name} style={{ textAlign: 'center', cursor: 'pointer', border: m.active ? '2px solid var(--green)' : '1px solid var(--border)' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', margin: '0 auto 12px', background: m.bgGrad || 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>{m.initial}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', margin: '4px 0' }}>{m.age}</div>
            <Badge color={m.color}>{m.status}</Badge>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>{m.last}<br/>{m.score}</div>
          </Card>
        ))}
        <Card style={{ textAlign: 'center', cursor: 'pointer', border: '2px dashed var(--border2)' }} onClick={() => showToast('Add dependent/caregiver profile wizard initiated.', 'info')}>
          <div style={{ fontSize: 32, margin: '12px 0 8px', color: 'var(--text3)' }}>+</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Add family member</div>
        </Card>
      </Grid>
      <Card>
        <SectionTitle>Caregiver Alerts</SectionTitle>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>You'll receive push notifications if a family member's condition worsens, their symptom severity increases by 2+ points, or a red-flag symptom combination is detected. Age-appropriate thresholds apply.</div>
      </Card>
    </div>
  );
}

// ─── SETTINGS ───────────────────────────────────────────────────────────────
export function Settings() {
  const [toggles, setToggles] = useState({ anon: true, heatmap: true, apple: true, fitbit: false, samsung: false, offline: true });
  const toggle = k => setToggles(prev => ({ ...prev, [k]: !prev[k] }));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Settings</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>Privacy, notifications, integrations, data</div>
      </div>
      <Grid cols={2} gap={20}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Privacy & Data</SectionTitle>
            {[
              { key: 'anon', label: 'Anonymous mode', desc: 'On-device inference for skin/eye checks' },
              { key: 'heatmap', label: 'Opt-in crowd heatmap', desc: 'Share anonymised symptoms for outbreak detection' },
            ].map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.desc}</div>
                </div>
                <Toggle checked={toggles[s.key]} onChange={() => toggle(s.key)} />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>Data retention</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>GDPR + DISHA (India) compliant</div></div>
              <select><option>12 months</option><option>6 months</option><option>Forever</option></select>
            </div>
          </Card>
          <Card>
            <SectionTitle>Wearable Integration</SectionTitle>
            {[
              { key: 'apple', label: 'Apple Watch / HealthKit' },
              { key: 'fitbit', label: 'Fitbit' },
              { key: 'samsung', label: 'Samsung Health Connect' },
            ].map(w => (
              <div key={w.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{w.label}</span>
                <Toggle checked={toggles[w.key]} onChange={() => toggle(w.key)} />
              </div>
            ))}
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card>
            <SectionTitle>Language & Region</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ flex: 1, fontSize: 13 }}>App language</span>
              <select><option>English</option><option>Hindi</option><option>Kannada</option><option>Tamil</option><option>Telugu</option></select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1, fontSize: 13 }}>Region</span>
              <select><option>India</option><option>US</option><option>UK</option></select>
            </div>
          </Card>
          <Card>
            <SectionTitle>Offline Mode</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Full offline mode</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Core checker + home care works without internet</div>
              </div>
              <Toggle checked={toggles.offline} onChange={() => toggle('offline')} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Critical for rural India. Syncs when connectivity resumes. Last sync: Today 8:42am</div>
          </Card>
          <Card>
            <SectionTitle>Account</SectionTitle>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>Sathish S · sathish@email.com · Premium plan</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="outline" style={{ fontSize: 12 }}>Edit profile</Btn>
              <Btn variant="outline" style={{ fontSize: 12, color: 'var(--red)', borderColor: 'var(--red)' }}>Delete data</Btn>
            </div>
          </Card>
        </div>
      </Grid>
    </div>
  );
}
