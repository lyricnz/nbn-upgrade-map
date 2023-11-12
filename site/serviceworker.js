const cacheName = 'cache';
const cacheDuration = 30; // days
const subCacheNames = ['tiles'];
let completeCacheNames = subCacheNames.map((subCacheName) => {
    return `${cacheName}-${subCacheName}`;
});

self.addEventListener("activate", (event) => {
    event.waitUntil(caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => {
            if (!completeCacheNames.includes(key)) {
                return caches.delete(key);
            }
        }));
    }));
});

self.addEventListener("fetch", async (event) => {
    if (event.request.url.includes('/rastertiles/')) {
        event.respondWith(caches.open(`${cacheName}-tiles`).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                if (isValid(cachedResponse)) {
                    console.log('Serving from the cache: ', event.request.url);
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
                    console.log('Serving from the network: ', event.request.url);
                    let cacheCopy = networkResponse.clone();
                    let headers = new Headers(cacheCopy.headers);
                    headers.append('sw-fetched-on', new Date().getTime());
                    cache.put(event.request, new Response(cacheCopy.body, {
                        status: cacheCopy.status,
                        statusText: cacheCopy.statusText,
                        headers: headers
                    }));

                    return networkResponse;
                }).catch(() => {
                    return cachedResponse;
                });
            });
        }));
    } else {
        event.respondWith(fetch(event.request));
    }
});

function isValid (response, days=cacheDuration) {
    if (!response) {
        return false;
    }

    let fetchedOn = response.headers.get('sw-fetched-on');
    if (!fetchedOn) {
        return false;
    }

    fetchedOn = parseInt(fetchedOn);
    if (isNaN(fetchedOn)) {
        return false;
    }

    return (new Date().getTime() - fetchedOn) < (days * 24 * 60 * 60 * 1000);
}