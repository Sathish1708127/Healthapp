import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, AlertBanner, ProgressBar, Tag } from '../components/UI';
import { getEnvironmentalData, getSupportedCities, generateHealthAlerts, getAQIInfo, getMosquitoInfo } from '../utils/environmental';

function EnvGauge({ value, max, label, unit, color, icon, size = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 11 }}>{icon}</div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
          <div style={{ fontSize: 9, color: 'var(--text3)' }}>{unit}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text2)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function LocationPicker({ current, onSelect }) {
  const [open, setOpen] = useState(false);
  const cities = getSupportedCities();
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        padding: '6px 12px', borderRadius: 8, background: 'var(--bg3)',
        border: '1px solid var(--border)', fontSize: 13,
      }}>
        <span>📍</span>
        <span>{current}</span>
        <span style={{ color: 'var(--text3)' }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
          marginTop: 4, background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {cities.map(city => (
            <div key={city} onClick={() => { onSelect(city); setOpen(false); }} style={{
              padding: '8px 12px', fontSize: 13, cursor: 'pointer',
              background: city === current ? 'var(--green-dim)' : 'transparent',
              color: city === current ? 'var(--green)' : 'var(--text)',
            }}>{city}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const FORECAST_COLORS = {
  'Low': 'var(--green)',
  'Med': 'var(--amber)',
  'Medium': 'var(--amber)',
  'High': 'var(--red)',
  'Very High': 'var(--red)',
};

export default function EnvironmentalHealth() {
  const [city, setCity] = useState('Bengaluru');
  const [envData, setEnvData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userConditions, setUserConditions] = useState({
    conditions: ['allergy'],
    allergies: ['pollen'],
  });

  useEffect(() => {
    loadData();
  }, [city]);

  const loadData = async () => {
    setLoading(true);
    const data = await getEnvironmentalData(city);
    setEnvData(data);
    const healthAlerts = generateHealthAlerts(data, userConditions);
    setAlerts(healthAlerts);
    setLoading(false);
  };

  if (loading || !envData) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🌤️</div>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>Loading environmental data...</div>
      </div>
    );
  }

  const aqiInfo = getAQIInfo(envData.aqi.value);
  const mosquitoInfo = getMosquitoInfo(envData.mosquito.value);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>🌤️ Environmental Health Radar</div>
          <LocationPicker current={city} onSelect={setCity} />
          <Badge color="blue">Updated: {new Date(envData.updatedAt).toLocaleTimeString()}</Badge>
          <Btn variant="outline" onClick={loadData} style={{ padding: '4px 12px', fontSize: 11 }}>
            🔄 Refresh
          </Btn>
        </div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Real-time AQI, pollen, UV, temperature, and mosquito risk — with personalized health alerts
        </div>
      </div>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map((a, i) => (
            <AlertBanner key={i} type={a.severity === 'red' ? 'red' : 'amber'}>
              {a.message}
            </AlertBanner>
          ))}
        </div>
      )}

      {/* Gauges */}
      <Grid cols={4} gap={16} style={{ marginBottom: 20 }}>
        <Card style={{ padding: 16 }}>
          <EnvGauge value={envData.aqi.value} max={300} label={`AQI: ${envData.aqi.level}`} unit=""
            color={aqiInfo.color} icon={aqiInfo.icon} />
        </Card>
        <Card style={{ padding: 16 }}>
          <EnvGauge value={envData.uv.value} max={11} label={`UV Index: ${envData.uv.level}`} unit=""
            color={envData.uv.value > 7 ? 'var(--red)' : envData.uv.value > 5 ? 'var(--amber)' : 'var(--green)'} icon="☀️" />
        </Card>
        <Card style={{ padding: 16 }}>
          <EnvGauge value={envData.pollen.value} max={150} label={`Pollen: ${envData.pollen.level}`} unit={envData.pollen.type || ''}
            color={FORECAST_COLORS[envData.pollen.level] || 'var(--green)'} icon="🌿" />
        </Card>
        <Card style={{ padding: 16 }}>
          <EnvGauge value={envData.mosquito.value} max={10} label={`Mosquito: ${mosquitoInfo.level}`} unit=""
            color={mosquitoInfo.color} icon="🦟" />
        </Card>
      </Grid>

      <Grid cols={2} gap={20}>
        {/* Details */}
        <Card>
          <SectionTitle>Current Conditions</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Temperature', icon: '🌡️', value: `${envData.temperature.value}${envData.temperature.unit}`, sub: `Feels ${envData.temperature.feelsLike}°C` },
              { label: 'Humidity', icon: '💧', value: `${envData.humidity.value}${envData.humidity.unit}`, sub: '' },
              { label: 'AQI Status', icon: aqiInfo.icon, value: aqiInfo.level, sub: envData.aqi.value.toString() },
              { label: 'Mosquito Advice', icon: '🦟', value: mosquitoInfo.advice, sub: '' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 12, background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: 'var(--green)' }}>{item.value}</div>
                {item.sub && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        </Card>

        {/* Forecast */}
        <Card>
          <SectionTitle>5-Day Forecast</SectionTitle>
          {envData.forecast && envData.forecast.length > 0 ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {envData.forecast.map((f, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center', padding: 12, borderRadius: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{f.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{f.temp}°</div>
                  <div style={{ fontSize: 11, color: FORECAST_COLORS[f.pollen] || 'var(--text3)', marginTop: 4 }}>
                    Pollen: {f.pollen}
                  </div>
                  <div style={{ fontSize: 11, color: f.aqi > 100 ? 'var(--amber)' : 'var(--green)', marginTop: 2 }}>
                    AQI: {f.aqi}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
              Forecast data available for Bengaluru
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)' }}>
            Powered by OpenWeatherMap + custom health correlation engine
          </div>
        </Card>

        {/* Personal health correlation */}
        <Card>
          <SectionTitle>Your Health Profile</SectionTitle>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
            Alerts are personalized based on your conditions and allergies.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { key: 'allergy', label: 'Pollen Allergy', active: userConditions.allergies.includes('pollen') },
              { key: 'asthma', label: 'Asthma / Respiratory', active: userConditions.conditions.includes('asthma') },
              { key: 'skin', label: 'Skin Sensitivity', active: userConditions.conditions.includes('skin') },
            ].map(c => (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, background: 'var(--bg3)' }}>
                <span style={{ flex: 1, fontSize: 13 }}>{c.label}</span>
                <Badge color={c.active ? 'green' : 'blue'}>{c.active ? 'Tracked' : 'Add'}</Badge>
              </div>
            ))}
          </div>
          <Btn variant="outline" onClick={() => alert('Full health profile settings in Settings page')} style={{ fontSize: 12 }}>
            Manage health conditions →
          </Btn>
        </Card>

        {/* Health recommendations */}
        <Card>
          <SectionTitle>Today's Recommendations</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              envData.aqi.value > 100 && '😷 Wear a mask outdoors — AQI is elevated',
              envData.uv.value > 7 && '🧴 Apply sunscreen SPF 50+ before going out',
              envData.pollen.value > 60 && '🤧 Take antihistamine — high pollen today',
              envData.temperature.value > 35 && '💧 Drink 3L+ water — heat advisory active',
              envData.mosquito.value > 6 && '🦟 Use mosquito repellent — high mosquito activity',
            ].filter(Boolean).map((rec, i) => (
              <div key={i} style={{ padding: 10, background: 'var(--green-dim)', borderRadius: 8, fontSize: 13, border: '1px solid rgba(16,217,152,0.2)' }}>
                {rec}
              </div>
            ))}
          </div>
        </Card>
      </Grid>
    </div>
  );
}

