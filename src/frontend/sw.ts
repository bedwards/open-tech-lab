/* eslint-env serviceworker */
/// <reference lib="webworker" />

interface SyncEvent extends ExtendableEvent {
  tag: string;
}

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'open-tech-lab-v1';
const STATIC_CACHE = ['/', '/index.html', '/src/frontend/main.ts', '/src/frontend/styles/main.css'];

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE)));
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
        )
      )
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

sw.addEventListener('sync', (event) => {
  const syncEvent = event as unknown as SyncEvent;
  if (syncEvent.tag === 'sync-projects') {
    syncEvent.waitUntil(syncProjects());
  }
});

async function syncProjects(): Promise<void> {
  console.log('Syncing projects...');
}
