import React, { useState, useEffect } from 'react';
import { Card, SectionTitle, Badge, Btn, Grid, AlertBanner, ProgressBar, Divider } from '../components/UI';
import {
  getUserState, getAllBadges, getChallengeTemplates, getLeaderboard,
  recordAction, TIERS, LEVEL_THRESHOLDS, getLevelInfo,
} from '../utils/gamification';

function LevelProgress({ xp, level }) {
  const current = LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];
  const next = LEVEL_THRESHOLDS.find(l => l.level === level + 1);
  if (!next) return null;
  const xpInLevel = xp - current.xp;
  const xpRequired = next.xp - current.xp;
  const pct = Math.min((xpInLevel / xpRequired) * 100, 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>Level {level} {current.title}</span>
        <span style={{ color: 'var(--text2)' }}>{xp} / {next.xp} XP</span>
      </div>
      <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 4,
          background: 'linear-gradient(90deg, var(--green), var(--blue))',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function BadgeCard({ badge, earned }) {
  const tierColor = TIERS[badge.tier] || '#aaa';
  return (
    <div style={{
      padding: 14, borderRadius: 10, textAlign: 'center', cursor: 'pointer',
      background: earned ? 'var(--green-dim)' : 'var(--bg3)',
      border: `1px solid ${earned ? tierColor : 'var(--border)'}`,
      opacity: earned ? 1 : 0.4,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      <div style={{ fontSize: 28, marginBottom: 4 }}>{badge.icon}</div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{badge.name}</div>
      <div style={{ fontSize: 10, color: 'var(--text2)' }}>{badge.desc}</div>
      <div style={{ marginTop: 6 }}>
        <Badge color={badge.tier === 'platinum' ? 'purple' : badge.tier === 'gold' ? 'amber' : badge.tier === 'silver' ? 'blue' : 'green'}>
          {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)} · {badge.xp} XP
        </Badge>
      </div>
      {earned && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 4 }}>✅ Earned</div>}
    </div>
  );
}

function ChallengeCard({ challenge, onStart }) {
  return (
    <Card style={{ padding: 14, border: '1px solid rgba(16,217,152,0.15)' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{challenge.icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{challenge.name}</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', margin: '4px 0' }}>{challenge.desc}</div>
      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
        <span>⏱ {challenge.duration} day(s)</span>
        <span>🏅 {challenge.xpReward} XP</span>
      </div>
      <Btn onClick={() => onStart(challenge)} style={{ width: '100%', fontSize: 12 }}>
        Start Challenge
      </Btn>
    </Card>
  );
}

export default function Gamification() {
  const [userState, setUserState] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const state = await getUserState();
    setUserState(state);
    setAllBadges(getAllBadges());
    setLeaderboard(await getLeaderboard());
  };

  const handleStartChallenge = async (template) => {
    await recordAction('checker_use'); // Trigger badge checks
    alert(`🎯 Challenge started: ${template.name}! Complete within ${template.duration} day(s) to earn ${template.xpReward} XP.`);
    await loadData();
  };

  const handleAction = async (action) => {
    const result = await recordAction(action);
    setUserState(result.state);
    if (result.newBadges.length > 0) {
      alert(`🏆 New badge earned: ${result.newBadges.map(b => b.name).join(', ')}!`);
    }
    await loadData();
  };

  if (!userState) {
    return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>Loading...</div>;
  }

  const earnedBadgeIds = userState.badges || [];
  const completedChallenges = userState.completedChallenges?.length || 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>🏆 Gamification Hub</div>
        <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
          Earn XP, unlock badges, complete challenges, and compete with family.
        </div>
      </div>

      {/* User stats banner */}
      <Card style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', margin: '0 auto 8px',
              background: 'linear-gradient(135deg, var(--green), var(--blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🏆</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Level {userState.level}</div>
            <div style={{ fontSize: 11, color: 'var(--green)' }}>{userState.title}</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <LevelProgress xp={userState.xp} level={userState.level} />
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ textAlign: 'center', flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>🔥 {userState.streak}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Day Streak</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--purple)' }}>{earnedBadgeIds.length}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Badges Earned</div>
              </div>
              <div style={{ textAlign: 'center', flex: 1, background: 'var(--bg3)', borderRadius: 8, padding: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--blue)' }}>{completedChallenges}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>Challenges Won</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <Btn variant="outline" onClick={() => handleAction('symptom_log')} style={{ fontSize: 12 }}>
          📓 Log Symptom (+XP)
        </Btn>
        <Btn variant="outline" onClick={() => handleAction('water_log')} style={{ fontSize: 12 }}>
          💧 Log Water (+XP)
        </Btn>
        <Btn variant="outline" onClick={() => handleAction('vitals_sync')} style={{ fontSize: 12 }}>
          ⌚ Sync Vitals (+XP)
        </Btn>
        <Btn variant="outline" onClick={() => handleAction('meditation')} style={{ fontSize: 12 }}>
          🧘 Meditate (+XP)
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {[
          { id: 'overview', label: '🏠 Overview' },
          { id: 'badges', label: `🏅 Badges (${earnedBadgeIds.length}/${allBadges.length})` },
          { id: 'challenges', label: '🎯 Challenges' },
          { id: 'leaderboard', label: '👑 Leaderboard' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '9px 16px', fontSize: 13, cursor: 'pointer', background: 'none', border: 'none',
            fontFamily: 'inherit', color: activeTab === tab.id ? 'var(--green)' : 'var(--text3)',
            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--green)' : 'transparent'}`,
            transition: 'all 0.15s',
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <AlertBanner type="green">
            🔥 You're on a <strong>{userState.streak}-day streak!</strong> Keep logging daily to unlock more badges.
            Next badge in {3 - (userState.streak % 3)} days: {
              userState.streak < 7 ? 'Symptom Log 7 🔜' :
              userState.streak < 30 ? 'Symptom Log 30 🔜' : 'All streak badges earned!'
            }
          </AlertBanner>
          <Grid cols={2} gap={16}>
            <Card>
              <SectionTitle>Recent Activity</SectionTitle>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.8 }}>
                {userState.stats?.checkerUses > 0 && `🔍 Symptom checker: ${userState.stats.checkerUses} uses\n`}
                {userState.stats?.symptomLogs > 0 && `📓 Symptoms logged: ${userState.stats.symptomLogs} times\n`}
                {userState.stats?.waterLogs > 0 && `💧 Water logged: ${userState.stats.waterLogs} times\n`}
                {userState.stats?.vitalsSyncs > 0 && `⌚ Vitals synced: ${userState.stats.vitalsSyncs} times\n`}
                {userState.stats?.checkerUses === 0 && 'No activity yet. Start with a quick action above! 👆'}
              </div>
            </Card>
            <Card>
              <SectionTitle>Motivation</SectionTitle>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
                "Health is not about being perfect. It's about being consistent." 🌱
                <br /><br />
                You're doing great! Every small step counts.
                <br /><br />
                <strong>{userState.streak > 0
                  ? `${userState.streak} days and counting!`
                  : 'Start your streak today!'}</strong>
              </div>
            </Card>
          </Grid>
        </div>
      )}

      {activeTab === 'badges' && (
        <Grid cols={4} gap={12}>
          {allBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.includes(badge.id)} />
          ))}
        </Grid>
      )}

      {activeTab === 'challenges' && (
        <div>
          <Grid cols={3} gap={16}>
            {getChallengeTemplates().map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} onStart={handleStartChallenge} />
            ))}
          </Grid>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <SectionTitle>Family Leaderboard</SectionTitle>
          {leaderboard.map((p, i) => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              borderRadius: 8, marginBottom: 8,
              background: i === 0 ? 'var(--amber-dim)' : 'var(--bg3)',
              border: i === 0 ? '1px solid rgba(255,215,0,0.3)' : '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 20, width: 30, textAlign: 'center' }}>
                {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name} {i === 0 && '⭐'}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Level {p.level}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>{p.xp}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>XP</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
            Compete with family members to stay motivated!
          </div>
        </Card>
      )}
    </div>
  );
}

