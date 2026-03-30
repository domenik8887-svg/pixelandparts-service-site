const express = require("express");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const rootDir = __dirname;
const siteDir = path.join(rootDir, "site");
const localUiDir = path.join(rootDir, "local-ui");
const dataDir = path.join(rootDir, "data");
const configPath = path.join(dataDir, "runtime-config.json");
const dbPath = path.join(dataDir, "pixelandparts.sqlite");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 8080);
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;
const allowedStatuses = new Set(["Neu", "In Bearbeitung", "Erledigt"]);
const sessions = new Map();

fs.mkdirSync(dataDir, { recursive: true });

const runtimeConfig = loadOrCreateRuntimeConfig();
const db = new DatabaseSync(dbPath);

initializeDatabase();

const app = express();
app.disable("x-powered-by");

app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));
app.use(securityHeaders);
app.use(cleanExpiredSessions);
app.use("/api/inquiries", createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 20 }));
app.use("/auth/login", createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 12 }));
app.use("/local-ui", express.static(localUiDir));

app.get("/api/health", (_req, res) => {
  res.json({
    backend: true,
    storage: "sqlite",
    dashboardPath: "/dashboard"
  });
});

app.get("/login", (req, res) => {
  if (getSession(req)) {
    res.redirect("/dashboard");
    return;
  }

  res.sendFile(path.join(localUiDir, "login.html"));
});

app.post("/auth/login", (req, res) => {
  const username = normalizeText(req.body.username, 80);
  const password = normalizeText(req.body.password, 200);

  if (
    username !== runtimeConfig.adminUsername ||
    !safeCompare(password, runtimeConfig.adminPassword)
  ) {
    res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    username,
    expiresAt: Date.now() + sessionTtlMs
  });

  setSessionCookie(res, token);
  res.json({ ok: true, redirectTo: "/dashboard" });
});

app.post("/auth/logout", (req, res) => {
  const token = getSessionToken(req);
  if (token) {
    sessions.delete(token);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/auth/status", (req, res) => {
  const session = getSession(req);
  res.json({
    authenticated: Boolean(session),
    username: session ? session.username : null
  });
});

app.get("/dashboard", (req, res) => {
  if (!getSession(req)) {
    res.redirect("/login");
    return;
  }

  res.sendFile(path.join(localUiDir, "dashboard.html"));
});

app.get("/dashboard/api/inquiries", requireAuth, (_req, res) => {
  res.json({
    inquiries: listInquiries(),
    stats: getStats()
  });
});

app.patch("/dashboard/api/inquiries/:id", requireAuth, (req, res) => {
  const inquiryId = Number(req.params.id);
  const status = normalizeText(req.body.status, 40);
  const notes = normalizeText(req.body.notes, 3000);

  if (!Number.isInteger(inquiryId) || inquiryId < 1) {
    res.status(400).json({ error: "Ungueltige Anfrage-ID." });
    return;
  }

  if (!allowedStatuses.has(status)) {
    res.status(400).json({ error: "Ungueltiger Status." });
    return;
  }

  const statement = db.prepare(`
    UPDATE inquiries
    SET status = ?, notes = ?, updated_at = ?
    WHERE id = ?
  `);

  const result = statement.run(status, notes, new Date().toISOString(), inquiryId);

  if (result.changes === 0) {
    res.status(404).json({ error: "Anfrage nicht gefunden." });
    return;
  }

  res.json({
    ok: true,
    inquiry: getInquiry(inquiryId),
    stats: getStats()
  });
});

app.get("/dashboard/api/export.csv", requireAuth, (_req, res) => {
  const inquiries = listInquiries();
  const lines = [
    [
      "ID",
      "Erstellt",
      "Status",
      "Name",
      "E-Mail",
      "Telefon",
      "Leistung",
      "Geraet",
      "Kontaktweg",
      "Quelle",
      "Nachricht",
      "Notizen"
    ].join(";")
  ];

  for (const inquiry of inquiries) {
    lines.push([
      inquiry.id,
      escapeCsv(inquiry.createdAt),
      escapeCsv(inquiry.status),
      escapeCsv(inquiry.name),
      escapeCsv(inquiry.email),
      escapeCsv(inquiry.phone),
      escapeCsv(inquiry.serviceType),
      escapeCsv(inquiry.deviceType),
      escapeCsv(inquiry.preferredContact),
      escapeCsv(inquiry.source),
      escapeCsv(inquiry.message),
      escapeCsv(inquiry.notes)
    ].join(";"));
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=\"pixelandparts-anfragen.csv\"");
  res.send(lines.join("\n"));
});

app.post("/api/inquiries", (req, res) => {
  const inquiry = {
    name: normalizeText(req.body.name, 120),
    email: normalizeText(req.body.email, 160),
    phone: normalizeText(req.body.phone, 80),
    serviceType: normalizeText(req.body.serviceType, 80),
    deviceType: normalizeText(req.body.deviceType, 160),
    preferredContact: normalizeText(req.body.preferredContact, 40) || "E-Mail",
    message: normalizeText(req.body.message, 3000),
    source: normalizeText(req.body.source, 40) || "website"
  };

  const validationError = validateInquiry(inquiry);
  if (validationError) {
    res.status(400).send(validationError);
    return;
  }

  const now = new Date().toISOString();
  const statement = db.prepare(`
    INSERT INTO inquiries (
      name,
      email,
      phone,
      service_type,
      device_type,
      preferred_contact,
      message,
      source,
      status,
      notes,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Neu', '', ?, ?)
  `);

  const result = statement.run(
    inquiry.name,
    inquiry.email,
    inquiry.phone,
    inquiry.serviceType,
    inquiry.deviceType,
    inquiry.preferredContact,
    inquiry.message,
    inquiry.source,
    now,
    now
  );

  if (wantsJson(req)) {
    res.status(201).json({
      ok: true,
      inquiry: getInquiry(Number(result.lastInsertRowid))
    });
    return;
  }

  res.redirect(303, "/anfrage-erfolgreich.html");
});

app.use(express.static(siteDir));

app.use((_req, res) => {
  res.status(404).send("Nicht gefunden.");
});

app.listen(port, host, () => {
  const urls = collectUrls(port);

  console.log("Pixel&Parts Server gestartet.");
  console.log(`Dashboard Login: ${runtimeConfig.adminUsername}`);
  console.log(`Dashboard Passwort: ${runtimeConfig.adminPassword}`);
  console.log("Erreichbar unter:");
  for (const url of urls) {
    console.log(`- ${url}`);
  }
});

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      service_type TEXT NOT NULL,
      device_type TEXT NOT NULL DEFAULT '',
      preferred_contact TEXT NOT NULL DEFAULT 'E-Mail',
      message TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'website',
      status TEXT NOT NULL DEFAULT 'Neu',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_inquiries_created_at
      ON inquiries (created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_inquiries_status
      ON inquiries (status);
  `);
}

function loadOrCreateRuntimeConfig() {
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  const generated = {
    adminUsername: "admin",
    adminPassword: generateSecret(18),
    sessionSecret: generateSecret(32)
  };

  fs.writeFileSync(configPath, JSON.stringify(generated, null, 2), "utf8");
  return generated;
}

function generateSecret(length) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

function securityHeaders(_req, res, next) {
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; font-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  next();
}

function createRateLimiter({ windowMs, limit }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = hits.get(key) || [];
    const freshHits = current.filter((timestamp) => now - timestamp < windowMs);

    freshHits.push(now);
    hits.set(key, freshHits);

    if (freshHits.length > limit) {
      res.status(429).send("Zu viele Versuche. Bitte spaeter noch einmal probieren.");
      return;
    }

    next();
  };
}

function cleanExpiredSessions(_req, _res, next) {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
  next();
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((all, entry) => {
      const index = entry.indexOf("=");
      if (index < 1) {
        return all;
      }

      const key = entry.slice(0, index);
      const value = entry.slice(index + 1);
      all[key] = decodeURIComponent(value);
      return all;
    }, {});
}

function getSessionToken(req) {
  return parseCookies(req.headers.cookie).pp_session || null;
}

function getSession(req) {
  const token = getSessionToken(req);
  if (!token) {
    return null;
  }

  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function requireAuth(req, res, next) {
  if (!getSession(req)) {
    res.status(401).json({ error: "Nicht angemeldet." });
    return;
  }

  next();
}

function setSessionCookie(res, token) {
  const cookie = [
    `pp_session=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(sessionTtlMs / 1000)}`
  ];

  res.setHeader("Set-Cookie", cookie.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "pp_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function normalizeText(value, maxLength) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function validateInquiry(inquiry) {
  if (!inquiry.name || !inquiry.email || !inquiry.serviceType || !inquiry.message) {
    return "Bitte Name, E-Mail, Leistung und Beschreibung ausfuellen.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    return "Bitte eine gueltige E-Mail-Adresse angeben.";
  }

  return null;
}

function listInquiries() {
  const statement = db.prepare(`
    SELECT
      id,
      name,
      email,
      phone,
      service_type,
      device_type,
      preferred_contact,
      message,
      source,
      status,
      notes,
      created_at,
      updated_at
    FROM inquiries
    ORDER BY created_at DESC
  `);

  return statement.all().map(mapInquiry);
}

function getInquiry(id) {
  const statement = db.prepare(`
    SELECT
      id,
      name,
      email,
      phone,
      service_type,
      device_type,
      preferred_contact,
      message,
      source,
      status,
      notes,
      created_at,
      updated_at
    FROM inquiries
    WHERE id = ?
  `);

  const row = statement.get(id);
  return row ? mapInquiry(row) : null;
}

function mapInquiry(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    serviceType: row.service_type,
    deviceType: row.device_type,
    preferredContact: row.preferred_contact,
    message: row.message,
    source: row.source,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getStats() {
  const total = db.prepare("SELECT COUNT(*) AS count FROM inquiries").get().count;
  const open = db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'Neu'").get().count;
  const progress = db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'In Bearbeitung'").get().count;
  const done = db.prepare("SELECT COUNT(*) AS count FROM inquiries WHERE status = 'Erledigt'").get().count;

  return { total, open, progress, done };
}

function wantsJson(req) {
  const acceptHeader = req.headers.accept || "";
  const contentType = req.headers["content-type"] || "";
  return acceptHeader.includes("application/json") || contentType.includes("application/json");
}

function escapeCsv(value) {
  return `"${String(value || "").replace(/"/g, "\"\"")}"`;
}

function collectUrls(currentPort) {
  const networkUrls = [`http://localhost:${currentPort}`];
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        networkUrls.push(`http://${address.address}:${currentPort}`);
      }
    }
  }

  return [...new Set(networkUrls)];
}
