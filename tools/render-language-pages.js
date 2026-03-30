const fs = require("node:fs");
const path = require("node:path");

const siteDir = path.join(__dirname, "..", "site");
const pageFiles = {
  home: "index.html",
  services: "services.html",
  process: "process.html",
  faq: "faq.html",
  request: "request.html",
  contact: "contact.html",
  success: "success.html"
};

const csp = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self' https: http://localhost:8080 http://127.0.0.1:8080; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests";

main();

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node tools/render-language-pages.js <data.json>");
  }

  const language = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const outputDir = path.join(siteDir, language.code);
  fs.mkdirSync(outputDir, { recursive: true });

  const pages = {
    home: renderHome(language),
    services: renderServices(language),
    process: renderProcess(language),
    faq: renderFaq(language),
    request: renderRequest(language),
    contact: renderContact(language),
    success: renderSuccess(language)
  };

  for (const [key, html] of Object.entries(pages)) {
    fs.writeFileSync(path.join(outputDir, pageFiles[key]), html, "utf8");
  }

  console.log(`Rendered pages for ${language.code}.`);
}

function renderHome(language) {
  const page = language.pages.home;
  const cards = page.cards.map(renderCard).join("");
  const support = page.support.map(renderCard).join("");
  return wrap(language, "home", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p><div class="cta-row"><a class="button button-primary" href="request.html">${escapeHtml(page.ctaPrimary)}</a><a class="button button-secondary" href="services.html">${escapeHtml(page.ctaSecondary)}</a></div></div><div class="hero-side"><article class="panel"><h3>${escapeHtml(page.focusTitle)}</h3>${renderList(page.focusItems)}</article><article class="panel"><h3>${escapeHtml(page.casesTitle)}</h3>${renderList(page.casesItems)}</article></div></section>
    <section class="shell section"><div class="section-heading"><p class="eyebrow">${escapeHtml(page.overviewEyebrow)}</p><h2>${escapeHtml(page.overviewTitle)}</h2><p>${escapeHtml(page.overviewLead)}</p></div><div class="grid-3">${cards}</div></section>
    <section class="shell section"><div class="grid-2">${support}</div></section>`);
}

function renderServices(language) {
  const page = language.pages.services;
  const cards = page.cards.map(renderCard).join("");
  return wrap(language, "services", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p></div><article class="panel"><h3>${escapeHtml(page.sideTitle)}</h3>${renderList(page.sideItems)}</article></section>
    <section class="shell section"><div class="grid-3">${cards}</div></section>`);
}

function renderProcess(language) {
  const page = language.pages.process;
  const principles = page.principles.map(renderCard).join("");
  const steps = page.steps.map((step) => `<li class="card"><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join("");
  return wrap(language, "process", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p></div><article class="panel"><h3>${escapeHtml(page.sideTitle)}</h3>${renderList(page.sideItems)}</article></section>
    <section class="shell section"><div class="section-heading"><p class="eyebrow">${escapeHtml(page.principleEyebrow)}</p><h2>${escapeHtml(page.principleTitle)}</h2></div><div class="grid-2">${principles}</div></section>
    <section class="shell section"><div class="section-heading"><p class="eyebrow">${escapeHtml(page.timelineEyebrow)}</p><h2>${escapeHtml(page.timelineTitle)}</h2></div><ol class="timeline">${steps}</ol></section>`);
}

function renderFaq(language) {
  const page = language.pages.faq;
  const cards = page.cards.map(renderCard).join("");
  return wrap(language, "faq", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p></div><article class="panel"><h3>${escapeHtml(page.sideTitle)}</h3><p>${escapeHtml(page.sideText)}</p></article></section>
    <section class="shell section"><div class="grid-2">${cards}</div></section>`);
}

function renderRequest(language) {
  const page = language.pages.request;
  const serviceOptions = [`<option value="">${escapeHtml(page.placeholders.choose)}</option>`, ...page.options.services.map((item) => `<option>${escapeHtml(item)}</option>`)].join("");
  const contactOptions = page.options.contacts.map((item) => `<option>${escapeHtml(item)}</option>`).join("");
  return wrap(language, "request", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p></div><article class="panel request-copy"><div class="status-chip" id="backend-chip">${escapeHtml(page.checkingLabel)}</div><h3>${escapeHtml(page.sideTitle)}</h3>${renderList(page.sideItems)}<p class="queue-note" id="queue-note">${escapeHtml(page.queueText)}</p><p class="contact-note" id="backend-note">${escapeHtml(page.noteText)}</p></article></section>
    <section class="shell section"><form class="request-form" data-request-form method="post" action="../api/inquiries" novalidate><div class="form-grid"><label class="field"><span>${escapeHtml(page.fields.name)}</span><input type="text" name="name" autocomplete="name" required></label><label class="field"><span>${escapeHtml(page.fields.email)}</span><input type="email" name="email" autocomplete="email" required></label><label class="field"><span>${escapeHtml(page.fields.phone)}</span><input type="tel" name="phone" autocomplete="tel"></label><label class="field"><span>${escapeHtml(page.fields.service)}</span><select name="serviceType" data-custom-select required>${serviceOptions}</select></label><label class="field field-wide"><span>${escapeHtml(page.fields.device)}</span><input type="text" name="deviceType" placeholder="${escapeHtml(page.placeholders.device)}"></label><label class="field field-wide"><span>${escapeHtml(page.fields.preferred)}</span><select name="preferredContact" data-custom-select>${contactOptions}</select></label><label class="field field-full"><span>${escapeHtml(page.fields.message)}</span><textarea name="message" rows="6" placeholder="${escapeHtml(page.placeholders.message)}" required></textarea></label></div><input type="hidden" name="source" value="website"><label class="field" style="display:none"><span>${escapeHtml(page.fields.honeypot)}</span><input type="text" name="website" autocomplete="off" tabindex="-1"></label><button class="button button-primary" id="request-submit" type="submit">${escapeHtml(page.button)}</button><p class="field-hint" id="request-hint">${escapeHtml(page.hint)}</p><p class="field-feedback" id="request-feedback" aria-live="polite"></p></form></section>`);
}

function renderContact(language) {
  const page = language.pages.contact;
  const cards = page.cards.map((card) => `<article class="contact-method"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p><p><a class="button ${card.primary ? "button-primary" : "button-secondary"}" href="${escapeHtml(card.href)}"${card.href.startsWith("https://") ? ' rel="noreferrer"' : ""}>${escapeHtml(card.label)}</a></p></article>`).join("");
  return wrap(language, "contact", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p></div><article class="panel"><h3>${escapeHtml(page.sideTitle)}</h3>${renderList(page.sideItems)}</article></section>
    <section class="shell section"><div class="contact-grid">${cards}</div></section>`);
}

function renderSuccess(language) {
  const page = language.pages.success;
  return wrap(language, "success", page.title, page.meta, `
    <section class="shell page-hero"><div><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p class="lead">${escapeHtml(page.lead)}</p><div class="cta-row"><a class="button button-primary" href="index.html">${escapeHtml(page.primary)}</a><a class="button button-secondary" href="request.html">${escapeHtml(page.secondary)}</a></div></div><article class="panel"><h3>${escapeHtml(page.sideTitle)}</h3>${renderList(page.sideItems)}</article></section>`);
}

function wrap(language, pageKey, title, meta, content) {
  return `<!DOCTYPE html>
<html lang="${escapeHtml(language.lang)}" dir="${escapeHtml(language.dir)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="description" content="${escapeHtml(meta)}">
  <meta name="theme-color" content="#f5f1ea">
  <title>Pixel &amp; Parts | ${escapeHtml(title)}</title>
  <link rel="icon" href="../favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="../site.webmanifest">
  <link rel="stylesheet" href="../modern.css">
  <script src="../public.js" defer></script>
</head>
<body data-site-root=".." data-page-key="${pageKey}"${pageKey === "request" ? ' data-success-url="./success.html"' : ""}>
  <a class="skip-link" href="#main-content">${escapeHtml(language.skip)}</a>
  ${renderHeader(language, pageKey)}
  <main id="main-content" class="page-shell">
${content}
  </main>
  ${renderFooter(language)}
</body>
</html>`;
}

function renderHeader(language, pageKey) {
  return `<header class="site-header"><div class="shell nav-shell"><a class="brand" href="index.html"><img src="../assets/pixel-parts-mark.svg" width="52" height="52" alt=""><span><strong>Pixel &amp; Parts</strong><small>${escapeHtml(language.brandSubtitle)}</small></span></a><div class="header-tools"><nav class="main-nav" aria-label="${escapeHtml(language.navigationLabel || "Navigation")}"><a${pageKey === "home" ? ' class="is-active"' : ""} href="index.html">${escapeHtml(language.nav.home)}</a><a${pageKey === "services" ? ' class="is-active"' : ""} href="services.html">${escapeHtml(language.nav.services)}</a><a${pageKey === "process" ? ' class="is-active"' : ""} href="process.html">${escapeHtml(language.nav.process)}</a><a${pageKey === "faq" ? ' class="is-active"' : ""} href="faq.html">${escapeHtml(language.nav.faq)}</a><a${pageKey === "request" ? ' class="is-active"' : ""} href="request.html">${escapeHtml(language.nav.request)}</a><a${pageKey === "contact" ? ' class="is-active"' : ""} href="contact.html">${escapeHtml(language.nav.contact)}</a></nav><div class="language-switch" data-language-switch aria-label="${escapeHtml(language.languageLabel)}"></div></div></div></header>`;
}

function renderFooter(language) {
  return `<footer class="site-footer"><div class="shell footer-grid"><div><p class="footer-title">Pixel &amp; Parts</p><p>${escapeHtml(language.footerAbout)}</p></div><div><p class="footer-title">${escapeHtml(language.footerPagesTitle)}</p><ul class="footer-list"><li><a href="services.html">${escapeHtml(language.nav.services)}</a></li><li><a href="process.html">${escapeHtml(language.nav.process)}</a></li><li><a href="faq.html">${escapeHtml(language.nav.faq)}</a></li><li><a href="request.html">${escapeHtml(language.nav.request)}</a></li><li><a href="contact.html">${escapeHtml(language.nav.contact)}</a></li><li><a href="../en/legal.html">${escapeHtml(language.nav.legal)}</a></li><li><a href="../en/privacy.html">${escapeHtml(language.nav.privacy)}</a></li></ul></div><div><p class="footer-title">${escapeHtml(language.footerContactTitle)}</p><ul class="footer-list"><li><a href="mailto:koelbeldomenik@web.de">koelbeldomenik@web.de</a></li><li><a href="tel:+491771680815">0177 1680815</a></li><li><a href="https://wa.me/4915751713843" rel="noreferrer">WhatsApp</a></li><li><a href="../.well-known/security.txt">security.txt</a></li></ul></div></div></footer>`;
}

function renderCard(card) {
  return `<article class="card"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.text)}</p></article>`;
}

function renderList(items) {
  return `<ul class="detail-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}
