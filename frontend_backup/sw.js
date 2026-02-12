const CACHE_NAME = 'aegis-v1.0.1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/i18n.js',
    '/logo.png'
];

// 安裝時清理舊快取並立即生效
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
});

// 網路優先策略 (Network First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request))
    );
});
