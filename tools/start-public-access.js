const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const siteConfigPath = path.join(rootDir, "site", "public-config.json");
const runtimeConfigPath = path.join(rootDir, "data", "runtime-config.json");
const localServerUrl = "http://127.0.0.1:8080";
const publicSiteUrl = "https://domenik8887-svg.github.io/pixelandparts-service-site";
const publicSiteOrigin = "https://domenik8887-svg.github.io";

let serverProcess = null;
let tunnelProcess = null;
let cloudflaredPath = null;

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

async function main() {
  cloudflaredPath = resolveCloudflaredPath();

  if (!(await isHealthy(`${localServerUrl}/api/health`))) {
    startLocalServer();
    await waitForHealthy(`${localServerUrl}/api/health`, 30000);
  } else {
    console.log("Lokaler Pixel&Parts-Server läuft bereits.");
  }

  const publicUrl = await startCloudflareTunnel();
  const dashboardUrl = `${publicUrl}/login`;
  const updatedAt = new Date().toISOString();

  writeRuntimeConfig({
    publicSiteUrl,
    publicSiteOrigin,
    publicApiUrl: publicUrl,
    publicDashboardUrl: dashboardUrl,
    publicTunnelProvider: "cloudflare-quick-tunnel",
    publicUpdatedAt: updatedAt
  });

  const changed = writePublicSiteConfig({
    siteUrl: publicSiteUrl,
    siteOrigin: publicSiteOrigin,
    apiBaseUrl: publicUrl,
    dashboardUrl,
    status: "online",
    updatedAt
  });

  if (changed) {
    await publishConfigChange();
  } else {
    console.log("Die GitHub-Page-Konfiguration war bereits aktuell.");
  }

  console.log(`Öffentliche API: ${publicUrl}`);
  console.log(`Öffentliches Dashboard: ${dashboardUrl}`);
  console.log("Die GitHub-Page nutzt jetzt diese API-Adresse. Falls GitHub Pages noch cached, kurz neu laden.");
  console.log("Der Tunnel bleibt offen, solange dieses Fenster läuft.");

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

function resolveCloudflaredPath() {
  try {
    const output = execFileSync("where.exe", ["cloudflared"], {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8"
    }).trim();

    if (output) {
      return output.split(/\r?\n/)[0];
    }
  } catch {
    const candidate = path.join(
      process.env.LOCALAPPDATA || "",
      "Microsoft",
      "WinGet",
      "Packages",
      "Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe",
      "cloudflared.exe"
    );

    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("'cloudflared' ist nicht installiert oder nicht auffindbar.");
}

function startLocalServer() {
  console.log("Lokaler Server wird gestartet ...");
  serverProcess = spawn(process.execPath, ["server.js"], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (chunk) => {
    process.stdout.write(`[server] ${chunk}`);
  });

  serverProcess.stderr.on("data", (chunk) => {
    process.stderr.write(`[server] ${chunk}`);
  });

  serverProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Lokaler Server wurde mit Code ${code} beendet.`);
    }
  });
}

async function startCloudflareTunnel() {
  console.log("Cloudflare Quick Tunnel wird aufgebaut ...");
  tunnelProcess = spawn(cloudflaredPath, ["tunnel", "--url", localServerUrl, "--no-autoupdate"], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"]
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Es konnte keine öffentliche Tunnel-URL ermittelt werden."));
    }, 60000);

    const handleChunk = (chunk) => {
      const text = chunk.toString();
      process.stdout.write(`[cloudflared] ${text}`);
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/iu);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
    };

    tunnelProcess.stdout.on("data", handleChunk);
    tunnelProcess.stderr.on("data", handleChunk);

    tunnelProcess.on("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`cloudflared wurde mit Code ${code} beendet.`));
      }
    });
  });
}

function writeRuntimeConfig(patch) {
  const current = fs.existsSync(runtimeConfigPath)
    ? JSON.parse(fs.readFileSync(runtimeConfigPath, "utf8"))
    : {};
  const next = { ...current, ...patch };
  fs.writeFileSync(runtimeConfigPath, JSON.stringify(next, null, 2), "utf8");
}

function writePublicSiteConfig(payload) {
  const previous = fs.existsSync(siteConfigPath)
    ? JSON.parse(fs.readFileSync(siteConfigPath, "utf8"))
    : {};

  const changed = JSON.stringify(previous) !== JSON.stringify(payload);
  fs.writeFileSync(siteConfigPath, JSON.stringify(payload, null, 2), "utf8");
  return changed;
}

async function publishConfigChange() {
  if (!isGitRepository()) {
    console.log("Kein Git-Repository gefunden. public-config.json wurde nur lokal aktualisiert.");
    return;
  }

  try {
    execFileSync("git", ["add", "site/public-config.json"], { cwd: rootDir, stdio: "ignore" });

    try {
      execFileSync("git", ["commit", "-m", "Update public API endpoint"], {
        cwd: rootDir,
        stdio: "ignore"
      });
    } catch {
      console.log("Keine neue Git-Änderung für public-config.json zu committen.");
      return;
    }

    execFileSync("git", ["push"], { cwd: rootDir, stdio: "ignore" });
    console.log("Die neue öffentliche API-Adresse wurde zu GitHub gepusht.");
  } catch (error) {
    console.log(`Die GitHub-Page-Konfiguration wurde lokal aktualisiert, konnte aber nicht automatisch gepusht werden: ${error.message}`);
  }
}

function isGitRepository() {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { cwd: rootDir, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function isHealthy(url) {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForHealthy(url, timeoutMs) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    if (await isHealthy(url)) {
      return;
    }

    await delay(1000);
  }

  throw new Error("Der lokale Server wurde nicht rechtzeitig erreichbar.");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown() {
  if (tunnelProcess && !tunnelProcess.killed) {
    tunnelProcess.kill();
  }

  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }

  process.exit(0);
}
