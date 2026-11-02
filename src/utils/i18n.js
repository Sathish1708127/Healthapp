/**
 * Internationalization (i18n) Engine
 *
 * Runtime language switching with fallback to English.
 * Supports: English (en), Hindi (hi), Kannada (kn), Tamil (ta), Telugu (te), Marathi (mr)
 */

import hi from '../locales/hi.json';
import kn from '../locales/kn.json';
import ta from '../locales/ta.json';

const LOCALES = { hi, kn, ta };

const TRANSLATIONS = {
  en: {},  // English is the source — no translation needed
  ...LOCALES,
};

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

let currentLanguage = 'en';
let listeners = [];

/**
 * Set the active language
 */
export function setLanguage(code) {
  if (TRANSLATIONS[code] !== undefined || code === 'en') {
    currentLanguage = code;
    document.documentElement.lang = code;
    localStorage.setItem('healthai_lang', code);
    listeners.forEach(fn => fn(code));
  }
}

/**
 * Get current language
 */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Translate a key — returns translated string or the key itself as fallback
 */
export function t(key, params = {}) {
  if (currentLanguage === 'en') return key;

  const langData = TRANSLATIONS[currentLanguage];
  if (!langData) return key;

  // Support nested keys: "dashboard.title"
  const keys = key.split('.');
  let value = langData;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }

  // Replace params: {{name}}
  if (typeof value === 'string') {
    return value.replace(/\{\{(\w+)\}\}/g, (_, param) => params[param] ?? `{{${param}}}`);
  }

  return value || key;
}

/**
 * Subscribe to language changes
 */
export function onLanguageChange(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

/**
 * Get supported languages list
 */
export function getSupportedLanguages() {
  return SUPPORTED_LANGUAGES;
}

/**
 * Detect browser language
 */
export function detectLanguage() {
  const stored = localStorage.getItem('healthai_lang');
  if (stored && TRANSLATIONS[stored] !== undefined) return stored;

  const browserLang = navigator.language?.split('-')[0];
  if (TRANSLATIONS[browserLang] !== undefined) return browserLang;

  return 'en';
}

/**
 * Initialize i18n with detected language
 */
export function initI18n() {
  const lang = detectLanguage();
  setLanguage(lang);
  return lang;
}

/**
 * Check if current language supports RTL
 */
export function isRTL() {
  return ['ar', 'ur'].includes(currentLanguage);
}

