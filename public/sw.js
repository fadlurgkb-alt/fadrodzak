const CACHE_NAME = 'fadrodzak-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan tahan request navigasi Next.js, RSC, ataupun API
  if (
    event.request.method !== 'GET' ||
    url.searchParams.has('_rsc') ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  // Hanya cache aset gambar / font statis
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
          })
        );
      })
    );
  }
});
