const CACHE = 'sudoku-v4';

self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('/')).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const isFont = FONT_HOSTS.includes(url.hostname);
  if (url.origin !== self.location.origin && !isFont) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const fetchOpts = isFont ? { mode: 'cors' } : undefined;
      const fresh = fetch(e.request, fetchOpts).then(resp => {
        if (resp.ok) cache.put(e.request, resp.clone());
        return resp;
      }).catch(() => cached);
      return cached ?? fresh;
    })
  );
});
