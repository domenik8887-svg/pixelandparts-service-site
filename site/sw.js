const CACHE_NAME = "pixelparts-modern-v6";
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
  "./favicon.svg",
  "./assets/pixel-parts-mark.svg",
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
  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.endsWith("/public-config.json")) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(event.request);
        return cached || caches.match("./index.html");
      })
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
