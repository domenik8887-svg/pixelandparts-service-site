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
    button.type = "button";
    button.className = "custom-select-button";
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
      const current = select.options[select.selectedIndex];
      label.textContent = current ? current.textContent : "";
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

function setFeedback(message) {
  feedback.textContent = message || "";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function updateStats(stats) {
  statTotal.textContent = stats.total;
  statOpen.textContent = stats.open;
  statProgress.textContent = stats.progress;
  statDone.textContent = stats.done;
}

function createCard(inquiry) {
  const article = document.createElement("article");
  article.className = "inquiry-card";

  const head = document.createElement("div");
  head.className = "inquiry-head";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = `${inquiry.name} (#${inquiry.id})`;

  const meta = document.createElement("ul");
  meta.className = "meta-list";
  [inquiry.serviceType, inquiry.deviceType || "Gerät offen", inquiry.preferredContact, formatDate(inquiry.createdAt)].forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    meta.appendChild(item);
  });

  const tags = document.createElement("ul");
  tags.className = "tag-list";
  [inquiry.status, inquiry.email, inquiry.phone || "Keine Telefonnummer"].forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry;
    tags.appendChild(item);
  });

  titleWrap.append(title, meta);
  head.append(titleWrap, tags);

  const messageBox = document.createElement("div");
  messageBox.className = "message-box";
  messageBox.textContent = inquiry.message;

  const editor = document.createElement("form");
  editor.className = "editor-grid";

  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("data-custom-select", "");
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
  article.append(head, messageBox, editor);

  enhanceCustomSelects(article);

  editor.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFeedback(`Anfrage #${inquiry.id} wird gespeichert ...`);

    const response = await fetch(`/dashboard/api/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ status: statusSelect.value, notes: notes.value })
    });

    const data = await response.json();
    if (response.status === 401) {
      window.location.href = "/login";
      return;
    }

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

  return article;
}

function renderList() {
  const query = (searchInput.value || "").trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = inquiries.filter((inquiry) => {
    const matchesStatus = selectedStatus === "Alle" || inquiry.status === selectedStatus;
    const haystack = [inquiry.name, inquiry.email, inquiry.phone, inquiry.serviceType, inquiry.deviceType, inquiry.message, inquiry.notes].join(" ").toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });

  inquiryList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = query || selectedStatus !== "Alle"
      ? "Keine passenden Anfragen gefunden."
      : "Aktuell sind keine Anfragen gespeichert. Neue Website-Anfragen erscheinen hier automatisch.";
    inquiryList.appendChild(empty);
    return;
  }

  filtered.forEach((inquiry) => inquiryList.appendChild(createCard(inquiry)));
}

async function loadDashboard() {
  try {
    setFeedback("Anfragen werden geladen ...");
    const response = await fetch("/dashboard/api/inquiries", {
      headers: { Accept: "application/json" }
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
}

logoutButton?.addEventListener("click", async () => {
  await fetch("/auth/logout", {
    method: "POST",
    headers: { Accept: "application/json" }
  });
  window.location.href = "/login";
});

statusFilter?.setAttribute("data-custom-select", "");
enhanceCustomSelects(document);
searchInput?.addEventListener("input", renderList);
statusFilter?.addEventListener("change", renderList);
loadDashboard();
