// ※ アカウント・ログイン情報はlocalStorageに保存され、ここのキャッシュ更新では消えません
const CACHE = 'zaiko-v3';
const ASSETS = [
  './在庫検索アプリ.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // GASへのAPIリクエストはキャッシュしない（常に最新データを取得）
  if (e.request.url.includes('script.google.com')) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
