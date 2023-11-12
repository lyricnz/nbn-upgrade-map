const cacheName = 'cache';
const cacheDuration = 30; // days

self.addEventListener("fetch", async (event) => {
    // Open the cache
    event.respondWith(caches.open(cacheName).then((cache) => {
        if (event.request.destination === 'image') {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());

                    return networkResponse;
                });

                return cachedResponse || fetchedResponse;
            });
        } else {
            return fetch(event.request);
        }
    }));
});