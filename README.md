# Pixel&Parts

Website fuer PC- und Laptop-Reparaturen, Upgrades, Updates, Datenrettung und Beratung.

## Lokal starten

1. `npm install`
2. `npm start`
3. Website: `http://localhost:8080`
4. Dashboard Login: `http://localhost:8080/login`

Beim ersten Start werden die lokalen Zugangsdaten in `data/runtime-config.json` erzeugt.

## Vom Handy abrufen

Wenn der Server laeuft, ist das Dashboard auch ueber die lokale IP des PCs erreichbar, zum Beispiel:

- `http://192.168.x.x:8080/login`

Das Handy muss dafuer im gleichen WLAN sein.

## Kostenloses Hosting

Die oeffentliche Website wird ueber GitHub Pages aus dem Ordner `site/` deployed.
Der lokale Server und die Datenbank werden dabei nicht veroeffentlicht.
