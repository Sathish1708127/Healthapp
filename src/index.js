import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initI18n } from './utils/i18n';

// Initialize language detection
initI18n();

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('📡 Service Worker registered for offline mode'))
      .catch(() => console.log('Service Worker not available'));
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
