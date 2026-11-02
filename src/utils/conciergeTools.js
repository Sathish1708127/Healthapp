/**
 * AI Health Concierge — Tool Registry
 *
 * Defines all tools the Concierge can invoke.
 * Each tool has a name, description, execute function, and UI renderer.
 * The Concierge calls these tools based on user intent.
 */

// ─── Tool Registry ───────────────────────────────────────────────────────
class ConciergeTool {
  constructor({ id, name, description, icon, execute, renderResult }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.execute = execute;
    this.renderResult = renderResult;
  }
}

// ─── Tool Implementations (mock/simulated) ───────────────────────────────

const analyzeLabPhoto = new ConciergeTool({
  id: 'analyze_lab_photo',
  name: 'Analyze Lab Report',
  description: 'Extract and interpret values from a lab report photo',
  icon: '🔬',
  execute: async (params) => {
    // In real implementation, this calls OCR + labAnalyzer
    const { text } = params;
    return {
      type: 'lab_report',
      data: {
        summary: 'Analyzed 12 parameters. 2 abnormal values detected.',
        abnormal: [
          { name: 'Vitamin D (25-OH)', value: '14 ng/mL', status: 'low', range: '20-50 ng/mL' },
          { name: 'HbA1c', value: '6.8%', status: 'elevated', range: '<5.7%' },
        ],
        normal: ['Hemoglobin: 14.2 g/dL ✓', 'TSH: 2.8 µIU/mL ✓', 'Creatinine: 0.9 mg/dL ✓'],
      },
    };
  },
  renderResult: (result) => ({
    type: 'lab_inline',
    label: '📋 Lab Report Analysis',
    summary: result.data.summary,
    details: [
      ...result.data.abnormal.map(a => `<div class="abnormal">⚠️ <strong>${a.name}</strong>: ${a.value} (${a.status}, normal: ${a.range})</div>`),
      ...result.data.normal.map(n => `<div class="normal">✅ ${n}</div>`),
    ].join(''),
  }),
});

const checkDrugInteraction = new ConciergeTool({
  id: 'check_drug_interaction',
  name: 'Check Drug Interactions',
  description: 'Check interactions between medications, foods, and Ayurvedic remedies',
  icon: '💊',
  execute: async (params) => {
    const { drugs } = params;
    return {
      type: 'drug_interaction',
      data: {
        drugs: drugs || ['Paracetamol', 'Metformin'],
        interactions: [],
        safe: true,
      },
    };
  },
  renderResult: (result) => ({
    type: 'drug_inline',
    label: '💊 Drug Interaction Check',
    summary: result.data.interactions.length === 0
      ? '✅ No interactions found between your medications.'
      : `⚠️ ${result.data.interactions.length} interaction(s) found.`,
    details: result.data.interactions.map(i => `<div>⚠️ ${i.drugs.join(' + ')}: ${i.advice}</div>`).join(''),
  }),
});

const getEnvironment = new ConciergeTool({
  id: 'get_environment',
  name: 'Check Environment',
  description: 'Get AQI, UV index, pollen count, and personalized health advice',
  icon: '🌤️',
  execute: async (params) => {
    const { city } = params;
    return {
      type: 'environment',
      data: {
        city: city || 'Bengaluru',
        aqi: { value: 62, level: 'Moderate' },
        uv: 7,
        pollen: { value: 85, level: 'Medium' },
        temperature: 28,
        alerts: [
          '🌿 High pollen today — take antihistamine if you have allergies.',
          '☀️ UV index 7 (High) — apply sunscreen SPF 50+.',
        ],
      },
    };
  },
  renderResult: (result) => ({
    type: 'env_inline',
    label: `🌤️ ${result.data.city} — Environmental Health`,
    summary: `AQI: ${result.data.aqi.value} (${result.data.aqi.level}) · UV: ${result.data.uv} · Pollen: ${result.data.pollen.value}`,
    details: result.data.alerts.map(a => `<div>${a}</div>`).join(''),
  }),
});

const readVault = new ConciergeTool({
  id: 'read_vault',
  name: 'Search Health Vault',
  description: 'Search and retrieve documents from your encrypted health vault',
  icon: '🔐',
  execute: async (params) => {
    const { query } = params;
    return {
      type: 'vault_results',
      data: {
        query: query || 'blood report',
        results: [
          { name: 'CBC Blood Report — March 2026', date: '2026-03-15', type: 'Lab Report' },
          { name: 'Comprehensive Health Check — Jan 2026', date: '2026-01-20', type: 'Lab Report' },
        ],
      },
    };
  },
  renderResult: (result) => ({
    type: 'vault_inline',
    label: `🔐 Found ${result.data.results.length} documents for "${result.data.query}"`,
    summary: result.data.results.map(r =>
      `<div style="display:flex;justify-content:space-between;padding:4px 0">` +
      `<span>📄 ${r.name}</span><span style="color:var(--text3)">${r.date}</span></div>`
    ).join(''),
    details: '',
  }),
});

const generateQR = new ConciergeTool({
  id: 'generate_qr',
  name: 'Generate Health QR',
  description: 'Create a verifiable QR code for a health credential',
  icon: '📱',
  execute: async (params) => {
    const { type } = params;
    return {
      type: 'qr_code',
      data: {
        credential: {
          type: type || 'blood-group',
          claims: { group: 'B+', rh: 'Positive' },
          issuer: 'Self',
        },
        qrData: JSON.stringify({ t: 'blood-group', c: { group: 'B+' } }),
      },
    };
  },
  renderResult: (result) => ({
    type: 'qr_inline',
    label: '📱 Generated Health QR',
    summary: 'Scan to verify: Blood Group B+',
    details: `<canvas id="qr-canvas" style="width:150px;height:150px;margin:8px auto;display:block"/>`,
  }),
});

const getGamification = new ConciergeTool({
  id: 'get_gamification',
  name: 'Check Gamification Status',
  description: 'Check your streaks, badges, XP, and active challenges',
  icon: '🏆',
  execute: async (params) => {
    return {
      type: 'gamification',
      data: {
        streak: 5,
        xp: 340,
        level: 3,
        title: 'Health Follower',
        badges: ['first-login', 'symptom-log-3', 'vitals-sync'],
        activeChallenges: ['Hydration Hero'],
      },
    };
  },
  renderResult: (result) => ({
    type: 'gamification_inline',
    label: `🏆 Level ${result.data.level}: ${result.data.title}`,
    summary: `🔥 ${result.data.streak}-day streak · ${result.data.xp} XP · ${result.data.badges.length} badges`,
    details: `<div>Active challenge: ${result.data.activeChallenges.join(', ')}</div>`,
  }),
});

const getHealthSummary = new ConciergeTool({
  id: 'get_health_summary',
  name: 'Get Health Summary',
  description: 'Get a dashboard-style summary of recent health data',
  icon: '📊',
  execute: async (params) => {
    return {
      type: 'health_summary',
      data: {
        healthScore: 80,
        vitals: { hr: 72, spo2: 98, temp: 98.4 },
        recentSymptoms: ['Mild headache (2 days ago)', 'Fatigue (3 days ago)'],
        alerts: ['🔴 Dengue outbreak 18km away'],
      },
    };
  },
  renderResult: (result) => ({
    type: 'dashboard_inline',
    label: '📊 Your Health Summary',
    summary: `Health Score: ${result.data.healthScore}/100 · HR: ${result.data.vitals.hr} bpm`,
    details: [
      ...result.data.recentSymptoms.map(s => `<div>🩺 ${s}</div>`),
      ...result.data.alerts.map(a => `<div>${a}</div>`),
    ].join(''),
  }),
});

// ─── Tool Registry ────────────────────────────────────────────────────────
const AVAILABLE_TOOLS = {
  analyze_lab_photo: analyzeLabPhoto,
  check_drug_interaction: checkDrugInteraction,
  get_environment: getEnvironment,
  read_vault: readVault,
  generate_qr: generateQR,
  get_gamification: getGamification,
  get_health_summary: getHealthSummary,
};

/**
 * Get all available tools as a formatted list for system prompt
 */
export function getToolsSystemPrompt() {
  return Object.values(AVAILABLE_TOOLS)
    .map(t => `  • ${t.icon || '🔧'} ${t.name}: "${t.description}" [tool: ${t.id}]`)
    .join('\n');
}

/**
 * Execute a tool by ID
 */
export async function executeTool(toolId, params) {
  const tool = AVAILABLE_TOOLS[toolId];
  if (!tool) throw new Error(`Unknown tool: ${toolId}`);
  return tool.execute(params);
}

/**
 * Get tool metadata
 */
export function getToolInfo(toolId) {
  return AVAILABLE_TOOLS[toolId] || null;
}

/**
 * Get all tools (for UI display)
 */
export function getAllTools() {
  return Object.values(AVAILABLE_TOOLS).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    icon: t.icon,
  }));
}

