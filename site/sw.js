const CACHE_NAME = "pixelparts-modern-v8";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./leistungen.html",
  "./arbeitsweise.html",
  "./faq.html",
  "./anfrage.html",
  "./kontakt.html",
  "./impressum.html",
  "./datenschutz.html",
  "./anfrage-erfolgreich.html",
  "./modern.css",
  "./public.js",
  "./public-config.json",
  "./site.webmanifest",
  "./favicon.svg",
  "./assets/pixel-parts-mark.svg",
  "./assets/photos/pc-assembly-closeup.jpg",
  "./assets/photos/pc-assembly-overview.jpg",
  "./en/index.html",
  "./en/services.html",
  "./en/process.html",
  "./en/faq.html",
  "./en/request.html",
  "./en/contact.html",
  "./en/success.html",
  "./en/legal.html",
  "./en/privacy.html",
  "./he/index.html",
  "./he/services.html",
  "./he/process.html",
  "./he/faq.html",
  "./he/request.html",
  "./he/contact.html",
  "./he/success.html",
  "./ru/index.html",
  "./ru/services.html",
  "./ru/process.html",
  "./ru/faq.html",
  "./ru/request.html",
  "./ru/contact.html",
  "./ru/success.html",
  "./zh/index.html",
  "./zh/services.html",
  "./zh/process.html",
  "./zh/faq.html",
  "./zh/request.html",
  "./zh/contact.html",
  "./zh/success.html",
  "./tr/index.html",
  "./tr/services.html",
  "./tr/process.html",
  "./tr/faq.html",
  "./tr/request.html",
  "./tr/contact.html",
  "./tr/success.html",
  "./ar/index.html",
  "./ar/services.html",
  "./ar/process.html",
  "./ar/faq.html",
  "./ar/request.html",
  "./ar/contact.html",
  "./ar/success.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const cacheableDestinations = new Set(["document", "style", "script", "image", "font", "manifest"]);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    try {
      const fresh = await fetch(request);
      if (fresh.ok && (request.mode === "navigate" || cacheableDestinations.has(request.destination) || url.pathname.endsWith("/public-config.json"))) {
        cache.put(request, fresh.clone());
      }
      return fresh;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      if (request.mode === "navigate") {
        return (await cache.match("./index.html")) || Response.error();
      }

      throw error;
    }
  })());
});
