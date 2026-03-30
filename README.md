# Pixel&Parts

Website für PC- und Laptop-Reparaturen, Upgrades, Updates, Datenrettung und Beratung.

## Lokal starten

1. `npm install`
2. `npm start`
3. Website: `http://localhost:8080`
4. Dashboard Login: `http://localhost:8080/login`

Beim ersten Start werden die lokalen Zugangsdaten in `data/runtime-config.json` erzeugt.

## Öffentlich erreichbar machen

1. `npm run public`
2. Das Script startet bei Bedarf den lokalen Server.
3. Danach wird ein Cloudflare Quick Tunnel erzeugt.
4. Die aktuelle öffentliche API-Adresse wird nach `site/public-config.json` geschrieben und automatisch zu GitHub gepusht.

Danach kann die GitHub-Page direkte Anfragen an dein lokales SQLite-Backend senden, und das Dashboard ist über die ausgegebene öffentliche URL auch vom Handy außerhalb des eigenen Netzwerks erreichbar.

## Vom Handy abrufen

Wenn der Server läuft, ist das Dashboard auch über die lokale IP des PCs erreichbar, zum Beispiel:

- `http://192.168.x.x:8080/login`

Das Handy muss dafür im gleichen WLAN sein.

Wenn `npm run public` aktiv ist, funktioniert der Zugriff auch außerhalb des gleichen Netzwerks über die öffentliche Tunnel-Adresse.

## Kostenloses Hosting

Die öffentliche Website wird über GitHub Pages aus dem Ordner `site/` deployed.
Der lokale Server und die Datenbank werden dabei nicht veröffentlicht.
