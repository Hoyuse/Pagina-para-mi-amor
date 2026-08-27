const CACHE_NAME = 'nuestro-amor-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-init.js',
  './voice.js',
  './particles.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
