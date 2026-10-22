// Offline-stöd när appen körs som webbapp (PWA)
const CACHE = 'turnering-v7';
const FILES = ['./', './index.html', './styles.css', './logic.js', './stages.js', './stats.js', './vendor/anthropic-sdk.js', './app.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Nätverket först så att uppdateringar syns, cache som reserv offline.
// no-cache frågar servern varje gång, så en ny index.html aldrig blandas med en gammal app.js
// från webbläsarens HTTP-cache. Bara lyckade svar sparas, så ett felsvar ersätter inte en bra kopia.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
