var cacheName = 'protodbL12';
var filesToCache = [
  './',
  'index.html',
  'admin.html',

  'static/css/style.css',

  'static/js/main.js',
  'static/js/knockout-3.5.1.js',
  'static/js/idb-keyval-iife.js',
  'static/js/protodb_util.js',
  'static/js/protodb.js',
  'static/js/protodb_db.js',
  'static/js/protodb_ko_person.js',
  'static/js/protodb_ko_group.js',
  'static/js/protodb_ko_viewmodel.js',
  'static/js/protodb_formload.js',
  'static/js/protodb_tosheet.js',
  'static/js/protodb-admin.js',

  'static/js/session_questions.json',
  'static/js/person_questions.json',
  'static/js/staff_questions.json',

  'static/images/favicon.ico',
  "static/images/protodb-icon-128.png",
  "static/images/protodb-icon-144.png",
  "static/images/protodb-icon-152.png",
  "static/images/protodb-icon-192.png",
  "static/images/protodb-icon-256.png",
  "static/images/protodb-icon-512.png",
];

/* on install, get fresh version from server */
var nocacheRequest = function(url){
    r = new Request(url, {'cache': 'reload'});
    return r;
}


/* Install the service worker and cache everything needed offline */
self.addEventListener('install', function(e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            var ncrs = filesToCache.map(nocacheRequest);
            return cache.addAll(ncrs);
        })
    );
});

/* Remove old caches when new service worker activated */
self.addEventListener('activate', function(event){
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames
                .filter(function(cname){
                    // Return true if you want to remove this cache
                    // (all but the current, which is cacheName)
                    return cname != cacheName;
                })
                .map(function (cname) {
                    return caches.delete(cname);
                }),
            );
        }),
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
