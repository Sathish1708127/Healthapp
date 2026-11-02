/**
 * Environmental Health Radar — Data Sources & Health Correlation Engine
 *
 * Combines: AQI, pollen, UV, temperature, humidity, mosquito index
 * Generates: Personalized health alerts based on user's conditions
 */

// ─── Mock Data (fallback when APIs unavailable) ──────────────────────────
const MOCK_DATA = {
  'Bengaluru': {
    aqi: { value: 62, level: 'Moderate', color: 'var(--amber)' },
    pollen: { value: 85, level: 'Medium', type: 'Grass', color: 'var(--amber)' },
    uv: { value: 7, level: 'High', color: 'var(--amber)' },
    temperature: { value: 28, unit: '°C', feelsLike: 31 },
    humidity: { value: 65, unit: '%' },
    mosquito: { value: 8, level: 'High', color: 'var(--red)' },
    forecast: [
      { day: 'Mon', aqi: 58, temp: 27, pollen: 'Med' },
      { day: 'Tue', aqi: 64, temp: 29, pollen: 'High' },
      { day: 'Wed', aqi: 72, temp: 30, pollen: 'High' },
      { day: 'Thu', aqi: 55, temp: 26, pollen: 'Med' },
      { day: 'Fri', aqi: 48, temp: 25, pollen: 'Low' },
    ],
    updatedAt: new Date().toISOString(),
  },
  'Mumbai': {
    aqi: { value: 134, level: 'Unhealthy for Sensitive Groups', color: 'var(--amber)' },
    pollen: { value: 45, level: 'Low', type: 'Tree', color: 'var(--green)' },
    uv: { value: 9, level: 'Very High', color: 'var(--red)' },
    temperature: { value: 33, unit: '°C', feelsLike: 38 },
    humidity: { value: 78, unit: '%' },
    mosquito: { value: 6, level: 'Medium', color: 'var(--amber)' },
    forecast: [],
    updatedAt: new Date().toISOString(),
  },
  'Delhi': {
    aqi: { value: 218, level: 'Very Unhealthy', color: 'var(--red)' },
    pollen: { value: 120, level: 'High', type: 'Weed', color: 'var(--red)' },
    uv: { value: 5, level: 'Moderate', color: 'var(--amber)' },
    temperature: { value: 38, unit: '°C', feelsLike: 42 },
    humidity: { value: 32, unit: '%' },
    mosquito: { value: 4, level: 'Low', color: 'var(--green)' },
    forecast: [],
    updatedAt: new Date().toISOString(),
  },
  'Chennai': {
    aqi: { value: 78, level: 'Moderate', color: 'var(--amber)' },
    pollen: { value: 30, level: 'Low', type: 'Grass', color: 'var(--green)' },
    uv: { value: 10, level: 'Very High', color: 'var(--red)' },
    temperature: { value: 35, unit: '°C', feelsLike: 40 },
    humidity: { value: 72, unit: '%' },
    mosquito: { value: 9, level: 'High', color: 'var(--red)' },
    forecast: [],
    updatedAt: new Date().toISOString(),
  },
  'Hyderabad': {
    aqi: { value: 85, level: 'Moderate', color: 'var(--amber)' },
    pollen: { value: 55, level: 'Medium', type: 'Tree', color: 'var(--amber)' },
    uv: { value: 8, level: 'Very High', color: 'var(--red)' },
    temperature: { value: 34, unit: '°C', feelsLike: 37 },
    humidity: { value: 48, unit: '%' },
    mosquito: { value: 5, level: 'Medium', color: 'var(--amber)' },
    forecast: [],
    updatedAt: new Date().toISOString(),
  },
};

const CITIES = Object.keys(MOCK_DATA);

/**
 * Get environmental data for a city
 * @param {string} city - City name
 * @returns {Promise<Object>} Environmental data
 */
export async function getEnvironmentalData(city = 'Bengaluru') {
  // Try to fetch real data — fallback to mock
  try {
    // In production, replace with:
    // const aqi = await fetch(`https://api.waqi.info/feed/${city}/?token=YOUR_TOKEN`);
    // const weather = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=YOUR_KEY`);
    throw new Error('API not configured — using mock');
  } catch {
    return MOCK_DATA[city] || MOCK_DATA['Bengaluru'];
  }
}

/**
 * Get list of supported cities
 */
export function getSupportedCities() {
  return CITIES;
}

/**
 * Generate personalized health alerts based on environmental data + user conditions
 * @param {Object} envData - Environmental data
 * @param {Object} userProfile - User health profile
 * @returns {Array} Personalised alerts
 */
export function generateHealthAlerts(envData, userProfile = {}) {
  const alerts = [];
  const { conditions = [], allergies = [], age = 30, isOutdoorWorker = false } = userProfile;

  // AQI alerts
  if (envData.aqi.value > 100) {
    const msg = envData.aqi.value > 200
      ? '🚨 AQI is Very Unhealthy. Avoid outdoor activity. Wear N95 mask if going out.'
      : '⚠️ AQI is unhealthy for sensitive groups. Limit outdoor exertion.';
    alerts.push({ type: 'aqi', severity: envData.aqi.value > 200 ? 'red' : 'amber', message: msg });
  }

  // Pollen alerts (if user has allergies)
  if (envData.pollen.value > 60 && (allergies.includes('pollen') || allergies.includes('all'))) {
    alerts.push({
      type: 'pollen',
      severity: 'amber',
      message: '🌿 High pollen today. Take antihistamine before going out. Keep windows closed.',
    });
  }

  // UV alerts
  if (envData.uv.value > 7) {
    alerts.push({
      type: 'uv',
      severity: envData.uv.value > 10 ? 'red' : 'amber',
      message: `☀️ UV index ${envData.uv.value} (${envData.uv.level}). Apply SPF 50+, wear sunglasses, avoid sun 10am-4pm.`,
    });
  }

  // Heat alerts
  if (envData.temperature.value > 36) {
    alerts.push({
      type: 'heat',
      severity: envData.temperature.value > 40 ? 'red' : 'amber',
      message: `🌡️ Heat advisory: ${envData.temperature.value}°C (feels ${envData.temperature.feelsLike}°C). Stay hydrated, avoid strenuous activity.`,
    });
  }

  // Mosquito alerts (high correlation with dengue/malaria risk)
  if (envData.mosquito.value > 6) {
    alerts.push({
      type: 'mosquito',
      severity: 'amber',
      message: '🦟 High mosquito activity. Use DEET repellent, wear long sleeves, check for standing water. Active dengue in your region.',
    });
  }

  // Cold alerts
  if (envData.temperature.value < 15) {
    alerts.push({
      type: 'cold',
      severity: 'green',
      message: '❄️ Cold weather alert. If you have asthma, keep inhaler handy. Layer clothing.',
    });
  }

  return alerts;
}

/**
 * Get AQI description and color
 */
export function getAQIInfo(value) {
  if (value <= 50) return { level: 'Good', color: 'var(--green)', icon: '😊' };
  if (value <= 100) return { level: 'Moderate', color: 'var(--amber)', icon: '😐' };
  if (value <= 150) return { level: 'Unhealthy (Sensitive)', color: 'var(--amber)', icon: '😷' };
  if (value <= 200) return { level: 'Unhealthy', color: 'var(--red)', icon: '😷' };
  if (value <= 300) return { level: 'Very Unhealthy', color: 'var(--red)', icon: '🚨' };
  return { level: 'Hazardous', color: 'var(--red)', icon: '☠️' };
}

/**
 * Get mosquito index description
 */
export function getMosquitoInfo(value) {
  if (value <= 3) return { level: 'Low', color: 'var(--green)', advice: 'Normal precautions' };
  if (value <= 6) return { level: 'Medium', color: 'var(--amber)', advice: 'Use repellent at dawn/dusk' };
  return { level: 'High', color: 'var(--red)', advice: 'High risk — take full precautions' };
}

