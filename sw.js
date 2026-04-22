/**
 * sw.js — Service Worker
 * Strategy: Cache-first for static assets, network-first for HTML pages.
 * API calls (/api/*) are always fetched live — never cached.
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE   = `shell-${CACHE_VERSION}`;
const ASSET_CACHE   = `assets-${CACHE_VERSION}`;

/* Files that make up the "app shell" — cached on install */
const SHELL_FILES = [
  '/',
  '/index.html',
  '/404.html',
  '/css/style.min.css',
  '/js/main.min.js',
  '/js/features.js',
  '/assets/yash-patil.webp',
  '/manifest.json',
];

/* ── Install: pre-cache the shell ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

/* ── Activate: remove stale caches ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: routing logic ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /* Always go live for: API calls, non-GET requests, cross-origin */
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin
  ) {
    return; // fall through to the browser's default fetch
  }

  /* HTML pages: network-first so content stays fresh */
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Static assets: cache-first, fall back to network and cache the result */
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(ASSET_CACHE).then((c) => c.put(request, clone));
          return res;
        })
    )
  );
});
