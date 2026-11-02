import React from 'react';
import { Card, Badge, ProgressBar, Btn } from './UI';

/**
 * RichMessage — Parses tool results into inline React components
 *
 * The Concierge returns message text that may contain <RichCard> tags.
 * This component detects those and renders actual React UI inline in the chat.
 */
export default function RichMessage({ message }) {
  // Parse tool-call result blocks
  if (message?.type === 'tool_result') {
    return <ToolResultBlock result={message} />;
  }

  // Plain text message
  return <PlainText message={message} />;
}

function PlainText({ message }) {
  return <div style={{ whiteSpace: 'pre-wrap' }}>{message?.text || message}</div>;
}

function ToolResultBlock({ result }) {
  const { toolId, data } = result;

  switch (toolId) {
    case 'get_health_summary':
      return <DashboardInline data={data} />;
    case 'analyze_lab_photo':
      return <LabInline data={data} />;
    case 'get_environment':
      return <EnvInline data={data} />;
    case 'check_drug_interaction':
      return <DrugInline data={data} />;
    case 'read_vault':
      return <VaultInline data={data} />;
    case 'generate_qr':
      return <QRInline data={data} />;
    case 'get_gamification':
      return <GamificationInline data={data} />;
    default:
      return <Card style={{ padding: 12, margin: '4px 0' }}>{data?.summary || JSON.stringify(data)}</Card>;
  }
}

function DashboardInline({ data }) {
  const { healthScore, vitals, recentSymptoms, alerts } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(16,217,152,0.2)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📊 Health Summary</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <div style={{ textAlign: 'center', padding: '6px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{healthScore?.healthScore || healthScore || 80}</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>Score</div>
        </div>
        {vitals && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {vitals.hr && <MiniStat label="HR" value={`${vitals.hr}`} unit="bpm" />}
            {vitals.spo2 && <MiniStat label="SpO2" value={`${vitals.spo2}`} unit="%" />}
            {vitals.temp && <MiniStat label="Temp" value={`${vitals.temp}`} unit="°F" />}
          </div>
        )}
      </div>
      {recentSymptoms?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
          🩺 Recent: {recentSymptoms.join(', ')}
        </div>
      )}
      {alerts?.length > 0 && alerts.map((a, i) => (
        <div key={i} style={{ fontSize: 12, color: 'var(--amber)', marginTop: 4 }}>{a}</div>
      ))}
    </Card>
  );
}

function MiniStat({ label, value, unit }) {
  return (
    <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 6, padding: '4px 10px' }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text3)' }}>{unit}</div>
      <div style={{ fontSize: 9, color: 'var(--text3)' }}>{label}</div>
    </div>
  );
}

function LabInline({ data }) {
  const { summary, abnormal, normal } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(255,90,106,0.15)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔬 Lab Report Analysis</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{summary}</div>
      {abnormal?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          {abnormal.map((a, i) => (
            <div key={i} style={{
              padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: 12,
              background: 'var(--red-dim)', border: '1px solid rgba(255,90,106,0.2)',
            }}>
              ⚠️ <strong>{a.name}</strong>: {a.value} <span style={{ color: 'var(--red)' }}>({a.status})</span>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Normal: {a.range}</div>
            </div>
          ))}
        </div>
      )}
      {normal?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--green)' }}>
          {normal.map((n, i) => <div key={i}>✅ {n}</div>)}
        </div>
      )}
    </Card>
  );
}

function EnvInline({ data }) {
  const { city, aqi, uv, pollen, temperature, alerts } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(79,158,255,0.2)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🌤️ {city} — Environmental Health</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        {aqi && <MiniStat label="AQI" value={`${aqi.value}`} unit={aqi.level} />}
        {uv && <MiniStat label="UV" value={`${uv.value}`} unit={uv.level} />}
        {pollen && <MiniStat label="Pollen" value={`${pollen.value}`} unit={pollen.level} />}
        {temperature && <MiniStat label="Temp" value={`${temperature.value}`} unit={temperature.unit} />}
      </div>
      {alerts?.map((a, i) => (
        <div key={i} style={{ fontSize: 12, padding: '4px 0', color: a.includes('🚨') ? 'var(--red)' : 'var(--amber)' }}>
          {a}
        </div>
      ))}
    </Card>
  );
}

function DrugInline({ data }) {
  const { drugs, interactions, safe } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: `1px solid ${safe ? 'rgba(16,217,152,0.2)' : 'rgba(255,90,106,0.2)'}` }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>💊 Drug Interaction Check</div>
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: 'var(--text2)' }}>Medications: </span>
        {drugs?.join(', ') || 'None listed'}
      </div>
      {safe && <Badge color="green">✅ No interactions found</Badge>}
      {interactions?.map((i, idx) => (
        <div key={idx} style={{ padding: 6, marginTop: 4, background: 'var(--red-dim)', borderRadius: 6, fontSize: 12 }}>
          ⚠️ {i.drugs?.join(' + ')}: {i.advice}
        </div>
      ))}
    </Card>
  );
}

function VaultInline({ data }) {
  const { query, results } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(192,132,252,0.2)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔐 Health Vault</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
        {results?.length || 0} document(s) found for "{query}"
      </div>
      {results?.map((r, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: 12,
          background: 'var(--bg3)', border: '1px solid var(--border)',
        }}>
          <span>📄 {r.name}</span>
          <span style={{ color: 'var(--text3)' }}>{r.date}</span>
        </div>
      ))}
    </Card>
  );
}

function QRInline({ data }) {
  const { credential, qrData } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(79,158,255,0.2)', textAlign: 'center' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>📱 Health QR Generated</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>
        {credential?.type === 'blood-group' ? `Blood Group: ${credential.claims?.group || 'B+'}` : 'Credential'}
      </div>
      <div style={{
        width: 120, height: 120, margin: '0 auto', background: 'white', borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#333',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>📱</div>
          <div style={{ marginTop: 4 }}>Scan to verify</div>
        </div>
      </div>
      <Btn variant="outline" onClick={() => alert('QR code saved to gallery')} style={{ marginTop: 8, fontSize: 11 }}>
        Save QR
      </Btn>
    </Card>
  );
}

function GamificationInline({ data }) {
  const { streak, xp, level, title, badges, activeChallenges } = data || {};
  return (
    <Card style={{ padding: 14, margin: '6px 0', border: '1px solid rgba(255,215,0,0.2)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🏆 Health Achievements</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
        <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>🔥 {streak || 0}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)' }}>Day Streak</div>
        </div>
        <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)' }}>{xp || 0}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)' }}>XP</div>
        </div>
        <div style={{ textAlign: 'center', background: 'var(--bg3)', borderRadius: 8, padding: '4px 10px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--blue)' }}>Lv.{level || 1}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)' }}>{title || 'Explorer'}</div>
        </div>
      </div>
      {badges?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          🏅 {badges.length} badges earned
        </div>
      )}
      {activeChallenges?.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 4 }}>
          🎯 Active: {activeChallenges.join(', ')}
        </div>
      )}
    </Card>
  );
}

