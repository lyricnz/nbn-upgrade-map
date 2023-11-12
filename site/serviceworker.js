const cacheName = 'cache';
const cacheDuration = 30; // days

self.addEventListener("fetch", event => {
    // All requests fall into one of these categories.
    // 1. Return if in cache and less than 30 days old or if network request fails.
    // 2. Return from cache and update cache in the background.
    // 3. Return if in cache else make network request and cache the result.

    // map tiles
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(`${cacheName}-tiles`).then(cache => {
                return cache.match(event.request).then(response => {
                    if (isValid(response, cacheDuration)) {
                        return response;
                    }

                    return fetch(event.request).then(response => {
                        var copy = response.clone();
                        copy.headers.append('sw-cache-date', new Date().toString());
                        cache.put(event.request, copy);
                        return response;
                    }).catch(() => {
                        return cache.match(event.request);
                    });
                });
            })
        );
    }
});

function isValid(response, days = 30) {
    return response && (Date.now() - new Date(response.headers.get('sw-cache-date'))) / (1000 * 60 * 60 * 24) < days;
}