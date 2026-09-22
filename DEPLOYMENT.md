# New Shores: privates Repository, automatisches Deployment und Domain

## Update: Domain, Gerätewechsel und Bergbau

`settler.eliaspfeffer.de` liefert gültiges HTTPS; die ebenfalls auf diesen Server zeigende Schreibweise `settlers.eliaspfeffer.de` erhält ein eigenes Zertifikat und leitet unter Erhalt des Pfads auf die Singular-Adresse weiter. Beide HTTPS-Verbindungen wurden am 14. September überprüft. Die früher dokumentierte ausstehende DNS/TLS-Prüfung ist damit erledigt.

Die Layoutwahl erfolgt nach primärem Zeiger, Hover und Touch-Fähigkeit. Alte `mobile=0/1`-Links ändern das nicht mehr. Nur für absichtliche Vorschauen gibt es `ui=mobile` bzw. `ui=desktop`. Laptop-Hauptmenü mit breiter Zweispaltenkarte; neue Siedlung in eigenem Dialog. Keine neuen Grafikassets.

Registrierung mit bereits vorhandenem Konto und identischem Passwort stellt eine Sitzung her. Ein anderes Passwort überschreibt niemals das vorhandene Konto. Konten können ihr Passwort mit dem bisherigen Passwort ändern und alle anderen Sitzungen widerrufen. Für Verifizierung und Selbstbedienungs-Wiederherstellung werden optional `RESEND_API_KEY`, `MAIL_FROM` und die öffentliche `APP_ORIGIN` in `/etc/new-shores.env` gesetzt. Einmal-Token liegen ausschließlich gehasht und zeitlich begrenzt in PostgreSQL; ohne Mailkonfiguration bleiben bestehende Konten und Registrierung nutzbar.

Gerätewechsel: eine lokale Welt einmal als neue Serverinsel sichern; anschließend „Speichern & Gerätewechsel“. Das alte Gerät pausiert und sendet für diese Bindung keine weiteren automatischen Updates. Auf dem anderen Gerät mit demselben Konto anmelden und diese Insel laden. Bei Rückkehr ebenfalls die neueste Serverinsel laden. Veraltete Schreibversuche bleiben durch Revisionsvergleich geschützt. Keine gleichzeitige Echtzeitsimulation.

Bergbaureserve: Beim ersten Anwerben eines Kohleminenarbeiters und eines Eisenminenarbeiters stellt die Siedlung je eine zweckgebundene Spitzhacke bereit. Je Typ einmal; `coalStarterToolUsed` und `ironStarterToolUsed` werden mit dem Spielstand gespeichert und validiert. Gilt auch für ältere Spielstände ohne diese Flags. Das Werkzeug wird anschließend normal getragen, bei Freistellung zurückgegeben und bei Verlust nicht unbegrenzt ersetzt. Keine Änderung der Nahrung-, Erz-, Kohle- oder Eisenrezepte.

Verifiziert: alle 41 Node-Testdateien, Simulation/Strategie, Produktionsbuild und isolierte PostgreSQL/API-Tests. Auf öffentlichem HTTPS mit zwei getrennten Browserkontexten: Registrierung, sichere Wiederholung, falsches Passwort abgewiesen, Welt PC → Handy → PC mit übernommenem Kartenstand und auf dem Handy geänderter Spielerfarbe. Temporäre QA-Konten samt Testinseln entfernt. Öffentliche Menüprüfung bei 894×612, 1400×900, 844×390, 390×844. Schnelle Klicks auf gerade neu aufgebaute Insel-Listen bleiben bis zum Ende der Aktualisierung gesperrt. Keine quantitative FPS-Messung oder echte Handy-Hardwaremessung; Layout-Erkennung und Browserabläufe getestet.

## DNS bei Porkbun

Für `eliaspfeffer.de` nur diesen neuen Host setzen (keine bestehenden anderen Hosts ändern):

| Typ | Host | Wert | TTL |
|---|---|---|---|
| A | settler | 89.167.71.235 | 600 |

Kein zusätzlicher CNAME oder AAAA für denselben Host. Ein bereits vorhandener widersprechender Record für **settler** muss vorher geprüft werden. DNS enthält weder `https://` noch Port oder Pfad. Danach ist die Adresse `https://settler.eliaspfeffer.de/?mobile=1` (Laptop auch ohne Parameter). Vor dem DNS-Eintrag kann kein öffentlich gültiges Zertifikat bestätigt werden. Caddy bezieht/erneuert das Zertifikat nach erfolgreicher DNS-Auflösung; vorhandenes HAProxy leitet HTTPS intern an Caddy weiter. Der Tailscale-Link auf Port 9444 bleibt bestehen.

Quellen: [Porkbun A-Records](https://kb.porkbun.com/article/54-pointing-your-domain-to-hosting-with-a-records), [Caddy HTTPS-Voraussetzungen](https://caddyserver.com/docs/automatic-https).

## Aktualisierungen

`new-shores-update.timer` prüft etwa alle zwei Minuten den privaten GitHub-Branch `main`. Dedizierter Read-only-Deploy-Key, fester GitHub-Hostschlüssel, eigener Benutzer `new-shores-deploy`. Kein öffentlicher Webhook, kein GitHub-Token im Browser, keine Root-Zugangsdaten bei GitHub. Build und Tests laufen als eingeschränkter Benutzer, maximal ein CPU-Kern und 1 GB RAM. Ohne neuen Commit kein Build.

Root-eigene Skripte in `/usr/local/libexec` werden bei späteren Repository-Pushes bewusst **nicht** automatisch ersetzt. Das Build-Skript installiert Abhängigkeiten mit `--ignore-scripts`, prüft alle Node-Tests und baut eine getrennte Releasefassung. Erst danach ersetzt ein fester Aktivierungsschritt den Symlink `/opt/new-shores-current`, startet ausschließlich `new-shores.service` neu und prüft `/api/health`. Bei fehlgeschlagenem Healthcheck wird der alte Symlink wiederhergestellt. Alte Releases bleiben erhalten. Datenbankänderungen sind nicht durch diesen Code-Rollback rückgängig gemacht; destruktive Migrationen brauchen eine gesonderte Sicherungsstrategie.

Prüfung: `systemctl status new-shores-update.timer`, `journalctl -u new-shores-update.service`, `/version.json` (Commit der tatsächlich gebauten Fassung). Für sofortiges Prüfen: `systemctl start new-shores-update.service`. Stoppen: `systemctl stop new-shores-update.timer`. Fehlgeschlagene Tests lassen die letzte geprüfte Fassung online; „neueste“ heißt daher neueste erfolgreich gebaute Fassung. Keine automatische Benachrichtigung bei Fehlern eingerichtet.

Browser: Online-Navigation bevorzugt aktuelle HTML-Dateien; Offline-Navigation behält die lokale Cachefassung. Der Service Worker prüft Updates auch bei Rückkehr in den Tab. In einer laufenden Partie wird nicht zwangsweise neu geladen; im Pausenmenü kann „Neue Version laden (Spielstand sichern)“ gewählt werden. Für die erstmalige Umstellung von der alten Cache-Strategie gegebenenfalls alle Spiel-Tabs schließen und neu öffnen.

## Konten und Sicherheitsgrenzen

„Anmelden / Account erstellen“ steht direkt oben im Startmenü. Mindestpasswortlänge 12 Zeichen. Vorhandene Konten bleiben erhalten. Beide Domains greifen auf dieselbe Datenbank zu, Cookies und lokale Spielstände sind jedoch origin-getrennt: Vor Domainwechsel die Insel online sichern oder exportieren, auf neuer Domain anmelden und laden.

Passwörter: gesalzenes scrypt; Sitzungstoken nur gehasht in PostgreSQL; Secure/HttpOnly/SameSite-Cookies; explizite Origin-Allowlist statt Wildcard-CORS; parametrisierte SQL-Abfragen und Inselberechtigungen. Begrenzte Anfragen/Bodygrößen, höchstens zwei parallele Passwortprüfungen und acht API-Anfragen, Sicherheitsheader/CSP. Der Node-Dienst bleibt auf Loopback gebunden und ohne Root-Rechte, Umgebungsdatei root-only. IP-Limits nutzen absichtlich keine ungesicherten Forwarded-Header; hinter dem vorhandenen Proxy sind sie konservativ für mehrere Nutzer gemeinsam. Kein Schutzversprechen gegen alle Angriffe oder große DDoS-Angriffe.

Offen: Zugangsdaten eines transaktionalen Mailproviders, MFA, ein unabhängiger Penetrationstest sowie die laufende Prüfung anderer Serverdienste. Der vorhandene Server hat weitere lokal gebundene Dienste; diese werden nicht ungeprüft verändert. Ob sie von außen erreichbar sind, hängt zusätzlich von Host-/Provider-Firewalls ab. Ein isolierter Spielehost wäre eine zusätzliche Trennung, ist hier aber nicht eingerichtet.

Gemeinsames Inselspiel nutzt Server-Sent Events für Anwesenheit, Nachrichten, Sperrstatus und neue Revisionen. Eine kurze, erneuerte Steuerlease sorgt dafür, dass immer nur ein Gerät verbindlich schreibt. Das ist konfliktgeschützter Live-Koop auf einer Insel, keine behauptete hochfrequente MMO-Simulation einzelner Einheiten.

`new-shores-backup.tmpfiles` legt das rootgeschützte Zielverzeichnis an. `new-shores-backup.timer` erzeugt dort täglich ein PostgreSQL-Custom-Dump, prüft es sofort mit `pg_restore --list` und hält 14 Tage vor. `new-shores-hardening.conf` ergänzt den Dienst um leere Linux-Capability-Sets, private Geräte, eingeschränkte Adressfamilien und Kernel-/Prozessschutz. Nach Änderungen immer `systemd-tmpfiles --create`, einen echten Backup-Lauf und `/api/health` prüfen.

`prune-releases.sh` entfernt ausschließlich validierte 40-stellige Release-Verzeichnisse und bewahrt die aktive sowie insgesamt vier neueste Fassungen. Es darf erst nach erfolgreichem Healthcheck ausgeführt werden. `sshd-new-shores-hardening.conf` lässt Schlüsselanmeldung einschließlich des vorhandenen Admin-Schlüssels zu, deaktiviert Passwort-/Tastatur- und X11-Anmeldung und reduziert Loginzeit und Fehlversuche; vor Reload immer `sshd -t`, danach eine zweite neue SSH-Verbindung prüfen.

## Spätere Vercel-Nutzung und Kosten

Das Spiel ist bereits ein statischer Vite-Build: Simulation, Wegfindung und Rendering laufen im Browser, nicht pro Frame auf dem Server. HTML/CSS/JS/Bilder können später als `dist` über ein CDN ausgeliefert werden, ohne SSR oder dauernd laufende Vercel-Funktionen. Unveränderliche, gehashte Assets werden lange gecacht; HTML, Worker und Versionsdatei revalidiert. Große Grafikpakete verursachen trotzdem Bandbreite/Storage und Client-CPU.

Die jetzige Node-/PostgreSQL-Konto-API wird durch einen reinen Vercel-Frontend-Umzug **nicht** automatisch mitgenommen. Zunächst kann sie auf dem vorhandenen Server bleiben; eine Serverless-Migration braucht einen separaten Adapter, Connection-Pooling, verteilte Rate-Limits und eine überprüfte Origin-/Cookie-Konfiguration. Aktuell keine Vercel-Ressourcen angelegt und keine Kosten- oder CPU-Garantie abgegeben. Cloud-Speichern geschieht bei Änderungen im 30-Sekunden-Intervall statt pro Simulationsschritt.

## Menübild

Der in diesem Durchlauf mit dem eingebauten Imagegen erzeugte Holztafel-/Schildentwurf ist eine Vorschau, kein eingebauter Menü-Screenshot. Referenz: Nutzerbild der Gameloft-Handyfassung. Vier große Tafeln für Start, Spiel laden, Anmeldung/Registrierung, Einstellungen; eigenes New-Shores-Segelwappen. Desktop und Handy-Querformat teilen dieselbe Komposition. Bestehende Grafikdateien unverändert.

## Verifikation am 14. September 2026

Simulation, Strategie, alle 39 Node-Testdateien und Produktionsbuild bestanden. Registrierung, Abmelden, erneutes Anmelden und Spielstart auf 844 × 390 sowie 1400 × 900 im Browser geprüft; ausschließlich erzeugte QA-Konten anschließend entfernt. Automatischer Build und Aktivierung nach GitHub-Push nachgewiesen. Das Release-Elternverzeichnis braucht Durchtritt für den getrennten Laufzeitbenutzer (751); Schlüsselverzeichnis bleibt 700. Alte Releases werden noch nicht automatisch bereinigt: Speicherplatz regelmäßig prüfen.

Domain-DNS und öffentlich gültiges TLS-Zertifikat waren bei Abschluss noch nicht verifiziert. Der vorhandene ältere Caddy meldet außerdem einen Fehler beim ZeroSSL-Fallback; nach dem DNS-Eintrag muss die Zertifikatsausstellung erneut geprüft werden. Ein Live-Service-Worker-Wechsel zwischen zwei Browserfassungen wurde nicht gesondert automatisiert getestet.
