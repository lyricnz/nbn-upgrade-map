const cacheName = 'cache';
const cacheDuration = 30; // days

self.addEventListener("fetch", async (event) => {
    if (event.request.destination === 'image') {
        event.respondWith(caches.open(cacheName).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    let cacheCopy = networkResponse.clone();
                    let headers = new Headers(cacheCopy.headers);
                    headers.append('sw-fetched-on', new Date().getTime());
                    cache.put(event.request, new Response(cacheCopy.body, {
                        status: cacheCopy.status,
                        statusText: cacheCopy.statusText,
                        headers: headers
                    }));

                    return networkResponse;
                });

                return cachedResponse || fetchedResponse;
            });
        }));
    } else {
        event.respondWith(fetch(event.request));
    }
});