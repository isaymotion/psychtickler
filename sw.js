/* Offline support: network first, cached copy when offline. Bump VERSION on every publish.
   Cache names MUST start with this app's PREFIX: all isaymotion apps share one origin and one cache storage. */
const PREFIX = 'psychtickler-';
const VERSION = PREFIX + '1.3.3';
const CORE = ['./', './index.html', './css/app.css', './js/app.js', './js/cloud.js', './js/vendor/firebase.js', './js/vendor/jspdf.umd.min.js', './data/app-meta.js', './data/changelog.js', './data/hospital.js', './data/dept-events.js', './img/events/gapp-2026-webinar.jpg', './data/strings.js', './data/strings-pt.js', './data/fields.js', './data/icebreakers.js', './data/places.js', './data/fun.js', './data/cloud.js', './data/tmdb.js', './data/stickers.js', './img/banner.jpg', './img/banner-small.jpg', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];
self.addEventListener('install', (event) => {
  // add() one by one so a not-yet-uploaded icon cannot make the whole install fail
  event.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Only delete this app's own old caches: other study apps on isaymotion.github.io share this cache storage.
      .then((keys) => Promise.all(keys.filter((k) => k.indexOf(PREFIX) === 0 && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Leave Firebase / Google sign-in traffic alone (never cache it); only same-origin files and Google Fonts are cached.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin && !/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
