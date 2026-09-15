// Multi Quiz App service worker — lets the installed PWA open and run fully
// offline (all quiz data is bundled into the app's JS).
//
// This is a template: the serviceWorker() plugin in vite.config.js builds it
// into dist/sw.js, filling in the two double-underscore placeholders below
// with this build's file list and a per-build id — so every deploy is a
// byte-different worker that installs fresh and clears the previous build's
// cache. (Keep those placeholder names out of comments: the plugin replaces
// the first occurrence of each.)
const CACHE = `multi-quiz-${__CACHE_VERSION__}`;
const FONT_CACHE = 'multi-quiz-fonts'; // survives deploys; fonts rarely change
const PRECACHE_URLS = __PRECACHE_URLS__;
const APP_SHELL = new URL('./', self.location).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE && key !== FONT_CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Page loads: network first, so a new deploy shows up as soon as you're
  // online; offline, fall back to the cached app shell (single-page app, so
  // every route is index.html).
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(APP_SHELL)));
    return;
  }

  // Google Fonts (index.html's fonts + any Answer Font picked later): serve
  // the cached copy immediately and refresh it in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const refresh = fetch(request)
            .then((response) => {
              cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);
          return cached || refresh;
        })
      )
    );
    return;
  }

  // The app's own files: cache first (build assets are content-hashed, so a
  // cached copy is never stale), caching anything not precached on first use.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
  }
});
