const backendChip = document.getElementById("backend-chip");
const backendNote = document.getElementById("backend-note");
const requestForm = document.getElementById("request-form");
const requestSubmit = document.getElementById("request-submit");
const requestHint = document.getElementById("request-hint");

const setOfflineMode = () => {
  if (!requestForm || !requestSubmit || !backendChip || !backendNote || !requestHint) {
    return;
  }

  requestForm.dataset.disabled = "true";
  backendChip.dataset.state = "offline";
  backendChip.textContent = "Nur Website aktiv";
  backendNote.textContent = "Die kostenlose GitHub-Pages-Version ist online, aber das lokale Anfrage-Backend ist gerade nicht erreichbar. Nutze aktuell bitte E-Mail oder Telefon.";
  requestHint.textContent = "Zum Speichern in der lokalen Datenbank muss der Pixel&Parts-Server laufen.";

  for (const element of requestForm.elements) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    if (element.tagName === "BUTTON") {
      element.toggleAttribute("disabled", true);
      continue;
    }

    element.toggleAttribute("disabled", true);
  }
};

const setOnlineMode = () => {
  if (!requestForm || !requestSubmit || !backendChip || !backendNote || !requestHint) {
    return;
  }

  requestForm.dataset.disabled = "false";
  backendChip.dataset.state = "ready";
  backendChip.textContent = "Lokale Anfrageannahme aktiv";
  backendNote.textContent = "Neue Anfragen werden direkt in der lokalen SQLite-Datenbank gespeichert und koennen anschliessend im Dashboard geoeffnet werden.";
  requestHint.textContent = "Die Anfrage wird direkt lokal gespeichert und danach auf die Bestaetigungsseite weitergeleitet.";

  for (const element of requestForm.elements) {
    if (!(element instanceof HTMLElement)) {
      continue;
    }

    element.toggleAttribute("disabled", false);
  }
};

const checkBackend = async () => {
  if (!requestForm) {
    return;
  }

  try {
    const response = await fetch("./api/health", {
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Backend nicht erreichbar");
    }

    const payload = await response.json();

    if (payload.backend === true) {
      setOnlineMode();
      return;
    }

    setOfflineMode();
  } catch {
    setOfflineMode();
  }
};

checkBackend();
