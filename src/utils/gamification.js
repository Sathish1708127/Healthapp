/**
 * Health Gamification Engine — Streaks, Badges, XP, Challenges
 *
 * Tracks user engagement and health actions to motivate through gamification.
 * All data stored locally in IndexedDB.
 */

const DB_NAME = 'HealthGamification';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('state')) {
        db.createObjectStore('state', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getState(key, fallback = null) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('state', 'readonly');
    const store = tx.objectStore('state');
    const req = store.get(key);
    req.onsuccess = () => {
      resolve(req.result?.value ?? fallback);
      db.close();
    };
    req.onerror = () => { resolve(fallback); db.close(); };
  });
}

async function setState(key, value) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('state', 'readwrite');
    const store = tx.objectStore('state');
    store.put({ key, value });
    tx.oncomplete = () => { resolve(); db.close(); };
  });
}

// ─── BADGES ──────────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id: 'first-login', name: 'First Steps', desc: 'Logged in for the first time', icon: '👋', tier: 'bronze', xp: 10 },
  { id: 'symptom-log-3', name: 'Body Watcher', desc: 'Logged symptoms 3 days in a row', icon: '📓', tier: 'bronze', xp: 25 },
  { id: 'symptom-log-7', name: 'Health Chronicler', desc: 'Logged symptoms 7 days in a row', icon: '📖', tier: 'silver', xp: 50 },
  { id: 'symptom-log-30', name: 'Symptom Sage', desc: 'Logged symptoms 30 days in a row', icon: '🧠', tier: 'gold', xp: 150 },
  { id: 'hydration-3', name: 'Hydrated', desc: 'Logged 3L water 3 days in a row', icon: '💧', tier: 'bronze', xp: 20 },
  { id: 'hydration-7', name: 'Aqua Master', desc: 'Logged 3L water 7 days in a row', icon: '💦', tier: 'silver', xp: 50 },
  { id: 'score-80', name: 'Health Star', desc: 'Achieved 80+ health score', icon: '⭐', tier: 'silver', xp: 40 },
  { id: 'score-90', name: 'Health Elite', desc: 'Achieved 90+ health score', icon: '🌟', tier: 'gold', xp: 100 },
  { id: 'vitals-sync', name: 'Connected', desc: 'Synced vitals from wearable', icon: '⌚', tier: 'bronze', xp: 15 },
  { id: 'vitals-7', name: 'Vital Watcher', desc: 'Synced vitals for 7 days', icon: '📊', tier: 'silver', xp: 45 },
  { id: 'checker-use', name: 'Symptom Sleuth', desc: 'Used symptom checker 5 times', icon: '🔍', tier: 'bronze', xp: 20 },
  { id: 'checker-20', name: 'Diagnosis Ace', desc: 'Used symptom checker 20 times', icon: '🩺', tier: 'gold', xp: 100 },
  { id: 'vault-save', name: 'File Keeper', desc: 'Saved first document to vault', icon: '🔐', tier: 'bronze', xp: 15 },
  { id: 'vault-10', name: 'Document Keeper', desc: 'Saved 10 documents to vault', icon: '📁', tier: 'silver', xp: 60 },
  { id: 'family-add', name: 'Family First', desc: 'Added a family member profile', icon: '👨‍👩‍👧', tier: 'bronze', xp: 20 },
  { id: 'challenge-win', name: 'Champion', desc: 'Won a health challenge', icon: '🏆', tier: 'gold', xp: 100 },
  { id: 'outbreak-alert', name: 'Alert Watcher', desc: 'Checked outbreak alerts 3 times', icon: '🗺️', tier: 'bronze', xp: 15 },
  { id: 'lab-report', name: 'Lab Analyst', desc: 'Analyzed a lab report', icon: '🔬', tier: 'silver', xp: 40 },
  { id: 'qr-share', name: 'QR Sharer', desc: 'Shared health passport QR', icon: '📱', tier: 'bronze', xp: 20 },
  { id: 'login-30', name: 'Regular', desc: 'Logged in for 30 days', icon: '📅', tier: 'platinum', xp: 200 },
];

const TIERS = { bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2' };

// ─── CHALLENGES ───────────────────────────────────────────────────────────
const CHALLENGE_TEMPLATES = [
  { id: 'water-day', name: 'Hydration Hero', desc: 'Drink 3L water today', icon: '💧', duration: 1, target: { type: 'water', value: 3 }, xpReward: 20 },
  { id: 'symptom-week', name: 'Symptom Streak', desc: 'Log symptoms 7 days in a row', icon: '📓', duration: 7, target: { type: 'symptom_log', value: 7 }, xpReward: 100 },
  { id: 'vitals-week', name: 'Vital Check', desc: 'Sync vitals for 7 days', icon: '📊', duration: 7, target: { type: 'vitals_sync', value: 7 }, xpReward: 80 },
  { id: 'health-score', name: 'Score 80+', desc: 'Achieve 80+ health score', icon: '⭐', duration: 1, target: { type: 'health_score', value: 80 }, xpReward: 50 },
  { id: 'family-step', name: 'Family Step Race', desc: 'Walk 10k steps with a family member (combined)', icon: '👨‍👩‍👧', duration: 1, target: { type: 'steps', value: 20000 }, xpReward: 75 },
  { id: 'meditation-week', name: 'Calm Mind', desc: 'Do breathing exercises 5 days this week', icon: '🧘', duration: 7, target: { type: 'meditation', value: 5 }, xpReward: 60 },
];

// ─── XP & LEVELS ─────────────────────────────────────────────────────────
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Health Explorer' },
  { level: 2, xp: 100, title: 'Health Learner' },
  { level: 3, xp: 250, title: 'Health Follower' },
  { level: 4, xp: 500, title: 'Health Advocate' },
  { level: 5, xp: 800, title: 'Health Guardian' },
  { level: 6, xp: 1200, title: 'Health Champion' },
  { level: 7, xp: 1800, title: 'Health Legend' },
  { level: 8, xp: 2500, title: 'Health Master' },
  { level: 9, xp: 3500, title: 'Health Guru' },
  { level: 10, xp: 5000, title: 'Health God' },
];

// ─── Engine Functions ────────────────────────────────────────────────────

/**
 * Get or initialize user state
 */
export async function getUserState() {
  let state = await getState('userState');
  if (!state) {
    state = {
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: [],
      activeChallenges: [],
      completedChallenges: [],
      stats: {
        symptomLogs: 0,
        vitalsSyncs: 0,
        checkerUses: 0,
        waterLogs: 0,
        vaultSaves: 0,
        labAnalyses: 0,
        familyMembers: 0,
        outbreaksChecked: 0,
        qrShares: 0,
        meditations: 0,
      },
    };
    await setState('userState', state);
  }
  return state;
}

/**
 * Check & update daily streak
 */
export async function updateStreak() {
  const state = await getUserState();
  const today = new Date().toISOString().split('T')[0];
  const lastActive = state.lastActiveDate;

  if (lastActive === today) return state.streak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  state.streak = lastActive === yesterday ? state.streak + 1 : 1;
  state.lastActiveDate = today;
  await setState('userState', state);
  return state.streak;
}

/**
 * Add XP to user and check for level up
 */
export async function addXP(amount) {
  const state = await getUserState();
  state.xp += amount;

  // Check level up
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (state.xp >= LEVEL_THRESHOLDS[i].xp) {
      const leveledUp = state.level < LEVEL_THRESHOLDS[i].level;
      state.level = LEVEL_THRESHOLDS[i].level;
      state.title = LEVEL_THRESHOLDS[i].title;
      if (leveledUp) {
        await setState('userState', state);
        return { xp: state.xp, level: state.level, title: state.title, leveledUp: true };
      }
      break;
    }
  }

  await setState('userState', state);
  return { xp: state.xp, level: state.level, title: state.title, leveledUp: false };
}

/**
 * Record an action and check for badge unlocks
 */
export async function recordAction(action, metadata = {}) {
  const state = await getUserState();
  const statKey = STAT_ACTION_MAP[action];
  if (statKey && state.stats[statKey] !== undefined) {
    state.stats[statKey] += 1;
  }

  await setState('userState', state);
  await updateStreak();

  // Check for badge unlocks
  const newBadges = [];
  for (const badge of ALL_BADGES) {
    if (state.badges.includes(badge.id)) continue;
    if (checkBadgeCondition(badge.id, state)) {
      state.badges.push(badge.id);
      newBadges.push(badge);
      // Also add XP for badge
      await addXP(badge.xp);
    }
  }

  if (newBadges.length > 0) {
    await setState('userState', state);
  }

  return { state, newBadges };
}

const STAT_ACTION_MAP = {
  'symptom_log': 'symptomLogs',
  'vitals_sync': 'vitalsSyncs',
  'checker_use': 'checkerUses',
  'water_log': 'waterLogs',
  'vault_save': 'vaultSaves',
  'lab_analysis': 'labAnalyses',
  'family_add': 'familyMembers',
  'outbreak_check': 'outbreaksChecked',
  'qr_share': 'qrShares',
  'meditation': 'meditations',
};

function checkBadgeCondition(badgeId, state) {
  switch (badgeId) {
    case 'first-login': return state.xp >= 10;
    case 'symptom-log-3': return state.streak >= 3;
    case 'symptom-log-7': return state.streak >= 7;
    case 'symptom-log-30': return state.streak >= 30;
    case 'hydration-3': return state.stats.waterLogs >= 3;
    case 'hydration-7': return state.stats.waterLogs >= 7;
    case 'score-80': return getState('healthScore', 0) >= 80;
    case 'score-90': return getState('healthScore', 0) >= 90;
    case 'vitals-sync': return state.stats.vitalsSyncs >= 1;
    case 'vitals-7': return state.stats.vitalsSyncs >= 7;
    case 'checker-use': return state.stats.checkerUses >= 5;
    case 'checker-20': return state.stats.checkerUses >= 20;
    case 'vault-save': return state.stats.vaultSaves >= 1;
    case 'vault-10': return state.stats.vaultSaves >= 10;
    case 'family-add': return state.stats.familyMembers >= 1;
    case 'challenge-win': return state.completedChallenges.length >= 1;
    case 'outbreak-alert': return state.stats.outbreaksChecked >= 3;
    case 'lab-report': return state.stats.labAnalyses >= 1;
    case 'qr-share': return state.stats.qrShares >= 1;
    case 'login-30': return state.xp >= 200;
    default: return false;
  }
}

/**
 * Create a new challenge
 */
export async function createChallenge(templateId, participants = []) {
  const template = CHALLENGE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return null;

  const challenge = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...template,
    participants: [participants[0] || 'self', ...participants.slice(1)],
    progress: {},
    startedAt: new Date().toISOString(),
    endsAt: new Date(Date.now() + template.duration * 86400000).toISOString(),
    completed: false,
  };

  const challenges = await getState('challenges', []);
  challenges.push(challenge);
  await setState('challenges', challenges);
  return challenge;
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(challengeId, userId, value) {
  const challenges = await getState('challenges', []);
  const idx = challenges.findIndex(c => c.id === challengeId);
  if (idx === -1) return null;

  const challenge = challenges[idx];
  challenge.progress[userId] = (challenge.progress[userId] || 0) + value;

  if (challenge.progress[userId] >= challenge.target.value) {
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();
    await addXP(challenge.xpReward);
  }

  challenges[idx] = challenge;
  await setState('challenges', challenges);
  return challenge;
}

/**
 * Get all badges info
 */
export function getAllBadges() {
  return ALL_BADGES;
}

/**
 * Get challenge templates
 */
export function getChallengeTemplates() {
  return CHALLENGE_TEMPLATES;
}

/**
 * Get level info
 */
export function getLevelInfo(level) {
  return LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];
}

/**
 * Get leaderboard data (from local storage — simulated)
 */
export async function getLeaderboard() {
  const state = await getUserState();
  return [
    { name: 'You', xp: state.xp, level: state.level, badge: '👑' },
    { name: 'Mom', xp: Math.round(state.xp * 0.7), level: Math.max(1, state.level - 1), badge: '🌟' },
    { name: 'Dad', xp: Math.round(state.xp * 0.5), level: Math.max(1, state.level - 2), badge: '⭐' },
  ];
}

export { ALL_BADGES, TIERS, CHALLENGE_TEMPLATES, LEVEL_THRESHOLDS };

