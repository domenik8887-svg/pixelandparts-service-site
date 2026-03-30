const siteRoot = document.body.dataset.siteRoot || ".";
const currentLang = (document.documentElement.lang || "de").startsWith("en") ? "en" : "de";
const successUrl = document.body.dataset.successUrl || "./anfrage-erfolgreich.html";

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
  }
};

const t = translations[currentLang];
const pendingStorageKey = "pixelparts-pending-requests";

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

function closeCustomSelect(wrapper) {
  wrapper.dataset.open = "false";
  const button = wrapper.querySelector(".custom-select-button");
  if (button) {
    button.setAttribute("aria-expanded", "false");
  }
}

document.addEventListener("click", (event) => {
  document.querySelectorAll(".custom-select[data-open='true']").forEach((wrapper) => {
    if (!wrapper.contains(event.target)) {
      closeCustomSelect(wrapper);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".custom-select[data-open='true']").forEach((wrapper) => closeCustomSelect(wrapper));
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

  const serviceWorkerUrl = new URL(`${siteRoot}/sw.js`, window.location.href);
  navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
}

function setupRequestForm() {
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
  const localHealthUrl = new URL(`${siteRoot}/api/health`, window.location.href).toString();
  const publicConfigUrl = new URL(`${siteRoot}/public-config.json`, window.location.href).toString();

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
      state.apiBaseUrl = new URL(siteRoot, window.location.href).origin;
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
