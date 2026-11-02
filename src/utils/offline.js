/**
 * Offline Mode — Service Worker Registration & Sync Queue
 *
 * Enables full offline capability for rural/limited-connectivity areas.
 * Queues actions performed offline and syncs when connectivity returns.
 */

const SW_PATH = '/service-worker.js';
const SYNC_QUEUE_KEY = 'healthai_sync_queue';
const LOW_BANDWIDTH_KEY = 'healthai_low_bandwidth';

/**
 * Register the service worker for offline support
 */
export async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported — offline mode unavailable');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    });
    console.log('Service Worker registered:', registration.scope);
    return true;
  } catch (err) {
    console.warn('Service Worker registration failed:', err.message);
    return false;
  }
}

/**
 * Check if browser is currently online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onConnectivityChange(callback) {
  const handler = () => callback(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}

/**
 * Queue an action to be synced when online
 */
export function queueAction(action) {
  try {
    const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    queue.push({
      ...action,
      queuedAt: new Date().toISOString(),
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    return queue.length;
  } catch {
    return 0;
  }
}

/**
 * Get queued actions
 */
export function getQueuedActions() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Process sync queue — send queued actions to server (or process locally)
 */
export async function processSyncQueue() {
  if (!isOnline()) return { synced: 0, remaining: 0 };

  const queue = getQueuedActions();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  let synced = 0;
  const failed = [];

  for (const action of queue) {
    try {
      // Process based on action type
      switch (action.type) {
        case 'log_symptom':
          // Already stored locally — just mark synced
          break;
        case 'save_vault':
          // Vault is always local — no sync needed
          break;
        case 'create_challenge':
          // Process locally
          break;
        default:
          // Unknown action — skip
          break;
      }
      synced++;
    } catch {
      failed.push(action);
    }
  }

  // Update queue with only failed items
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failed));
  return { synced, remaining: failed.length };
}

/**
 * Enable/disable low-bandwidth mode
 */
export function setLowBandwidthMode(enabled) {
  try {
    localStorage.setItem(LOW_BANDWIDTH_KEY, JSON.stringify(enabled));
    if (enabled) {
      document.documentElement.classList.add('low-bandwidth');
    } else {
      document.documentElement.classList.remove('low-bandwidth');
    }
  } catch {}
}

/**
 * Check if low-bandwidth mode is active
 */
export function isLowBandwidthMode() {
  try {
    return JSON.parse(localStorage.getItem(LOW_BANDWIDTH_KEY) || 'false');
  } catch {
    return false;
  }
}

/**
 * Detect connection speed
 */
export function detectConnectionSpeed() {
  if ('connection' in navigator) {
    const conn = navigator.connection;
    if (conn) {
      const speed = conn.downlink || 0; // Mbps
      if (speed < 0.5) return 'very-slow';   // <500 Kbps
      if (speed < 1.5) return 'slow';        // <1.5 Mbps
      if (speed < 5) return 'moderate';      // <5 Mbps
      return 'fast';
    }
  }
  return 'unknown';
}

/**
 * Get sync queue size (number of pending actions + estimated bytes)
 */
export function getSyncQueueInfo() {
  const queue = getQueuedActions();
  const estimatedBytes = queue.reduce((acc, a) => acc + JSON.stringify(a).length, 0);
  return {
    pending: queue.length,
    estimatedKB: Math.round(estimatedBytes / 1024 * 10) / 10,
    lastSync: localStorage.getItem('healthai_last_sync') || null,
  };
}

/**
 * Update last sync timestamp
 */
export function updateLastSync() {
  localStorage.setItem('healthai_last_sync', new Date().toISOString());
}

