const CACHE_NAME = 'k-vibe-static-v2';
const SUPPORTED_LOCALES = ['ko', 'en', 'ja', 'zh'];
const APP_SHELL_ROUTES = ['', '/map', '/analyze', '/persona', '/route', '/docent', '/radar', '/profile'];
const STATIC_ASSET_URLS = [
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/shortcut-map.png',
  '/icons/shortcut-analyze.png',
  '/og-image.png',
];
const PRECACHE_URLS = [
  ...STATIC_ASSET_URLS,
  ...SUPPORTED_LOCALES.flatMap((locale) => APP_SHELL_ROUTES.map((route) => `/${locale}${route}`)),
];

function getLocaleFallbackPath(pathname) {
  const [, locale] = pathname.match(/^\/(ko|en|ja|zh)(?:\/|$)/) || [];
  return locale ? `/${locale}` : '/ko';
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;

            const localeFallbackPath = getLocaleFallbackPath(url.pathname);
            return caches.match(localeFallbackPath).then((fallback) => fallback || caches.match('/ko'));
          }),
        ),
    );
    return;
  }

  const shouldCache =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    STATIC_ASSET_URLS.includes(url.pathname);

  if (!shouldCache) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy));
        }
        return response;
      });
    }),
  );
});
