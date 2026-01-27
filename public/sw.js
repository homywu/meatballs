// Minimal Service Worker for PWA compliance
// Required for "Install" prompt to appear in browsers

const CACHE_NAME = 'meatballs-cache-v1';

self.addEventListener('install', (event) => {
    // @ts-ignore
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // We don't necessarily need to pre-cache anything for the install prompt to work
            // but having an install listener is good practice
            return cache.addAll([]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // A fetch listener is REQUIRED for PWA installability
    // @ts-ignore
    event.respondWith(
        // @ts-ignore
        caches.match(event.request).then((response) => {
            // @ts-ignore
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('activate', (event) => {
    // @ts-ignore
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
