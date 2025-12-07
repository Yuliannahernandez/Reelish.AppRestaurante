const CACHE_NAME = 'mi-app-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 🛑 1. Nunca interceptar POST, PUT, PATCH, DELETE
  if (req.method !== 'GET') return;

  // 🛑 2. Nunca interceptar APIs de backend (Render, AWS, Supabase, etc.)
  if (url.origin.includes('onrender.com')) return;

  // 🛑 3. Nunca interceptar OAuth botones o requests de Google
  if (url.origin.includes('google.com') || url.origin.includes('gstatic.com')) {
    return;
  }

  // 🟢 CACHE FIRST para assets estáticos del proyecto
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (res.status === 200 && req.url.startsWith(self.location.origin)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
