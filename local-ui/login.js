const loginForm = document.getElementById("login-form");
const feedback = document.getElementById("login-feedback");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.textContent = "Anmeldung wird geprueft...";

  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Anmeldung fehlgeschlagen.");
    }

    window.location.href = data.redirectTo || "/dashboard";
  } catch (error) {
    feedback.textContent = error.message;
  }
});
