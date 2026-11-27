/* Service Worker: يخزّن واجهة البرنامج للفتح السريع. البيانات دايماً من السيرفر (لا تُخزَّن هنا). */
const CACHE = 'zakat-nashrat-shell-v3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'native.bundle.js', 'islam.js', 'islam-data.js', 'i18n.js', 'lang/en.js', 'fonts/amiri-quran-arabic-400-normal.woff2', 'libs/html2pdf.bundle.min.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'fonts/cairo-arabic-400-normal.woff2', 'fonts/cairo-arabic-600-normal.woff2', 'fonts/cairo-arabic-700-normal.woff2', 'fonts/cairo-arabic-800-normal.woff2',
  'fonts/cairo-latin-400-normal.woff2', 'fonts/cairo-latin-600-normal.woff2', 'fonts/cairo-latin-700-normal.woff2', 'fonts/cairo-latin-800-normal.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (isPage) {
    // الصفحة: الشبكة أولاً (لتصل التحديثات) ثم النسخة المخزنة عند انقطاع النت
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
});
