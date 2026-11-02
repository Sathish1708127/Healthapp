import React, { useState } from 'react';
import {
  HeartPulse, Thermometer, Droplets, Moon, AlertTriangle,
  ArrowRight, Sparkles, Activity, Gift, Flame
} from '../components/Icons';
import { Card, SectionTitle, Badge, AlertBanner, ProgressBar, Btn, Grid } from '../components/UI';
import { useGamification } from '../context/GamificationContext';

export default function Dashboard({ onNavigate }) {
  const {
    xp,
    currentLevel,
    currentTier,
    nextTier,
    xpNeededForNext,
    levelProgressPct,
    streak,
    quests,
    completeQuest,
    setRewardsModalOpen,
  } = useGamification();

  const [waterCount, setWaterCount] = useState(1.8);

  const stats = [
    {
      icon: HeartPulse,
      label: 'Heart Rate',
      val: '72',
      unit: 'bpm',
      trend: '▲ Optimal',
      trendColor: 'var(--green)',
      iconColor: 'var(--green)',
      bgGrad: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.04) 100%)',
    },
    {
      icon: Thermometer,
      label: 'Body Temp',
      val: '98.4',
      unit: '°F',
      trend: 'Normal baseline',
      trendColor: 'var(--green)',
      iconColor: 'var(--blue)',
      bgGrad: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.04) 100%)',
    },
    {
      icon: Droplets,
      label: 'Blood Oxygen',
      val: '98',
      unit: '%',
      trend: 'Optimal (98%)',
      trendColor: 'var(--green)',
      iconColor: 'var(--purple)',
      bgGrad: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.04) 100%)',
    },
    {
      icon: Moon,
      label: 'Sleep Duration',
      val: '6.8',
      unit: 'hrs',
      trend: '20m below target',
      trendColor: 'var(--amber)',
      iconColor: 'var(--amber)',
      bgGrad: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.04) 100%)',
    },
  ];

  const handleQuickHydrate = () => {
    setWaterCount(prev => Math.min(+(prev + 0.25).toFixed(2), 3.0));
    completeQuest('water');
  };

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
              Good morning, Sathish
            </h1>
            <Badge color="green">Vitals Synced</Badge>
          </div>
          <div style={{ color: 'var(--text2)', fontSize: 13.5, marginTop: 4 }}>
            Bengaluru, Karnataka • Continuous health surveillance active
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Btn onClick={() => onNavigate('checker')}>
            <Sparkles size={16} />
            <span>AI Health Triage</span>
          </Btn>
          <Btn variant="outline" onClick={() => onNavigate('vitals')}>
            <Activity size={16} />
            <span>Vitals Monitor</span>
          </Btn>
        </div>
      </div>

      {/* Outbreak Notice */}
      <AlertBanner type="amber">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <strong>Geofenced Outbreak Alert:</strong> Dengue spike detected <strong>18km</strong> away in HSR Layout & Whitefield.
            Preemptive symptom surveillance enabled.
          </div>
          <span
            style={{
              color: 'var(--amber)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={() => onNavigate('outbreak')}
          >
            Review outbreak radar <ArrowRight size={14} />
          </span>
        </div>
      </AlertBanner>

      {/* 4 Stats Cards */}
      <Grid cols={4} gap={16} style={{ marginBottom: 24 }}>
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label} hover style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: s.bgGrad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <Icon size={22} color={s.iconColor} />
                </div>
                <div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    fontWeight: 700,
                  }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginTop: 2 }}>
                    {s.val} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text3)' }}>{s.unit}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: s.trendColor, fontWeight: 600, marginTop: 2 }}>
                    {s.trend}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </Grid>

      {/* Health insights and gamification */}
      <Grid
        cols={3}
        gap={16}
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          marginBottom: 24,
        }}
      >
        {/* Health Score Card */}
        <Card>
          <SectionTitle badge={<Badge color="green">Normal Range</Badge>}>
            Weekly Health Index
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 10 }}>
            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: 105, height: 105, flexShrink: 0 }}>
              <svg viewBox="0 0 100 100" width="105" height="105">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8"/>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset="52"
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>80</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>/100</div>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ flex: 1 }}>
              <ProgressBar label="Activity Level" sublabel="88%" value={88} color="var(--green)" />
              <ProgressBar label="Nutrition Quality" sublabel="72%" value={72} color="var(--amber)" />
              <ProgressBar label="Sleep Consistency" sublabel="65%" value={65} color="var(--blue)" />
            </div>
          </div>
        </Card>

        {/* Recent Symptoms Tracking */}
        <Card>
          <SectionTitle badge={<span style={{ fontSize: 11, color: 'var(--green)', cursor: 'pointer' }} onClick={() => onNavigate('journal')}>+ Log new</span>}>
            Symptom Log & Trends
          </SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Mild headache', severity: 'Mild', color: 'amber', time: '2 days ago' },
              { name: 'Fatigue', severity: 'Moderate', color: 'amber', time: '3 days ago' },
              { name: 'Dry throat', severity: 'Resolved', color: 'green', time: '5 days ago' },
            ].map(s => (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'rgba(30, 41, 59, 0.45)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge color={s.color}>{s.severity}</Badge>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{s.time}</span>
                </div>
              </div>
            ))}
          </div>

          <Btn variant="outline" onClick={() => onNavigate('checker')} style={{ marginTop: 14, width: '100%', fontSize: 12.5 }}>
            Launch triage assessment →
          </Btn>
        </Card>

        {/* Gamification status */}
        <Card
          style={{
            minHeight: 280,
            padding: 18,
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(6, 78, 59, 0.3))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.08)',
          }}
        >
          <SectionTitle style={{ marginBottom: 10 }} badge={<Flame size={15} color="var(--amber)" />}>
            Your Progress
          </SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              role="progressbar"
              aria-label={nextTier ? `Progress to level ${nextTier.level}` : 'Maximum level reached'}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(levelProgressPct)}
              style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}
            >
              <svg viewBox="0 0 100 100" width="84" height="84" aria-hidden="true">
                <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="39"
                  fill="none"
                  stroke="url(#xpProgressGradient)"
                  strokeWidth="8"
                  strokeDasharray="245.04"
                  strokeDashoffset={245.04 * (1 - levelProgressPct / 100)}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }}
                />
                <defs>
                  <linearGradient id="xpProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.15,
              }}>
                <span style={{ fontSize: 21 }}>{currentTier.badge}</span>
                <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>
                  {Math.round(levelProgressPct)}%
                </span>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Level {currentLevel}</div>
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.25 }}>{currentTier.title}</div>
              <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginTop: 5 }}>
                {xp} XP earned
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
            {nextTier
              ? `Just ${xpNeededForNext} more XP to reach Level ${nextTier.level}. Keep it up!`
              : 'You’ve reached the highest level. Keep up your healthy habits!'}
          </div>
          {nextTier && (
            <div style={{ fontSize: 10.5, color: 'var(--text3)', marginTop: 4 }}>
              {xpInCurrentLevel(xp, currentTier)} / {nextTier.xpRequired - currentTier.xpRequired} XP to next level
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>
              🔥 {streak}-day streak
            </span>
            <Btn variant="outline" onClick={() => setRewardsModalOpen(true)} style={{ fontSize: 11, padding: '6px 10px' }}>
              <Gift size={13} />
              <span>Rewards</span>
            </Btn>
          </div>

          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 11, fontWeight: 700 }}>
              Today’s quests · {quests.filter(q => q.completed).length}/{quests.length}
            </summary>
            <div style={{ display: 'grid', gap: 7, marginTop: 8 }}>
              {quests.slice(0, 4).map(q => (
                <button
                  key={q.id}
                  type="button"
                  disabled={q.completed}
                  onClick={() => q.id === 'water' ? handleQuickHydrate() : completeQuest(q.id)}
                  style={{
                    padding: '7px 9px',
                    borderRadius: 8,
                    background: q.completed ? 'rgba(16, 185, 129, 0.06)' : 'rgba(30, 41, 59, 0.5)',
                    border: q.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border)',
                    color: q.completed ? 'var(--text3)' : 'var(--text)',
                    cursor: q.completed ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 11 }}>{q.icon} {q.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: q.completed ? 'var(--green)' : 'var(--amber)', whiteSpace: 'nowrap' }}>
                    {q.completed ? 'Done ✓' : `+${q.xp} XP`}
                  </span>
                </button>
              ))}
            </div>
          </details>
        </Card>
      </Grid>

      {/* Disease Categories Grid */}
      <Card>
        <SectionTitle>Clinical Specialties Covered</SectionTitle>
        <Grid cols={3} gap={12}>
          {[
            { label: 'Infectious Diseases', color: 'red', desc: 'Dengue, COVID XEC variants, typhoid, malaria, chikungunya' },
            { label: 'Chronic & Endocrine', color: 'amber', desc: 'Diabetes, hypertension, thyroid, PCOS, fatty liver, anaemia' },
            { label: 'Mental Wellness', color: 'purple', desc: 'Anxiety, burnout, sleep disorders via longitudinal mood tracking' },
            { label: 'Dermatology & Eyes', color: 'teal', desc: 'Rashes, eczema, psoriasis, jaundice, conjunctival anaemia via photo AI' },
            { label: 'Nutrition & Deficiencies', color: 'green', desc: 'B12, iron, vitamin D3, hydration tracking and regional diet planning' },
            { label: 'Outbreak Intelligence', color: 'blue', desc: 'WHO, CDC, and municipal IDSP geo-tracking within 50km radius' },
          ].map(c => (
            <div
              key={c.label}
              style={{
                padding: '14px 16px',
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: 12,
                border: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Badge color={c.color} style={{ marginBottom: 8 }}>{c.label}</Badge>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, marginTop: 6 }}>
                {c.desc}
              </div>
            </div>
          ))}
        </Grid>
      </Card>
    </div>
  );
}

function xpInCurrentLevel(totalXP, currentTier) {
  return Math.max(totalXP - currentTier.xpRequired, 0);
}
