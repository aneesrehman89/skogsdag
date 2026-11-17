// Offline support: app files are cached; network first so updates arrive, cached copy when there is no signal.
const CACHE = 'skogsdag-v4';
const FILES = ['./', 'index.html', 'app.css', 'app.js', 'data.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'icon-maskable-512.png',
  'vendor/leaflet.js', 'vendor/leaflet.css', 'vendor/fonts/jakarta-latin.woff2', 'vendor/images/layers.png', 'vendor/images/marker-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'skogsdag-tiles').map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname === 'tile.openstreetmap.org') {   // map tiles: keep what was seen, for use without signal
    e.respondWith(caches.open('skogsdag-tiles').then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});
