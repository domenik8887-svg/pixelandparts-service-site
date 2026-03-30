const supportedLanguages = {
  de: {
    label: "DE",
    name: "Deutsch",
    pages: {
      home: "index.html",
      services: "leistungen.html",
      process: "arbeitsweise.html",
      faq: "faq.html",
      request: "anfrage.html",
      contact: "kontakt.html",
      success: "anfrage-erfolgreich.html",
      legal: "impressum.html",
      privacy: "datenschutz.html"
    }
  },
  en: {
    label: "EN",
    name: "English",
    pages: {
      home: "en/index.html",
      services: "en/services.html",
      process: "en/process.html",
      faq: "en/faq.html",
      request: "en/request.html",
      contact: "en/contact.html",
      success: "en/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  },
  he: {
    label: "HE",
    name: "עברית",
    pages: {
      home: "he/index.html",
      services: "he/services.html",
      process: "he/process.html",
      faq: "he/faq.html",
      request: "he/request.html",
      contact: "he/contact.html",
      success: "he/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  },
  ru: {
    label: "RU",
    name: "Русский",
    pages: {
      home: "ru/index.html",
      services: "ru/services.html",
      process: "ru/process.html",
      faq: "ru/faq.html",
      request: "ru/request.html",
      contact: "ru/contact.html",
      success: "ru/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  },
  zh: {
    label: "ZH",
    name: "中文",
    pages: {
      home: "zh/index.html",
      services: "zh/services.html",
      process: "zh/process.html",
      faq: "zh/faq.html",
      request: "zh/request.html",
      contact: "zh/contact.html",
      success: "zh/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  },
  tr: {
    label: "TR",
    name: "Türkçe",
    pages: {
      home: "tr/index.html",
      services: "tr/services.html",
      process: "tr/process.html",
      faq: "tr/faq.html",
      request: "tr/request.html",
      contact: "tr/contact.html",
      success: "tr/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  },
  ar: {
    label: "AR",
    name: "العربية",
    pages: {
      home: "ar/index.html",
      services: "ar/services.html",
      process: "ar/process.html",
      faq: "ar/faq.html",
      request: "ar/request.html",
      contact: "ar/contact.html",
      success: "ar/success.html",
      legal: "en/legal.html",
      privacy: "en/privacy.html"
    }
  }
};

const siteRoot = document.body.dataset.siteRoot || ".";
const siteBaseUrl = new URL(`${siteRoot}/`, window.location.href);
const resolvedLang = String(document.documentElement.lang || "de").split("-")[0].toLowerCase();
const currentLang = supportedLanguages[resolvedLang] ? resolvedLang : "de";
const successUrl = document.body.dataset.successUrl || buildSiteUrl(supportedLanguages[currentLang].pages.success);
const rtlLanguages = new Set(["ar", "he"]);

const translations = {
  de: {
    backendChecking: "Verbindung wird geprüft",
    backendReady: "Direkte Übermittlung aktiv",
    backendOffline: "Zwischenspeicherung aktiv",
    queueEmpty: "Aktuell keine zwischengespeicherten Anfragen auf diesem Gerät.",
    queuePending: "{count} Anfrage(n) warten auf diesem Gerät und werden automatisch übertragen, sobald die Verbindung wieder steht.",
    readyNote: "Das Formular ist bereit. Neue Anfragen werden direkt übermittelt.",
    readyHint: "Wenn die Verbindung verfügbar ist, wird die Anfrage sofort gesendet.",
    offlineNote: "Die Verbindung ist gerade nicht verfügbar. Anfragen können sicher auf diesem Gerät zwischengespeichert werden.",
    offlineHint: "Bei einer kurzen Störung wird die Anfrage lokal gesichert und später automatisch übertragen.",
    submitReady: "Anfrage senden",
    submitOffline: "Anfrage zwischenspeichern",
    submitBusy: "Anfrage wird verarbeitet ...",
    submitSuccess: "Anfrage erfolgreich gespeichert. Weiterleitung zur Bestätigungsseite ...",
    submitOfflineSaved: "Die Verbindung war gerade nicht verfügbar. Die Anfrage wurde auf diesem Gerät gesichert und wird später automatisch übertragen.",
    submitTransferred: "Zwischengespeicherte Anfragen wurden erfolgreich übertragen.",
    validationBot: "Die Anfrage konnte nicht verarbeitet werden.",
    validationMissing: "Bitte Name, E-Mail, Leistung und Beschreibung ausfüllen.",
    validationEmail: "Bitte eine gültige E-Mail-Adresse angeben."
  },
  en: {
    backendChecking: "Checking connection",
    backendReady: "Direct sending active",
    backendOffline: "Buffering active",
    queueEmpty: "There are currently no buffered requests on this device.",
    queuePending: "{count} request(s) are waiting on this device and will be transferred automatically once the connection is back.",
    readyNote: "The form is ready. New requests are sent directly.",
    readyHint: "If the connection is available, the request is sent immediately.",
    offlineNote: "The connection is currently unavailable. Requests can be buffered safely on this device.",
    offlineHint: "During a short outage, the request is stored locally and transferred automatically later.",
    submitReady: "Send request",
    submitOffline: "Save request locally",
    submitBusy: "Processing request ...",
    submitSuccess: "Request stored successfully. Redirecting to the confirmation page ...",
    submitOfflineSaved: "The connection was unavailable. The request was saved on this device and will be transferred automatically later.",
    submitTransferred: "Buffered requests were transferred successfully.",
    validationBot: "The request could not be processed.",
    validationMissing: "Please complete name, email, service and description.",
    validationEmail: "Please enter a valid email address."
  },
  he: {
    backendChecking: "החיבור נבדק",
    backendReady: "שליחה ישירה פעילה",
    backendOffline: "שמירה זמנית פעילה",
    queueEmpty: "כרגע אין פניות שמורות זמנית במכשיר זה.",
    queuePending: "{count} פנייה/ות ממתינות במכשיר זה ויישלחו אוטומטית ברגע שהחיבור יחזור.",
    readyNote: "הטופס מוכן. פניות חדשות נשלחות מיד.",
    readyHint: "כאשר החיבור זמין, הפנייה נשלחת מיד.",
    offlineNote: "החיבור אינו זמין כרגע. ניתן לשמור פניות בבטחה במכשיר זה.",
    offlineHint: "במקרה של תקלה קצרה, הפנייה נשמרת מקומית ותישלח אוטומטית מאוחר יותר.",
    submitReady: "שלח פנייה",
    submitOffline: "שמור פנייה מקומית",
    submitBusy: "הפנייה מעובדת ...",
    submitSuccess: "הפנייה נשמרה בהצלחה. מעבר לדף האישור ...",
    submitOfflineSaved: "החיבור לא היה זמין. הפנייה נשמרה במכשיר זה ותועבר אוטומטית מאוחר יותר.",
    submitTransferred: "הפניות השמורות הועברו בהצלחה.",
    validationBot: "לא ניתן היה לעבד את הפנייה.",
    validationMissing: "נא למלא שם, דוא\"ל, שירות ותיאור.",
    validationEmail: "נא להזין כתובת דוא\"ל תקינה."
  },
  ru: {
    backendChecking: "Проверка соединения",
    backendReady: "Прямая отправка активна",
    backendOffline: "Локальное сохранение активно",
    queueEmpty: "На этом устройстве сейчас нет сохранённых запросов.",
    queuePending: "{count} запрос(ов) ожидают на этом устройстве и будут отправлены автоматически, как только соединение восстановится.",
    readyNote: "Форма готова. Новые запросы отправляются сразу.",
    readyHint: "Если соединение доступно, запрос отправляется немедленно.",
    offlineNote: "Соединение сейчас недоступно. Запросы можно безопасно сохранить на этом устройстве.",
    offlineHint: "При коротком сбое запрос сохраняется локально и будет отправлен позже автоматически.",
    submitReady: "Отправить запрос",
    submitOffline: "Сохранить локально",
    submitBusy: "Запрос обрабатывается ...",
    submitSuccess: "Запрос успешно сохранён. Переход на страницу подтверждения ...",
    submitOfflineSaved: "Соединение было недоступно. Запрос сохранён на этом устройстве и будет отправлен позже автоматически.",
    submitTransferred: "Сохранённые запросы успешно переданы.",
    validationBot: "Не удалось обработать запрос.",
    validationMissing: "Пожалуйста, заполните имя, email, услугу и описание.",
    validationEmail: "Пожалуйста, укажите корректный email."
  },
  zh: {
    backendChecking: "正在检查连接",
    backendReady: "已启用直接提交",
    backendOffline: "已启用本地暂存",
    queueEmpty: "此设备当前没有暂存的请求。",
    queuePending: "此设备上有 {count} 条请求等待发送，连接恢复后将自动提交。",
    readyNote: "表单已准备就绪。新的请求会直接发送。",
    readyHint: "连接可用时，请求会立即发送。",
    offlineNote: "当前连接不可用。请求可以安全地暂存在此设备上。",
    offlineHint: "如果出现短暂中断，请求会保存在本地，稍后自动发送。",
    submitReady: "发送请求",
    submitOffline: "本地保存请求",
    submitBusy: "正在处理请求 ...",
    submitSuccess: "请求已成功保存。正在跳转到确认页面 ...",
    submitOfflineSaved: "连接不可用。请求已保存在此设备上，稍后会自动发送。",
    submitTransferred: "暂存的请求已成功发送。",
    validationBot: "无法处理该请求。",
    validationMissing: "请填写姓名、电子邮箱、服务和说明。",
    validationEmail: "请输入有效的电子邮箱地址。"
  },
  tr: {
    backendChecking: "Bağlantı kontrol ediliyor",
    backendReady: "Doğrudan gönderim aktif",
    backendOffline: "Yerel kayıt aktif",
    queueEmpty: "Bu cihazda şu anda bekleyen kayıtlı talep yok.",
    queuePending: "Bu cihazda {count} talep bekliyor ve bağlantı geri geldiğinde otomatik olarak gönderilecek.",
    readyNote: "Form hazır. Yeni talepler doğrudan gönderilir.",
    readyHint: "Bağlantı varsa talep hemen gönderilir.",
    offlineNote: "Bağlantı şu anda kullanılamıyor. Talepler bu cihazda güvenle saklanabilir.",
    offlineHint: "Kısa bir kesinti olursa talep yerel olarak kaydedilir ve daha sonra otomatik olarak gönderilir.",
    submitReady: "Talep gönder",
    submitOffline: "Yerel olarak kaydet",
    submitBusy: "Talep işleniyor ...",
    submitSuccess: "Talep başarıyla kaydedildi. Onay sayfasına yönlendiriliyor ...",
    submitOfflineSaved: "Bağlantı mevcut değildi. Talep bu cihaza kaydedildi ve daha sonra otomatik olarak gönderilecek.",
    submitTransferred: "Bekleyen talepler başarıyla gönderildi.",
    validationBot: "Talep işlenemedi.",
    validationMissing: "Lütfen ad, e-posta, hizmet ve açıklama alanlarını doldurun.",
    validationEmail: "Lütfen geçerli bir e-posta adresi girin."
  },
  ar: {
    backendChecking: "جار فحص الاتصال",
    backendReady: "الإرسال المباشر مفعّل",
    backendOffline: "الحفظ المؤقت مفعّل",
    queueEmpty: "لا توجد طلبات محفوظة مؤقتاً على هذا الجهاز حالياً.",
    queuePending: "هناك {count} طلب/طلبات محفوظة على هذا الجهاز وسيتم إرسالها تلقائياً عند عودة الاتصال.",
    readyNote: "النموذج جاهز. يتم إرسال الطلبات الجديدة مباشرة.",
    readyHint: "عندما يكون الاتصال متاحاً يتم إرسال الطلب فوراً.",
    offlineNote: "الاتصال غير متاح حالياً. يمكن حفظ الطلبات بأمان على هذا الجهاز.",
    offlineHint: "في حال حدوث انقطاع قصير يتم حفظ الطلب محلياً وإرساله لاحقاً تلقائياً.",
    submitReady: "إرسال الطلب",
    submitOffline: "حفظ الطلب محلياً",
    submitBusy: "يتم معالجة الطلب ...",
    submitSuccess: "تم حفظ الطلب بنجاح. جارٍ الانتقال إلى صفحة التأكيد ...",
    submitOfflineSaved: "لم يكن الاتصال متاحاً. تم حفظ الطلب على هذا الجهاز وسيتم إرساله لاحقاً تلقائياً.",
    submitTransferred: "تم إرسال الطلبات المحفوظة بنجاح.",
    validationBot: "تعذر معالجة الطلب.",
    validationMissing: "يرجى إدخال الاسم والبريد الإلكتروني والخدمة والوصف.",
    validationEmail: "يرجى إدخال بريد إلكتروني صالح."
  }
};

const brandContent = {
  de: {
    brandSubtitle: "PC-Service mit christlichen Werten",
    faithBadge: "Christlich geprägt",
    faithText: "Ehrlichkeit, Verantwortung und Hilfe mit Respekt.",
    footerText: "PC- und Laptop-Service in Köln-Mülheim, geprägt von Ehrlichkeit, Verantwortung und einem respektvollen Umgang mit Menschen und Daten."
  },
  en: {
    brandSubtitle: "PC service shaped by Christian values",
    faithBadge: "Christian values",
    faithText: "Honesty, responsibility and respectful help.",
    footerText: "PC and laptop service in Cologne-Mülheim shaped by honesty, responsibility and respectful care for people and data."
  },
  he: {
    brandSubtitle: "שירות מחשבים עם ערכים נוצריים",
    faithBadge: "ערכים נוצריים",
    faithText: "יושר, אחריות ועזרה מתוך כבוד.",
    footerText: "שירות למחשבי PC ולפטופים בקלן-מילהיים, מונחה ביושר, אחריות ויחס מכבד לאנשים ולנתונים."
  },
  ru: {
    brandSubtitle: "ПК-сервис с христианскими ценностями",
    faithBadge: "Христианские ценности",
    faithText: "Честность, ответственность и уважительная помощь.",
    footerText: "Сервис для ПК и ноутбуков в Кёльн-Мюльхайме, основанный на честности, ответственности и уважительном отношении к людям и данным."
  },
  zh: {
    brandSubtitle: "以基督教价值观为基础的电脑服务",
    faithBadge: "基督教价值观",
    faithText: "诚实、责任与尊重式帮助。",
    footerText: "位于科隆米尔海姆的 PC 与笔记本服务，以诚实、责任和对人与数据的尊重为基础。"
  },
  tr: {
    brandSubtitle: "Hristiyan degerlerle bilgisayar servisi",
    faithBadge: "Hristiyan degerler",
    faithText: "Dogruluk, sorumluluk ve saygili destek.",
    footerText: "Koeln-Muelheim'de PC ve dizustu bilgisayar servisi; durustluk, sorumluluk ve insanlara ve verilere saygili yaklasimla sunulur."
  },
  ar: {
    brandSubtitle: "خدمة كمبيوتر بقيم مسيحية",
    faithBadge: "قيم مسيحية",
    faithText: "أمانة ومسؤولية ومساعدة باحترام.",
    footerText: "خدمة لأجهزة الكمبيوتر واللابتوب في كولونيا-مولهايم، قائمة على الأمانة والمسؤولية والاحترام في التعامل مع الناس والبيانات."
  }
};

const t = translations[currentLang] || translations.de;
const branding = brandContent[currentLang] || brandContent.de;
const pendingStorageKey = "pixelparts-pending-requests";

function buildSiteUrl(relativePath) {
  return new URL(relativePath, siteBaseUrl).toString();
}

function closeCustomSelect(wrapper) {
  wrapper.dataset.open = "false";
  const button = wrapper.querySelector(".custom-select-button");
  if (button) {
    button.setAttribute("aria-expanded", "false");
  }
}

function enhanceCustomSelects(root = document) {
  root.querySelectorAll("select[data-custom-select]").forEach((select) => {
    if (select.dataset.enhanced === "true") {
      return;
    }

    select.dataset.enhanced = "true";
    select.classList.add("select-native");

    const wrapper = document.createElement("div");
    wrapper.className = "custom-select";

    const button = document.createElement("button");
    button.className = "custom-select-button";
    button.type = "button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    const label = document.createElement("span");
    label.className = "custom-select-label";
    const icon = document.createElement("span");
    icon.className = "custom-select-icon";
    icon.textContent = "▾";

    const menu = document.createElement("div");
    menu.className = "custom-select-menu";
    menu.setAttribute("role", "listbox");

    for (const option of select.options) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "custom-select-option";
      item.textContent = option.textContent;
      item.dataset.value = option.value;
      item.addEventListener("click", () => {
        select.value = option.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        closeCustomSelect(wrapper);
      });
      menu.appendChild(item);
    }

    const sync = () => {
      const selected = select.options[select.selectedIndex];
      label.textContent = selected ? selected.textContent : "";
      wrapper.dataset.placeholder = select.value ? "false" : "true";
      menu.querySelectorAll(".custom-select-option").forEach((item) => {
        item.dataset.selected = item.dataset.value === select.value ? "true" : "false";
      });
    };

    button.addEventListener("click", () => {
      const isOpen = wrapper.dataset.open === "true";
      document.querySelectorAll(".custom-select[data-open='true']").forEach((entry) => closeCustomSelect(entry));
      document.querySelectorAll(".language-switch[data-open='true']").forEach((entry) => closeLanguageSwitch(entry));
      if (!isOpen) {
        wrapper.dataset.open = "true";
        button.setAttribute("aria-expanded", "true");
      }
    });

    select.addEventListener("change", sync);

    select.parentNode.insertBefore(wrapper, select);
    wrapper.append(select, button, menu);
    button.append(label, icon);
    sync();
  });
}

function closeLanguageSwitch(wrapper) {
  wrapper.dataset.open = "false";
  const button = wrapper.querySelector(".language-switch-button");
  if (button) {
    button.setAttribute("aria-expanded", "false");
  }
}

function normalizeBotTrapFields() {
  document.querySelectorAll("input[name='website']").forEach((input) => {
    input.type = "hidden";
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.removeAttribute("autocomplete");

    const wrapper = input.closest(".bot-trap, label, .field") || input.parentElement;
    if (wrapper && wrapper !== input.form) {
      wrapper.hidden = true;
      wrapper.setAttribute("aria-hidden", "true");
      wrapper.classList.add("bot-trap");
    }
  });
}

function applySiteBranding() {
  document.querySelectorAll(".brand small").forEach((node) => {
    node.textContent = branding.brandSubtitle;
    node.lang = currentLang;
    node.dir = rtlLanguages.has(currentLang) ? "rtl" : "ltr";
  });

  const footerLead = document.querySelector(".site-footer .footer-grid > div:first-child p:not(.footer-title)");
  if (footerLead) {
    footerLead.textContent = branding.footerText;
    footerLead.lang = currentLang;
    footerLead.dir = rtlLanguages.has(currentLang) ? "rtl" : "ltr";
  }

  const header = document.querySelector(".site-header");
  if (header && !document.querySelector(".faith-strip")) {
    const strip = document.createElement("div");
    strip.className = "faith-strip";

    const inner = document.createElement("div");
    inner.className = "shell faith-strip-inner";

    const badge = document.createElement("span");
    badge.className = "faith-badge";
    badge.textContent = branding.faithBadge;

    const text = document.createElement("p");
    text.className = "faith-copy";
    text.textContent = branding.faithText;
    text.lang = currentLang;
    text.dir = rtlLanguages.has(currentLang) ? "rtl" : "ltr";

    inner.append(badge, text);
    strip.append(inner);
    header.insertAdjacentElement("afterend", strip);
  }

  normalizeBotTrapFields();
}

function setupLanguageSwitch() {
  const container = document.querySelector("[data-language-switch]");
  if (!container) {
    return;
  }

  const pageKey = document.body.dataset.pageKey || "home";
  const currentLocale = supportedLanguages[currentLang] || supportedLanguages.de;
  const switchLabel = container.getAttribute("aria-label") || "Language";

  container.className = "language-switch";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "language-switch-button";
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-label", switchLabel);
  button.lang = currentLang;

  const currentShort = document.createElement("span");
  currentShort.className = "language-switch-current";
  currentShort.textContent = currentLocale.label;

  const currentName = document.createElement("span");
  currentName.className = "language-switch-name";
  currentName.textContent = currentLocale.name;

  const icon = document.createElement("span");
  icon.className = "language-switch-icon";
  icon.textContent = "▾";

  const menu = document.createElement("div");
  menu.className = "language-switch-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", switchLabel);

  for (const [code, language] of Object.entries(supportedLanguages)) {
    const option = document.createElement("a");
    option.className = "language-switch-option";
    option.href = buildSiteUrl(language.pages[pageKey] || language.pages.home);
    option.lang = code;
    option.dir = rtlLanguages.has(code) ? "rtl" : "ltr";
    option.setAttribute("role", "menuitem");
    option.textContent = `${language.label} · ${language.name}`;
    if (code === currentLang) {
      option.classList.add("is-active");
      option.setAttribute("aria-current", "page");
    }
    menu.appendChild(option);
  }

  button.addEventListener("click", () => {
    const isOpen = container.dataset.open === "true";
    document.querySelectorAll(".custom-select[data-open='true']").forEach((entry) => closeCustomSelect(entry));
    document.querySelectorAll(".language-switch[data-open='true']").forEach((entry) => closeLanguageSwitch(entry));
    if (!isOpen) {
      container.dataset.open = "true";
      button.setAttribute("aria-expanded", "true");
    }
  });

  button.append(currentShort, currentName, icon);
  container.replaceChildren(button, menu);
}

document.addEventListener("click", (event) => {
  document.querySelectorAll(".custom-select[data-open='true']").forEach((wrapper) => {
    if (!wrapper.contains(event.target)) {
      closeCustomSelect(wrapper);
    }
  });

  document.querySelectorAll(".language-switch[data-open='true']").forEach((wrapper) => {
    if (!wrapper.contains(event.target)) {
      closeLanguageSwitch(wrapper);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".custom-select[data-open='true']").forEach((wrapper) => closeCustomSelect(wrapper));
    document.querySelectorAll(".language-switch[data-open='true']").forEach((wrapper) => closeLanguageSwitch(wrapper));
  }
});

function getPendingRequests() {
  try {
    return JSON.parse(localStorage.getItem(pendingStorageKey) || "[]");
  } catch {
    return [];
  }
}

function setPendingRequests(entries) {
  localStorage.setItem(pendingStorageKey, JSON.stringify(entries));
}

function refreshCustomSelects(root) {
  root.querySelectorAll("select[data-custom-select]").forEach((select) => {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register(buildSiteUrl("sw.js")).catch(() => {});
}

function setupRequestForm() {
  applySiteBranding();
  setupLanguageSwitch();

  const requestForm = document.querySelector("[data-request-form]");
  if (!requestForm) {
    enhanceCustomSelects(document);
    registerServiceWorker();
    return;
  }

  const backendChip = document.getElementById("backend-chip");
  const backendNote = document.getElementById("backend-note");
  const queueNote = document.getElementById("queue-note");
  const requestSubmit = document.getElementById("request-submit");
  const requestHint = document.getElementById("request-hint");
  const requestFeedback = document.getElementById("request-feedback");
  const state = { apiBaseUrl: "", backendReady: false };

  const setFeedback = (message, stateName = "") => {
    requestFeedback.dataset.state = stateName;
    requestFeedback.textContent = message || "";
  };

  const updateQueueNote = () => {
    const pending = getPendingRequests();
    queueNote.textContent = pending.length === 0
      ? t.queueEmpty
      : t.queuePending.replace("{count}", String(pending.length));
  };

  const setBackendState = ({ ready, note, hint }) => {
    backendChip.dataset.state = ready ? "ready" : (getPendingRequests().length > 0 ? "queued" : "offline");
    backendChip.textContent = ready ? t.backendReady : t.backendOffline;
    backendNote.textContent = note;
    requestHint.textContent = hint;
    requestSubmit.textContent = ready ? t.submitReady : t.submitOffline;
    state.backendReady = ready;
  };

  const normalizeOrigin = (value) => String(value || "").replace(/\/+$/, "");
  const localHealthUrl = buildSiteUrl("api/health");
  const publicConfigUrl = buildSiteUrl("public-config.json");

  const useOfflineMode = () => setBackendState({ ready: false, note: t.offlineNote, hint: t.offlineHint });
  const useReadyMode = () => setBackendState({ ready: true, note: t.readyNote, hint: t.readyHint });

  const checkHealth = async (url) => {
    try {
      const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  };

  const flushPending = async () => {
    if (!state.apiBaseUrl || !navigator.onLine) {
      return;
    }

    const remaining = [];
    for (const entry of getPendingRequests()) {
      try {
        const response = await fetch(`${normalizeOrigin(state.apiBaseUrl)}/api/inquiries`, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(entry)
        });
        if (!response.ok) {
          remaining.push(entry);
        }
      } catch {
        remaining.push(entry);
      }
    }

    setPendingRequests(remaining);
    updateQueueNote();
    if (remaining.length === 0 && state.backendReady) {
      setFeedback(t.submitTransferred, "success");
    }
  };

  const bootstrapRuntime = async () => {
    backendChip.textContent = t.backendChecking;
    updateQueueNote();

    const localHealth = await checkHealth(localHealthUrl);
    if (localHealth?.backend) {
      state.apiBaseUrl = siteBaseUrl.origin;
      useReadyMode();
      await flushPending();
      return;
    }

    const configResponse = await checkHealth(publicConfigUrl);
    state.apiBaseUrl = normalizeOrigin(configResponse?.apiBaseUrl || "");

    const remoteHealth = state.apiBaseUrl ? await checkHealth(`${state.apiBaseUrl}/api/health`) : null;
    if (remoteHealth?.backend) {
      useReadyMode();
      await flushPending();
      return;
    }

    useOfflineMode();
  };

  const collectPayload = () => Object.fromEntries(new FormData(requestForm).entries());

  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = collectPayload();
    if (payload.website) {
      setFeedback(t.validationBot, "error");
      return;
    }
    if (!payload.name || !payload.email || !payload.serviceType || !payload.message) {
      setFeedback(t.validationMissing, "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setFeedback(t.validationEmail, "error");
      return;
    }

    delete payload.website;
    requestSubmit.disabled = true;
    setFeedback(t.submitBusy);

    if (!state.apiBaseUrl || !navigator.onLine || !state.backendReady) {
      const pending = getPendingRequests();
      pending.push({ ...payload, queuedAt: new Date().toISOString() });
      setPendingRequests(pending);
      updateQueueNote();
      useOfflineMode();
      requestForm.reset();
      requestSubmit.disabled = false;
      refreshCustomSelects(requestForm);
      setFeedback(t.submitOfflineSaved, "warning");
      return;
    }

    try {
      const response = await fetch(`${normalizeOrigin(state.apiBaseUrl)}/api/inquiries`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      requestForm.reset();
      requestSubmit.disabled = false;
      refreshCustomSelects(requestForm);
      setFeedback(t.submitSuccess, "success");
      window.setTimeout(() => {
        window.location.href = successUrl;
      }, 700);
    } catch (error) {
      const pending = getPendingRequests();
      pending.push({ ...payload, queuedAt: new Date().toISOString() });
      setPendingRequests(pending);
      updateQueueNote();
      useOfflineMode();
      requestForm.reset();
      requestSubmit.disabled = false;
      refreshCustomSelects(requestForm);
      setFeedback(error.message || t.submitOfflineSaved, "warning");
    }
  });

  window.addEventListener("online", async () => {
    await bootstrapRuntime();
  });

  enhanceCustomSelects(requestForm);
  registerServiceWorker();
  bootstrapRuntime();
}

setupRequestForm();
