# Privater Spielserver

Spiel: **https://hermes.tailee79a6.ts.net:9444/?mobile=1**

Der Link ist nur über Tailscale erreichbar, nicht öffentlich. Auf dem iPhone Tailscale einschalten und in Safari öffnen. Die Health-App behält Port 9443; deren Dienst, Datenbank und Zugangsdaten wurden nicht verändert.

## Einloggen und den Mac-Spielstand laden

1. „Konto & Inseln“ öffnen und mit dem separat eingerichteten Spielkonto anmelden.
2. Bei „Seenland · vom Mac übertragen“ auf „Insel laden“ tippen.
3. Im Querformat spielen. Vor Gerätewechsel im Pausenmenü → Konto & Inseln → Jetzt synchronisieren.

Der Originalexport von localhost:4176 wurde unverändert importiert: Seenland, Seed 541847447, sieben Gebäude, zehn Siedler, etwa 281 Sekunden Spielzeit. Lokale Quelle: `~/Downloads/new-shores-spielstand.json`. Auf dem Server liegt zusätzlich eine rootgeschützte Kopie unter `/opt/new-shores/backups/mac-original.json`. Das ursprüngliche Chrome-Spiel wurde pausiert, nicht überschrieben.

Keine Google-/Clerk-Verbindung und keine Wiederverwendung von OMS-Credentials. Die E-Mail ist die Kennung eines eigenen Spielkontos. Das angegebene Passwort wurde nur per SSH-Standardeingabe importiert; gespeichert wird ausschließlich ein individuell gesalzener scrypt-Hash. Noch keine E-Mail-Verifizierung, Passwort-zurücksetzen-Mail oder Kontolöschung in der Oberfläche.

## Synchronisierung und Freigaben

- Eine explizit geladene/hochgeladene Serverinsel wird online alle 30 Sekunden synchronisiert. „Jetzt synchronisieren“ zeigt bestätigten Erfolg. Nur lokale Spiele bleiben lokal.
- Offline funktionieren bereits geladene Spiele nach „Offline bereit“ weiter. Erste Anmeldung, andere Serverinsel laden und Synchronisieren benötigen Netzwerk. Safari kann Website-Daten löschen; unabhängige Exporte sind weiter sinnvoll.
- Ein älterer Versionsstand darf den Server nicht überschreiben. Konflikte stoppen die Synchronisierung; man kann den Serverstand laden oder die lokale Fassung als neue Insel sichern. Es gibt keine automatische Zusammenführung.
- Vor Server-Inselwechsel wird eine lokale Sicherung angelegt, erreichbar in der Speicherbibliothek. Beim Laden lokaler Slots/Importe oder Neustart wird die Serverbindung getrennt, damit kein fremder lokaler Stand unbemerkt hochgeladen wird.
- Besitzer können einmalige, sieben Tage gültige Einladungscodes mit „Ansehen“ oder „Mitbauen“ vergeben. Bereits angenommene Freigaben lassen sich entziehen. Der Code ist eine Zugriffsberechtigung und gehört nur an gewünschte Empfänger.
- Registrierung allein gewährt weder Tailscale-Zugang noch Zugriff auf fremde Inseln. Netzwerkfreigaben müssen getrennt so eingerichtet werden, dass Freunde nur den Spieldienst erreichen. Keine Health-App-Freigabe wurde eingerichtet.
- **Mitbauen bedeutet aktuell abwechselnd an derselben gespeicherten Insel arbeiten.** Noch keine servergesteuerte Echtzeit-Simulation, gleichzeitig steuerbaren getrennten Völker/Wirtschaften, automatisch benachbarte Inseln oder Freundschaft/Diplomatie.
- Warenlieferungen: Empfänger schaltet im Kontomenü Lieferungen ein und gibt dem Absender eine Einladung. Der Absender kann aus seiner eigenen gebundenen Insel 1–100 Waren senden. Auf der Zielinsel landen diese als abholbare Bodenwaren; danach die neue Serverfassung laden. Änderungen beider Inseln erfolgen atomar mit Historie und wiederholbarer Auftragskennung. Unklare Versandantworten über „Offene Sendung abschließen“ klären; nicht Browserdaten löschen. Keine Schiffe, Reisezeiten oder Echtzeit-Simulation.

## Betrieb

- SSH-Alias: `openclaw`; Anwendung `/opt/new-shores`, systemd `new-shores.service`.
- Nichtprivilegierter Systembenutzer `new-shores`; HTTP nur `127.0.0.1:8791`; Tailscale Serve nur HTTPS 9444. Kein Funnel und keine öffentliche Firewallöffnung.
- Eigene Datenbank und Rolle `new_shores` im bestehenden PostgreSQL-Container `database-platform-postgres`. Keine Tabellen in Health-/OMS-Datenbanken. Dienstpool maximal fünf Verbindungen.
- `/etc/new-shores.env` enthält nur eigene Spiel-Datenbank-Credentials, Modus 600. Nicht ausgeben oder ins Repository übernehmen.
- `server/schema.sql` enthält idempotente Tabellenanlage. Die API hält die letzten fünf Versionen pro Insel in `island_history`. Ein separater regelmäßiger externer Datenbank-Backupjob wurde noch nicht eingerichtet.
- Opt-in-Bergung nach Abriss benötigt Spielstandversion 7, sobald aktiviert oder Bodenwaren/Fracht vorhanden sind. Vor Laden solcher Inseln alte Offline-Clients vollständig schließen/aktualisieren. Der aktuelle Server akzeptiert weiterhin alte Versionen 1–6.
- Kontositzungen: zufällige 256-Bit-Tokens, nur gehasht in PostgreSQL, HttpOnly/Secure/SameSite=Strict-Cookies, 30 Tage. Origin-/Content-Type-Prüfung auf schreibenden APIs, Mengen-/Strukturprüfung und Anmelderatenbegrenzung.
- `deploy/provision.mjs` ist ausdrücklich eine einmalige Bereitstellung; bricht bei vorhandener Datenbank/Rolle/Umgebungsdatei ab. Nicht für laufende Updates verwenden.

Updates: lokal Tests und Build ausführen, nur `dist`, `src`, `server`, Paketdateien in die vorhandene Anwendung übertragen; `npm ci --omit=dev` bei Paketänderungen, danach ausschließlich `new-shores.service` neu starten. Alte gehashte Frontend-Assets während Service-Worker-Updates erhalten. Bestehende Offline-Installationen ggf. vollständig schließen und wieder öffnen.

## Verifikation

`tests/deliveries.mjs` prüft Mengenbilanz, Platzierung und echte Abholung. `tests/server/deliveries.mjs` prüft im isolierten Schema Berechtigungen, Opt-in, parallele Wiederholungen, Historie, Rollback und Widerruf. `tests/browser/deliveries.cjs` prüft zwei Konten mit verlorener Versandantwort auf Desktop und mobilem Querformat; die exakt erfassten QA-Konten werden durch `tests/browser/cleanup-server.cjs` entfernt.

`npm test`, `node tests/simulation.mjs`, `node tests/strategy.mjs`, `npm run build`.

`tests/server/api.mjs` benötigt eine eigene Datenbankverbindung mit Erlaubnis zum Anlegen eines Testschemas. Das Skript isoliert seine Daten in einem zufälligen Schema und entfernt nur dieses Testschema danach. Es prüft Anmeldung, Zugriff, Versionskonflikte, Historie, Einladungen, Berechtigungen und Widerruf.

`tests/browser/cloud.cjs` prüft den hier benannten Server in zwei getrennten Browserkontexten auf Desktop und 667×375-Touch: Registrierung, Login, Gerätewechsel, Konfliktschutz und Offline-Reload. Es legt ausschließlich `qa-…@example.invalid`-Testkonten an und entfernt seine exakt erfassten Testkonten/Spielstände anschließend per SSH. Nicht ungeprüft auf einen anderen Host umstellen. `tests/browser/unit-menu.cjs` prüft lokale Spezialistenausbildung/-suche und kontextabhängige Befehle.

Referenzen: [Tailscale Serve](https://tailscale.com/docs/reference/tailscale-cli/serve), [Node.js crypto](https://nodejs.org/api/crypto.html). Diese Dokumentationen begründen Netzwerk-/Hashing-Mechanismen; sie sind keine Aussage über vollständige Spiel- oder Sicherheitsabdeckung.
