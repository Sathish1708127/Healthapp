/**
 * HealthAI Service Worker — Offline-First Rural Mode
 *
 * Cache-first strategy for static assets.
 * Network-first with cache fallback for dynamic content.
 * Background sync for queued actions.
 */

const CACHE_NAME = 'healthai-v1';
const STATIC_CACHE = 'healthai-static-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/manifest.json',
];

// ─── Install ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// ─── Activate ────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ─── Fetch ───────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls - network first with fallback
  if (url.hostname === 'api.anthropic.com' || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Static assets - cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirstWithFallback(request));
    return;
  }

  // Navigation - network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithNavigationFallback(request));
    return;
  }

  // Everything else - network only
  event.respondWith(fetch(request));
});

// ─── Strategies ──────────────────────────────────────────────────────────

async function cacheFirstWithFallback(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, message: 'You are offline' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function networkFirstWithNavigationFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) return response;
    throw new Error('Network failed');
  } catch {
    const cached = await caches.match('/index.html');
    if (cached) return cached;
    // Fallback minimal HTML
    return new Response(
      `<!DOCTYPE html><html><head><title>HealthAI - Offline</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>body{font-family:sans-serif;background:#0a0f1e;color:#fff;display:flex;
      align-items:center;justify-content:center;height:100vh;text-align:center;}
      h1{color:#10d998;}</style></head>
      <body><div><h1>HealthAI 🌿</h1>
      <p>You're offline. Basic health tools still work.</p>
      <p>Sync when connected again.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html;charset=UTF-8' } }
    );
  }
}

// ─── Background Sync ────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'healthai-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_TRIGGERED' });
    });
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// ─── Message handling ───────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
    caches.delete(STATIC_CACHE);
  }
});

