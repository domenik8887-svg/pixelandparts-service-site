const CACHE_NAME = "pixelparts-modern-v3";
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
  "./en/privacy.html"
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
