const CACHE_NAME = 'universo-offline-v3';

const APP_SHELL_URLS = [
  '/',
  '/about',
  '/how-to-play',
  '/minijuegos',
  '/configuracion',
  '/dashboard',
  '/planeta/1',
  '/planeta/2',
  '/planeta/3',
  '/juego/1/1',
  '/juego/2/7',
  '/juego/3/10',
  '/maestro',
  '/maestro/ia',
  '/admin',
  '/admin/pendientes',
  '/admin/usuarios',
  '/asignaciones',
  '/manifest.webmanifest',
  '/images/liquid-prism-bg.jpg',
  '/images/liquid-prism-light-bg.jpg',
  '/images/numerix-board-bg.jpg',
  '/images/letralia-board-bg.jpg',
  '/images/naturae-board-bg.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL_URLS.map((url) =>
          fetch(url, { cache: 'reload' })
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {}),
        ),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('webpack-hmr')
  ) {
    return;
  }

  // Network-First: siempre entrega lo más nuevo si hay red; si estás sin conexión sirve caché local
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        }
        return networkRes;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const exact = await cache.match(req);
        if (exact) return exact;

        // Para navegaciones RSC (? _rsc=...) o páginas sin query, intenta coincidir por pathname
        const byPath = await cache.match(url.pathname);
        if (byPath) return byPath;

        if (req.mode === 'navigate') {
          const fallbackRoot = await cache.match('/');
          if (fallbackRoot) return fallbackRoot;
        }

        return new Response('Sin conexión y recurso no guardado en caché todavía.', {
          status: 503,
          statusText: 'Offline',
        });
      }),
  );
});
