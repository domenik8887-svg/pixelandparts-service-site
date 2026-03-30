const backendChip = document.getElementById("backend-chip");
const backendNote = document.getElementById("backend-note");
const queueNote = document.getElementById("queue-note");
const dashboardLink = document.getElementById("dashboard-link");
const requestForm = document.getElementById("request-form");
const requestSubmit = document.getElementById("request-submit");
const requestHint = document.getElementById("request-hint");
const requestFeedback = document.getElementById("request-feedback");

const PENDING_STORAGE_KEY = "pixelparts-pending-requests";

const state = {
  apiBaseUrl: "",
  dashboardUrl: "",
  sameOriginBackend: false,
  backendReady: false
};

const getPendingRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const setPendingRequests = (entries) => {
  localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(entries));
};

const updateQueueNote = () => {
  if (!queueNote) {
    return;
  }

  const pending = getPendingRequests();
  if (pending.length === 0) {
    queueNote.textContent = "Noch keine offline zwischengespeicherten Anfragen auf diesem Geraet.";
    return;
  }

  queueNote.textContent = `${pending.length} Anfrage(n) warten lokal auf diesem Geraet und werden automatisch nachgesendet, sobald das Backend wieder erreichbar ist.`;
};

const setFeedback = (message, stateName = "") => {
  if (!requestFeedback) {
    return;
  }

  requestFeedback.dataset.state = stateName;
  requestFeedback.textContent = message || "";
};

const setBackendState = ({ chip, note, hint, ready }) => {
  if (!backendChip || !backendNote || !requestHint || !requestSubmit) {
    return;
  }

  backendChip.dataset.state = chip;
  backendChip.textContent = ready ? "Direkte Speicherung aktiv" : "Offline-Puffer aktiv";
  backendNote.textContent = note;
  requestHint.textContent = hint;
  requestSubmit.textContent = ready ? "Anfrage direkt senden" : "Anfrage offline sichern";
};

const updateDashboardLink = () => {
  if (!dashboardLink) {
    return;
  }

  if (!state.dashboardUrl) {
    dashboardLink.classList.add("is-hidden");
    dashboardLink.removeAttribute("href");
    return;
  }

  dashboardLink.href = state.dashboardUrl;
  dashboardLink.classList.remove("is-hidden");
};

const useReadyMode = () => {
  state.backendReady = true;
  setBackendState({
    chip: "ready",
    ready: true,
    note: "Die GitHub-Page kann jetzt direkt an dein oeffentlich erreichbares Anfrage-Backend senden. Jede neue Anfrage landet sofort in der lokalen SQLite-Datenbank.",
    hint: "Neue Anfragen werden sofort an dein Anfrage-Backend gesendet und direkt in SQLite gespeichert."
  });
};

const useOfflineMode = () => {
  state.backendReady = false;
  setBackendState({
    chip: getPendingRequests().length > 0 ? "queued" : "offline",
    ready: false,
    note: "Das Anfrage-Backend ist gerade nicht erreichbar. Neue Anfragen werden auf diesem Geraet offline gepuffert und automatisch an dein lokales SQLite-Backend nachgeliefert, sobald es wieder online ist.",
    hint: "Ohne erreichbares Backend wird die Anfrage lokal im Browser gespeichert und spaeter automatisch an dein SQLite-System gesendet."
  });
};

const normalizeOrigin = (value) => String(value || "").replace(/\/+$/, "");

const isLocalBackendOrigin = async () => {
  try {
    const response = await fetch("./api/health", {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return payload.backend === true;
  } catch {
    return false;
  }
};

const loadPublicConfig = async () => {
  try {
    const response = await fetch(`./public-config.json?ts=${Date.now()}`, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return {};
    }

    return await response.json();
  } catch {
    return {};
  }
};

const probeBackend = async (baseUrl) => {
  if (!baseUrl) {
    return false;
  }

  try {
    const response = await fetch(`${normalizeOrigin(baseUrl)}/api/health`, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    return payload.backend === true;
  } catch {
    return false;
  }
};

const queueInquiry = (payload) => {
  const pending = getPendingRequests();
  pending.push({
    ...payload,
    queuedAt: new Date().toISOString()
  });
  setPendingRequests(pending);
  updateQueueNote();
  useOfflineMode();
};

const flushPendingRequests = async () => {
  if (!state.apiBaseUrl || !navigator.onLine) {
    return;
  }

  const pending = getPendingRequests();
  if (pending.length === 0) {
    return;
  }

  const remaining = [];

  for (const entry of pending) {
    try {
      const response = await fetch(`${normalizeOrigin(state.apiBaseUrl)}/api/inquiries`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
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
    setFeedback("Alle zwischengespeicherten Anfragen wurden erfolgreich an dein SQLite-Backend uebertragen.", "success");
  } else if (remaining.length > 0) {
    useOfflineMode();
  }
};

const loadRuntime = async () => {
  if (!requestForm) {
    return;
  }

  updateQueueNote();

  const sameOriginBackend = await isLocalBackendOrigin();
  if (sameOriginBackend) {
    state.sameOriginBackend = true;
    state.apiBaseUrl = window.location.origin;
    state.dashboardUrl = `${window.location.origin}/login`;
    updateDashboardLink();
    useReadyMode();
    await flushPendingRequests();
    return;
  }

  const publicConfig = await loadPublicConfig();
  state.apiBaseUrl = normalizeOrigin(publicConfig.apiBaseUrl || "");
  state.dashboardUrl = publicConfig.dashboardUrl || "";
  updateDashboardLink();

  if (await probeBackend(state.apiBaseUrl)) {
    useReadyMode();
    await flushPendingRequests();
    return;
  }

  useOfflineMode();
};

const collectPayload = () => {
  const formData = new FormData(requestForm);
  return Object.fromEntries(formData.entries());
};

const validateForm = () => {
  if (!requestForm.checkValidity()) {
    requestForm.reportValidity();
    return false;
  }

  const payload = collectPayload();
  if (payload.website) {
    setFeedback("Anfrage konnte nicht verarbeitet werden.", "error");
    return false;
  }

  return true;
};

const sendInquiry = async (payload) => {
  const response = await fetch(`${normalizeOrigin(state.apiBaseUrl)}/api/inquiries`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Anfrage konnte nicht gesendet werden.");
  }

  return response.json();
};

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const payload = collectPayload();
  delete payload.website;

  requestSubmit.disabled = true;
  setFeedback("Anfrage wird verarbeitet...", "");

  if (!state.apiBaseUrl || !navigator.onLine || !state.backendReady) {
    queueInquiry(payload);
    setFeedback("Das Backend ist gerade nicht erreichbar. Die Anfrage wurde offline auf diesem Geraet gesichert und wird spaeter automatisch in SQLite uebertragen.", "warning");
    requestForm.reset();
    requestSubmit.disabled = false;
    return;
  }

  try {
    await sendInquiry(payload);
    setFeedback("Anfrage erfolgreich gespeichert. Du wirst jetzt zur Bestaetigungsseite weitergeleitet.", "success");
    requestForm.reset();
    setTimeout(() => {
      window.location.href = "./anfrage-erfolgreich.html";
    }, 700);
  } catch (error) {
    queueInquiry(payload);
    setFeedback(`${error.message} Die Anfrage wurde deshalb offline auf diesem Geraet zwischengespeichert.`, "warning");
    requestForm.reset();
  } finally {
    requestSubmit.disabled = false;
  }
};

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch {
    // Service worker is optional; ignore registration failures.
  }
};

requestForm?.addEventListener("submit", handleSubmit);

window.addEventListener("online", async () => {
  await loadRuntime();
  await flushPendingRequests();
});

document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "visible") {
    await loadRuntime();
  }
});

registerServiceWorker();
loadRuntime();
