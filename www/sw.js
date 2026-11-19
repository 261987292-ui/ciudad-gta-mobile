var CACHE="ciudad-gta-v1";
var FILES=["./","./index.html","./css/style.css","./js/three.min.js","./js/audio.js","./js/game.js","./manifest.json"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(FILES);}));self.skipWaiting();});
self.addEventListener("activate",function(e){e.waitUntil(clients.claim());});
self.addEventListener("fetch",function(e){e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request);}));});
