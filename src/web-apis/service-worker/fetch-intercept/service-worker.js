/* eslint-env browser */

const cacheName = ['static-v1'];
const fallbackUrl = '/act/test/monorepo/latest/web-apis/service-worker/fetch-intercept/oldtv.jpg';

const putInCache = async (request, response) => {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
};

self.addEventListener('activate', (event) => {
  const preCache = async () => {
    // eslint-disable-next-line no-undef
    await clients.claim();
    const responseFromNetwork = await fetch(fallbackUrl);
    return putInCache(fallbackUrl, responseFromNetwork.clone());
  };
  event.waitUntil(preCache());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('newtv.png')) {
    event.respondWith(
      caches.open(cacheName).then((cache) => {
        return cache.match(fallbackUrl).then((response) => {
          if (response) {
            return response;
          }
        });
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
