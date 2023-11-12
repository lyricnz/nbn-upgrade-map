const cacheName = 'cache';
const cacheDuration = 30; // days

self.addEventListener("fetch", async (event) => {
    if (event.request.destination === 'image') {
        event.respondWith(caches.open(cacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    let cacheCopy = networkResponse.clone();
                    cacheCopy.headers.set('sw-fetched-on', new Date().getTime());
                    cache.put(event.request, cacheCopy);

                    return networkResponse;
                });

                return cachedResponse || fetchedResponse;
            });
        }));
    } else {
        event.respondWith(fetch(event.request));
    }
});