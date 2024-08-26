const cacheName = 'cache';
const cacheDuration = 30; // days
const subCacheNames = ['tiles', 'persistent', 'other'];
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
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    if (event.request.url.includes('/rastertiles/')) {
        event.respondWith(caches.open(`${cacheName}-tiles`).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                if (isValid(cachedResponse)) {
                    return cachedResponse;
                }

                return fetch(event.request).then((networkResponse) => {
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
    } else if (event.request.url.includes('/static/') || event.request.headers.get('accept').includes('text/css') || event.request.url.endsWith('.js') || /^https:\/\/nbn\.lukeprior.com\/[^|/]{40,}\/results\/.*\.geojson/.test(event.request.url)) {
        event.respondWith(caches.open(`${cacheName}-persistent`).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    cache.put(event.request, networkResponse.clone());

                    return networkResponse;
                });

                return cachedResponse || fetchedResponse;
            });
        }));
    } else {
        event.respondWith(caches.open(`${cacheName}-other`).then((cache) => {
            return fetch(event.request).then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());

                return networkResponse;
            }).catch(() => {
                return cache.match(event.request);
            });
        }));
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
