const inquiryList = document.getElementById("inquiry-list");
const feedback = document.getElementById("dashboard-feedback");
const logoutButton = document.getElementById("logout-button");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

const statTotal = document.getElementById("stat-total");
const statOpen = document.getElementById("stat-open");
const statProgress = document.getElementById("stat-progress");
const statDone = document.getElementById("stat-done");

let inquiries = [];

const setFeedback = (message) => {
  feedback.textContent = message || "";
};

const formatDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
};

const updateStats = (stats) => {
  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statProgress.textContent = stats.progress;
  statDone.textContent = stats.done;
};

const createCard = (inquiry) => {
  const article = document.createElement("article");
  article.className = "inquiry-card";

  const head = document.createElement("div");
  head.className = "inquiry-head";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = `${inquiry.name} (#${inquiry.id})`;

  const meta = document.createElement("ul");
  meta.className = "meta-list";
  [
    inquiry.serviceType,
    inquiry.deviceType || "Gerät offen",
    inquiry.preferredContact,
    formatDate(inquiry.createdAt)
  ].forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    meta.appendChild(item);
  });

  titleWrap.append(title, meta);

  const tags = document.createElement("ul");
  tags.className = "tag-list";
  [inquiry.status, inquiry.email, inquiry.phone || "Keine Telefonnummer"].forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    tags.appendChild(item);
  });

  head.append(titleWrap, tags);

  const messageBox = document.createElement("div");
  messageBox.className = "message-box";
  messageBox.textContent = inquiry.message;

  const editor = document.createElement("form");
  editor.className = "editor-grid";

  const statusSelect = document.createElement("select");
  ["Neu", "In Bearbeitung", "Erledigt"].forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    option.selected = inquiry.status === status;
    statusSelect.appendChild(option);
  });

  const notes = document.createElement("textarea");
  notes.value = inquiry.notes || "";
  notes.placeholder = "Notizen für Rückruf, Angebot oder nächsten Schritt";

  const saveButton = document.createElement("button");
  saveButton.className = "save-button";
  saveButton.type = "submit";
  saveButton.textContent = "Speichern";

  editor.append(statusSelect, notes, saveButton);

  editor.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(`Anfrage #${inquiry.id} wird gespeichert ...`);

    const response = await fetch(`/dashboard/api/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        status: statusSelect.value,
        notes: notes.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setFeedback(data.error || "Speichern fehlgeschlagen.");
      return;
    }

    const updated = data.inquiry;
    const index = inquiries.findIndex((entry) => entry.id === updated.id);
    if (index >= 0) {
      inquiries[index] = updated;
    }

    updateStats(data.stats);
    renderList();
    setFeedback(`Anfrage #${inquiry.id} wurde gespeichert.`);
  });

  article.append(head, messageBox, editor);
  return article;
};

const renderList = () => {
  const query = (searchInput.value || "").trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = inquiries.filter((inquiry) => {
    const matchesStatus = selectedStatus === "Alle" || inquiry.status === selectedStatus;
    const haystack = [
      inquiry.name,
      inquiry.email,
      inquiry.phone,
      inquiry.serviceType,
      inquiry.deviceType,
      inquiry.message,
      inquiry.notes
    ].join(" ").toLowerCase();

    const matchesSearch = !query || haystack.includes(query);
    return matchesStatus && matchesSearch;
  });

  inquiryList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const hasFilters = Boolean(query) || selectedStatus !== "Alle";
    empty.textContent = hasFilters
      ? "Keine passenden Anfragen gefunden."
      : "Aktuell sind keine Anfragen gespeichert. Neue Website-Anfragen erscheinen hier automatisch.";
    inquiryList.appendChild(empty);
    return;
  }

  filtered.forEach((inquiry) => {
    inquiryList.appendChild(createCard(inquiry));
  });
};

const loadDashboard = async () => {
  try {
    setFeedback("Anfragen werden geladen ...");
    const response = await fetch("/dashboard/api/inquiries", {
      headers: {
        Accept: "application/json"
      }
    });

    const data = await response.json();

    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "Anfragen konnten nicht geladen werden.");
    }

    inquiries = data.inquiries;
    updateStats(data.stats);
    renderList();
    setFeedback(`${inquiries.length} Anfragen geladen.`);
  } catch (error) {
    setFeedback(error.message);
  }
};

logoutButton?.addEventListener("click", async () => {
  await fetch("/auth/logout", {
    method: "POST",
    headers: {
      Accept: "application/json"
    }
  });

  window.location.href = "/login";
});

searchInput?.addEventListener("input", renderList);
statusFilter?.addEventListener("change", renderList);

loadDashboard();
