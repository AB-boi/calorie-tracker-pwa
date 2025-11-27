// Service Worker for Calorie Tracker PWA
const CACHE_NAME = 'calorie-tracker-v3';

// List of files to cache (this file, the HTML, and external dependencies)
const urlsToCache = [
    './CalorieTracker.html',
    './manifest.json',
    // External dependencies - Caching these allows offline use for the UI/UX
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://unpkg.com/lucide@latest',
    'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&display=swap'
];

// Installation: Caching all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation: Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetching: Serve from cache first, then fall back to network
self.addEventListener('fetch', event => {
    // We do not cache API calls (Gemini) or dynamic resources (like font imports handled by CSS)
    if (event.request.url.includes('googleapis.com/v1beta/models')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // No cache match - fetch from network
                return fetch(event.request);
            })
    );
});
